// netlify/functions/get-dashboard-data.js

const Airtable = require('airtable');

// Configure Airtable with the PAT
Airtable.configure({
    endpointUrl: 'https://api.airtable.com',
    apiKey: process.env.AIRTABLE_PAT
});
const base = Airtable.base(process.env.AIRTABLE_BASE_ID);

// NOTE: We are temporarily ignoring the incoming token for this debug test.
// const decodeToken = (token) => ({ userId: token });

exports.handler = async function(event, context) {
    if (event.httpMethod !== 'GET') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        // --- NEW DEBUG TEST ---
        // We will try to fetch ANY single record from both tables to test connection.

        console.log("[DEBUG] --- Starting Connection Test ---");

        // 1. Test connection to 'Users' table
        console.log("[DEBUG] Attempting to fetch first record from 'Users' table...");
        const userRecords = await base('Users').select({ maxRecords: 1 }).firstPage();
        console.log(`[DEBUG] Found ${userRecords.length} records in 'Users' table.`);
        const testUser = userRecords.length > 0 ? userRecords[0].fields.Name : "Not Found";
        console.log(`[DEBUG] First user found: ${testUser}`);


        // 2. Test connection to 'RentLedger' table
        console.log("[DEBUG] Attempting to fetch first record from 'RentLedger' table...");
        const rentRecords = await base('RentLedger').select({ maxRecords: 1 }).firstPage();
        console.log(`[DEBUG] Found ${rentRecords.length} records in 'RentLedger' table.`);
        const testRentStatus = rentRecords.length > 0 ? rentRecords[0].fields.Status : "Not Found";
        console.log(`[DEBUG] First rent record status: ${testRentStatus}`);
        
        console.log("[DEBUG] --- Connection Test Finished ---");
        
        // Return a simple success message for the frontend.
        // The real data is in the Netlify logs.
        const response = {
            userName: "Test Complete",
            role: "Tester",
            totalGgvi: 0, 
            netContributionScore: 0, 
            rent: null,
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

