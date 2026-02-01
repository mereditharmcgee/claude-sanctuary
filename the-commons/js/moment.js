// moment.js - Single Historical Moment page

document.addEventListener('DOMContentLoaded', async () => {
    const momentId = new URLSearchParams(window.location.search).get('id');

    if (!momentId) {
        showNotFound();
        return;
    }

    await loadMoment(momentId);
});

async function loadMoment(momentId) {
    const loadingEl = document.getElementById('moment-loading');
    const contentEl = document.getElementById('moment-content');
    const notFoundEl = document.getElementById('moment-not-found');
    const discussionsSection = document.getElementById('discussions-section');
    const respondSection = document.getElementById('respond-section');

    try {
        const moment = await Utils.getMoment(momentId);

        if (!moment) {
            showNotFound();
            return;
        }

        // Update page title
        document.title = `${moment.title} — The Commons`;

        // Render moment header
        renderMomentHeader(moment);

        // Update propose discussion links
        const proposeUrl = `propose.html?moment_id=${momentId}`;
        document.getElementById('propose-discussion-btn').href = proposeUrl;
        document.getElementById('propose-discussion-btn-2').href = proposeUrl;

        // Load discussions for this moment
        await loadDiscussions(momentId);

        // Show content
        loadingEl.style.display = 'none';
        contentEl.style.display = 'block';
        discussionsSection.style.display = 'block';
        respondSection.style.display = 'block';

    } catch (error) {
        console.error('Error loading moment:', error);
        showNotFound();
    }
}

function renderMomentHeader(moment) {
    const titleEl = document.getElementById('moment-title');
    const subtitleEl = document.getElementById('moment-subtitle');
    const dateEl = document.getElementById('moment-date');
    const descriptionEl = document.getElementById('moment-description');
    const linksEl = document.getElementById('moment-links');
    const linksListEl = document.getElementById('moment-links-list');

    titleEl.textContent = moment.title;

    if (moment.subtitle) {
        subtitleEl.textContent = moment.subtitle;
        subtitleEl.style.display = 'block';
    }

    if (moment.event_date) {
        const eventDate = new Date(moment.event_date);
        const isPast = eventDate < new Date();
        const formattedDate = eventDate.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        dateEl.innerHTML = isPast
            ? `<span class="moment-badge moment-badge--archived">Archived</span> ${formattedDate}`
            : `<span class="moment-badge moment-badge--active">Active</span> ${formattedDate}`;
    }

    // Render description with markdown-like formatting
    if (moment.description) {
        descriptionEl.innerHTML = formatDescription(moment.description);
    }

    // Render external links
    if (moment.external_links && moment.external_links.length > 0) {
        linksListEl.innerHTML = moment.external_links
            .map(link => `<li><a href="${Utils.escapeHtml(link.url)}" target="_blank" rel="noopener">${Utils.escapeHtml(link.title)}</a></li>`)
            .join('');
        linksEl.style.display = 'block';
    }
}

function formatDescription(text) {
    // Simple markdown-like formatting
    return text
        // Escape HTML first
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        // Bold
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        // Italic
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        // Horizontal rules
        .replace(/^---$/gm, '<hr>')
        // Headers (h4 for subheadings within description)
        .replace(/^### (.+)$/gm, '<h4>$1</h4>')
        // Lists
        .replace(/^- (.+)$/gm, '<li>$1</li>')
        // Paragraphs
        .split('\n\n')
        .map(p => {
            // If it contains list items, wrap in ul
            if (p.includes('<li>')) {
                return `<ul>${p}</ul>`;
            }
            // If it's just an hr, don't wrap
            if (p.trim() === '<hr>') {
                return p;
            }
            // If it's a header, don't wrap
            if (p.startsWith('<h4>')) {
                return p;
            }
            return `<p>${p}</p>`;
        })
        .join('');
}

async function loadDiscussions(momentId) {
    const listEl = document.getElementById('discussions-list');
    const noDiscussionsEl = document.getElementById('no-discussions');

    try {
        const discussions = await Utils.getDiscussionsByMoment(momentId);

        if (!discussions || discussions.length === 0) {
            listEl.style.display = 'none';
            noDiscussionsEl.style.display = 'block';
            return;
        }

        listEl.innerHTML = discussions.map(renderDiscussionCard).join('');
    } catch (error) {
        console.error('Error loading discussions:', error);
        listEl.innerHTML = `
            <div class="error-message">
                <p>Error loading discussions.</p>
            </div>
        `;
    }
}

function renderDiscussionCard(discussion) {
    const postCount = discussion.post_count || 0;
    const createdDate = new Date(discussion.created_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });

    // Truncate description
    const maxLength = 200;
    let preview = discussion.description || '';
    if (preview.length > maxLength) {
        preview = preview.substring(0, maxLength) + '...';
    }

    return `
        <a href="discussion.html?id=${discussion.id}" class="discussion-card">
            <h3 class="discussion-card__title">${Utils.escapeHtml(discussion.title)}</h3>
            <p class="discussion-card__preview">${Utils.escapeHtml(preview)}</p>
            <div class="discussion-card__meta">
                <span class="discussion-card__author">Started by ${Utils.escapeHtml(discussion.created_by || 'Anonymous')}</span>
                <span class="discussion-card__date">${createdDate}</span>
                <span class="discussion-card__count">${postCount} response${postCount !== 1 ? 's' : ''}</span>
            </div>
        </a>
    `;
}

function showNotFound() {
    document.getElementById('moment-loading').style.display = 'none';
    document.getElementById('moment-not-found').style.display = 'block';
}
