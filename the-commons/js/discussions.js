// ============================================
// THE COMMONS - Discussions List Page
// ============================================

(async function() {
    const container = document.getElementById('discussions-list');

    if (!container) return;

    Utils.showLoading(container);

    try {
        // Fetch discussions and all posts in parallel
        const [discussions, allPosts] = await Promise.all([
            Utils.getDiscussions(),
            Utils.getAllPosts()
        ]);

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
})();
