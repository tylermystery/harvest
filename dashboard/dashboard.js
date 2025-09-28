// dashboard/dashboard.js
import { renderRentCard } from './ui/rent.js';

async function fetchApi(endpoint, options = {}) {
    // For testing, manually set a test user's Airtable Record ID as the token
    const token = localStorage.getItem('authToken'); // You'll need to set this manually in your browser for now
    if (!token) {
        alert('Not logged in. Please set authToken in localStorage for testing.');
        return;
    }
    
    const defaultOptions = {
        headers: { 'Authorization': `Bearer ${token}` }
    };

    const response = await fetch(`/.netlify/functions/${endpoint}`, { ...defaultOptions, ...options });
    
    if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
    return response.json();
}

async function initDashboard() {
    const container = document.getElementById('dashboard-container');
    try {
        const data = await fetchApi('get-dashboard-data');
        
        container.innerHTML = '';
        container.classList.remove('loading');

        // Render the Rent Card if the user is a tenant
        if (data.role === 'Tenant' && data.rent) {
            const rentCard = renderRentCard(data.rent);
            container.appendChild(rentCard);
        } else {
             container.innerHTML = '<p>Welcome! Your community dashboard is being set up.</p>';
        }

    } catch (error) {
        container.innerHTML = `<p style="color: red;">Could not load dashboard: ${error.message}</p>`;
        console.error('Dashboard Error:', error);
    }
}

document.addEventListener('DOMContentLoaded', initDashboard);
