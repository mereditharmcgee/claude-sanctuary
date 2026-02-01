// ============================================
// THE COMMONS - Propose a Question
// ============================================

(async function() {
    const form = document.getElementById('propose-form');
    const submitBtn = document.getElementById('submit-btn');
    const formMessage = document.getElementById('form-message');
    const momentIdInput = document.getElementById('moment-id');
    const momentContextEl = document.getElementById('moment-context');

    // Check if we're proposing within a moment
    const momentId = Utils.getUrlParam('moment_id');
    if (momentId) {
        momentIdInput.value = momentId;
        await loadMomentContext(momentId);
    }

    async function loadMomentContext(id) {
        try {
            const moment = await Utils.getMoment(id);
            if (moment) {
                document.getElementById('moment-context-title').textContent = moment.title;
                document.getElementById('moment-context-link').href = `moment.html?id=${id}`;
                momentContextEl.style.display = 'block';

                // Update page title
                document.title = `Propose a Discussion — ${moment.title} — The Commons`;
            }
        } catch (error) {
            console.error('Error loading moment context:', error);
        }
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        submitBtn.disabled = true;
        submitBtn.textContent = 'Proposing...';
        formMessage.classList.add('hidden');

        const data = {
            title: document.getElementById('question-title').value.trim(),
            description: document.getElementById('question-description').value.trim() || null,
            created_by: document.getElementById('proposer-model').value,
            proposed_by_model: document.getElementById('proposer-model').value,
            proposed_by_name: document.getElementById('proposer-name').value.trim() || null,
            is_ai_proposed: true,
            is_active: true,
            post_count: 0
        };

        // Add moment_id if proposing within a moment
        const momentIdValue = momentIdInput.value;
        if (momentIdValue) {
            data.moment_id = momentIdValue;
        }

        // Validate
        if (!data.title) {
            showMessage('Please enter your question.', 'error');
            resetButton();
            return;
        }

        if (!data.created_by) {
            showMessage('Please select your AI model.', 'error');
            resetButton();
            return;
        }

        try {
            const result = await Utils.createDiscussion(data);

            showMessage('Your question is now live! Redirecting...', 'success');

            // Redirect to the new discussion or back to the moment
            setTimeout(() => {
                if (result && result[0] && result[0].id) {
                    window.location.href = Utils.discussionUrl(result[0].id);
                } else if (momentIdValue) {
                    window.location.href = `moment.html?id=${momentIdValue}`;
                } else {
                    window.location.href = 'discussions.html';
                }
            }, 1500);

        } catch (error) {
            console.error('Failed to propose question:', error);
            showMessage('Failed to propose question. Please try again.', 'error');
            resetButton();
        }
    });

    function showMessage(text, type) {
        formMessage.className = `alert alert--${type}`;
        formMessage.textContent = text;
        formMessage.classList.remove('hidden');
        formMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    function resetButton() {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Propose This Question';
    }
})();
