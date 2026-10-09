# Verification — October 9, 2026

## Executed checks

- `npm run lint`: passed with zero warnings.
- `npm test`: 29 passing unit/component tests in three files.
- `npm run build`: passed for the personal-use live build.
- `npm run build:demo`: passed for the isolated synthetic sample build.
- `npm run test:browser`: 16 passing deterministic checks, eight each for desktop Chromium and mobile Chromium. Two opt-in external-network checks are skipped in this default command. The suite also explicitly tests 320-pixel layout in both projects.
- Axe WCAG 2 A/AA and WCAG 2.1 AA audit: no violations on the tested desktop/mobile forecast states. This is an automated check, not a claim of a complete manual accessibility audit.
- `npm audit --omit=dev`: zero reported production dependency vulnerabilities at verification time.

## Interaction coverage

The browser suite exercises manual search and selection, current/hourly/seven-day rendering, Celsius/Fahrenheit and wind units, explicit save/remove, route navigation and Back, reload persistence, loading and service failure/retry, switching cities during requests, stale search cancellation, offline cached forecasts and reconnection, corrupt/blocked local storage, keyboard skip links, horizontal overflow, and independent sample storage. The sample build was tested with a `?mode=live` query attempt and made zero weather-provider requests.

Unit tests additionally cover malformed provider payloads, HTTP 429, request timeout and caller cancellation, nullable weather/polar sunrise values, invalid sunrise epochs, unknown weather codes, storage limits/expiry, DST hourly conversion, fixed-offset daily dates, and old/future timestamps.

## Real external-provider evidence

Real HTTPS requests, without keys, succeeded for the public example city Berlin: geocoding returned eight candidate places; the selected city forecast returned seven daily rows and 168 hourly rows under Europe/Berlin.

The supported cloud browser also completed the actual personal-use journey on October 9 at approximately 13:27 UTC: search Berlin → choose Berlin, Germany → see Open-Meteo modeled conditions, 12 upcoming hours and seven daily cards → change to Fahrenheit → save Berlin → open it from Saved places. The screen displayed retrieval time 15:27 GMT+2 and model-data time 15:15 GMT+2, 13°C / 56°F, and appropriate attribution. This was actual provider data, not test fixtures. No device location was requested.

A separate, directly launched sandboxed Playwright browser could not reach the same geocoding endpoint (`net::ERR_CONNECTION_REFUSED`). The app correctly displayed its connection error. That runner-specific external-network failure is not counted as a passing automated live-source smoke. The supported cloud-browser success above establishes the live browser journey; default CI remains deterministic and does not depend on provider uptime. `WEATHER_LIVE_SMOKE=1 npm run test:browser -- tests/browser/live-smoke.spec.js --project=desktop` enables the optional actual-provider check in an environment with working network access.

## Scope and limits

- Portfolio/demo artifacts contain clearly labeled synthetic sample weather and never call Open-Meteo. Public/private visibility does not remove the provider's restriction against free-API use in promotional activities.
- The personal-use live app is restricted to the provider's documented non-commercial scope and limits. Commercial/promotional live deployment requires separate provider arrangements.
- Only Chromium was exercised here; Safari and Firefox were not independently verified.
- Forecast availability and accuracy are the provider's responsibility. This app does not provide official severe-weather alerts.
- Cached forecasts are usable in an already-loaded offline session; there is no service-worker installation or guaranteed cold-start offline shell.
- Favorites/preferences are local to the browser and limited to 20 places; cache storage is bounded to 12 city forecasts and 24 hours.
- No merge or production deployment is performed by this change. Exact release source SHA, build checksums, screenshot evidence and CI status accompany the delivery artifact.
