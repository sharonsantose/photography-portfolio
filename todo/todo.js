const PASS_HASH = 'e4782cfc2b471cd4e24686f692188416d8a313cccb62679dc08c348447c2507b';
const PROXY = 'https://sharon-todo-proxy.sharon5234.workers.dev';

const HABITS = [
    { id: 'creatine', name: 'Creatine + inositol', source: 'Manual' },
    { id: 'read', name: 'Read', source: 'Manual' },
    { id: 'journal', name: 'Journal', source: 'Manual' },
    { id: 'strava', name: 'Workout', source: 'Strava', readonly: true },
    { id: 'garmin_steps', name: '15k steps', source: 'Garmin', readonly: true },
    { id: 'garmin_calories', name: '500 active kcal', source: 'Garmin', readonly: true }
];

const CATEGORY_LABELS = {
    life: 'Life',
    photo: 'Creative',
    running: 'Training',
    health: 'Health'
};

let todos = [];
let habitsData = {};
let stravaDates = new Set();
let garminStepDates = new Set();
let garminCalorieDates = new Set();
let currentFilter = 'all';
let isSaving = false;
let saveQueued = false;

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
    initializeWorkspace();
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

async function fetchFirst(paths) {
    for (const path of paths) {
        try {
            const response = await fetch(`${path}?v=${Date.now()}`, { cache: 'no-store' });
            if (response.ok) return response.json();
        } catch (error) {
            // Try the next data source.
        }
    }
    throw new Error('No data source was available.');
}

async function initializeWorkspace() {
    document.getElementById('currentDate').textContent = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    });
    setSyncStatus('Loading your space');

    await Promise.all([loadAutomaticHabits(), loadTaskData()]);
    renderAll();
    window.clearInterval(window.todoPollTimer);
    window.todoPollTimer = window.setInterval(refreshFromCloud, 60000);
}

async function loadAutomaticHabits() {
    const [stravaResult, garminResult] = await Promise.allSettled([
        fetchFirst(['../private/strava_data.json', '/private/strava_data.json']),
        fetchFirst(['../private/garmin_data.json', '/private/garmin_data.json'])
    ]);

    if (stravaResult.status === 'fulfilled') {
        stravaDates = new Set(Object.keys(stravaResult.value.activities_by_date || {}));
    }

    if (garminResult.status === 'fulfilled') {
        const data = garminResult.value;
        Object.entries(data.steps_history || {}).forEach(([date, item]) => {
            const steps = Number(item?.steps ?? item) || 0;
            const goal = Number(item?.goal) || 15000;
            if (steps >= goal) garminStepDates.add(date);

            const activityCalories = (data.activities_by_date?.[date] || [])
                .reduce((sum, activity) => sum + (Number(activity.calories) || 0), 0);
            if (Math.max(activityCalories, Math.round(steps * 0.045)) >= 500) {
                garminCalorieDates.add(date);
            }
        });
    }
}

async function loadTaskData() {
    try {
        const response = await fetch(`${PROXY}?v=${Date.now()}`, { cache: 'no-store' });
        if (!response.ok) throw new Error(`Cloud read ${response.status}`);
        const data = await response.json();
        applyData(data);
        cacheSnapshot();
        setSyncStatus('Cloud synced', 'synced');
        return;
    } catch (cloudError) {
        console.warn(cloudError);
    }

    try {
        const cached = JSON.parse(localStorage.getItem('sharon_todo_snapshot') || 'null');
        if (cached) {
            applyData(cached);
            setSyncStatus('Using saved copy', 'error');
            return;
        }
    } catch (error) {
        localStorage.removeItem('sharon_todo_snapshot');
    }

    try {
        const local = await fetchFirst(['../private/todo_data.json', '/private/todo_data.json']);
        applyData(local);
        setSyncStatus('Local data loaded', 'error');
    } catch (error) {
        todos = [];
        habitsData = {};
        setSyncStatus('Offline · changes stay local', 'error');
    }
}

function applyData(data) {
    todos = Array.isArray(data.todos) ? data.todos : [];
    habitsData = data.habits && typeof data.habits === 'object' ? data.habits : {};
}

function cacheSnapshot() {
    localStorage.setItem('sharon_todo_snapshot', JSON.stringify({ todos, habits: habitsData }));
}

async function refreshFromCloud() {
    if (isSaving || document.hidden) return;
    try {
        const response = await fetch(`${PROXY}?v=${Date.now()}`, { cache: 'no-store' });
        if (!response.ok) return;
        applyData(await response.json());
        cacheSnapshot();
        renderAll();
        setSyncStatus('Cloud synced', 'synced');
    } catch (error) {
        // Keep the local state without interrupting the user.
    }
}

async function saveData() {
    cacheSnapshot();
    if (isSaving) {
        saveQueued = true;
        return;
    }

    isSaving = true;
    setSyncStatus('Saving');
    try {
        const response = await fetch(PROXY, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ todos, habits: habitsData })
        });
        if (!response.ok) throw new Error(`Cloud write ${response.status}`);
        setSyncStatus('Cloud synced', 'synced');
    } catch (error) {
        console.warn(error);
        setSyncStatus('Saved on this device', 'error');
    } finally {
        isSaving = false;
        if (saveQueued) {
            saveQueued = false;
            saveData();
        }
    }
}

function setSyncStatus(text, state = '') {
    document.getElementById('syncStatus').textContent = text;
    const line = document.querySelector('.sync-line');
    line.classList.toggle('synced', state === 'synced');
    line.classList.toggle('error', state === 'error');
}

function renderAll() {
    renderFocus();
    renderTasks();
    renderTodayHabits();
    renderHabitWeek();
    renderCompleted();
}

function activeFocusTasks() {
    return todos.filter(task => task.isFocus && !task.done).slice(0, 3);
}

function renderFocus() {
    const grid = document.getElementById('focusGrid');
    const focus = activeFocusTasks();
    grid.replaceChildren();

    for (let slot = 0; slot < 3; slot++) {
        const task = focus[slot];
        const card = document.createElement('article');
        card.className = `focus-card${task ? '' : ' empty'}`;
        const slotLabel = document.createElement('span');
        slotLabel.className = 'focus-slot';
        slotLabel.textContent = `Focus ${String(slot + 1).padStart(2, '0')}`;
        card.appendChild(slotLabel);

        if (task) {
            const content = document.createElement('div');
            const category = categoryElement(task.cat);
            const title = document.createElement('h3');
            title.textContent = task.text;
            content.append(category, title);

            const actions = document.createElement('div');
            actions.className = 'focus-actions';
            actions.append(
                actionButton('Complete', 'complete-button', () => completeTask(task.id)),
                actionButton('Return to inbox', '', () => demoteTask(task.id))
            );
            card.append(content, actions);
        } else {
            const copy = document.createElement('p');
            copy.textContent = 'Leave space, or choose one clear next action.';
            const hasInboxTasks = todos.some(item => !item.done && !item.isFocus);
            const button = actionButton(hasInboxTasks ? 'Browse inbox' : 'Inbox is clear', 'quiet-button', () => {
                if (hasInboxTasks) document.getElementById('inboxTitle').scrollIntoView({ behavior: 'smooth' });
            });
            button.disabled = !hasInboxTasks;
            card.append(copy, button);
        }
        grid.appendChild(card);
    }

    document.getElementById('focusSummary').textContent = `${focus.length} of 3 focus slots filled`;
}

function actionButton(label, className, handler) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = className;
    button.textContent = label;
    button.addEventListener('click', handler);
    return button;
}

function categoryElement(category = 'life') {
    const element = document.createElement('span');
    element.className = `category category-${category}`;
    element.textContent = CATEGORY_LABELS[category] || 'Life';
    return element;
}

function renderTasks() {
    const list = document.getElementById('taskList');
    const active = todos.filter(task => !task.done && !task.isFocus);
    const filtered = currentFilter === 'all' ? active : active.filter(task => (task.cat || 'life') === currentFilter);
    list.replaceChildren();
    filtered.forEach(task => list.appendChild(taskRow(task, false)));
    document.getElementById('emptyTasks').hidden = filtered.length > 0;
    document.getElementById('inboxSummary').textContent = `${active.length} open task${active.length === 1 ? '' : 's'}`;
    updateFilterCounts(active);
}

function taskRow(task, completed) {
    const row = document.createElement('article');
    row.className = `task-row${completed ? ' done' : ''}`;

    const check = document.createElement('button');
    check.type = 'button';
    check.className = 'task-check';
    check.setAttribute('aria-label', completed ? `Restore ${task.text}` : `Complete ${task.text}`);
    check.textContent = completed ? '✓' : '';
    check.addEventListener('click', () => toggleTask(task.id));

    const copy = document.createElement('div');
    copy.className = 'task-copy';
    const text = document.createElement('p');
    text.textContent = task.text;
    copy.append(text, categoryElement(task.cat));

    const actions = document.createElement('div');
    actions.className = 'task-actions';
    if (!completed) {
        actions.appendChild(actionButton('Focus', '', () => promoteTask(task.id)));
    }
    const remove = actionButton('×', 'delete-button', () => deleteTask(task.id));
    remove.setAttribute('aria-label', `Delete ${task.text}`);
    actions.appendChild(remove);

    row.append(check, copy, actions);
    return row;
}

function updateFilterCounts(active) {
    const counts = { all: active.length, life: 0, photo: 0, running: 0, health: 0 };
    active.forEach(task => {
        const category = task.cat || 'life';
        if (category in counts) counts[category]++;
    });
    Object.entries(counts).forEach(([key, value]) => {
        document.getElementById(`count-${key}`).textContent = value;
    });
}

function addTask(text, category) {
    todos.unshift({
        id: Date.now(),
        text,
        cat: category,
        done: false,
        isFocus: false,
        createdAt: new Date().toISOString()
    });
    renderAll();
    saveData();
}

function promoteTask(id) {
    if (activeFocusTasks().length >= 3) {
        setSyncStatus('Complete or return a focus task first', 'error');
        return;
    }
    todos = todos.map(task => task.id === id ? { ...task, isFocus: true } : task);
    renderAll();
    saveData();
}

function demoteTask(id) {
    todos = todos.map(task => task.id === id ? { ...task, isFocus: false } : task);
    renderAll();
    saveData();
}

function completeTask(id) {
    todos = todos.map(task => task.id === id ? {
        ...task,
        done: true,
        isFocus: false,
        completedAt: new Date().toISOString()
    } : task);
    renderAll();
    saveData();
}

function toggleTask(id) {
    todos = todos.map(task => {
        if (task.id !== id) return task;
        const done = !task.done;
        return {
            ...task,
            done,
            isFocus: done ? false : task.isFocus,
            completedAt: done ? new Date().toISOString() : null
        };
    });
    renderAll();
    saveData();
}

function deleteTask(id) {
    todos = todos.filter(task => task.id !== id);
    renderAll();
    saveData();
}

function getHabitStatus(date, habitId) {
    if (habitId === 'strava') return stravaDates.has(date) || Boolean(habitsData[date]?.strava);
    if (habitId === 'garmin_steps') return garminStepDates.has(date) || Boolean(habitsData[date]?.garmin_steps);
    if (habitId === 'garmin_calories') return garminCalorieDates.has(date) || Boolean(habitsData[date]?.garmin_calories);
    return Boolean(habitsData[date]?.[habitId]);
}

function toggleHabit(habitId) {
    const habit = HABITS.find(item => item.id === habitId);
    if (!habit || habit.readonly) return;
    const today = localDateKey();
    habitsData[today] ||= {};
    habitsData[today][habitId] = !getHabitStatus(today, habitId);
    renderTodayHabits();
    renderHabitWeek();
    saveData();
}

function renderTodayHabits() {
    const container = document.getElementById('todayHabits');
    const today = localDateKey();
    let completed = 0;
    container.replaceChildren();

    HABITS.forEach(habit => {
        const done = getHabitStatus(today, habit.id);
        if (done) completed++;
        const button = document.createElement('button');
        button.type = 'button';
        button.className = `habit-toggle${done ? ' done' : ''}${habit.readonly ? ' readonly' : ''}`;
        button.disabled = habit.readonly;
        if (!habit.readonly) button.addEventListener('click', () => toggleHabit(habit.id));

        const check = document.createElement('span');
        check.className = 'habit-check';
        const name = document.createElement('span');
        name.className = 'habit-name';
        name.textContent = habit.name;
        const source = document.createElement('span');
        source.className = 'habit-source';
        source.textContent = habit.readonly ? `Auto · ${habit.source}` : `${calculateStreak(habit.id)} day streak`;
        button.append(check, name, source);
        container.appendChild(button);
    });

    document.getElementById('habitSummary').textContent = `${completed} of ${HABITS.length} complete today`;
}

function calculateStreak(habitId) {
    let streak = 0;
    const date = new Date();
    for (let offset = 0; offset < 365; offset++) {
        const key = localDateKey(date);
        if (!getHabitStatus(key, habitId)) break;
        streak++;
        date.setDate(date.getDate() - 1);
    }
    return streak;
}

function renderHabitWeek() {
    const container = document.getElementById('habitWeek');
    const dates = [];
    for (let offset = 6; offset >= 0; offset--) {
        const date = new Date();
        date.setHours(12, 0, 0, 0);
        date.setDate(date.getDate() - offset);
        dates.push(date);
    }
    container.replaceChildren();

    container.appendChild(weekCell('', 'header label'));
    dates.forEach(date => {
        const label = `${date.toLocaleDateString('en-US', { weekday: 'narrow' })}<br>${date.getDate()}`;
        container.appendChild(weekCell(label, `header${localDateKey(date) === localDateKey() ? ' today' : ''}`, true));
    });

    HABITS.forEach(habit => {
        container.appendChild(weekCell(habit.name, 'label'));
        dates.forEach(date => {
            const key = localDateKey(date);
            const cell = weekCell('', key === localDateKey() ? 'today' : '');
            const dot = document.createElement('span');
            dot.className = `week-dot${getHabitStatus(key, habit.id) ? ' done' : ''}`;
            cell.appendChild(dot);
            container.appendChild(cell);
        });
    });
}

function weekCell(content, classes = '', allowHtml = false) {
    const cell = document.createElement('div');
    cell.className = `habit-week-cell ${classes}`.trim();
    if (allowHtml) {
        const [day, number] = content.split('<br>');
        const daySpan = document.createElement('span');
        daySpan.textContent = day;
        const numberSpan = document.createElement('span');
        numberSpan.textContent = number;
        cell.append(daySpan, document.createElement('br'), numberSpan);
    } else {
        cell.textContent = content;
    }
    return cell;
}

function renderCompleted() {
    const completed = todos.filter(task => task.done);
    const list = document.getElementById('completedList');
    list.replaceChildren();
    completed.forEach(task => list.appendChild(taskRow(task, true)));
    document.getElementById('completedSummary').textContent = `${completed.length} task${completed.length === 1 ? '' : 's'}`;
    document.getElementById('emptyCompleted').hidden = completed.length > 0;
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('authForm').addEventListener('submit', unlock);
    document.getElementById('lockBtn').addEventListener('click', lock);
    document.getElementById('refreshBtn').addEventListener('click', initializeWorkspace);
    document.getElementById('captureForm').addEventListener('submit', event => {
        event.preventDefault();
        const input = document.getElementById('taskInput');
        const text = input.value.trim();
        if (!text) return;
        addTask(text, document.getElementById('categoryInput').value);
        input.value = '';
        input.focus();
    });
    document.querySelectorAll('[data-filter]').forEach(button => {
        button.addEventListener('click', () => {
            currentFilter = button.dataset.filter;
            document.querySelectorAll('[data-filter]').forEach(item => item.classList.toggle('active', item === button));
            renderTasks();
        });
    });
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden) refreshFromCloud();
    });

    if (isLocalPreview() || sessionStorage.getItem('sharon_private_unlocked') === 'true') {
        showApp();
    } else {
        document.getElementById('passwordInput').focus();
    }
});
