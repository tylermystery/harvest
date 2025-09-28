// dashboard-v2.js

// This UI component function can be in its own file, but for simplicity,
// we'll keep it here for the final check.
function renderRentCard(rentData) {
    const card = document.createElement('div');
    card.className = 'dashboard-card rent-card';
    card.dataset.status = rentData.status;

    // Use a nullish coalescing operator for safety
    const statusClass = (rentData.status || 'unknown').toLowerCase();
    const statusText = rentData.status || 'Unknown';

    card.innerHTML = `
        <h2>Rent Status</h2>
        <div class="rent-status ${statusClass}">${statusText}</div>
        <div class="rent-details">
            <p>$${rentData.amount || '0.00'} for ${rentData.month || 'N/A'}</p>
        </div>
        <button id="pay-rent-btn">Pay Now</button> 
    `;
    return card;
}


// --- UPDATED AND ROBUST API FUNCTION ---
async function fetchApi(endpoint, options = {}) {
    const token = localStorage.getItem('authToken');
    if (!token) {
        // Instead of an alert and a silent return, we throw a clear error.
        throw new Error('Authentication token not found.');
    }

    const defaultOptions = {
        headers: { 'Authorization': `Bearer ${token}` }
    };

    const response = await fetch(`/.netlify/functions/${endpoint}`, { ...defaultOptions, ...options });

    if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`);
    }
    return response.json();
}


// --- UPDATED AND ROBUST INITIALIZATION FUNCTION ---
async function initDashboard() {
    const container = document.getElementById('dashboard-container');
    try {
        const data = await fetchApi('get-dashboard-data');
        
        console.log("✅ Data from API:", data);

        container.innerHTML = ''; // Clear the spinner
        container.classList.remove('loading');

        // Render the Rent Card if the user is a tenant and has rent data
        if (data && data.role === 'Tenant' && data.rent) {
            const rentCard = renderRentCard(data.rent);
            container.appendChild(rentCard);
        } else {
            // Show a generic welcome if not a tenant or no rent data
            container.innerHTML = '<p>Welcome! Your community dashboard is being set up.</p>';
        }

    } catch (error) {
        console.error('Dashboard Error:', error);
        container.classList.remove('loading'); // Also clear spinner on error

        // Now we can show a user-friendly message for the specific auth error
        if (error.message === 'Authentication token not found.') {
            container.innerHTML = '<h2>Please Log In</h2><p>You need to be logged in to view your dashboard.</p>';
        } else {
            // Generic error for other issues (like API being down)
            container.innerHTML = `<p style="color: red;">Could not load your dashboard at this time.</p>`;
        }
    }
}

// Start the application
document.addEventListener('DOMContentLoaded', initDashboard);
