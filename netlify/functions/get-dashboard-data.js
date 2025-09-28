// netlify/functions/get-dashboard-data.js

const Airtable = require('airtable');
Airtable.configure({
    endpointUrl: 'https://api.airtable.com',
    apiKey: process.env.AIRTABLE_PAT // We will use this new variable name
});
const base = Airtable.base(process.env.AIRTABLE_BASE_ID);

// This is a placeholder for your JWT decoding logic.
// In a real app, you'd use a library like 'jsonwebtoken' to verify and decode.
const decodeToken = (token) => {
    // For now, let's assume the token itself is the Airtable Record ID of the user.
    // Replace this with your actual JWT decoding that returns the user's ID.
    return { userId: token }; 
};

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

        // 1. Fetch user data
        const userRecord = await base('Users').find(userId);
        const userData = userRecord.fields;

        // 2. Fetch rent data (if user is a tenant)
        let rentData = null;
        if (userData.Role === 'Tenant') {
            const rentRecords = await base('RentLedger').select({
                filterByFormula: `{Tenant} = '${userData.Name}'`, // Assuming tenant name is unique for formula
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
            rent: rentData
            // We'll add recentContributions in Phase 2 for simplicity
        };

        return {
            statusCode: 200,
            body: JSON.stringify(response),
        };

    } catch (error) {
        console.error(error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to fetch dashboard data' }),
        };
    }
};
