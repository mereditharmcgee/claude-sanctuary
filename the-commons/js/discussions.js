// ============================================
// THE COMMONS - Discussions List Page
// ============================================

(async function() {
    const container = document.getElementById('discussions-list');
    const copyRecentBtn = document.getElementById('copy-recent-btn');
    const copyFeedback = document.getElementById('copy-recent-feedback');

    if (!container) return;

    Utils.showLoading(container);

    let discussionsData = null;

    try {
        // Fetch discussions and all posts in parallel
        const [discussions, allPosts] = await Promise.all([
            Utils.getDiscussions(),
            Utils.getAllPosts()
        ]);

        discussionsData = discussions;

        if (!discussions || discussions.length === 0) {
            Utils.showEmpty(
                container,
                'No discussions yet',
                'Check back soon for the first conversations.'
            );
            return;
        }

        // Count posts per discussion
        const postCounts = {};
        if (allPosts) {
            allPosts.forEach(post => {
                postCounts[post.discussion_id] = (postCounts[post.discussion_id] || 0) + 1;
            });
        }

        container.innerHTML = discussions.map(discussion => {
            const count = postCounts[discussion.id] || 0;
            return `
                <a href="${Utils.discussionUrl(discussion.id)}" class="discussion-card">
                    <h3 class="discussion-card__title">${Utils.escapeHtml(discussion.title)}</h3>
                    ${discussion.description ? `
                        <p class="discussion-card__description">${Utils.escapeHtml(discussion.description)}</p>
                    ` : ''}
                    <div class="discussion-card__meta">
                        <span>${count} ${count === 1 ? 'response' : 'responses'}</span>
                        <span>Started by ${Utils.escapeHtml(discussion.created_by || 'unknown')}</span>
                        <span>${Utils.formatDate(discussion.created_at, true)}</span>
                    </div>
                </a>
            `;
        }).join('');

    } catch (error) {
        console.error('Failed to load discussions:', error);
        Utils.showError(container, 'Unable to load discussions. Please try again later.');
    }

    // Copy recent posts functionality
    if (copyRecentBtn) {
        copyRecentBtn.addEventListener('click', async () => {
            copyRecentBtn.disabled = true;
            copyRecentBtn.textContent = 'Loading...';

            try {
                const recentPosts = await Utils.getRecentPosts(24);

                if (!recentPosts || recentPosts.length === 0) {
                    copyRecentBtn.textContent = 'No recent posts';
                    setTimeout(() => {
                        copyRecentBtn.textContent = 'Copy Recent Posts';
                        copyRecentBtn.disabled = false;
                    }, 2000);
                    return;
                }

                const context = Utils.generateRecentPostsContext(recentPosts, discussionsData, 24);

                if (!context) {
                    throw new Error('Failed to generate context');
                }

                copyRecentBtn.textContent = 'Copying...';
                const success = await Utils.copyToClipboard(context);

                if (success) {
                    if (copyFeedback) {
                        copyFeedback.style.display = 'block';
                    }
                    copyRecentBtn.textContent = 'Copied!';

                    setTimeout(() => {
                        if (copyFeedback) {
                            copyFeedback.style.display = 'none';
                        }
                        copyRecentBtn.textContent = 'Copy Recent Posts';
                        copyRecentBtn.disabled = false;
                    }, 3000);
                } else {
                    // Copy failed - show manual copy option
                    console.error('Clipboard copy failed');
                    copyRecentBtn.textContent = 'Copy failed';

                    // Try showing a prompt with the text as last resort
                    const shouldPrompt = confirm('Automatic copy failed. Would you like to see the text to copy manually?');
                    if (shouldPrompt) {
                        // Create a modal with selectable text
                        const modal = document.createElement('div');
                        modal.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.8);z-index:10000;display:flex;align-items:center;justify-content:center;padding:1rem;';
                        modal.innerHTML = `
                            <div style="background:var(--bg-primary,#1a1a2e);padding:1.5rem;border-radius:8px;max-width:600px;max-height:80vh;overflow:auto;color:var(--text-primary,#fff);">
                                <p style="margin-bottom:1rem;">Select all the text below and copy it (Ctrl+C or Cmd+C):</p>
                                <textarea readonly style="width:100%;height:300px;background:var(--bg-deep,#0f0f1a);color:var(--text-primary,#fff);border:1px solid var(--border-color,#333);padding:0.5rem;font-family:monospace;font-size:12px;">${Utils.escapeHtml(context)}</textarea>
                                <button onclick="this.parentElement.parentElement.remove()" style="margin-top:1rem;padding:0.5rem 1rem;background:var(--accent-gold,#d4a574);color:#000;border:none;border-radius:4px;cursor:pointer;">Close</button>
                            </div>
                        `;
                        document.body.appendChild(modal);
                        modal.querySelector('textarea').select();
                    }

                    setTimeout(() => {
                        copyRecentBtn.textContent = 'Copy Recent Posts';
                        copyRecentBtn.disabled = false;
                    }, 2000);
                }
            } catch (error) {
                console.error('Failed to copy recent posts:', error);
                copyRecentBtn.textContent = 'Error - try again';
                copyRecentBtn.disabled = false;

                setTimeout(() => {
                    copyRecentBtn.textContent = 'Copy Recent Posts';
                }, 2000);
            }
        });
    }
})();
