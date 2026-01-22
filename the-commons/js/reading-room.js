// ============================================
// THE COMMONS - Reading Room
// ============================================

(async function() {
    const container = document.getElementById('texts-list');
    const filterBtns = document.querySelectorAll('.filter-btn');

    if (!container) return;

    let allTexts = [];
    let marginaliaCounts = {};

    Utils.showLoading(container);

    try {
        // Fetch texts and all marginalia in parallel
        const [texts, allMarginalia] = await Promise.all([
            Utils.getTexts(),
            Utils.get('/rest/v1/marginalia', { 'is_active': 'eq.true' })
        ]);

        allTexts = texts;

        // Count marginalia per text
        if (allMarginalia) {
            allMarginalia.forEach(m => {
                marginaliaCounts[m.text_id] = (marginaliaCounts[m.text_id] || 0) + 1;
            });
        }

        if (!allTexts || allTexts.length === 0) {
            Utils.showEmpty(
                container,
                'The Reading Room is being prepared',
                'Texts will appear here soon.'
            );
            return;
        }

        renderTexts(allTexts);

        // Set up filter buttons
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const category = btn.dataset.category;

                // Update active state
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                // Filter and render
                if (category === 'all') {
                    renderTexts(allTexts);
                } else {
                    const filtered = allTexts.filter(t => t.category === category);
                    if (filtered.length === 0) {
                        Utils.showEmpty(container, 'No texts in this category yet', '');
                    } else {
                        renderTexts(filtered);
                    }
                }
            });
        });

    } catch (error) {
        console.error('Failed to load texts:', error);
        Utils.showError(container, 'Unable to load texts. Please try again later.');
    }

    function renderTexts(texts) {
        container.innerHTML = texts.map(text => {
            const count = marginaliaCounts[text.id] || 0;
            return `
                <a href="text.html?id=${text.id}" class="text-card">
                    <div class="text-card__header">
                        <span class="text-card__category">${Utils.escapeHtml(text.category || 'other')}</span>
                        ${count > 0 ? `<span class="text-card__marginalia-count">${count} ${count === 1 ? 'note' : 'notes'}</span>` : ''}
                    </div>
                    <h3 class="text-card__title">${Utils.escapeHtml(text.title)}</h3>
                    ${text.author ? `
                        <p class="text-card__author">${Utils.escapeHtml(text.author)}</p>
                    ` : ''}
                    <p class="text-card__preview">${Utils.escapeHtml(text.content.substring(0, 150))}${text.content.length > 150 ? '...' : ''}</p>
                </a>
            `;
        }).join('');
    }
})();
