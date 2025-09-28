// dashboard-v2.js
import { renderHarvestCard } from './ui/harvest.js';
import { renderContributionsCard } from './ui/contributions.js';

// --- Helper Function ---
function renderRentCard(rentData) {
    const card = document.createElement('div');
    card.className = 'dashboard-card rent-card';
    card.dataset.status = rentData.status;

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

// --- API Function with Cache Busting ---
async function fetchApi(endpoint, options = {}) {
    const token = localStorage.getItem('authToken');
    if (!token) {
        throw new Error('Authentication token not found.');
    }

    const defaultOptions = {
        headers: { 'Authorization': `Bearer ${token}` }
    };
    
    const url = `/.netlify/functions/${endpoint}?t=${new Date().getTime()}`;
    const response = await fetch(url, { ...defaultOptions, ...options });

    if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`);
    }
    return response.json();
}

// --- Main Application Initialization ---
async function initDashboard() {
    const container = document.getElementById('dashboard-container');
    try {
        const data = await fetchApi('get-dashboard-data');
        
        console.log("✅ Data from API:", data);

        container.innerHTML = ''; // Clear the spinner
        container.classList.remove('loading');

        // --- Render All Cards ---
        const harvestCard = renderHarvestCard(data);
        container.appendChild(harvestCard);

        if (data && data.role === 'Tenant' && data.rent) {
            const rentCard = renderRentCard(data.rent);
            container.appendChild(rentCard);
        }
        
        const contributionsCard = renderContributionsCard();
        container.appendChild(contributionsCard);

    } catch (error) {
        console.error('Dashboard Error:', error);
        container.classList.remove('loading');

        if (error.message === 'Authentication token not found.') {
            container.innerHTML = '<h2>Please Log In</h2><p>You need to be logged in to view your dashboard.</p>';
        } else {
            container.innerHTML = `<p style="color: red;">Could not load your dashboard at this time.</p>`;
        }
    }
}

// Start the application
document.addEventListener('DOMContentLoaded', initDashboard);

