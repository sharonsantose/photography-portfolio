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
    const card         = document.getElementById('stravaCard');
    const title        = document.getElementById('stravaTitle');
    const location     = document.getElementById('stravaLocation');
    const metrics      = document.getElementById('stravaMetrics');
    const label        = document.getElementById('stravaSectionLabel');
    const mapContainer = document.getElementById('stravaMapContainer');

    if (!card || !title || !metrics) return;

    let data = null;
    const paths = ['/private/strava_data.json', 'private/strava_data.json', './private/strava_data.json', 'strava_data.json'];
    for (const p of paths) {
        try {
            const response = await fetch(p + '?v=' + Date.now(), { cache: 'no-store' });
            if (response.ok) {
                data = await response.json();
                break;
            }
        } catch (err) {}
    }

    if (!data || !data.activities_by_date) return;

    const dates = Object.keys(data.activities_by_date).sort().reverse();
    if (dates.length === 0) return;

    const latestDateStr = dates[0];
    const activities = data.activities_by_date[latestDateStr];
    if (!activities || activities.length === 0) return;

    const latestAct = activities[0];

    // Format date string (e.g. "Jul 27, 2026")
    const dateObj = new Date(latestDateStr + 'T00:00:00');
    const formattedDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    // Update text content
    if (label) label.textContent = `Latest Workout · ${latestAct.sport.toUpperCase()}`;
    title.textContent = `${latestAct.emoji} ${latestAct.name}`;
    location.textContent = `${formattedDate} • Strava Live Sync`;
    metrics.textContent = latestAct.detail;

    if (latestAct.strava_id) {
        card.href = `https://www.strava.com/activities/${latestAct.strava_id}`;
    }

    // Dynamic Route SVG Map update
    if (mapContainer && latestAct.map_polyline) {
        const svgHtml = generateSvgMapHtml(latestAct.map_polyline);
        if (svgHtml) {
            mapContainer.innerHTML = svgHtml;
        }
    }
}

// ── Encoded Polyline Decoder & Dynamic SVG Route Generator ───────────
function decodePolyline(str) {
    if (!str) return [];
    let index = 0, len = str.length;
    let lat = 0, lng = 0;
    const coordinates = [];

    while (index < len) {
        let b, shift = 0, result = 0;
        do {
            b = str.charCodeAt(index++) - 63;
            result |= (b & 0x1f) << shift;
            shift += 5;
        } while (b >= 0x20);
        let dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
        lat += dlat;

        shift = 0;
        result = 0;
        do {
            b = str.charCodeAt(index++) - 63;
            result |= (b & 0x1f) << shift;
            shift += 5;
        } while (b >= 0x20);
        let dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
        lng += dlng;

        coordinates.push([lat / 1e5, lng / 1e5]);
    }
    return coordinates;
}

function generateSvgMapHtml(polylineStr, width = 340, height = 180, padding = 22) {
    const coords = decodePolyline(polylineStr);
    if (!coords || coords.length < 2) return null;

    let minLat = Infinity, maxLat = -Infinity;
    let minLng = Infinity, maxLng = -Infinity;

    coords.forEach(([lat, lng]) => {
        if (lat < minLat) minLat = lat;
        if (lat > maxLat) maxLat = lat;
        if (lng < minLng) minLng = lng;
        if (lng > maxLng) maxLng = lng;
    });

    const latRange = (maxLat - minLat) || 0.0001;
    const lngRange = (maxLng - minLng) || 0.0001;

    const drawWidth  = width - (padding * 2);
    const drawHeight = height - (padding * 2);

    const scale = Math.min(drawWidth / lngRange, drawHeight / latRange);
    const offsetX = padding + (drawWidth - lngRange * scale) / 2;
    const offsetY = padding + (drawHeight - latRange * scale) / 2;

    const points = coords.map(([lat, lng]) => {
        const x = offsetX + (lng - minLng) * scale;
        const y = height - (offsetY + (lat - minLat) * scale);
        return `${x.toFixed(1)},${y.toFixed(1)}`;
    });

    const startPt = points[0].split(',');
    const endPt   = points[points.length - 1].split(',');

    return `
        <svg viewBox="0 0 ${width} ${height}" class="route-svg">
            <polyline points="${points.join(' ')}" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <circle cx="${startPt[0]}" cy="${startPt[1]}" r="3.5" fill="#ffffff" />
            <circle cx="${endPt[0]}" cy="${endPt[1]}" r="3.5" fill="#000000" stroke="#ffffff" stroke-width="1.8"/>
        </svg>
    `;
}


