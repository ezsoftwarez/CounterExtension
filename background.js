// Tracked apps: each entry has a display name and a list of hostname patterns.
const TRACKED_APPS = [
  { id: "youtube",     name: "YouTube",      hostnames: ["youtube.com", "www.youtube.com", "m.youtube.com"] },
  { id: "gmail",       name: "Gmail",        hostnames: ["mail.google.com"] },
  { id: "github",      name: "GitHub",       hostnames: ["github.com", "www.github.com"] },
  { id: "twitter",     name: "X / Twitter",  hostnames: ["twitter.com", "www.twitter.com", "x.com", "www.x.com"] },
  { id: "reddit",      name: "Reddit",       hostnames: ["reddit.com", "www.reddit.com"] },
  { id: "google_docs", name: "Google Docs",  hostnames: ["docs.google.com"] },
  { id: "netflix",     name: "Netflix",      hostnames: ["netflix.com", "www.netflix.com"] },
  { id: "linkedin",    name: "LinkedIn",     hostnames: ["linkedin.com", "www.linkedin.com"] },
  { id: "facebook",    name: "Facebook",     hostnames: ["facebook.com", "www.facebook.com"] },
  { id: "instagram",   name: "Instagram",    hostnames: ["instagram.com", "www.instagram.com"] }
];

// Build a fast lookup map: hostname -> app id
const hostnameToApp = {};
for (const app of TRACKED_APPS) {
  for (const host of app.hostnames) {
    hostnameToApp[host] = app.id;
  }
}

// ---------------------------------------------------------------------------
// Time tracking
// activeTracked: { tabId, appId, startTime } | null
// ---------------------------------------------------------------------------
let activeTracked = null;

function stopTiming() {
  if (!activeTracked) return;
  const elapsed = Date.now() - activeTracked.startTime;
  const key = activeTracked.appId + "_time";
  chrome.storage.local.get([key], (result) => {
    const current = result[key] || 0;
    chrome.storage.local.set({ [key]: current + elapsed });
  });
  activeTracked = null;
}

function startTiming(tabId, appId) {
  activeTracked = { tabId, appId, startTime: Date.now() };
}

function appIdForTab(tab) {
  if (!tab || !tab.url) return null;
  let hostname;
  try {
    hostname = new URL(tab.url).hostname;
  } catch {
    return null;
  }
  return hostnameToApp[hostname] || null;
}

// User switched to a different tab.
chrome.tabs.onActivated.addListener(({ tabId }) => {
  stopTiming();
  chrome.tabs.get(tabId, (tab) => {
    if (chrome.runtime.lastError) return;
    const appId = appIdForTab(tab);
    if (appId) startTiming(tabId, appId);
  });
});

// Window focus changed (e.g. user switched app or came back to Chrome).
chrome.windows.onFocusChanged.addListener((windowId) => {
  stopTiming();
  if (windowId !== chrome.windows.WINDOW_ID_NONE) {
    chrome.tabs.query({ active: true, windowId }, (tabs) => {
      if (!tabs || !tabs[0]) return;
      const appId = appIdForTab(tabs[0]);
      if (appId) startTiming(tabs[0].id, appId);
    });
  }
});

// Tab closed.
chrome.tabs.onRemoved.addListener((tabId) => {
  if (activeTracked && activeTracked.tabId === tabId) stopTiming();
});

// ---------------------------------------------------------------------------
// Navigation tracking (open counts + re-evaluate timing)
// ---------------------------------------------------------------------------
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status !== "complete" || !tab.url) return;

  let hostname;
  try {
    hostname = new URL(tab.url).hostname;
  } catch {
    return;
  }

  const appId = hostnameToApp[hostname];

  // If this is the currently timed tab, stop old timing and maybe start new.
  if (activeTracked && activeTracked.tabId === tabId) {
    stopTiming();
    if (appId) startTiming(tabId, appId);
  }

  if (!appId) return;

  // Increment the open count for this app in storage.
  chrome.storage.local.get([appId], (result) => {
    const current = result[appId] || 0;
    chrome.storage.local.set({ [appId]: current + 1 });
  });
});
