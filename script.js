const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const projectModal = $('#projectModal');
const projectForm = $('#projectForm');
const projectRows = $('#projectRows');
const toast = $('#toast');
const appShell = $('#appShell');
const authScreen = $('#authScreen');
let signUpMode = false;
let currentPage = 'Dashboard';

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove('show'), 2600);
}
function openModal() { projectModal.hidden = false; $('#projectName').focus(); }
function closeModal() { projectModal.hidden = true; projectForm.reset(); }

// Demo sign-in: this is frontend-only and does not verify credentials with a server.
$('#authSwitch').addEventListener('click', event => {
  if (event.target.id !== 'toggleAuth') return;
  signUpMode = !signUpMode;
  $('#authTitle').textContent = signUpMode ? 'Create your account' : 'Sign in to Quantora';
  $('#authSubtitle').textContent = signUpMode ? 'Set up your workspace to get started.' : 'Manage your projects and keep your team moving.';
  $('#authSubmit').textContent = signUpMode ? 'Create account' : 'Sign in';
  $('#authSwitch').innerHTML = signUpMode ? 'Already have an account? <button type="button" id="toggleAuth">Sign in</button>' : 'New to Quantora? <button type="button" id="toggleAuth">Create an account</button>';
});
$('#authForm').addEventListener('submit', event => {
  event.preventDefault();
  const email = $('#authEmail').value.trim();
  const password = $('#authPassword').value;
  if (!email || password.length < 4) return;
  const displayName = email.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  $('#profileName').textContent = displayName;
  $('#profileInitials').textContent = displayName.split(' ').map(x => x[0]).join('').slice(0, 2).toUpperCase();
  localStorage.setItem('quantoraDemoUser', JSON.stringify({ email, displayName }));
  authScreen.hidden = true;
  appShell.hidden = false;
  showPage('Dashboard');
});

$('#newProjectBtn').addEventListener('click', openModal);
$('#closeModal').addEventListener('click', closeModal);
projectModal.addEventListener('click', event => { if (event.target === projectModal) closeModal(); });
document.addEventListener('keydown', event => { if (event.key === 'Escape') closeModal(); });
projectForm.addEventListener('submit', event => {
  event.preventDefault();
  const name = $('#projectName').value.trim();
  const category = $('#projectCategory').value.trim();
  const deadlineValue = $('#projectDeadline').value;
  if (!name || !category || !deadlineValue) return;
  const formattedDate = new Date(`${deadlineValue}T00:00:00`).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
  const row = document.createElement('tr');
  row.dataset.search = `${name} ${category}`.toLowerCase();
  row.innerHTML = `<td><div class="project-name"><span class="project-symbol sky"></span><span><strong></strong><small></small></span></div></td><td></td><td><div class="progress-cell"><span>0%</span><i><b style="width:0%"></b></i></div></td><td><span class="status status-planning">Planning</span></td><td><button class="row-more" aria-label="More options">···</button></td>`;
  $('.project-symbol', row).textContent = name[0].toUpperCase();
  $('.project-name strong', row).textContent = name;
  $('.project-name small', row).textContent = category;
  row.children[1].textContent = formattedDate;
  projectRows.prepend(row);
  closeModal(); showToast(`“${name}” was added to your projects.`);
});
$('#searchInput').addEventListener('input', event => {
  const query = event.target.value.trim().toLowerCase();
  let visibleCount = 0;
  $$('#projectRows tr').forEach(row => { const match = !query || row.dataset.search.includes(query); row.hidden = !match; if (match) visibleCount++; });
  $('#emptyState').hidden = visibleCount !== 0;
});

const dashboardElements = () => $$('.main-content > .welcome-row, .main-content > .stats-grid, .main-content > .charts-grid, .main-content > .bottom-grid, .main-content > .page-footer');
function showPage(page) {
  currentPage = page;
  $$('.nav-item').forEach(item => item.classList.toggle('active', item.dataset.page === page));
  $('#currentPage').textContent = page === 'Dashboard' ? 'Overview' : page;
  let dynamic = $('#dynamicPage');
  if (dynamic) dynamic.remove();
  dashboardElements().forEach(el => el.hidden = page !== 'Dashboard');
  if (page !== 'Dashboard') {
    dynamic = document.createElement('section'); dynamic.id = 'dynamicPage'; dynamic.className = 'dynamic-page';
    dynamic.innerHTML = pageMarkup(page);
    $('.main-content').append(dynamic);
    bindPageActions(page);
  }
}
function pageMarkup(page) {
  if (page === 'Tasks') return `<div class="page-title"><div><p class="eyebrow">WORKSPACE</p><h1>Tasks</h1><p class="muted">Plan the work and keep track of progress.</p></div></div><div class="panel page-panel"><form id="taskForm" class="task-form"><input id="taskInput" required maxlength="90" placeholder="Add a new task..."/><select id="taskStatus"><option>To do</option><option>In progress</option><option>Completed</option></select><button class="button button-primary">Add task</button></form><div id="taskList" class="task-list"></div></div>`;
  if (page === 'Projects') return `<div class="page-title"><div><p class="eyebrow">WORKSPACE</p><h1>Projects</h1><p class="muted">All projects in your workspace.</p></div><button class="button button-primary" id="projectsNewBtn">＋ New project</button></div><div class="panel page-panel"><div class="table-wrap"><table><thead><tr><th>PROJECT NAME</th><th>DEADLINE</th><th>PROGRESS</th><th>STATUS</th></tr></thead><tbody>${projectRows.innerHTML}</tbody></table></div></div>`;
  if (page === 'Analytics') return `<div class="page-title"><div><p class="eyebrow">WORKSPACE</p><h1>Analytics</h1><p class="muted">A snapshot of your workspace performance.</p></div></div><div class="stats-grid"><article class="stat-card"><div class="stat-top">Total projects</div><div class="stat-value">24</div><div class="stat-foot">＋4 vs. last month</div></article><article class="stat-card"><div class="stat-top">Active tasks</div><div class="stat-value">38</div><div class="stat-foot">−12% vs. last month</div></article><article class="stat-card"><div class="stat-top">Completed tasks</div><div class="stat-value">124</div><div class="stat-foot">＋18.2% vs. last month</div></article><article class="stat-card"><div class="stat-top">Overall progress</div><div class="stat-value">76%</div><div class="stat-foot">＋8.4% vs. last month</div></article></div><div class="panel page-panel"><h2>Project performance</h2><p class="muted">Your sample workspace is making steady progress.</p><div class="analytics-bar"><span style="width:76%"></span></div><strong>76% overall progress</strong></div>`;
  if (page === 'Notifications') return `<div class="page-title"><div><p class="eyebrow">UPDATES</p><h1>Notifications</h1><p class="muted">Recent activity from your workspace.</p></div><button class="button button-light" id="markReadBtn">Mark all as read</button></div><div class="panel page-panel notification-list"><p><b>Website refresh completed</b><small>You marked the project as done · 12 min ago</small></p><p><b>New comment on Orbit</b><small>Sarah: “The new layout looks great!” · 38 min ago</small></p><p><b>Lumina mobile app updated</b><small>Daniel added 3 new design tasks · 1 hour ago</small></p><p><b>API integration ready for review</b><small>Emily changed the project status · 2 hours ago</small></p></div>`;
  if (page === 'Settings') return `<div class="page-title"><div><p class="eyebrow">PREFERENCES</p><h1>Settings</h1><p class="muted">Manage your profile and workspace preferences.</p></div></div><div class="panel page-panel"><form id="settingsForm" class="settings-form"><label>Display name<input id="settingsName" value="${$('#profileName').textContent}" required /></label><label>Email address<input id="settingsEmail" type="email" value="${(JSON.parse(localStorage.getItem('quantoraDemoUser') || '{}').email || '')}" required /></label><label>Workspace name<input id="workspaceName" value="Quantora Studio" required /></label><button class="button button-primary">Save changes</button></form></div>`;
  return `<div class="page-title"><div><p class="eyebrow">QUANTORA</p><h1>Help & getting started</h1><p class="muted">A few tips to help you get moving.</p></div></div><div class="panel page-panel"><h2>Welcome to your workspace</h2><p class="muted">Create projects, add tasks, review analytics and customize your workspace from the sidebar.</p><button class="button button-primary" id="helpTaskBtn">Go to Tasks</button></div>`;
}
function getTasks() { return JSON.parse(localStorage.getItem('quantoraTasks') || '[]'); }
function saveTasks(tasks) { localStorage.setItem('quantoraTasks', JSON.stringify(tasks)); }
function renderTasks() {
  const list = $('#taskList'); if (!list) return;
  const tasks = getTasks();
  list.innerHTML = tasks.length ? tasks.map((task, i) => `<div class="task-row"><span class="task-label ${task.status === 'Completed' ? 'is-done' : ''}">${escapeHTML(task.name)}</span><select data-task-status="${i}"><option ${task.status==='To do'?'selected':''}>To do</option><option ${task.status==='In progress'?'selected':''}>In progress</option><option ${task.status==='Completed'?'selected':''}>Completed</option></select><button class="text-button" data-task-delete="${i}">Delete</button></div>`).join('') : '<p class="muted">No tasks yet. Add your first task above.</p>';
}
function escapeHTML(value) { return value.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function bindPageActions(page) {
  if (page === 'Tasks') {
    renderTasks();
    $('#taskForm').addEventListener('submit', e => { e.preventDefault(); const tasks=getTasks(); tasks.push({name:$('#taskInput').value.trim(),status:$('#taskStatus').value}); saveTasks(tasks); $('#taskInput').value=''; renderTasks(); });
    $('#taskList').addEventListener('change', e => { if (e.target.dataset.taskStatus !== undefined) { const tasks=getTasks(); tasks[+e.target.dataset.taskStatus].status=e.target.value; saveTasks(tasks); renderTasks(); } });
    $('#taskList').addEventListener('click', e => { if (e.target.dataset.taskDelete !== undefined) { const tasks=getTasks(); tasks.splice(+e.target.dataset.taskDelete,1); saveTasks(tasks); renderTasks(); } });
  }
  if (page === 'Projects') $('#projectsNewBtn').addEventListener('click', openModal);
  if (page === 'Notifications') $('#markReadBtn').addEventListener('click', () => showToast('All notifications marked as read.'));
  if (page === 'Settings') $('#settingsForm').addEventListener('submit', e => { e.preventDefault(); $('#profileName').textContent=$('#settingsName').value; const user=JSON.parse(localStorage.getItem('quantoraDemoUser')||'{}'); user.displayName=$('#settingsName').value; user.email=$('#settingsEmail').value; localStorage.setItem('quantoraDemoUser',JSON.stringify(user)); showToast('Settings saved in this browser.'); });
  if (page === 'Help') $('#helpTaskBtn').addEventListener('click', () => showPage('Tasks'));
}
$$('.nav-item').forEach(item => item.addEventListener('click', event => { event.preventDefault(); showPage(item.dataset.page); }));
$('#viewAllBtn').addEventListener('click', () => showPage('Projects'));
$('#activityBtn').addEventListener('click', () => showPage('Notifications'));
$('#upgradeBtn').addEventListener('click', () => showToast('Upgrade options would be connected here.'));
$('#dateButton').addEventListener('click', () => showToast('Showing workspace data for November 2026.'));
$('.notification-button').addEventListener('click', () => showPage('Notifications'));
$('#logoutBtn').addEventListener('click', () => { localStorage.removeItem('quantoraDemoUser'); appShell.hidden=true; authScreen.hidden=false; $('#authForm').reset(); showPage('Dashboard'); });
