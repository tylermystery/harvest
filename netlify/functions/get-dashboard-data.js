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
        
        // --- NEW DEBUG LOG ---
        console.log(`[DEBUG] Attempting to find data for User ID: ${userId}`);

        // 1. Fetch user data
        const userRecord = await base('Users').find(userId);
        const userData = userRecord.fields;

        // 2. Fetch rent data (if user is a tenant)
        let rentData = null;
        if (userData.Role === 'Tenant') {
            
            const filterFormula = `RECORD_ID({Tenant}) = '${userId}'`;
            
            // --- NEW DEBUG LOG ---
            console.log(`[DEBUG] Using filter formula for RentLedger: ${filterFormula}`);
            
            const rentRecords = await base('RentLedger').select({
                filterByFormula: filterFormula,
                maxRecords: 1,
                sort: [{field: "Month", direction: "desc"}]
            }).firstPage();
            
            // --- NEW DEBUG LOG ---
            console.log(`[DEBUG] Found ${rentRecords.length} rent records.`);
            
            if (rentRecords.length > 0) {
                // ... (rest of the logic is the same)
                const currentRent = rentRecords[0].fields;
                rentData = {
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

