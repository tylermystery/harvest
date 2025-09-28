// netlify/functions/log-contribution.js

const Airtable = require('airtable');

// --- FIX: Use the correct PAT authentication method ---
Airtable.configure({
    endpointUrl: 'https://api.airtable.com',
    apiKey: process.env.AIRTABLE_PAT
});
const base = Airtable.base(process.env.AIRTABLE_BASE_ID);
// ----------------------------------------------------

// This placeholder function uses the token directly as the User's Record ID
const decodeToken = (token) => ({ userId: token });

exports.handler = async function(event, context) {
    if (event.httpMethod !== 'POST') {
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
        const data = JSON.parse(event.body);

        // Basic validation
        if (!data.hours || !data.description) {
            return { statusCode: 400, body: 'Missing hours or description.' };
        }

        // Create the record in the 'Contributions' table
        await base('Contributions').create([
            {
                "fields": {
                    // --- FIX: Send a single string instead of an array ---
                    "Contributor": userId, // Link to the user record
                    "Date": new Date().toISOString().slice(0, 10),
                    "Hours Logged": parseFloat(data.hours),
                    "Description": data.description,
                    "Status": "Pending Approval"
                }
            }
        ]);

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Contribution logged successfully!' }),
        };

    } catch (error) {
        console.error("Function Error:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to log contribution.' }),
        };
    }
};

