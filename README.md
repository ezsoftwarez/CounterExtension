# CounterExtension

A Chrome extension that counts how many times you open your favorite web apps.

## Tracked apps

| App | Hostname(s) |
|---|---|
| YouTube | youtube.com |
| Gmail | mail.google.com |
| GitHub | github.com |
| X / Twitter | twitter.com, x.com |
| Reddit | reddit.com |
| Google Docs | docs.google.com |
| Netflix | netflix.com |
| LinkedIn | linkedin.com |
| Facebook | facebook.com |
| Instagram | instagram.com |

## How it works

A background service worker listens for tab-navigation events. Every time a tab finishes loading a URL whose hostname matches one of the tracked apps, the counter for that app is incremented in `chrome.storage.local`.

Click the extension icon to open the popup and see the running totals. Use the **Reset all counts** button to clear every counter back to zero.

## Installation (unpacked)

1. Open `chrome://extensions` in Chrome.
2. Enable **Developer mode** (toggle in the top-right corner).
3. Click **Load unpacked** and select this repository folder.
4. The extension icon will appear in the toolbar.

## Files

| File | Purpose |
|---|---|
| `manifest.json` | Extension manifest (Manifest V3) |
| `background.js` | Service worker – tracks app navigations, open counts, and time spent |
| `popup.html` | Popup UI (app table + YouTube player) |
| `popup.js` | Renders counts and time, handles reset, and manages the YouTube player |
| `popup.css` | Popup styles |