const PASS_HASH = 'e4782cfc2b471cd4e24686f692188416d8a313cccb62679dc08c348447c2507b';

const TRAINING_PLAN = [
    ['2026-08-03', 'Easy run + strength', 'Run club 4 mi, strength work, and an easy row.'],
    ['2026-08-04', 'Strength A + bike', 'Session A with a 10-minute row, then 60 minutes easy on the bike.'],
    ['2026-08-05', 'Row + swim', 'Easy row, short StairStepper effort, and 25 minutes of relaxed swimming.'],
    ['2026-08-06', 'Strength B + bike', 'Session B, 15 minutes on the stairs, then 60 minutes easy on the bike.'],
    ['2026-08-07', 'Easy run + strides', '4 easy miles with four 20-second strides, then an easy swim.'],
    ['2026-08-08', 'Long run · 6 mi', 'Run 6 miles at 11:15–11:45 per mile, followed by Session C.'],
    ['2026-08-09', 'Ride + recovery swim', 'Ride 90–105 minutes easy, then swim 20 minutes restorative.'],
    ['2026-08-10', 'Easy run · 4 mi', 'Run 4 miles easy, then swim 30 minutes easy.'],
    ['2026-08-11', 'Strength A + bike', 'Session A with a 10-minute row, then 60 minutes easy on the bike.'],
    ['2026-08-12', 'Intervals · 4 × 800 m', 'Warm up 1 mile, run 4 × 800 m at 9:45–10:00 per mile, cool down 1 mile, then swim 25 minutes.'],
    ['2026-08-13', 'Strength B + bike', 'Session B, 15 minutes on the stairs, then 60 minutes easy on the bike.'],
    ['2026-08-14', 'Easy run + strides', 'Run 4 easy miles with four strides, then swim 25 minutes.'],
    ['2026-08-15', 'Long run · 8 mi', 'Run 8 miles at 11:15–11:45 per mile, then complete Session C.'],
    ['2026-08-16', 'Aerobic choice', 'Run 6 miles or ride 90 minutes, then swim 20 minutes recovery.'],
    ['2026-08-17', 'Easy run · 4 mi', 'Run 4 miles easy, then swim 30 minutes easy.'],
    ['2026-08-18', 'Strength A + bike', 'Session A with a 10-minute row, then 60 minutes easy on the bike.'],
    ['2026-08-19', 'Intervals · 5 × 800 m', 'Warm up 1 mile, run 5 × 800 m at 9:45–10:00 per mile, cool down, then swim.'],
    ['2026-08-20', 'Strength B + bike', 'Session B, 15 minutes on the stairs, then 60 minutes easy on the bike.'],
    ['2026-08-21', 'Easy run + strides', 'Run 4 easy miles with four strides, then swim 25 minutes.'],
    ['2026-08-22', 'Long run · 9 mi', 'Run 7 miles easy and finish 2 miles near 10:30 pace, then complete Session C.'],
    ['2026-08-23', 'Aerobic choice', 'Run 6 miles or ride 2 hours, then swim 20 minutes recovery.'],
    ['2026-08-24', 'Easy run · 4 mi', 'Run 4 miles easy, then swim 30 minutes easy.'],
    ['2026-08-25', 'Strength A + bike', 'Session A with a 10-minute row, then 60 minutes easy on the bike.'],
    ['2026-08-26', 'Tempo · 3 mi', 'Warm up 1 mile, run 3 miles at 10:15–10:25 pace, cool down, then swim.'],
    ['2026-08-27', 'Strength B + bike', 'Session B, 10–15 minutes on the stairs, then 45–60 minutes easy on the bike.'],
    ['2026-08-28', 'Easy run · 3 mi', 'Run 3 easy miles with four strides, then swim 25 minutes.'],
    ['2026-08-29', 'Long run · 10–11 mi', 'Run easy at 11:15–11:45 per mile, then complete a reduced Session C.'],
    ['2026-08-30', 'Aerobic choice', 'Run 6 miles or ride 90 minutes, then swim 20 minutes recovery.'],
    ['2026-08-31', 'Easy run · 3–4 mi', 'Run easy, then swim 30 minutes.'],
    ['2026-09-01', 'Reduced Strength A', 'Reduced Session A, then ride 45 minutes easy.'],
    ['2026-09-02', 'Run + pickups', 'Run 4 miles with six 30-second goal-pace pickups, then swim 25 minutes.'],
    ['2026-09-03', 'Reduced Strength B', 'Reduced Session B, then ride 40 minutes easy.'],
    ['2026-09-04', 'Shakeout · 2 mi', 'Run 2 miles easy, then swim 20 minutes.'],
    ['2026-09-05', 'Confidence run · 13.1 mi', 'Complete 13.1 miles strictly easy at 12:00–12:30 per mile.'],
    ['2026-09-06', 'Recovery option', 'Run 6 miles only if recovered, then swim 20 minutes restorative.'],
    ['2026-09-07', 'Recovery swim', 'Swim 30 minutes easy and omit the run.'],
    ['2026-09-08', 'Reduced Strength A', 'Reduced Session A, then ride 45 minutes easy.'],
    ['2026-09-09', 'Race rehearsal', 'Warm up 1 mile, run 3 miles at 10:15–10:20 pace, cool down, then swim.'],
    ['2026-09-10', 'Reduced Strength B', 'Reduced Session B, then ride 45 minutes easy.'],
    ['2026-09-11', 'Easy run · 3 mi', 'Run 3 easy miles with four strides, then swim 25 minutes.'],
    ['2026-09-12', 'Final long run · 7–8 mi', 'Run easy, then complete an upper-body Session C.'],
    ['2026-09-13', 'Aerobic choice', 'Run 6 miles or ride 60 minutes, then swim 20 minutes recovery.'],
    ['2026-09-14', 'Easy run · 3 mi', 'Run easy with four strides, then swim 20 minutes.'],
    ['2026-09-15', 'Activation A', 'Complete 20 minutes of light strength, then ride 30–40 minutes.'],
    ['2026-09-16', 'Pace check', 'Warm up 1 mile, run 2 miles at 10:18 pace, cool down half a mile, then swim.'],
    ['2026-09-17', 'Activation B', 'Complete 15 minutes of light strength. No stairs or bike.'],
    ['2026-09-18', 'Easy run · 2 mi', 'Run very easy, swim 15–20 minutes, then begin race preparation.'],
    ['2026-09-19', 'Shakeout', 'Jog 15 minutes easy with four strides. Prioritize an early night.'],
    ['2026-09-20', 'Race day · 13.1 mi', 'Target 2:15 with an average pace near 10:18 per mile.']
].map(([date, title, detail]) => ({ date, title, detail }));

const ROUTINES = {
    a: {
        title: 'Session A · Tuesday',
        moves: ['Row warm-up · 8–10 min', 'Smith squat · 3 × 6–8', 'Dumbbell RDL · 3 × 8–10', 'Smith bench press · 3 × 8–10', 'Weighted row · 3 × 8–10', 'Triceps pushdown · 2 × 10–12', 'Farmer carry · 3 × 30–40 sec']
    },
    b: {
        title: 'Session B · Thursday',
        moves: ['Mobility + glute bridges', 'Smith hip thrust · 3 × 8–10', 'Reverse lunge · 2 × 8 / side', 'Shoulder press · 3 × 8–10', 'Lat pulldown · 3 × 8–12', 'One-arm row · 2 × 10 / side', 'Pallof press · 2 × 10 / side']
    },
    c: {
        title: 'Session C · Saturday',
        moves: ['Smith bench press · 3 × 8–10', 'Weighted row · 3 × 8–10', 'Lat pulldown · 2 × 10–12', 'Shoulder press · 2 × 10', 'Triceps pushdown · 2 × 12–15', 'Biceps curl · 2 × 10–12', 'Light hip thrust + Pallof press']
    }
};

let garminData = null;
let stravaData = null;
let googleCalendarData = {};

async function sha256(value) {
    const encoded = new TextEncoder().encode(value);
    const digest = await crypto.subtle.digest('SHA-256', encoded);
    return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('');
}

function isLocalPreview() {
    return ['127.0.0.1', 'localhost'].includes(window.location.hostname)
        && new URLSearchParams(window.location.search).get('preview') === '1';
}

async function unlock(event) {
    if (event) event.preventDefault();
    const input = document.getElementById('passwordInput');
    const valid = isLocalPreview() || await sha256(input.value.trim()) === PASS_HASH;
    if (!valid) {
        document.getElementById('authError').classList.add('visible');
        input.value = '';
        input.focus();
        return;
    }

    sessionStorage.setItem('sharon_private_unlocked', 'true');
    sessionStorage.setItem('sharon_fit_unlocked', 'true');
    sessionStorage.setItem('todoUnlocked', 'true');
    showApp();
}

function showApp() {
    document.getElementById('authScreen').hidden = true;
    document.getElementById('app').hidden = false;
    loadDashboard();
}

function lock() {
    ['sharon_private_unlocked', 'sharon_fit_unlocked', 'todoUnlocked'].forEach(key => {
        sessionStorage.removeItem(key);
        localStorage.removeItem(key);
    });
    document.getElementById('app').hidden = true;
    document.getElementById('authScreen').hidden = false;
    document.getElementById('passwordInput').value = '';
    document.getElementById('passwordInput').focus();
}

function localDateKey(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function parseLocalDate(key) {
    return new Date(`${key}T12:00:00`);
}

function formatShortDate(key) {
    return parseLocalDate(key).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatPlanDate(key) {
    return parseLocalDate(key).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

async function fetchFirst(paths) {
    for (const path of paths) {
        try {
            const response = await fetch(`${path}?v=${Date.now()}`, { cache: 'no-store' });
            if (response.ok) return await response.json();
        } catch (error) {
            // Try the next local path.
        }
    }
    throw new Error('No data source was available.');
}

async function loadDashboard() {
    setSyncStatus('Refreshing Garmin and Strava');
    document.getElementById('currentDate').textContent = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    });

    const garminPaths = [
        '../private/garmin_data.json',
        '/private/garmin_data.json',
        'private/garmin_data.json',
        'https://sharonsantos.me/private/garmin_data.json'
    ];
    const stravaPaths = [
        '../private/strava_data.json',
        '/private/strava_data.json',
        'private/strava_data.json',
        'https://sharonsantos.me/private/strava_data.json'
    ];
    const gcalPaths = [
        'gcal_imported_events.json',
        './gcal_imported_events.json',
        '/fit/gcal_imported_events.json',
        'fit/gcal_imported_events.json',
        '../fit/gcal_imported_events.json',
        'https://sharonsantos.me/fit/gcal_imported_events.json'
    ];

    [garminData, stravaData, googleCalendarData] = await Promise.all([
        fetchFirst(garminPaths).catch(() => ({ stats: {}, today: localDateKey(), activities_by_date: {}, steps_history: {}, sleep_history: {} })),
        fetchFirst(stravaPaths).catch(() => ({ activities_by_date: {} })),
        fetchFirst(gcalPaths).catch(() => ({}))
    ]);

    renderDashboard();
    const fetched = garminData?.fetched_at ? new Date(garminData.fetched_at) : null;
    setSyncStatus(fetched && !Number.isNaN(fetched.getTime()) ? `Garmin synced ${fetched.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}` : 'Health data synced');
}

function setSyncStatus(text, error = false) {
    const status = document.getElementById('syncStatus');
    status.textContent = text;
    status.closest('.sync-line').classList.toggle('error', error);
}

function renderDashboard() {
    const stats = garminData.stats || {};
    const today = garminData.today || localDateKey();
    renderToday(today, stats);
    renderMetrics(stats);
    renderWeek(today);
    renderTrainingCalendar(today);
    renderTrends();
    renderUpcoming(today);
    renderRoutine('a');
    renderRaceCountdown(today);
}

function getActivities(dateKey) {
    const strava = stravaData?.activities_by_date?.[dateKey] || [];
    const garmin = garminData?.activities_by_date?.[dateKey] || [];
    return strava.length ? strava : garmin;
}

function renderToday(today, stats) {
    const planned = TRAINING_PLAN.find(item => item.date === today);
    const next = TRAINING_PLAN.find(item => item.date > today);
    const session = planned || next;
    document.getElementById('todayPlanDate').textContent = planned ? 'Today' : (next ? `Next · ${formatShortDate(next.date)}` : 'Plan complete');
    document.getElementById('todayTitle').textContent = session?.title || 'Recovery and reflection';
    document.getElementById('todayPlanDetail').textContent = session?.detail || 'The training block is complete. Keep moving in ways that feel restorative.';

    const activities = getActivities(today);
    const actual = document.getElementById('todayActual');
    actual.replaceChildren();
    const label = document.createElement('span');
    label.className = 'actual-label';
    label.textContent = 'Actual';
    const detail = document.createElement('span');
    detail.textContent = activities.length
        ? activities.map(activity => activity.detail ? `${activity.name || activity.sport}: ${activity.detail}` : (activity.name || activity.type || 'Workout')).join(' · ')
        : 'No activity logged yet';
    actual.append(label, detail);

    const readiness = calculateReadiness(stats);
    const ring = document.getElementById('readinessRing');
    ring.style.setProperty('--ready', `${readiness.value}%`);
    document.getElementById('readinessValue').textContent = readiness.value;
    document.getElementById('readinessLabel').textContent = readiness.label;
    document.getElementById('readinessNote').textContent = readiness.note;
}

function calculateReadiness(stats) {
    const sleep = Number(stats.sleep_score) || 75;
    const rhr = Number(stats.resting_hr) || 50;
    const heartSignal = Math.max(45, Math.min(100, 100 - Math.max(0, rhr - 44) * 3));
    const value = Math.round(sleep * 0.72 + heartSignal * 0.28);
    if (value >= 88) return { value, label: 'Ready for quality work', note: 'Recovery markers support the planned session. Keep the easy work easy.' };
    if (value >= 75) return { value, label: 'Steady and available', note: 'Proceed as planned, then adjust if your warm-up feels unusually heavy.' };
    return { value, label: 'Protect the base', note: 'Favor easy movement, food, and sleep over forcing intensity today.' };
}

function renderMetrics(stats) {
    const steps = Number(stats.steps) || 0;
    const stepGoal = Number(stats.step_goal) || 15000;
    const sleepHours = Number(stats.sleep_hours) || 0;
    const sleepScore = Number(stats.sleep_score) || 0;
    const rhr = Number(stats.resting_hr) || 0;
    const calories = Number(stats.active_calories) || 0;

    document.getElementById('stepsValue').textContent = steps.toLocaleString();
    document.getElementById('stepsGoal').textContent = `Goal ${stepGoal.toLocaleString()}`;
    document.getElementById('stepsProgress').style.width = `${Math.min(100, steps / stepGoal * 100)}%`;
    document.getElementById('sleepValue').textContent = `${sleepHours.toFixed(1)} hr`;
    document.getElementById('sleepScore').textContent = `Score ${sleepScore || '—'}`;
    document.getElementById('sleepNote').textContent = sleepScore >= 85 ? 'Strong recovery night' : 'Last night';
    document.getElementById('rhrValue').textContent = rhr ? `${rhr} bpm` : '—';
    document.getElementById('rhrNote').textContent = rhr && rhr <= 50 ? 'Quiet cardiovascular baseline' : 'Beats per minute';
    document.getElementById('calorieValue').textContent = calories ? `${calories} kcal` : '0 kcal';
    document.getElementById('calorieProgress').style.width = `${Math.min(100, calories / 500 * 100)}%`;
}

function startOfWeek(date) {
    const result = new Date(date);
    const day = (result.getDay() + 6) % 7;
    result.setDate(result.getDate() - day);
    result.setHours(12, 0, 0, 0);
    return result;
}

function renderWeek(todayKey) {
    const container = document.getElementById('weekStrip');
    const weekStart = startOfWeek(parseLocalDate(todayKey));
    let completed = 0;
    container.replaceChildren();

    for (let index = 0; index < 7; index++) {
        const date = new Date(weekStart);
        date.setDate(weekStart.getDate() + index);
        const key = localDateKey(date);
        const plan = TRAINING_PLAN.find(item => item.date === key);
        const activities = getActivities(key);
        if (activities.length) completed++;

        const day = document.createElement('article');
        day.className = `week-day${key === todayKey ? ' today' : ''}${activities.length ? ' complete' : ''}`;
        const dateLabel = document.createElement('span');
        dateLabel.className = 'week-date';
        dateLabel.textContent = date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' });
        const title = document.createElement('h3');
        title.textContent = plan?.title || 'Open day';
        const detail = document.createElement('p');
        detail.textContent = plan?.detail || 'Recovery, mobility, or unstructured movement.';
        const status = document.createElement('span');
        status.className = 'week-status';
        status.textContent = activities.length ? `${activities.length} activit${activities.length === 1 ? 'y' : 'ies'} logged` : (key < todayKey ? 'No activity logged' : 'Planned');
        day.append(dateLabel, title, detail, status);
        container.appendChild(day);
    }

    document.getElementById('weekSummary').textContent = `${completed} of 7 days have recorded movement`;
}

function renderTrainingCalendar(todayKey) {
    const body = document.getElementById('trainingCalendarBody');
    body.replaceChildren();
    const weeks = [];
    for (let index = 0; index < TRAINING_PLAN.length; index += 7) {
        weeks.push(TRAINING_PLAN.slice(index, index + 7));
    }

    let stravaDays = 0;
    let calendarDays = 0;
    weeks.forEach(week => {
        const row = document.createElement('tr');
        week.forEach(plan => {
            const activities = stravaData?.activities_by_date?.[plan.date] || [];
            const calendarEvents = googleCalendarData?.[plan.date] || [];
            if (activities.length) stravaDays++;
            if (calendarEvents.length) calendarDays++;

            const cell = document.createElement('td');
            if (plan.date < todayKey) cell.classList.add('past');
            if (plan.date === todayKey) cell.classList.add('today');
            if (activities.length) cell.classList.add('strava-verified');

            const dateLine = document.createElement('div');
            dateLine.className = 'calendar-date';
            const date = document.createElement('strong');
            date.textContent = formatShortDate(plan.date);
            const weekLabel = document.createElement('span');
            weekLabel.textContent = `Week ${weeks.indexOf(week) + 1}`;
            dateLine.append(date, weekLabel);

            const tags = document.createElement('div');
            tags.className = 'workout-tags';
            classifyWorkouts(plan).forEach(type => {
                const tag = document.createElement('span');
                tag.className = `workout-tag ${type.key}`;
                tag.textContent = type.label;
                tags.appendChild(tag);
            });

            const title = document.createElement('h3');
            title.className = 'calendar-workout-title';
            title.textContent = plan.title;
            const detail = document.createElement('p');
            detail.className = 'calendar-workout-detail';
            detail.textContent = plan.detail;

            const integrations = document.createElement('div');
            integrations.className = 'calendar-integrations';
            activities.forEach(activity => integrations.appendChild(stravaIntegration(activity)));
            calendarEvents.forEach(event => integrations.appendChild(calendarIntegration(event)));

            const exportLink = document.createElement('a');
            exportLink.className = 'calendar-export-link';
            exportLink.href = calendarUrl(plan);
            exportLink.target = '_blank';
            exportLink.rel = 'noopener';
            exportLink.textContent = 'Add to GCal ↗';
            exportLink.setAttribute('aria-label', `Add ${plan.title} on ${formatPlanDate(plan.date)} to Google Calendar`);

            cell.append(dateLine, tags, title, detail, integrations, exportLink);
            row.appendChild(cell);
        });
        body.appendChild(row);
    });

    document.getElementById('calendarSummary').textContent =
        `7 weeks · ${stravaDays} Strava days · ${calendarDays} Calendar days`;
}

function classifyWorkouts(plan) {
    const text = `${plan.title} ${plan.detail}`.toLowerCase();
    const definitions = [
        { key: 'race', label: 'Race', terms: ['race day', '13.1'] },
        { key: 'run', label: 'Run', terms: ['run', 'interval', 'tempo', 'stride', 'shakeout', 'rehearsal', 'pace check'] },
        { key: 'strength', label: 'Strength', terms: ['strength', 'session a', 'session b', 'session c', 'activation'] },
        { key: 'row', label: 'Row', terms: ['row'] },
        { key: 'stairs', label: 'Stairs', terms: ['stair'] },
        { key: 'bike', label: 'Bike', terms: ['bike', 'ride'] },
        { key: 'swim', label: 'Swim', terms: ['swim'] }
    ];
    const matches = definitions.filter(type => type.terms.some(term => text.includes(term)));
    return matches.length ? matches : [{ key: 'recovery', label: 'Recovery' }];
}

function stravaIntegration(activity) {
    const block = document.createElement('div');
    block.className = 'integration-block strava';
    const source = document.createElement('span');
    source.className = 'integration-source';
    source.textContent = `Strava actual · ${activity.sport || 'Workout'}`;
    const title = activity.strava_id ? document.createElement('a') : document.createElement('strong');
    title.textContent = activity.name || activity.sport || 'Workout';
    if (activity.strava_id) {
        title.href = `https://www.strava.com/activities/${activity.strava_id}`;
        title.target = '_blank';
        title.rel = 'noopener';
    }
    block.append(source, title);
    if (activity.detail) {
        const detail = document.createElement('p');
        detail.textContent = activity.detail;
        block.appendChild(detail);
    }
    return block;
}

function calendarIntegration(event) {
    const block = document.createElement('div');
    block.className = 'integration-block gcal';
    const source = document.createElement('span');
    source.className = 'integration-source';
    source.textContent = `Google Calendar · ${event.cal || 'Imported'}`;
    const title = document.createElement('strong');
    title.textContent = event.title || 'Calendar event';
    block.append(source, title);
    if (event.detail) {
        const details = document.createElement('details');
        const summary = document.createElement('summary');
        summary.textContent = 'Event details';
        const copy = document.createElement('p');
        copy.textContent = event.detail;
        details.append(summary, copy);
        block.appendChild(details);
    }
    return block;
}

function renderTrends() {
    const stepEntries = Object.entries(garminData.steps_history || {})
        .sort(([a], [b]) => a.localeCompare(b))
        .slice(-14)
        .map(([date, item]) => ({ date, value: Number(item?.steps ?? item) || 0, goal: Number(item?.goal) || 15000 }));
    const sleepEntries = Object.entries(garminData.sleep_history || {})
        .sort(([a], [b]) => a.localeCompare(b))
        .slice(-14)
        .map(([date, item]) => ({ date, value: Number(item?.score ?? item) || 0 }));

    const stepAvg = average(stepEntries.map(item => item.value));
    const sleepAvg = average(sleepEntries.map(item => item.value));
    document.getElementById('stepsAverage').textContent = `${Math.round(stepAvg).toLocaleString()} / day`;
    document.getElementById('stepsGoalDays').textContent = `${stepEntries.filter(item => item.value >= item.goal).length} goal days`;
    document.getElementById('sleepAverage').textContent = `${Math.round(sleepAvg)} average`;
    document.getElementById('sleepBest').textContent = `Best ${Math.max(0, ...sleepEntries.map(item => item.value))}`;
    drawChart(document.getElementById('stepsChart'), stepEntries.map(item => item.value), false);
    drawChart(document.getElementById('sleepChart'), sleepEntries.map(item => item.value), true);
}

function average(values) {
    return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
}

function drawChart(svg, values, sleep) {
    svg.replaceChildren();
    if (!values.length) return;
    const width = 640;
    const height = 190;
    const padding = 14;
    const max = Math.max(...values, 1);
    const min = Math.min(...values);
    const range = Math.max(1, max - min);
    const points = values.map((value, index) => {
        const x = padding + index * ((width - padding * 2) / Math.max(1, values.length - 1));
        const y = height - padding - ((value - min) / range) * (height - padding * 2);
        return [x, y];
    });

    [48, 95, 142].forEach(y => {
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', '0');
        line.setAttribute('x2', String(width));
        line.setAttribute('y1', String(y));
        line.setAttribute('y2', String(y));
        line.setAttribute('class', 'chart-grid');
        svg.appendChild(line);
    });

    const area = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    area.setAttribute('d', `M ${points[0][0]} ${height - padding} L ${points.map(point => point.join(' ')).join(' L ')} L ${points.at(-1)[0]} ${height - padding} Z`);
    area.setAttribute('class', `chart-area${sleep ? ' sleep' : ''}`);
    svg.appendChild(area);

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
    path.setAttribute('points', points.map(point => point.join(',')).join(' '));
    path.setAttribute('class', `chart-line${sleep ? ' sleep' : ''}`);
    svg.appendChild(path);

    points.forEach(point => {
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', String(point[0]));
        circle.setAttribute('cy', String(point[1]));
        circle.setAttribute('r', '3.5');
        circle.setAttribute('class', `chart-dot${sleep ? ' sleep' : ''}`);
        svg.appendChild(circle);
    });
}

function renderUpcoming(today) {
    const list = document.getElementById('upcomingList');
    const upcoming = TRAINING_PLAN.filter(item => item.date >= today).slice(0, 6);
    list.replaceChildren();

    upcoming.forEach(item => {
        const row = document.createElement('article');
        row.className = 'upcoming-item';
        const date = document.createElement('div');
        date.className = 'upcoming-date';
        date.textContent = formatPlanDate(item.date);
        const copy = document.createElement('div');
        const title = document.createElement('h3');
        title.textContent = item.title;
        const detail = document.createElement('p');
        detail.textContent = item.detail;
        copy.append(title, detail);
        const link = document.createElement('a');
        link.className = 'calendar-link';
        link.href = calendarUrl(item);
        link.target = '_blank';
        link.rel = 'noopener';
        link.textContent = '↗';
        link.setAttribute('aria-label', `Add ${item.title} to Google Calendar`);
        row.append(date, copy, link);
        list.appendChild(row);
    });
}

function calendarUrl(item) {
    const date = item.date.replaceAll('-', '');
    const params = new URLSearchParams({
        action: 'TEMPLATE',
        text: item.title,
        dates: `${date}T090000/${date}T100000`,
        details: item.detail
    });
    return `https://calendar.google.com/calendar/render?${params}`;
}

function exportFullPlan() {
    const escapeIcs = value => String(value)
        .replaceAll('\\', '\\\\')
        .replaceAll('\n', '\\n')
        .replaceAll(',', '\\,')
        .replaceAll(';', '\\;');
    const lines = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Sharon Santos//Half Marathon Training Plan//EN',
        'CALSCALE:GREGORIAN'
    ];
    TRAINING_PLAN.forEach(item => {
        lines.push(
            'BEGIN:VEVENT',
            `UID:training-${item.date}@sharonsantos.me`,
            `DTSTART;VALUE=DATE:${item.date.replaceAll('-', '')}`,
            `SUMMARY:${escapeIcs(item.title)}`,
            `DESCRIPTION:${escapeIcs(item.detail)}`,
            'END:VEVENT'
        );
    });
    lines.push('END:VCALENDAR');
    const blob = new Blob([`${lines.join('\r\n')}\r\n`], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'Sharon_Santos_Half_Marathon_Plan.ics';
    link.click();
    URL.revokeObjectURL(link.href);
}

function importCalendarFile(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.addEventListener('load', () => {
        const events = parseIcs(String(reader.result || ''));
        events.forEach(item => {
            googleCalendarData[item.date] ||= [];
            googleCalendarData[item.date].push({
                title: item.title,
                detail: item.detail,
                cal: 'Imported .ics'
            });
        });
        renderTrainingCalendar(garminData?.today || localDateKey());
        event.target.value = '';
    });
    reader.readAsText(file);
}

function parseIcs(text) {
    const unfolded = text.replace(/\r?\n[ \t]/g, '');
    const blocks = unfolded.match(/BEGIN:VEVENT[\s\S]*?END:VEVENT/g) || [];
    return blocks.map(block => {
        const read = key => {
            const match = block.match(new RegExp(`^${key}[^:]*:(.*)$`, 'm'));
            return match ? match[1].replaceAll('\\n', '\n').replaceAll('\\,', ',').replaceAll('\\;', ';') : '';
        };
        const rawDate = read('DTSTART').replace(/\D/g, '').slice(0, 8);
        return {
            date: rawDate.length === 8 ? `${rawDate.slice(0, 4)}-${rawDate.slice(4, 6)}-${rawDate.slice(6, 8)}` : '',
            title: read('SUMMARY') || 'Imported event',
            detail: read('DESCRIPTION')
        };
    }).filter(item => item.date);
}

function renderRaceCountdown(today) {
    const race = parseLocalDate('2026-09-20');
    const current = parseLocalDate(today);
    const days = Math.ceil((race - current) / 86400000);
    document.getElementById('raceCountdown').textContent = days > 0 ? `${days} days to race day` : (days === 0 ? 'Race day' : 'Training block complete');
}

function renderRoutine(key) {
    const routine = ROUTINES[key];
    document.getElementById('routineTitle').textContent = routine.title;
    const list = document.getElementById('routineList');
    list.replaceChildren();
    routine.moves.forEach(move => {
        const item = document.createElement('li');
        item.textContent = move;
        list.appendChild(item);
    });
    document.querySelectorAll('[data-routine]').forEach(button => button.classList.toggle('active', button.dataset.routine === key));
}

function calculatePace() {
    const parts = document.getElementById('finishTime').value.split(':').map(Number);
    if (parts.length !== 3 || parts.some(Number.isNaN)) return;
    const totalSeconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
    document.getElementById('paceResult').textContent = `${formatClock(totalSeconds / 13.1094, false)} / mi`;
    document.getElementById('fiveKResult').textContent = formatClock(totalSeconds * (5 / 21.0975), true);
    document.getElementById('tenKResult').textContent = formatClock(totalSeconds * (10 / 21.0975), true);
}

function formatClock(seconds, includeHours) {
    const rounded = Math.round(seconds);
    const hours = Math.floor(rounded / 3600);
    const minutes = Math.floor((rounded % 3600) / 60);
    const secs = rounded % 60;
    return includeHours && hours
        ? `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
        : `${minutes + hours * 60}:${String(secs).padStart(2, '0')}`;
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('authForm').addEventListener('submit', unlock);
    document.getElementById('lockBtn').addEventListener('click', lock);
    document.getElementById('refreshBtn').addEventListener('click', loadDashboard);
    document.getElementById('paceBtn').addEventListener('click', calculatePace);
    document.getElementById('exportPlanBtn').addEventListener('click', exportFullPlan);
    document.getElementById('importPlanInput').addEventListener('change', importCalendarFile);
    document.querySelectorAll('[data-routine]').forEach(button => {
        button.addEventListener('click', () => renderRoutine(button.dataset.routine));
    });

    if (isLocalPreview() || sessionStorage.getItem('sharon_private_unlocked') === 'true') {
        showApp();
    } else {
        document.getElementById('passwordInput').focus();
    }
});
