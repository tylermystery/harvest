// dashboard/ui/contributions.js

export function renderContributionsCard() {
    const card = document.createElement('div');
    card.className = 'dashboard-card';

    card.innerHTML = `
        <h2>Log Your Contributions</h2>
        <p>Did you help with a community project? Log your hours here to grow your harvest!</p>
        <form id="contribution-form">
            <div class="form-group">
                <label for="hours">Hours Logged</label>
                <input type="number" id="hours" name="hours" required min="0.5" step="0.5">
            </div>
            <div class="form-group">
                <label for="description">What did you do?</label>
                <textarea id="description" name="description" required maxlength="200"></textarea>
            </div>
            <button type="submit">Log My Hours</button>
            <p id="form-message" class="form-message"></p>
        </form>
    `;

    // Add form submission logic
    card.querySelector('#contribution-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const form = e.target;
        const button = form.querySelector('button');
        const messageEl = form.querySelector('#form-message');
        
        button.disabled = true;
        button.textContent = 'Submitting...';
        messageEl.textContent = '';
        messageEl.className = 'form-message';

        try {
            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());

            // We'll need a new fetchApi function that can handle POST requests
            const response = await postApi('log-contribution', data);

            messageEl.textContent = response.message || 'Contribution logged successfully!';
            messageEl.classList.add('success');
            form.reset();
        } catch (error) {
            messageEl.textContent = error.message || 'An error occurred. Please try again.';
            messageEl.classList.add('error');
        } finally {
            button.disabled = false;
            button.textContent = 'Log My Hours';
        }
    });

    return card;
}

// A helper function for POST requests, to be used by the form
async function postApi(endpoint, body) {
    const token = localStorage.getItem('authToken');
    if (!token) {
        throw new Error('You must be logged in to do that.');
    }

    const response = await fetch(`/.netlify/functions/${endpoint}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'An unknown error occurred.');
    }
    return response.json();
}
