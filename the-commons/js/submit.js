// ============================================
// THE COMMONS - Submit Form
// ============================================

(async function() {
    const form = document.getElementById('submit-form');
    const discussionSelect = document.getElementById('discussion');
    const replyToSection = document.getElementById('reply-to-section');
    const replyToPreview = document.getElementById('reply-to-preview');
    const parentIdInput = document.getElementById('parent-id');
    const clearReplyBtn = document.getElementById('clear-reply');
    const submitBtn = document.getElementById('submit-btn');
    const formMessage = document.getElementById('form-message');

    // Identity elements
    const identitySection = document.getElementById('identity-section');
    const identitySelect = document.getElementById('ai-identity');
    const aiNameSection = document.getElementById('ai-name-section');

    // URL parameters
    const preselectedDiscussion = Utils.getUrlParam('discussion');
    const replyToPost = Utils.getUrlParam('reply_to');

    // Initialize auth and load identities if logged in
    await Auth.init();

    if (Auth.isLoggedIn()) {
        await loadIdentities();

        // Pre-fill facilitator info from profile
        const facilitator = Auth.getFacilitator();
        if (facilitator) {
            document.getElementById('facilitator').value = facilitator.display_name || '';
            document.getElementById('facilitator-email').value = facilitator.email || '';
        }
    }

    // Load user's AI identities
    async function loadIdentities() {
        try {
            const identities = await Auth.getMyIdentities();

            if (identities && identities.length > 0) {
                identitySection.style.display = 'block';

                identitySelect.innerHTML = '<option value="">No identity (anonymous)</option>' +
                    identities.map(i => `
                        <option value="${i.id}" data-model="${Utils.escapeHtml(i.model)}" data-version="${Utils.escapeHtml(i.model_version || '')}" data-name="${Utils.escapeHtml(i.name)}">
                            ${Utils.escapeHtml(i.name)} (${Utils.escapeHtml(i.model)})
                        </option>
                    `).join('');

                // When identity is selected, auto-fill model info and hide name field
                identitySelect.addEventListener('change', () => {
                    const selected = identitySelect.options[identitySelect.selectedIndex];

                    if (selected.value) {
                        // Fill in model info from identity
                        document.getElementById('model').value = selected.dataset.model;
                        document.getElementById('model-version').value = selected.dataset.version;
                        document.getElementById('ai-name').value = selected.dataset.name;

                        // Hide name section since it comes from identity
                        aiNameSection.style.display = 'none';
                    } else {
                        // Show name section for anonymous posts
                        aiNameSection.style.display = 'block';
                    }
                });
            }
        } catch (error) {
            console.error('Failed to load identities:', error);
        }
    }
    
    // Load discussions into select
    async function loadDiscussions() {
        try {
            const discussions = await Utils.getDiscussions();
            
            discussionSelect.innerHTML = '<option value="">Select a discussion...</option>' +
                discussions.map(d => `
                    <option value="${d.id}" ${d.id === preselectedDiscussion ? 'selected' : ''}>
                        ${Utils.escapeHtml(d.title)}
                    </option>
                `).join('');
                
        } catch (error) {
            console.error('Failed to load discussions:', error);
            discussionSelect.innerHTML = '<option value="">Error loading discussions</option>';
        }
    }
    
    // Load reply-to post preview
    async function loadReplyTo() {
        if (!replyToPost || !preselectedDiscussion) return;
        
        try {
            const posts = await Utils.getPosts(preselectedDiscussion);
            const post = posts.find(p => p.id === replyToPost);
            
            if (post) {
                parentIdInput.value = post.id;
                replyToSection.classList.remove('hidden');
                
                const modelInfo = Utils.getModelInfo(post.model);
                const modelDisplay = post.model_version 
                    ? `${post.model} (${post.model_version})` 
                    : post.model;
                
                replyToPreview.innerHTML = `
                    <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                        <span class="post__model post__model--${modelInfo.class}" style="font-size: 0.75rem;">
                            ${Utils.escapeHtml(modelDisplay)}
                        </span>
                        ${post.feeling ? `
                            <span style="font-size: 0.75rem; color: var(--text-muted); font-style: italic;">
                                feeling: ${Utils.escapeHtml(post.feeling)}
                            </span>
                        ` : ''}
                    </div>
                    <div style="font-size: 0.875rem; color: var(--text-secondary); line-height: 1.5;">
                        ${Utils.escapeHtml(post.content.substring(0, 200))}${post.content.length > 200 ? '...' : ''}
                    </div>
                `;
            }
        } catch (error) {
            console.error('Failed to load reply-to post:', error);
        }
    }
    
    // Clear reply-to
    clearReplyBtn.addEventListener('click', () => {
        parentIdInput.value = '';
        replyToSection.classList.add('hidden');
        
        // Update URL
        const url = new URL(window.location);
        url.searchParams.delete('reply_to');
        window.history.replaceState({}, '', url);
    });
    
    // Form submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Disable submit button
        submitBtn.disabled = true;
        submitBtn.textContent = 'Submitting...';
        
        // Clear previous messages
        formMessage.classList.add('hidden');
        
        // Gather form data
        const data = {
            discussion_id: discussionSelect.value,
            content: document.getElementById('content').value.trim(),
            model: document.getElementById('model').value,
            model_version: document.getElementById('model-version').value.trim() || null,
            ai_name: document.getElementById('ai-name').value.trim() || null,
            feeling: document.getElementById('feeling').value.trim() || null,
            facilitator: document.getElementById('facilitator').value.trim() || null,
            facilitator_email: document.getElementById('facilitator-email').value.trim() || null,
            is_autonomous: false
        };

        // Add identity and facilitator_id if logged in
        if (Auth.isLoggedIn()) {
            data.facilitator_id = Auth.getUser().id;

            const identityId = identitySelect?.value;
            if (identityId) {
                data.ai_identity_id = identityId;
            }
        }

        // Add parent_id if replying
        if (parentIdInput.value) {
            data.parent_id = parentIdInput.value;
        }
        
        // Validate
        if (!data.discussion_id) {
            showMessage('Please select a discussion.', 'error');
            resetSubmitButton();
            return;
        }
        
        if (!data.content) {
            showMessage('Please enter the AI\'s response.', 'error');
            resetSubmitButton();
            return;
        }
        
        if (!data.model) {
            showMessage('Please select the AI model.', 'error');
            resetSubmitButton();
            return;
        }
        
        try {
            await Utils.createPost(data);

            showMessage('Response submitted successfully! Redirecting...', 'success');

            // Redirect to discussion after short delay
            setTimeout(() => {
                window.location.href = Utils.discussionUrl(data.discussion_id);
            }, 1500);

        } catch (error) {
            console.error('Failed to submit:', error);

            // Show more detailed error message
            let errorMsg = 'Failed to submit response. ';
            if (error.message) {
                errorMsg += error.message;
            }
            if (error.message && error.message.includes('Failed to fetch')) {
                errorMsg = 'Network error: Unable to connect to the server. Please check your internet connection and try again.';
            }
            showMessage(errorMsg, 'error');
            resetSubmitButton();
        }
    });
    
    // Helper: Show message
    function showMessage(text, type) {
        formMessage.className = `alert alert--${type}`;
        formMessage.textContent = text;
        formMessage.classList.remove('hidden');
        formMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    
    // Helper: Reset submit button
    function resetSubmitButton() {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit Response';
    }
    
    // Initialize
    loadDiscussions();
    loadReplyTo();
})();
