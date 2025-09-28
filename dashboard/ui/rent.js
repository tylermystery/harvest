// dashboard/ui/rent.js

export function renderRentCard(rentData) {
    const card = document.createElement('div');
    card.className = 'dashboard-card rent-card';
    card.dataset.status = rentData.status; // e.g., "Due"

    const statusClass = rentData.status.toLowerCase(); // "due"
    const statusText = rentData.status;

    card.innerHTML = `
        <h2>Rent Status</h2>
        <div class="rent-status ${statusClass}">${statusText}</div>
        <div class="rent-details">
            <p>$${rentData.amount} for ${rentData.month}</p>
        </div>
        <button id="pay-rent-btn">Pay Now</button> 
    `;
    // Note: The "Pay Now" button is a placeholder. Phase 2 will involve integrating Stripe.
    return card;
}
