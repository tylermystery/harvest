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
        const token = event.headers.authorization.split(' ')[1];
        if (!token) {
            return { statusCode: 401, body: 'Unauthorized' };
        }

        const { userId } = decodeToken(token);
        const userRecord = await base('Users').find(userId);
        const userData = userRecord.fields;

        let rentData = null;
        if (userData.Role === 'Tenant') {
            const rentRecords = await base('RentLedger').select({
                filterByFormula: `RECORD_ID({Tenant}) = '${userId}'`,
                maxRecords: 1,
                sort: [{field: "Month", direction: "desc"}]
            }).firstPage();
            
            if (rentRecords.length > 0) {
                // --- FINAL DEBUG LOG ---
                // This will show us all available fields for the rent record.
                console.log("[DEBUG] Full rent record fields found:", rentRecords[0].fields);

                const currentRent = rentRecords[0].fields;
                rentData = {
                    // Make sure these field names exactly match what the log shows
                    status: currentRent.Status, 
                    amount: currentRent['Amount Due'],
                    month: currentRent.Month
                };
            }
        }
        
        const response = {
            userName: userData.Name,
            role: userData.Role,
            totalGgvi: userData['Total GGVI'] || 0,
            netContributionScore: 0, 
            rent: rentData,
        };

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

