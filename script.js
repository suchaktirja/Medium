const projectModal = document.getElementById("projectModal");
const projectForm = document.getElementById("projectForm");
const projectRows = document.getElementById("projectRows");
const toast = document.getElementById("toast");

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove("show"), 2600);
}

function openModal() {
  projectModal.hidden = false;
  document.getElementById("projectName").focus();
}
function closeModal() {
  projectModal.hidden = true;
  projectForm.reset();
}

document.getElementById("newProjectBtn").addEventListener("click", openModal);
document.getElementById("closeModal").addEventListener("click", closeModal);
projectModal.addEventListener("click", (event) => {
  if (event.target === projectModal) closeModal();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeModal();
});

projectForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const name = document.getElementById("projectName").value.trim();
  const category = document.getElementById("projectCategory").value.trim();
  const deadlineValue = document.getElementById("projectDeadline").value;
  if (!name || !category || !deadlineValue) return;

  const date = new Date(`${deadlineValue}T00:00:00`);
  const formattedDate = date.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
  const firstLetter = name.charAt(0).toUpperCase();
  const row = document.createElement("tr");
  row.dataset.search = `${name} ${category}`.toLowerCase();
  row.innerHTML = `
    <td><div class="project-name"><span class="project-symbol sky"></span><span><strong></strong><small></small></span></div></td>
    <td></td><td><div class="progress-cell"><span>0%</span><i><b style="width:0%"></b></i></div></td>
    <td><span class="status status-planning">Planning</span></td><td><button class="row-more" aria-label="More options">···</button></td>`;
  row.querySelector(".project-symbol").textContent = firstLetter;
  row.querySelector(".project-name strong").textContent = name;
  row.querySelector(".project-name small").textContent = category;
  row.children[1].textContent = formattedDate;
  projectRows.prepend(row);
  closeModal();
  showToast(`"${name}" was added to your projects.`);
});

document.getElementById("searchInput").addEventListener("input", (event) => {
  const query = event.target.value.trim().toLowerCase();
  let visibleCount = 0;
  [...projectRows.querySelectorAll("tr")].forEach((row) => {
    const match = !query || row.dataset.search.includes(query);
    row.hidden = !match;
    if (match) visibleCount++;
  });
  document.getElementById("emptyState").hidden = visibleCount !== 0;
});

document.querySelectorAll(".nav-item").forEach((item) => {
  item.addEventListener("click", () => {
    document.querySelectorAll(".nav-item").forEach((nav) => nav.classList.remove("active"));
    item.classList.add("active");
    document.getElementById("currentPage").textContent = item.dataset.page;
    if (item.dataset.page !== "Dashboard") showToast(`${item.dataset.page} section selected. This demo currently shows the dashboard.`);
  });
});

document.getElementById("viewAllBtn").addEventListener("click", () => showToast("You are viewing all sample projects."));
document.getElementById("activityBtn").addEventListener("click", () => showToast("All recent activity is shown in this demo."));
document.getElementById("upgradeBtn").addEventListener("click", () => showToast("Upgrade options would be connected here."));
document.getElementById("dateButton").addEventListener("click", () => showToast("Showing workspace data for November 2026."));
document.querySelectorAll(".row-more").forEach((button) => {
  button.addEventListener("click", () => showToast("Project actions: open, edit or archive (demo)."));
});
