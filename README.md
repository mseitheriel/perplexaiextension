# ⚡ Perplexity Rate Limit Monitor

A lightweight Chrome/Edge browser extension that gives you a live, at-a-glance view of your [Perplexity AI](https://www.perplexity.ai) account limits, query usage, and connector quotas — without leaving whatever tab you're on.

---

## Features

- **Live dashboard** — fetches both `/rest/rate-limit/all` and `/rest/user/settings` simultaneously on each refresh
- **Subscription overview** — plan tier, billing source, promo/coupon name and expiry date
- **Lifetime query stats** — total, Copilot, and Mobile query counts
- **Account limits** — pages, uploads, collections, article images, and file storage caps
- **Connector quotas** — daily attachment limits, global file count, and max file size
- **Monthly source limits** — colour-coded remaining/total for capped integrations (CB Insights, PitchBook, Statista, Wiley, etc.)
- **Unlimited sources list** — all integrations with no monthly cap (Google Drive, GitHub, Slack, Jira, Notion, etc.)
- **Raw JSON tab** — syntax-highlighted full response from both endpoints for debugging or curiosity
- **Zero tracking** — no analytics, no external requests beyond Perplexity's own API, no data ever leaves your browser

---

## Installation

> The extension is not published to the Chrome Web Store. Install it in **Developer Mode** — this takes about 30 seconds.

### Step 1 — Download

Download the latest release zip from the [Releases](../../releases) page and unzip it to a permanent folder on your machine (e.g. `~/extensions/perplexity-monitor`).

> **Do not delete or move the folder after loading** — Chrome loads unpacked extensions live from disk.

### Step 2 — Load in Chrome / Edge

1. Open `chrome://extensions` (or `edge://extensions`)
2. Enable **Developer mode** using the toggle in the top-right corner
3. Click **Load unpacked**
4. Select the unzipped `perplexity-ratelimit-ext` folder
5. The extension icon (⚡) will appear in your toolbar — pin it for quick access

### Step 3 — Use it

1. Make sure you are **logged in** to [perplexity.ai](https://www.perplexity.ai) in the same browser profile
2. Click the ⚡ toolbar icon
3. Data loads automatically — hit **Refresh** any time to pull fresh values

---

## How It Works

The extension uses the `credentials: 'include'` fetch option to call two Perplexity REST endpoints using your existing browser session cookie. No login credentials are ever stored or transmitted by the extension itself.

| Endpoint | Purpose |
|---|---|
| `/rest/rate-limit/all` | Live rate-limit state (resets, windows, per-feature caps) |
| `/rest/user/settings` | Account config, subscription info, connector limits, query counts |

Both requests run in parallel and resolve in a single UI update. All data is read-only — the extension makes no `POST`, `PUT`, or `DELETE` requests.

---

## Permissions

The extension requests the minimum permissions required:

| Permission | Why it's needed |
|---|---|
| `cookies` | Read session state to determine if you're logged in |
| `storage` | Cache last-fetched data for instant display on re-open |
| `host_permissions: perplexity.ai/*` | Allow fetch calls to Perplexity's API from the extension context |

---

## File Structure

```
perplexity-ratelimit-ext/
├── manifest.json       # Extension manifest (MV3)
├── popup.html          # UI markup and styles
├── popup.js            # Fetch logic and rendering
├── icon16.png          # Toolbar icon (16×16)
├── icon48.png          # Extensions page icon (48×48)
└── icon128.png         # Chrome Web Store icon (128×128)
```

---

## Development

No build step required — this is plain HTML, CSS, and vanilla JavaScript.

```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/perplexity-rate-monitor.git
cd perplexity-rate-monitor

# Load in Chrome
# chrome://extensions → Developer mode → Load unpacked → select this folder
```

After editing any file, go to `chrome://extensions` and click the **↺ reload** icon on the extension card, then reopen the popup.

### Tips

- Use **Raw JSON tab** in the popup to inspect the exact API response shape while iterating
- Chrome DevTools for the popup: right-click the popup → **Inspect** (only works while popup is open)
- The footer shows how many keys were returned from each endpoint — useful for spotting API changes

---

## Compatibility

| Browser | Status |
|---|---|
| Chrome 108+ | ✅ Fully supported |
| Edge 108+ | ✅ Fully supported (Chromium-based) |
| Firefox | ⚠️ Not tested (MV3 support differs) |
| Safari | ❌ Not supported |

---

## Privacy

- No data is sent to any third party
- No telemetry, analytics, or crash reporting
- The extension only contacts `www.perplexity.ai` — the same domain you're already logged into
- All data displayed stays in your browser's memory and is discarded when the popup closes

---

## Contributing

Contributions are welcome — see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

---

## Changelog

See [CHANGELOG.md](CHANGELOG.md).

---

## License

[MIT](LICENSE) — do whatever you want with it.
