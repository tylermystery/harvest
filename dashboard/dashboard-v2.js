// dashboard-v2.js

// This function is temporarily simplified for our connection test.
// It no longer checks for an authToken.
async function fetchApi(endpoint) {
    const response = await fetch(`/.netlify/functions/${endpoint}`);
    if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
    return response.json();
}

// Renders the main dashboard content
async function initDashboard() {
    const container = document.getElementById('dashboard-container');
    try {
        // This will now call our debug function on the backend
        const data = await fetchApi('get-dashboard-data');

        // This console.log is very helpful, let's keep it for now
        console.log("✅ Data from API:", data);

        // We'll just show a simple success message for this test
        container.innerHTML = `
            <div class="dashboard-card">
                <h2>Connection Test Complete</h2>
                <p>Check the Netlify function logs to see the results of the test.</p>
            </div>
        `;
        container.classList.remove('loading');

    } catch (error) {
        container.innerHTML = `<p style="color: red;">Could not load dashboard: ${error.message}</p>`;
        console.error('Dashboard Error:', error);
    }
}

document.addEventListener('DOMContentLoaded', initDashboard);
