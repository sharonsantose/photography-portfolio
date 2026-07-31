// ==========================================================================
// SHARON SANTOS — TAB SWITCHING & ROUTING
// ==========================================================================

// Track whether tab data has been loaded
const tabLoaded = { letterboxd: false, strava: false };

function switchTab(tabId) {
    const validTabs = ['main', 'photography', 'writing', 'letterboxd', 'strava'];
    if (!validTabs.includes(tabId)) tabId = 'main';

    // Hide all tab panes
    const panes = document.querySelectorAll('.tab-pane');
    panes.forEach(pane => pane.style.display = 'none');

    // Remove active state from tab buttons
    const buttons = document.querySelectorAll('.nav-pill[data-tab]');
    buttons.forEach(btn => btn.classList.remove('active'));

    // Show target tab pane
    const targetPane = document.getElementById(`tab-${tabId}`);
    if (targetPane) {
        targetPane.style.display = 'block';
        // Instantly reveal all typewriter-reveal elements inside newly shown pane
        const reveals = targetPane.querySelectorAll('.typewriter-reveal');
        reveals.forEach(el => el.classList.add('is-visible'));
    }

    // Set active button
    const activeBtn = document.querySelector(`.nav-pill[data-tab="${tabId}"]`);
    if (activeBtn) {
        activeBtn.classList.add('active');
    }

    // Lazy-load tab data on first visit
    if (tabId === 'letterboxd' && !tabLoaded.letterboxd) {
        tabLoaded.letterboxd = true;
        fetchRecentFilms();
    }
    if (tabId === 'strava' && !tabLoaded.strava) {
        tabLoaded.strava = true;
        fetchSixStravaWorkouts();
    }

    // Strip #main hash from URL bar
    try {
        if (window.history.replaceState) {
            if (tabId === 'main') {
                const cleanUrl = window.location.protocol === 'file:' ? window.location.pathname : (window.location.origin + window.location.pathname);
                window.history.replaceState(null, '', cleanUrl);
            } else {
                window.history.replaceState(null, '', `#${tabId}`);
            }
        }
    } catch(e) {}
}

window.addEventListener('hashchange', () => {
    const hash = window.location.hash.replace('#', '');
    if (hash) switchTab(hash);
});

// ── In-Browser Live Screen Edit Mode ─────────────────────────────────
let isEditMode = false;

function toggleEditMode() {
    isEditMode = !isEditMode;
    const editableElements = document.querySelectorAll('.character-name, .dialogue-block, .action-block, .scene-heading, .scene-item-title, .writing-title, .writing-desc, .photo-caption');
    const toggleBtn = document.getElementById('editModeToggleBtn');
    const saveBtn = document.getElementById('saveEditsBtn');

    editableElements.forEach(el => {
        el.contentEditable = isEditMode ? 'true' : 'false';
        if (isEditMode) {
            el.classList.add('editable-active');
        } else {
            el.classList.remove('editable-active');
        }
    });

    if (toggleBtn) {
        toggleBtn.textContent = isEditMode ? '❌ Exit Edit Mode' : '✏️ Edit Mode';
    }
    if (saveBtn) {
        saveBtn.style.display = isEditMode ? 'inline-block' : 'none';
    }
}

function saveScreenEdits() {
    const mainPage = document.querySelector('.script-page');
    if (mainPage) {
        localStorage.setItem('sharon_saved_script_html', mainPage.innerHTML);
        alert('✨ Saved! Your edits have been saved to local browser storage.');
        toggleEditMode();
    }
}

// ── Typewriter Scroll Reveal Observer ─────────────────────────────────
function initTypewriterScrollObserver() {
    const revealElements = document.querySelectorAll('.typewriter-reveal');
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                // Stagger reveal slightly for screenplay effect
                setTimeout(() => {
                    entry.target.classList.add('is-visible');
                }, index * 80);
                obs.unobserve(entry.target);
            }
        });
    }, observerOptions);

    revealElements.forEach(el => observer.observe(el));
}

document.addEventListener('DOMContentLoaded', () => {
    try { localStorage.removeItem('sharon_saved_script_html'); } catch(e){}

    initTypewriterScrollObserver();

    // Route to initial tab — data loads lazily inside switchTab
    const initialHash = window.location.hash.replace('#', '');
    switchTab(initialHash || 'main');
});

const fallbackRecentFilms = [
    { titleAndYear: 'Past Lives (2023)', rating: '★★★★★', link: 'https://letterboxd.com/film/past-lives/', img: 'https://a.ltrbxd.com/resized/film-poster/8/2/4/3/9/5/824395-past-lives-0-230-0-345-crop.jpg' },
    { titleAndYear: 'Drive My Car (2021)', rating: '★★★★★', link: 'https://letterboxd.com/film/drive-my-car/', img: 'https://a.ltrbxd.com/resized/film-poster/6/9/8/3/9/1/698391-drive-my-car-0-230-0-345-crop.jpg' },
    { titleAndYear: 'Portrait of a Lady on Fire (2019)', rating: '★★★★★', link: 'https://letterboxd.com/film/portrait-of-a-lady-on-fire/', img: 'https://a.ltrbxd.com/resized/film-poster/4/9/4/8/2/4/494824-portrait-of-a-lady-on-fire-0-230-0-345-crop.jpg' },
    { titleAndYear: 'Perfect Days (2023)', rating: '★★★★★', link: 'https://letterboxd.com/film/perfect-days-2023/', img: 'https://a.ltrbxd.com/resized/film-poster/9/9/6/5/5/5/996555-perfect-days-0-230-0-345-crop.jpg' },
    { titleAndYear: 'Aftersun (2022)', rating: '★★★★★', link: 'https://letterboxd.com/film/aftersun/', img: 'https://a.ltrbxd.com/resized/film-poster/8/4/6/4/2/9/846429-aftersun-0-230-0-345-crop.jpg' },
    { titleAndYear: 'Anatomy of a Fall (2023)', rating: '★★★★½', link: 'https://letterboxd.com/film/anatomy-of-a-fall/', img: 'https://a.ltrbxd.com/resized/film-poster/8/6/2/2/8/0/862280-anatomy-of-a-fall-0-230-0-345-crop.jpg' },
    { titleAndYear: 'The Worst Person in the World (2021)', rating: '★★★★★', link: 'https://letterboxd.com/film/the-worst-person-in-the-world/', img: 'https://a.ltrbxd.com/resized/film-poster/6/2/9/3/8/5/629385-the-worst-person-in-the-world-0-230-0-345-crop.jpg' },
    { titleAndYear: 'In the Mood for Love (2000)', rating: '★★★★★', link: 'https://letterboxd.com/film/in-the-mood-for-love/', img: 'https://a.ltrbxd.com/resized/film-poster/4/9/8/3/7/49837-in-the-mood-for-love-0-230-0-345-crop.jpg' },
    { titleAndYear: 'Yi Yi (2000)', rating: '★★★★★', link: 'https://letterboxd.com/film/yi-yi/', img: 'https://a.ltrbxd.com/resized/film-poster/4/8/1/4/9/48149-yi-yi-0-230-0-345-crop.jpg' },
    { titleAndYear: 'Caché (2005)', rating: '★★★★½', link: 'https://letterboxd.com/film/cache/', img: 'https://a.ltrbxd.com/resized/film-poster/4/6/8/2/6/46826-cache-0-230-0-345-crop.jpg' },
    { titleAndYear: 'Decision to Leave (2022)', rating: '★★★★★', link: 'https://letterboxd.com/film/decision-to-leave/', img: 'https://a.ltrbxd.com/resized/film-poster/6/6/4/9/8/7/664987-decision-to-leave-0-230-0-345-crop.jpg' },
    { titleAndYear: 'Monster (2023)', rating: '★★★★★', link: 'https://letterboxd.com/film/monster-2023/', img: 'https://a.ltrbxd.com/resized/film-poster/9/4/5/8/4/6/945846-monster-0-230-0-345-crop.jpg' }
];

function renderFilmGrid(films) {
    const filmGrid = document.getElementById('filmGrid');
    if (!filmGrid) return;
    filmGrid.innerHTML = '';
    films.forEach(film => {
        const card = document.createElement('a');
        card.href = film.link;
        card.target = '_blank';
        card.rel = 'noopener';
        card.className = 'film-card';

        card.innerHTML = `
            ${film.img ? `<img src="${film.img}" alt="${film.titleAndYear}" class="film-poster" loading="lazy" onerror="this.onerror=null;this.src='https://placehold.co/230x345/18181b/ffffff?text=${encodeURIComponent(film.titleAndYear)}';">` : ''}
            <div class="film-info">
                <span class="film-name">${film.titleAndYear}</span>
                ${film.rating ? `<span class="film-rating">${film.rating}</span>` : ''}
            </div>
        `;

        filmGrid.appendChild(card);
    });
}

async function fetchRecentFilms() {
    const filmGrid = document.getElementById('filmGrid');
    if (!filmGrid) return;

    try {
        const rssUrl = 'https://letterboxd.com/sharon1/rss/';
        const response = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`);
        const data = await response.json();

        if (data.status === 'ok' && data.items && data.items.length > 0) {
            const items = data.items.slice(0, 12);
            const parsedFilms = items.map(item => {
                const parser = new DOMParser();
                const doc = parser.parseFromString(item.description, 'text/html');
                const imgTag = doc.querySelector('img');
                const parts = item.title.split(' - ');
                return {
                    titleAndYear: parts[0],
                    rating: parts[1] || '',
                    link: item.link,
                    img: imgTag ? imgTag.src : ''
                };
            });
            renderFilmGrid(parsedFilms);
        } else {
            renderFilmGrid(fallbackRecentFilms);
        }
    } catch (err) {
        renderFilmGrid(fallbackRecentFilms);
    }
}

// Fallback Strava Workouts for local file:// mode
const fallbackStravaActivities = [
    {
        emoji: '🏃',
        sport: 'Run',
        name: 'first run club!',
        dateStr: '2026-07-27',
        detail: '5.10 mi · 58m · @ 11:23/mi · ❤️ 174 bpm · ↑ 30ft · cadence 175 spm',
        strava_id: '19494164345',
        map_polyline: 'wduaH`~tiVbCBTP\\`@XTDRJhBCf@If@Q\\ORQJ[FQFWVWd@MH_@JSHOVQJI@SIM?cCvAQFq@n@[R]Pg@Ny@NoAD]@k@GgA@a@FoAAw@CM@s@AgA@YAW?SEKMIEkAWWKi@Kc@Oc@IWM]Ec@@YGsAAeCBm@DwAE{AFkBAa@B_ANQ@UFYNYHu@\\OBe@Vo@RcBx@g@PiAz@o@V]VcAd@_Al@c@RQDWLMDKFi@RuBrAw@`@y@l@m@j@{A~@ST_BnAm@n@MR}@nB[bA?TLTDRCZi@xAI^IL]lAMVS|@]x@m@lBm@nBq@dAm@v@m@VU?QCu@DUEOJ[Be@EkB?]Ce@?]EYB_ACi@BGAMQS}@CaAFm@Bk@LsABc@Hk@XcFHg@?[H[VcDNcAD{@X}C@SLo@JmAAGHSCDB?A@RwCBk@LsA@_@f@qDZoA^_AJc@Vm@fAgBd@k@JYD_@@YC_@A_BEaB?wAAKGCB@FMBV?jB@b@C`ABrBCl@KVMLu@hAw@~Ak@bB[jAYv@Ez@[`CA^UrBAl@@TAb@OTEVCn@GRGfAI`@Af@G`A[|CE|@[dDKdCCJA\\GVKhABRCBKp@GhAI^Bl@DPAl@FVHTRTBABBb@?f@DXE^Dt@ATD^Dn@CP?TF^A^@`@IfAAPA`@KZSXYn@}@j@qAXgAl@_BV_Ab@cB`@uAFUXq@Pm@@MCMQ_@?KDQl@yARq@f@}@p@m@`As@HANYfAw@LSNIr@o@LENMRI\\Yv@[n@a@|@c@b@MPQXQRIl@a@z@a@tAy@TGd@a@`Ac@hAs@jAg@b@GVOXIj@WXG\\O`@Mt@MDEl@CNCX@J@HAp@@XExAGh@Fp@GNBR@FABEN?|@DVG^Ax@Db@JhBVhAXr@Fn@VLBZVp@F`A?dAFREd@CVD`@@h@CRC|@A^DTHl@BZM`AEv@Q~@i@NQTMLM`@SXSL[VUXGPCb@UBBHLL@RYLGDGB{@E[?s@BsA?q@O}@Ua@KICM?g@'
    },
    {
        emoji: '🏊',
        sport: 'Swim',
        name: 'swim',
        dateStr: '2026-07-25',
        detail: '0.34 mi · 30m',
        strava_id: '19467566347',
        map_polyline: ''
    },
    {
        emoji: '🏃',
        sport: 'Run',
        name: 'Morning Run',
        dateStr: '2026-07-19',
        detail: '3.13 mi · 33m · @ 10:39/mi · ❤️ 177 bpm · ↑ 42ft · cadence 174 spm',
        strava_id: '19379397959',
        map_polyline: 'qefaHfleiVG?SFYP]LSCGEKMYoAIKQGeAIUI]Uo@{@GMOg@Sg@Mo@]iAc@iAI[i@sAe@s@k@g@i@Sa@IUCO@k@N]PON]f@Yp@OHWDs@D{@@a@B]A_@?q@Ek@Ke@EYE_@Ce@DUDk@PO@i@JCBo@PWBGFSAYLe@Dw@Rm@DQHYBa@Jq@Hq@?y@GM?}ASUAe@Mc@Wa@u@Sq@S_BIcAC_AYmD[yAQoB@a@JiAPq@RYXYRK`@Ez@[^Wp@[n@k@VKXUXO`@W^a@b@o@^[t@i@f@YTQREHMh@YBI?EAAC@@BRC^M`@E\\Kd@Ej@An@HX?PDr@FjAENCb@EVK^_@R[PI`@a@PIvAGXIPIb@c@ZQRCV?XGVIXYTOPCLAb@PP?d@^PXH`@P`DDNFd@Dp@?VJt@@b@GdA@VOh@GpAHx@^nAVZ^Vb@LfATb@Lb@\\\\b@N`@Jb@Nz@@\\IhBOt@?LCNUh@[d@AFFBFG^w@DCAGHMLk@HcB?i@Co@K{@]_AgA}@g@SwA]g@]c@m@Ss@Ia@Aa@@[ZsADg@?WIy@E_AOeAEk@?e@UuBGYCs@FULGj@FbAZlAt@zB|BbDnDRPhBpBb@lAj@rAPt@^jCZvANpBHb@?TFn@A\\C`@Ml@Ct@@n@B`@DRLRBNCdAB|@AbA@hAAHCD'
    },
    {
        emoji: '🚴',
        sport: 'Ride',
        name: 'Morning Ride',
        dateStr: '2026-07-19',
        detail: '12.18 mi · 51m · @ 14.2 mph · ❤️ 173 bpm · ↑ 93ft',
        strava_id: '19379397974',
        map_polyline: 'adfaHnleiVZBHDDHAPyBdAa@d@MXI^[hDK^[f@a@ZuGnAgL|DmFlCkGlD{CzA_JpCuEtBYZKXG\\q@rJGZUt@MVY\\{@h@qHfEUHUCUM{BoB{@[c@IwAGqAZiAl@q@p@mEtFWt@C^@`@T~@D`@?hEG`@OZmFjGs@dAy@nAk@jA]lAYpBCrA@hRQ~@_@t@u@f@wBhA}@^eA\\oAToAHqC@yBb@aAZaAj@gEhDyBjAkDpAiCx@oAj@aFdAq@V{GdDeAv@iAjAs@bA{@bBeBxE{@rASLUDgFBgAIeCaAyAuAm@a@_Bi@mDwA{Fo@gDj@mA^sCjAwCfA[Dy@ZoAl@}@r@UFsC?c@Gy@BwJScAWo@WqHsBgFu@aEuCgIwBs@]iC}@}@i@}B{@q@g@kAiA{@a@kA_@kDXqACcDQaDAyASiGoAkGWc@Ig@WgB{AaBeB_Am@eAUsA@y@NwAb@mABq@MuC{@e@?u@Z_Ax@k@TiBAs@GaBe@m@Em@@}BZ[@}@_@WCY?q@Nq@GULa@`@w@`@[^}@jB_@jASR{@ZqB|@uDbCuAVuEKy@SwBaAKAGHBLTJXFtAn@l@PrCBbCIxAq@tBwAdEeBPYdAoCXc@vB}AfAEd@M^A|@^\\DhC]vADv@TbAN~BFh@MbA_A\\U`@In@DhBj@vAX|@ArAe@|@OtAEn@JfAl@`D~CxA~@NBjAPfB@vBLxDn@dCl@~L^`AChBObBl@l@b@|AzAx@^~D|AfCjAjHjB~@`@jClBxFx@bG`BnDpA|D@lJTbAKxA{@~EcB~GoCzA]jBUrALfCb@xAd@tAl@`Bb@pCtBx@b@v@Z~@NfGCh@[Z]f@y@^_A\\oAlAuClAwAfBaBjCuAx@g@`Ai@z@[dCm@zFkBpA]~EkBvAw@jA}@`CwBx@e@zCu@|EGbBUzCkAhAk@rA{@\\e@P_@L{@EsQHkCVaB^gAz@yAjAcBzDwEjA}AFg@DmA?}B[oBA_@Da@J[tCwDz@gAbA_AhAe@|@OhAAhAXlA|@xApAh@AdAe@lGmDj@c@d@q@Rm@RgAj@uIHc@N[TQdAm@pCkA`Cu@tDeAxP{IlAw@vNaFdF}@d@W^e@Na@He@TkCLc@P]VUpCwA'
    },
    {
        emoji: '🏋️',
        sport: 'Workout',
        name: 'Morning Workout',
        dateStr: '2026-07-19',
        detail: '0.20 mi · 5m · ❤️ 143 bpm',
        strava_id: '19379397850',
        map_polyline: 'mafaHlmeiVBUACEAqAEMFQNCMCBBAA@@@AA@?A??A?BFFJGABMACE@HFAPMR@BAI]AUFSPQFYVKCBB?FHUIYJUXKh@KLCLGF@JAI'
    },
    {
        emoji: '🏃',
        sport: 'Run',
        name: 'Afternoon Run',
        dateStr: '2026-07-15',
        detail: '1.47 mi · 21m · @ 14:32/mi · ❤️ 142 bpm · cadence 158 spm',
        strava_id: '19331006045',
        map_polyline: 'ojraHlxuiVMBQH?Hg@`A_@jAa@r@q@vAm@v@CRJTJd@JP^Zl@bA@DFHD?CA@A@D?A@?JZf@p@LHJNf@n@pBbDl@h@HPXZDJJALEb@m@ZUPa@NY^i@D?@CABNHRRN?DDl@v@FJACDCD?@JGHAG@GGIDAL@?EBBAGRfA@RFBJNFVW\\Uf@w@xA_@z@g@v@Of@Wl@W^c@|@UVWl@QZ[r@m@fA_ArBSp@Wd@e@pAg@`Ai@vAgAvBi@nAUr@wAzBYj@c@|@ERQTENGFeAzBg@x@ERQ^MNg@hAiAdBcAlAMVCBMMOD[b@oAtAOVGTWf@CN?RJf@@XANKZIBQ`@IKH@JEJQNa@@WGg@?UNeAV_@\\]j@iAJI^o@'
    }
];

async function fetchSixStravaWorkouts() {
    const grid = document.getElementById('stravaGrid');
    if (!grid) return;

    let data = null;
    const paths = ['private/strava_data.json', './private/strava_data.json', '/private/strava_data.json'];
    for (const p of paths) {
        try {
            const response = await fetch(p + '?v=' + Date.now(), { cache: 'no-store' });
            if (response.ok) {
                data = await response.json();
                break;
            }
        } catch (err) {}
    }

    let topSix = [];
    if (data && data.activities_by_date) {
        const dates = Object.keys(data.activities_by_date).sort().reverse();
        const allActivities = [];
        dates.forEach(dateStr => {
            const acts = data.activities_by_date[dateStr];
            acts.forEach(act => {
                allActivities.push({ ...act, dateStr: dateStr });
            });
        });
        topSix = allActivities.slice(0, 6);
    }

    if (topSix.length === 0) {
        topSix = fallbackStravaActivities;
    }

    grid.innerHTML = '';
    topSix.forEach(act => {
        const dateObj = new Date(act.dateStr + 'T00:00:00');
        const formattedDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

        const card = document.createElement('a');
        card.href = act.strava_id ? `https://www.strava.com/activities/${act.strava_id}` : 'https://www.strava.com/athletes/197020850';
        card.target = '_blank';
        card.rel = 'noopener';
        card.className = 'strava-card';

        const svgMapHtml = act.map_polyline ? generateSvgMapHtml(act.map_polyline) : '';

        card.innerHTML = `
            <div class="strava-header">
                <span class="strava-title">${act.emoji || '🏃'} ${act.name}</span>
                <span class="strava-location">${formattedDate} • ${act.sport || 'Run'}</span>
                <span class="strava-metrics">${act.detail}</span>
            </div>
            ${svgMapHtml ? `<div class="strava-map-container">${svgMapHtml}</div>` : ''}
        `;

        grid.appendChild(card);
    });
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


