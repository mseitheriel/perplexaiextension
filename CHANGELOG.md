# Changelog

All notable changes to this project will be documented here.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [Unreleased]

---

## [1.2.0] — Initial public release

### Added
- Dashboard tab with full account overview
- Subscription card showing plan tier, billing source, promo/coupon name and expiry
- Lifetime query usage stats (Total, Copilot, Mobile)
- Account limits section: pages, uploads, collections, article images, files per user
- Connector file limits: daily attachments, total file slots, max file size
- Current Rate Limits section rendering all keys from `/rest/rate-limit/all`
- Monthly source limits with colour-coded remaining/total badges (green → amber → red)
- Unlimited sources list
- Raw JSON tab with syntax highlighting for both API endpoints
- Footer key count showing how many fields were returned from each endpoint
- Fade-in animation on tab switch

### Changed
- Replaced misleading full-width progress bars on account limits with a clean cap/description layout
- Improved subscription badge to show coupon metadata (name + expiry) when present
- Source names now use human-readable labels (e.g. "Microsoft Teams" instead of "microsoft_teams_mcp_merge")

### Fixed
- Data no longer silently falls back to empty when `/rest/rate-limit/all` returns a different schema than `/rest/user/settings` — each endpoint is now rendered independently

---

## [1.1.0]

### Added
- Separate Dashboard and Raw JSON tabs
- Both endpoints fetched in parallel; each rendered independently to avoid schema conflicts
- Fallback empty-state message when rate-limit endpoint returns no flat values

### Fixed
- All fields showing `—` when the rate-limit endpoint returned a different JSON structure than expected

---

## [1.0.0]

### Added
- Initial working extension
- Single popup fetching `/rest/rate-limit/all` and `/rest/user/settings`
- Basic display of subscription, query counts, resource limits, connector limits, and source quotas
