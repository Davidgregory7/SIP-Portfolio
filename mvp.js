const STORAGE_KEY = 'memorylens-mvp-v1';

const starterTasks = [
  { id: 1, name: 'Eat breakfast', time: '08:00', priority: 'Routine', status: 'Completed', respondedAt: '08:06' },
  { id: 2, name: 'Drink a glass of water', time: '09:00', priority: 'Routine', status: 'Pending', respondedAt: null },
  { id: 3, name: 'Take afternoon medication', time: '12:00', priority: 'High', status: 'Pending', respondedAt: null }
];

let tasks = loadTasks();
let activeTaskId = getPendingTask()?.id ?? null;

function loadTasks() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(saved) && saved.length ? saved : structuredClone(starterTasks);
  } catch {
    return structuredClone(starterTasks);
  }
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function getPendingTask(afterId = null) {
  const pending = tasks.filter(task => task.status === 'Pending' || task.status === 'Remind later');
  if (!pending.length) return null;
  if (afterId === null) return pending[0];
  const currentIndex = pending.findIndex(task => task.id === afterId);
  return pending[(currentIndex + 1) % pending.length];
}

function formatTime(value) {
  if (!value) return '';
  const [hour, minute] = value.split(':').map(Number);
  return new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' }).format(new Date(2026, 0, 1, hour, minute));
}

function statusClass(status) {
  return status.toLowerCase().replaceAll(' ', '-');
}

function renderWearer() {
  const task = tasks.find(item => item.id === activeTaskId) ?? getPendingTask();
  const content = document.querySelector('#reminder-content');
  const empty = document.querySelector('#empty-reminder');
  document.querySelector('#wearer-feedback').textContent = '';

  if (!task) {
    activeTaskId = null;
    content.hidden = true;
    empty.hidden = false;
    return;
  }

  activeTaskId = task.id;
  content.hidden = false;
  empty.hidden = true;
  document.querySelector('#lens-time').textContent = formatTime(task.time);
  document.querySelector('#reminder-title').textContent = task.name;
  document.querySelector('#reminder-instruction').textContent = task.priority === 'High'
    ? 'Important reminder. Choose the response that best describes what happened.'
    : 'Choose the response that best describes what happened.';
}

function renderDashboard() {
  const list = document.querySelector('#activity-list');
  const ordered = [...tasks].sort((a, b) => a.time.localeCompare(b.time));
  list.replaceChildren();

  ordered.forEach(task => {
    const item = document.createElement('article');
    item.className = 'activity-item';
    item.innerHTML = `
      <span class="activity-time">${formatTime(task.time)}</span>
      <div class="activity-copy"><strong>${escapeHtml(task.name)}</strong><span>${task.priority} priority${task.respondedAt ? ` · Response at ${formatTime(task.respondedAt)}` : ''}</span></div>
      <span class="status ${statusClass(task.status)}">${escapeHtml(task.status)}</span>`;
    list.append(item);
  });

  document.querySelector('#scheduled-count').textContent = tasks.length;
  document.querySelector('#completed-count').textContent = tasks.filter(task => task.status === 'Completed').length;
  document.querySelector('#attention-count').textContent = tasks.filter(task => ['Unanswered', 'Skipped', 'Dismissed'].includes(task.status)).length;
}

function escapeHtml(value) {
  const element = document.createElement('span');
  element.textContent = value;
  return element.innerHTML;
}

document.querySelectorAll('.tab').forEach(button => {
  button.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(tab => tab.classList.toggle('active', tab === button));
    document.querySelectorAll('.app-view').forEach(view => {
      const active = view.id === `${button.dataset.view}-view`;
      view.classList.toggle('active', active);
      view.hidden = !active;
    });
    if (button.dataset.view === 'caregiver') renderDashboard();
  });
});

document.querySelectorAll('[data-response]').forEach(button => {
  button.addEventListener('click', () => {
    const task = tasks.find(item => item.id === activeTaskId);
    if (!task) return;
    task.status = button.dataset.response;
    task.respondedAt = new Date().toTimeString().slice(0, 5);
    saveTasks();
    document.querySelector('#wearer-feedback').textContent = `${task.status} recorded. The caregiver log has been updated.`;
    renderDashboard();
  });
});

document.querySelector('#next-reminder').addEventListener('click', () => {
  activeTaskId = getPendingTask(activeTaskId)?.id ?? null;
  renderWearer();
});

document.querySelector('#task-form').addEventListener('submit', event => {
  event.preventDefault();
  const name = document.querySelector('#task-name').value.trim();
  const time = document.querySelector('#task-time').value;
  const priority = document.querySelector('#task-priority').value;
  if (!name || !time) return;
  const task = { id: Date.now(), name, time, priority, status: 'Pending', respondedAt: null };
  tasks.push(task);
  activeTaskId ??= task.id;
  saveTasks();
  renderDashboard();
  renderWearer();
  event.currentTarget.reset();
  document.querySelector('#form-message').textContent = 'Reminder scheduled and added to the wearer simulation.';
});

document.querySelector('#mark-unanswered').addEventListener('click', () => {
  const task = tasks.find(item => item.status === 'Pending' || item.status === 'Remind later');
  if (!task) {
    document.querySelector('#form-message').textContent = 'There are no pending reminders to mark unanswered.';
    return;
  }
  task.status = 'Unanswered';
  task.respondedAt = null;
  if (activeTaskId === task.id) activeTaskId = getPendingTask()?.id ?? null;
  saveTasks();
  renderDashboard();
  renderWearer();
});

document.querySelector('#reset-demo').addEventListener('click', () => {
  tasks = structuredClone(starterTasks);
  activeTaskId = getPendingTask()?.id ?? null;
  saveTasks();
  renderWearer();
  renderDashboard();
});

renderWearer();
renderDashboard();
