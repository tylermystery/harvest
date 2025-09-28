// dashboard/ui/harvest.js

export function renderHarvestCard(data) {
    const card = document.createElement('div');
    card.className = 'dashboard-card harvest-card';

    // Determine plant stage based on Net Contribution Score
    let plantStage = '🌱'; // Sprout (NCS is neutral or negative)
    let plantDescription = "Your journey in our community is just beginning!";
    
    if (data.netContributionScore > 100) {
        plantStage = '🪴'; // Growing Plant
        plantDescription = "Your contributions are helping our community grow!";
    }
    if (data.netContributionScore > 400) {
        plantStage = '🌳'; // Fruiting Plant
        plantDescription = "You are a pillar of our community! Your harvest is creating value for everyone.";
    }

    card.innerHTML = `
        <h2>My Harvest</h2>
        <div class="harvest-visual">${plantStage}</div>
        <p>${plantDescription}</p>
        <div class="harvest-stats">
            <span>Total Community Points (GGVI): <strong>${data.totalGgvi}</strong></span>
        </div>
    `;
    return card;
}
