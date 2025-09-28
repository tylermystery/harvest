// netlify/functions/get-dashboard-data.js

const Airtable = require('airtable');

// Configure Airtable with the PAT
Airtable.configure({
    endpointUrl: 'https://api.airtable.com',
    apiKey: process.env.AIRTABLE_PAT
});
const base = Airtable.base(process.env.AIRTABLE_BASE_ID);

const decodeToken = (token) => ({ userId: token });

exports.handler = async function(event, context) {
    if (event.httpMethod !== 'GET') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        if (!event.headers.authorization) {
            return { statusCode: 401, body: 'Unauthorized: Missing authorization header.' };
        }

        const token = event.headers.authorization.split(' ')[1];
        if (!token) {
            return { statusCode: 401, body: 'Unauthorized: Missing token.' };
        }

        const { userId } = decodeToken(token);
        console.log(`[DEBUG] Starting process for User ID: ${userId}`);

        const userRecord = await base('Users').find(userId);
        const userData = userRecord.fields;
        console.log("[DEBUG] Found user data:", userData);

        let rentData = null;
        console.log(`[DEBUG] Checking user role. Is Role === 'Tenant'? ${userData.Role === 'Tenant'}`);
        
        if (userData.Role === 'Tenant') {
            console.log("[DEBUG] User is a Tenant. Preparing to search for rent records.");
            const filterFormula = `RECORD_ID({Tenant}) = '${userId}'`;
            console.log("[DEBUG] Using filter formula:", filterFormula);

            const rentRecords = await base('RentLedger').select({
                filterByFormula: filterFormula,
                maxRecords: 1,
                sort: [{field: "Month", direction: "desc"}]
            }).firstPage();
            
            console.log(`[DEBUG] Found ${rentRecords.length} rent record(s).`);

            if (rentRecords.length > 0) {
                const currentRentFields = rentRecords[0].fields;
                console.log("[DEBUG] Full rent record object received from Airtable:", currentRentFields);

                rentData = {
                    status: currentRentFields.Status, 
                    amount: currentRentFields['Amount Due'],
                    month: currentRentFields.Month
                };
                console.log("[DEBUG] Assembled rentData object:", rentData);
            } else {
                console.log("[DEBUG] No rent records found for this user, rentData will be null.");
            }
        }
        
        const response = {
            userName: userData.Name,
            role: userData.Role,
            totalGgvi: userData['Total GGVI'] || 0,
            netContributionScore: 0, 
            rent: rentData,
        };
        console.log("[DEBUG] Final response object being sent to frontend:", response);

        return {
            statusCode: 200,
            body: JSON.stringify(response),
        };

    } catch (error) {
        console.error("Function Error:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to fetch dashboard data' }),
        };
    }
};

