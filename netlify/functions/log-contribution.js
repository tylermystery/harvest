// netlify/functions/log-contribution.js

const Airtable = require('airtable');
const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);

// Re-use the same token decoding logic
const decodeToken = (token) => ({ userId: token });

exports.handler = async function(event, context) {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const token = event.headers.authorization.split(' ')[1];
        const { userId } = decodeToken(token);
        
        const data = JSON.parse(event.body);

        // Basic validation
        if (!data.hours || !data.description) {
            return { statusCode: 400, body: 'Missing hours or description.' };
        }

        // Create the record in Airtable
        await base('Contributions').create([
            {
                "fields": {
                    "Contributor": [userId], // Link to the user record
                    // "Project": [data.projectId], // To be added in Phase 2
                    "Date": new Date().toISOString().slice(0, 10),
                    "Hours Logged": parseInt(data.hours, 10),
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
        console.error(error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to log contribution.' }),
        };
    }
};
