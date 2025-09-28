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
        const userRecord = await base('Users').find(userId);
        const userData = userRecord.fields;
        console.log("[DEBUG] Found user data. Role:", userData.Role);

        let rentData = null;
        
        // --- NEW, SIMPLIFIED LOGIC ---
        // If the user is a Tenant and has a linked RentLedger record...
        if (userData.Role === 'Tenant' && userData.RentLedger && userData.RentLedger.length > 0) {
            const rentLedgerId = userData.RentLedger[0];
            console.log(`[DEBUG] User is a Tenant. Fetching linked RentLedger record: ${rentLedgerId}`);
            
            // Directly find the specific rent record using its ID
            const rentRecord = await base('RentLedger').find(rentLedgerId);
            const currentRentFields = rentRecord.fields;
            console.log("[DEBUG] Found rent record fields:", currentRentFields);

            rentData = {
                status: currentRentFields.Status, 
                amount: currentRentFields['Amount Due'],
                month: currentRentFields.Month
            };
        }
        
        const response = {
            userName: userData.Name,
            role: userData.Role,
            totalGgvi: userData['Total GGVI'] || 0,
            netContributionScore: 0, 
            rent: rentData,
        };
        console.log("[DEBUG] Final response:", response);

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

