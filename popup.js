const TRACKED_APPS = [
  { id: "youtube",     name: "YouTube" },
  { id: "gmail",       name: "Gmail" },
  { id: "github",      name: "GitHub" },
  { id: "twitter",     name: "X / Twitter" },
  { id: "reddit",      name: "Reddit" },
  { id: "google_docs", name: "Google Docs" },
  { id: "netflix",     name: "Netflix" },
  { id: "linkedin",    name: "LinkedIn" },
  { id: "facebook",    name: "Facebook" },
  { id: "instagram",   name: "Instagram" }
];

const appIds = TRACKED_APPS.map((a) => a.id);

function renderCounts(data) {
  const tbody = document.getElementById("app-list");
  tbody.innerHTML = "";
  for (const app of TRACKED_APPS) {
    const count = data[app.id] || 0;
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${app.name}</td><td class="count">${count}</td>`;
    tbody.appendChild(tr);
  }
}

// Load and display current counts.
chrome.storage.local.get(appIds, renderCounts);

// Reset button clears all counts and re-renders.
document.getElementById("reset-btn").addEventListener("click", () => {
  const cleared = {};
  for (const id of appIds) cleared[id] = 0;
  chrome.storage.local.set(cleared, () => renderCounts(cleared));
});
