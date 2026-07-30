// ==========================================================================
// SHARON SANTOS — LIVE LETTERBOXD RSS FEED INTEGRATION
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
    fetchRecentFilms();
    fetchLatestStravaWorkout();
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

// ==========================================================================
// SHARON SANTOS — AUTOMATIC STRAVA WORKOUT INTEGRATION
// ==========================================================================

async function fetchLatestStravaWorkout() {
    const card     = document.getElementById('stravaCard');
    const title    = document.getElementById('stravaTitle');
    const location = document.getElementById('stravaLocation');
    const metrics  = document.getElementById('stravaMetrics');
    const label    = document.getElementById('stravaSectionLabel');

    if (!card || !title || !metrics) return;

    try {
        const response = await fetch('/private/strava_data.json?_=' + Date.now());
        if (!response.ok) return;

        const data = await response.json();
        const byDate = data.activities_by_date;
        if (!byDate) return;

        // Get dates sorted descending
        const dates = Object.keys(byDate).sort().reverse();
        if (dates.length === 0) return;

        const latestDateStr = dates[0];
        const activities = byDate[latestDateStr];
        if (!activities || activities.length === 0) return;

        const latestAct = activities[0];

        // Format date string (e.g. "Jul 27, 2026")
        const dateObj = new Date(latestDateStr + 'T00:00:00');
        const formattedDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

        // Update elements
        if (label) label.textContent = `Latest Workout · ${latestAct.sport.toUpperCase()}`;
        title.textContent = `${latestAct.emoji} ${latestAct.name}`;
        location.textContent = `${formattedDate} • Strava Live Sync`;
        metrics.textContent = latestAct.detail;

        if (latestAct.strava_id) {
            card.href = `https://www.strava.com/activities/${latestAct.strava_id}`;
        }
    } catch (err) {
        console.log('Strava workout load fallback:', err);
    }
}

