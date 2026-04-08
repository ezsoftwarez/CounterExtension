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
const timeKeys = appIds.map((id) => id + "_time");
const allKeys = [...appIds, ...timeKeys];

// Format milliseconds into a human-readable string.
function formatTime(ms) {
  if (!ms || ms < 1000) return "—";
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
}

const YOUTUBE_HOSTNAMES = new Set(["youtube.com", "www.youtube.com", "m.youtube.com"]);
const VIDEO_ID_RE = /^[a-zA-Z0-9_-]{11}$/;

function renderCounts(data) {
  const tbody = document.getElementById("app-list");
  tbody.innerHTML = "";
  for (const app of TRACKED_APPS) {
    const count = data[app.id] || 0;
    const timeMs = data[app.id + "_time"] || 0;
    const tr = document.createElement("tr");

    const tdName = document.createElement("td");
    tdName.textContent = app.name;

    const tdCount = document.createElement("td");
    tdCount.className = "count";
    tdCount.textContent = String(count);

    const tdTime = document.createElement("td");
    tdTime.className = "time";
    tdTime.textContent = formatTime(timeMs);

    tr.appendChild(tdName);
    tr.appendChild(tdCount);
    tr.appendChild(tdTime);
    tbody.appendChild(tr);
  }
}

// Load and display current counts.
chrome.storage.local.get(allKeys, renderCounts);

// Reset button clears all counts and time data, then re-renders.
document.getElementById("reset-btn").addEventListener("click", () => {
  const cleared = {};
  for (const key of allKeys) cleared[key] = 0;
  chrome.storage.local.set(cleared, () => renderCounts(cleared));
});

// ---------------------------------------------------------------------------
// YouTube player
// ---------------------------------------------------------------------------
function parseYoutubeId(input) {
  input = (input || "").trim();
  if (!input) return null;
  let candidate = null;
  try {
    const url = new URL(input);
    if (url.hostname === "youtu.be") {
      candidate = url.pathname.slice(1).split("?")[0];
    } else if (YOUTUBE_HOSTNAMES.has(url.hostname)) {
      const v = url.searchParams.get("v");
      if (v) {
        candidate = v;
      } else {
        const match = url.pathname.match(/\/embed\/([^/?]+)/);
        if (match) candidate = match[1];
      }
    }
  } catch {
    // Not a full URL — treat as a raw video ID.
    candidate = input;
  }
  // Always validate the ID to ensure it is safe to embed.
  return candidate && VIDEO_ID_RE.test(candidate) ? candidate : null;
}

function loadVideo() {
  const input = document.getElementById("yt-input").value;
  const videoId = parseYoutubeId(input);
  const frame = document.getElementById("yt-frame");
  const wrap = document.getElementById("yt-player-wrap");
  if (!videoId) {
    frame.src = "";
    wrap.classList.remove("visible");
    return;
  }
  frame.src = `https://www.youtube.com/embed/${videoId}`;
  wrap.classList.add("visible");
}

document.getElementById("yt-load-btn").addEventListener("click", loadVideo);
document.getElementById("yt-input").addEventListener("keydown", (e) => {
  if (e.key === "Enter") loadVideo();
});
