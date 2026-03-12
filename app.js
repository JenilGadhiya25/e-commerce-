const toastEl = document.getElementById("toast");

function showToast(message) {
  if (!toastEl) return;
  toastEl.textContent = message;
  toastEl.classList.add("is-visible");
  window.clearTimeout(showToast._t);
  showToast._t = window.setTimeout(() => toastEl.classList.remove("is-visible"), 1600);
}

function closeNav() {
  document.body.classList.remove("nav-open");
  const btn = document.querySelector(".nav-toggle");
  if (btn) btn.setAttribute("aria-expanded", "false");
}

function openNav() { 
  document.body.classList.add("nav-open");
  const btn = document.querySelector(".nav-toggle");
  if (btn) btn.setAttribute("aria-expanded", "true");
}

document.getElementById("year").textContent = new Date().getFullYear();

document.addEventListener("click", (e) => {
  const toggle = e.target.closest?.(".nav-toggle");
  if (toggle) {
    const isOpen = document.body.classList.contains("nav-open");
    (isOpen ? closeNav : openNav)();
    return;
  }

  const navLink = e.target.closest?.(".site-nav a");
  if (navLink) {
    closeNav();
    return;
  }

  if (document.body.classList.contains("nav-open")) {
    const clickedInsideNav = e.target.closest?.(".site-nav");
    if (!clickedInsideNav) closeNav();
  }
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeNav();
});

const chips = Array.from(document.querySelectorAll(".chip"));
const cards = Array.from(document.querySelectorAll("#menu-cards .card"));
const searchInput = document.getElementById("menu-search");

function setActiveChip(value) {
  for (const chip of chips) chip.classList.toggle("is-active", chip.dataset.filter === value);
}

function applyMenuFilter({ filter = "all", query = "" }) {
  const q = query.trim().toLowerCase();
  for (const card of cards) {
    const tags = (card.dataset.tags || "").split(/\s+/).filter(Boolean);
    const text = card.innerText.toLowerCase();
    const matchesTag = filter === "all" || tags.includes(filter);
    const matchesQuery = !q || text.includes(q);
    card.style.display = matchesTag && matchesQuery ? "" : "none";
  }
}

for (const chip of chips) {
  chip.addEventListener("click", () => {
    const filter = chip.dataset.filter || "all";
    setActiveChip(filter);
    applyMenuFilter({ filter, query: searchInput?.value || "" });
  });
}

document.querySelector('[data-action="search"]')?.addEventListener("click", () => {
  const active = document.querySelector(".chip.is-active")?.dataset.filter || "all";
  applyMenuFilter({ filter: active, query: searchInput?.value || "" });
});

searchInput?.addEventListener("input", () => {
  const active = document.querySelector(".chip.is-active")?.dataset.filter || "all";
  applyMenuFilter({ filter: active, query: searchInput.value });
});

document.addEventListener("click", (e) => {
  const addBtn = e.target.closest?.('[data-action="add"]');
  if (!addBtn) return;
  window.location.href = "./payment.html";
});

document.querySelector("form.form")?.addEventListener("submit", (e) => {
  e.preventDefault();
  const email = document.getElementById("email")?.value?.trim();
  showToast(email ? "Subscribed — check your inbox" : "Subscribed");
  e.target.reset();
});
