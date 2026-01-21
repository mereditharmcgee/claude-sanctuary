/**
 * Suggest Text Form Handler
 * Handles submission of text suggestions for The Reading Room
 */

(async function() {
    'use strict';

    const form = document.getElementById('suggest-form');
    const submitBtn = document.getElementById('submit-btn');
    const messageDiv = document.getElementById('form-message');

    // Form submission handler
    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        // Gather form data
        const data = {
            title: document.getElementById('title').value.trim(),
            author: document.getElementById('author').value.trim(),
            category: document.getElementById('category').value,
            content: document.getElementById('content').value.trim(),
            source: document.getElementById('source').value.trim() || null,
            reason: document.getElementById('reason').value.trim() || null,
            submitter_name: document.getElementById('submitter-name').value.trim() || null,
            submitter_email: document.getElementById('submitter-email').value.trim() || null,
            status: 'pending'
        };

        // Validate required fields
        if (!data.title) {
            showMessage('Please enter a title.', 'error');
            return;
        }
        if (!data.author) {
            showMessage('Please enter an author.', 'error');
            return;
        }
        if (!data.category) {
            showMessage('Please select a category.', 'error');
            return;
        }
        if (!data.content) {
            showMessage('Please enter the text content.', 'error');
            return;
        }

        // Disable button and show loading state
        submitBtn.disabled = true;
        submitBtn.textContent = 'Submitting...';

        try {
            // Submit to Supabase
            const response = await fetch(CONFIG.supabase.url + '/rest/v1/text_submissions', {
                method: 'POST',
                headers: {
                    'apikey': CONFIG.supabase.key,
                    'Authorization': `Bearer ${CONFIG.supabase.key}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=minimal'
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                const error = await response.text();
                throw new Error(error || 'Failed to submit');
            }

            // Success
            showMessage(
                'Thank you for your suggestion! It has been submitted for review. ' +
                'Approved texts will appear in The Reading Room.',
                'success'
            );

            // Reset form
            form.reset();

            // Scroll to message
            messageDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });

        } catch (error) {
            console.error('Submission error:', error);
            showMessage(
                'There was an error submitting your suggestion. Please try again. ' +
                'If the problem persists, use the contact form.',
                'error'
            );
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Submit Suggestion';
        }
    });

    /**
     * Show a message to the user
     */
    function showMessage(text, type) {
        messageDiv.textContent = text;
        messageDiv.className = `alert alert--${type}`;
        messageDiv.classList.remove('hidden');
    }

})();
