// ==========================================================================
// SHARON SANTOS — LIVE LETTERBOXD RSS FEED INTEGRATION
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
    fetchRecentFilms();
});

async function fetchRecentFilms() {
    const filmGrid = document.getElementById('filmGrid');
    if (!filmGrid) return;

    try {
        const rssUrl = 'https://letterboxd.com/sharon1/rss/';
        const response = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`);
        const data = await response.json();

        if (data.status === 'ok' && data.items && data.items.length > 0) {
            filmGrid.innerHTML = '';
            
            // Take top 4 recent film entries
            const items = data.items.slice(0, 4);

            items.forEach(item => {
                // Parse poster image from item description HTML
                const parser = new DOMParser();
                const doc = parser.parseFromString(item.description, 'text/html');
                const imgTag = doc.querySelector('img');
                const imgSrc = imgTag ? imgTag.src : '';

                // Extract title and rating
                const fullTitle = item.title;
                const parts = fullTitle.split(' - ');
                const titleAndYear = parts[0];
                const rating = parts[1] || '';

                const card = document.createElement('a');
                card.href = item.link;
                card.target = '_blank';
                card.rel = 'noopener';
                card.className = 'film-card';

                card.innerHTML = `
                    ${imgSrc ? `<img src="${imgSrc}" alt="${titleAndYear}" class="film-poster" loading="lazy">` : ''}
                    <div class="film-info">
                        <span class="film-name">${titleAndYear}</span>
                        ${rating ? `<span class="film-rating">${rating}</span>` : ''}
                    </div>
                `;

                filmGrid.appendChild(card);
            });
        }
    } catch (err) {
        console.log('Letterboxd feed load fallback:', err);
    }
}
