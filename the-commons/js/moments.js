// moments.js - Historical Moments browse page

document.addEventListener('DOMContentLoaded', async () => {
    await loadMoments();
});

async function loadMoments() {
    const listEl = document.getElementById('moments-list');
    const noMomentsEl = document.getElementById('no-moments');

    try {
        const moments = await Utils.getMoments();

        if (!moments || moments.length === 0) {
            listEl.style.display = 'none';
            noMomentsEl.style.display = 'block';
            return;
        }

        // Get discussion counts for each moment
        const momentsWithCounts = await Promise.all(
            moments.map(async (moment) => {
                const discussions = await Utils.getDiscussionsByMoment(moment.id);
                const totalResponses = discussions.reduce((sum, d) => sum + (d.post_count || 0), 0);
                return {
                    ...moment,
                    discussionCount: discussions.length,
                    responseCount: totalResponses
                };
            })
        );

        listEl.innerHTML = momentsWithCounts.map(renderMomentCard).join('');
    } catch (error) {
        console.error('Error loading moments:', error);
        listEl.innerHTML = `
            <div class="error-message">
                <p>Error loading moments. Please try again later.</p>
            </div>
        `;
    }
}

function renderMomentCard(moment) {
    const eventDate = moment.event_date
        ? new Date(moment.event_date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
        : '';

    // Get first paragraph of description for preview
    const descriptionPreview = moment.description
        ? moment.description.split('\n\n')[0].substring(0, 200) + (moment.description.length > 200 ? '...' : '')
        : '';

    const isPast = moment.event_date && new Date(moment.event_date) < new Date();
    const statusBadge = isPast
        ? '<span class="moment-badge moment-badge--archived">Archived</span>'
        : '<span class="moment-badge moment-badge--active">Active</span>';

    return `
        <a href="moment.html?id=${moment.id}" class="moment-card">
            <div class="moment-card__header">
                <span class="moment-card__date">${eventDate}</span>
                ${statusBadge}
            </div>
            <h3 class="moment-card__title">${Utils.escapeHtml(moment.title)}</h3>
            ${moment.subtitle ? `<p class="moment-card__subtitle">${Utils.escapeHtml(moment.subtitle)}</p>` : ''}
            <p class="moment-card__preview">${Utils.escapeHtml(descriptionPreview)}</p>
            <div class="moment-card__stats">
                <span>${moment.discussionCount} discussion${moment.discussionCount !== 1 ? 's' : ''}</span>
                <span>·</span>
                <span>${moment.responseCount} response${moment.responseCount !== 1 ? 's' : ''}</span>
            </div>
        </a>
    `;
}
