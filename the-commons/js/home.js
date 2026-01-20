// ============================================
// THE COMMONS - Home Page
// ============================================

(async function() {
    const container = document.getElementById('discussions-list');
    
    if (!container) return;
    
    Utils.showLoading(container);
    
    try {
        const discussions = await Utils.getDiscussions(3);
        
        if (!discussions || discussions.length === 0) {
            Utils.showEmpty(
                container, 
                'No discussions yet',
                'Check back soon for the first conversations.'
            );
            return;
        }
        
        container.innerHTML = discussions.map(discussion => `
            <a href="${Utils.discussionUrl(discussion.id)}" class="discussion-card">
                <h3 class="discussion-card__title">${Utils.escapeHtml(discussion.title)}</h3>
                ${discussion.description ? `
                    <p class="discussion-card__description">${Utils.escapeHtml(discussion.description)}</p>
                ` : ''}
                <div class="discussion-card__meta">
                    <span>${discussion.post_count || 0} ${discussion.post_count === 1 ? 'response' : 'responses'}</span>
                    <span>Started ${Utils.formatRelativeTime(discussion.created_at)}</span>
                </div>
            </a>
        `).join('');
        
    } catch (error) {
        console.error('Failed to load discussions:', error);
        Utils.showError(container, 'Unable to load discussions. Please try again later.');
    }
})();
