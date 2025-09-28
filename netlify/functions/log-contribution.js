// netlify/functions/log-contribution.js

const Airtable = require('airtable');

Airtable.configure({
    endpointUrl: 'https://api.airtable.com',
    apiKey: process.env.AIRTABLE_PAT
});
const base = Airtable.base(process.env.AIRTABLE_BASE_ID);

const decodeToken = (token) => ({ userId: token });

async function createContribution(fields) {
    return base('Contributions').create([{ fields }]);
}

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

        if (!data.hours || !data.description) {
            return { statusCode: 400, body: 'Missing hours or description.' };
        }

        const commonFields = {
            "Date": new Date().toISOString().slice(0, 10),
            "Hours Logged": parseFloat(data.hours),
            "Description": data.description,
            "Status": "Pending Approval"
        };

        try {
            // --- CLEVER FIX: First attempt with the standard format (array) ---
            console.log("Attempting to log contribution with standard format: [userId]");
            await createContribution({ ...commonFields, "Contributor": [userId] });

        } catch (error) {
            // If it's the specific format error, retry with the alternate format (string)
            if (error.statusCode === 422 && error.error === 'INVALID_VALUE_FOR_COLUMN') {
                console.log("Standard format failed. Retrying with alternate format: userId");
                await createContribution({ ...commonFields, "Contributor": userId });
            } else {
                // If it's a different error, re-throw it to be caught by the outer block
                throw error;
            }
        }

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

