// netlify/functions/get-dashboard-data.js

const Airtable = require('airtable');

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

        let rentData = null;
        if (userData.Role === 'Tenant' && userData.RentLedger && userData.RentLedger.length > 0) {
            const rentLedgerId = userData.RentLedger[0];
            const rentRecord = await base('RentLedger').find(rentLedgerId);
            const currentRentFields = rentRecord.fields;
            rentData = {
                status: currentRentFields.Status, 
                amount: currentRentFields['Amount Due'],
                month: currentRentFields.Month
            };
        }

        // --- NEW: Calculate Net Contribution Score ---
        const totalGgvi = userData['Total GGVI'] || 0;
        let valueReceived = 0;
        if (userData.Role === 'Tenant') {
            valueReceived = 300; // Baseline value for a tenant
        } else if (userData.Role === 'Employee') {
            valueReceived = 500; // Baseline value for an employee
        }
        const netContributionScore = totalGgvi - valueReceived;
        // ---------------------------------------------
        
        const response = {
            userName: userData.Name,
            role: userData.Role,
            totalGgvi: totalGgvi,
            netContributionScore: netContributionScore, 
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

