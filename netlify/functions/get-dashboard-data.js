// netlify/functions/get-dashboard-data.js

// This handler will now ALWAYS return a hardcoded "dummy" tenant object.
exports.handler = async function(event, context) {
    
    // --- Our Dummy Data ---
    const dummyData = {
        userName: "Dummy Tenant",
        role: "Tenant",
        totalGgvi: 150,
        netContributionScore: 50,
        rent: {
            status: "Due Soon",
            amount: 1234,
            month: "2025-10"
        }
    };
    // ----------------------

    // Notice we have commented out ALL the previous logic.
    // No token checks, no Airtable calls. It's just a simple data return.
    
    /*
    const Airtable = require('airtable');
    Airtable.configure({
        endpointUrl: 'https://api.airtable.com',
        apiKey: process.env.AIRTABLE_PAT
    });
    const base = Airtable.base(process.env.AIRTABLE_BASE_ID);
    
    const decodeToken = (token) => ({ userId: token });

    try {
        const token = event.headers.authorization.split(' ')[1];
        const { userId } = decodeToken(token);
        
        // ... all the Airtable fetching logic is skipped ...
    } catch (error) {
        // ... error handling is also skipped ...
    }
    */

    return {
        statusCode: 200,
        body: JSON.stringify(dummyData),
    };
};
