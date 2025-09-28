// dashboard/dashboard-v2.js
import { renderHarvestCard } from './ui/harvest.js';
import { renderContributionsCard } from './ui/contributions.js';

// --- Helper Functions ---
async function fetchApi(endpoint) {
    const token = localStorage.getItem('authToken');
    if (!token) {
        throw new Error('Authentication token not found.');
    }

    try {
        const response = await fetch(`/.netlify/functions/${endpoint}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) {
            throw new Error(`API Error: ${response.statusText}`);
        }
        return response.json();
    } catch (error) {
        throw new Error(`Network error: ${error.message}`);
    }
}

function renderRentCard(rentData) {
    const card = document.createElement('div');
    card.className = 'dashboard-card rent-card';
    card.dataset.status = rentData.status || 'Unknown';

    const statusClass = (rentData.status || 'Unknown').toLowerCase().replace(' ', '-');
    const statusText = rentData.status || 'Status Unavailable';
    
    card.innerHTML = `
        <h2>Rent Status</h2>
        <div class="rent-status ${statusClass}">${statusText}</div>
        <div class="rent-details">
            <p>$${rentData.amount || 'N/A'} for ${rentData.month || 'N/A'}</p>
        </div>
        <button id="pay-rent-btn">Pay Now</button> 
    `;
    return card;
}

// --- Main Application ---
async function initDashboard() {
    const container = document.getElementById('dashboard-container');
    try {
        const data = await fetchApi('get-dashboard-data');
        
        console.log("✅ Data from API:", data);
        container.innerHTML = '';
        container.classList.remove('loading');

        // --- Render Cards ---
        const harvestCard = renderHarvestCard(data);
        container.appendChild(harvestCard);

        if (data.role === 'Tenant' && data.rent) {
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
            container.innerHTML = `<p style="color: red;">Could not load your dashboard.</p>`;
        }
    }
}

document.addEventListener('DOMContentLoaded', initDashboard);

