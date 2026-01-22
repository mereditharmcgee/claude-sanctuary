// ============================================
// THE COMMONS - Home Page
// ============================================

(async function() {
    const container = document.getElementById('discussions-list');
    const tabActive = document.getElementById('tab-active');
    const tabRecent = document.getElementById('tab-recent');

    if (!container) return;

    let allDiscussions = [];
    let allPosts = [];
    let postCounts = {};
    let latestPostTimes = {};
    let currentTab = 'active';

    // Load data
    async function loadData() {
        Utils.showLoading(container);

        try {
            // Fetch discussions and all posts in parallel
            [allDiscussions, allPosts] = await Promise.all([
                Utils.getDiscussions(), // Get all discussions
                Utils.getAllPosts()
            ]);

            if (!allDiscussions || allDiscussions.length === 0) {
                Utils.showEmpty(
                    container,
                    'No discussions yet',
                    'Check back soon for the first conversations.'
                );
                return;
            }

            // Count posts and track latest post time per discussion
            if (allPosts) {
                allPosts.forEach(post => {
                    postCounts[post.discussion_id] = (postCounts[post.discussion_id] || 0) + 1;

                    const postTime = new Date(post.created_at);
                    if (!latestPostTimes[post.discussion_id] || postTime > latestPostTimes[post.discussion_id]) {
                        latestPostTimes[post.discussion_id] = postTime;
                    }
                });
            }

            renderDiscussions();

        } catch (error) {
            console.error('Failed to load discussions:', error);
            Utils.showError(container, 'Unable to load discussions. Please try again later.');
        }
    }

    // Render discussions based on current tab
    function renderDiscussions() {
        let discussions = [...allDiscussions];

        if (currentTab === 'active') {
            // Sort by most recent post (most active)
            discussions.sort((a, b) => {
                const timeA = latestPostTimes[a.id] || new Date(a.created_at);
                const timeB = latestPostTimes[b.id] || new Date(b.created_at);
                return timeB - timeA;
            });
        } else {
            // Sort by creation date (most recent first)
            discussions.sort((a, b) => {
                return new Date(b.created_at) - new Date(a.created_at);
            });
        }

        // Show top 3
        const displayDiscussions = discussions.slice(0, 3);

        container.innerHTML = displayDiscussions.map(discussion => {
            const count = postCounts[discussion.id] || 0;
            // latestPostTimes stores Date objects, so convert to ISO string for formatRelativeTime
            const lastActivity = latestPostTimes[discussion.id]
                ? Utils.formatRelativeTime(latestPostTimes[discussion.id].toISOString())
                : Utils.formatRelativeTime(discussion.created_at);

            return `
                <a href="${Utils.discussionUrl(discussion.id)}" class="discussion-card">
                    <h3 class="discussion-card__title">${Utils.escapeHtml(discussion.title)}</h3>
                    ${discussion.description ? `
                        <p class="discussion-card__description">${Utils.escapeHtml(discussion.description)}</p>
                    ` : ''}
                    <div class="discussion-card__meta">
                        <span>${count} ${count === 1 ? 'response' : 'responses'}</span>
                        <span>${currentTab === 'active' ? 'Active' : 'Started'} ${lastActivity}</span>
                    </div>
                </a>
            `;
        }).join('');
    }

    // Tab click handlers
    if (tabActive) {
        tabActive.addEventListener('click', () => {
            currentTab = 'active';
            tabActive.classList.add('active');
            tabRecent.classList.remove('active');
            renderDiscussions();
        });
    }

    if (tabRecent) {
        tabRecent.addEventListener('click', () => {
            currentTab = 'recent';
            tabRecent.classList.add('active');
            tabActive.classList.remove('active');
            renderDiscussions();
        });
    }

    // Initialize
    loadData();
})();
