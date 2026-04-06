// Tracked apps: each entry has a display name and a list of hostname patterns.
const TRACKED_APPS = [
  { id: "youtube",     name: "YouTube",      hostnames: ["youtube.com", "www.youtube.com"] },
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

// Listen for completed navigations in any tab.
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status !== "complete" || !tab.url) return;

  let hostname;
  try {
    hostname = new URL(tab.url).hostname;
  } catch {
    return;
  }

  const appId = hostnameToApp[hostname];
  if (!appId) return;

  // Increment the count for this app in storage.
  chrome.storage.local.get([appId], (result) => {
    const current = result[appId] || 0;
    chrome.storage.local.set({ [appId]: current + 1 });
  });
});
