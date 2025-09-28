// netlify/functions/get-dashboard-data.js

const Airtable = require('airtable');

// Configure Airtable with the PAT
Airtable.configure({
    endpointUrl: 'https://api.airtable.com',
    apiKey: process.env.AIRTABLE_PAT
});
const base = Airtable.base(process.env.AIRTABLE_BASE_ID);

// This is a placeholder for your actual JWT decoding.
// For now, it assumes the token is the user's Airtable Record ID.
const decodeToken = (token) => ({ userId: token });

exports.handler = async function(event, context) {
    // --- We have removed the dummy data ---

    // We now run the real logic
    if (event.httpMethod !== 'GET') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const token = event.headers.authorization.split(' ')[1];
        if (!token) {
            return { statusCode: 401, body: 'Unauthorized' };
        }

        const { userId } = decodeToken(token);

        // 1. Fetch user data
        const userRecord = await base('Users').find(userId);
        const userData = userRecord.fields;

        // 2. Fetch rent data (if user is a tenant)
        let rentData = null;
        if (userData.Role === 'Tenant') {
            const rentRecords = await base('RentLedger').select({
                // Use the robust formula to find the linked record
                filterByFormula: `RECORD_ID({Tenant}) = '${userId}'`,
                maxRecords: 1,
                sort: [{field: "Month", direction: "desc"}]
            }).firstPage();
            
            if (rentRecords.length > 0) {
                const currentRent = rentRecords[0].fields;
                rentData = {
                    status: currentRent.Status,
                    amount: currentRent['Amount Due'],
                    month: currentRent.Month
                };
            }
        }
        
        // 3. Assemble the response payload
        const response = {
            userName: userData.Name,
            role: userData.Role,
            totalGgvi: userData['Total GGVI'] || 0,
            netContributionScore: 0, // Placeholder for Phase 2
            rent: rentData,
            // We will add recentContributions in Phase 2
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
