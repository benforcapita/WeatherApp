# Weather App

A small, responsive weather companion: search for a city, choose the right place, view modeled conditions and a seven-day forecast, switch Celsius/Fahrenheit, and explicitly save favorite places on your device.

This completes the original React app's search / conditions / forecast / favorites journey. The old AccuWeather integration and legacy deploy script have been replaced. No credentials are required or bundled. Nothing deploys to `master`.

## Run locally

Use Node 22.12+ or Node 24, then:

```sh
npm ci
npm run dev
npm run check
npm run test:browser
```

`npm run build` creates the personal-use live app in `dist/`. Serve that directory over HTTP(S); do not open index.html as a file. Assets use relative paths and hash navigation, so the app also works under a subdirectory without server rewrites.

## Two explicit modes

- **Personal-use live app:** `npm run dev` or `npm run build`. City queries go to Open-Meteo geocoding; selected city coordinates go to its forecast API. No browser geolocation, account, analytics, or keys. The app makes no provider request until you choose a place or search, except refreshing your previously selected place on a later visit.
- **Portfolio sample demo:** `npm run build:demo`. This build cannot call live weather/geocoding endpoints. Search explores three sample cities; forecast values are synthetic and labeled "Sample data" throughout. The sample dates are an illustrative window anchored to the day of use, not a forecast. Demo and personal-use storage are separate. A query parameter cannot enable live requests in the sample build.

A sample demo demonstrates real interactions and persistence. It is never represented as a live-weather verification.

## Data provider and licensing boundary

The personal-use build changes the provider from AccuWeather to [Open-Meteo](https://open-meteo.com/), using its documented [Forecast API](https://open-meteo.com/en/docs) and [Geocoding API](https://open-meteo.com/en/docs/geocoding-api). Geocoding is based on [GeoNames](https://www.geonames.org/). Weather data attribution and [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) links remain visible in the app.

As checked on October 9, 2026, the [Open-Meteo terms](https://open-meteo.com/en/terms) restrict the free API to non-commercial use, including private apps without advertisements or subscriptions. They specifically exclude commercial products and promotional activities. The free limits are below 10,000 calls/day, 5,000/hour, and 600/minute. There is no availability guarantee. A private portfolio can still be promotional, so the portfolio uses the network-disabled sample build. Before any commercial/promotional deployment of the live app, arrange a suitable provider agreement or integration. This project does not purchase or configure a paid plan.

Search is manual, not per-keystroke; city weather is cached for 30 minutes, with bounded storage and no background polling. These controls reduce requests but are not a centralized per-application quota system.

## Reliability and privacy

- Abort signals plus request-generation guards prevent old search/forecast responses from overwriting newer choices.
- Temperature values are stored in Celsius and converted locally; wind is shown in km/h or mph consistently. Unit changes do not call the provider.
- Current values are weather-model estimates, not measured station observations. Hourly instants use UNIX timestamps and the returned IANA time zone, including daylight-saving transitions. Daily cards retain the provider's calendar dates; the provider's daily aggregates use its request-time UTC offset across the entire range.
- Validated city-specific forecasts are retained for up to 24 hours. Cached, stale, and offline data are labeled, with their retrieval time and model-data time. Missing values show a dash rather than zero. Failed updates keep only that city's usable saved forecast; no fake weather is substituted in the live app.
- Saved places and preferences use only versioned app-specific localStorage keys. Storage corruption or browser restrictions do not crash the app; an unsaved/session-only warning appears if writing fails. Unrelated localStorage is not read or displayed.
- The app shell is not installed as a service worker. Previously loaded weather can be used during an open offline session; a cold offline visit may not load the app shell.
- Do not rely on this app for emergencies, official alerts, or safety-critical decisions.

## Tests

Unit/component tests cover provider contracts, malformed responses, null values, unit conversion, timezone/DST handling, storage validation, explicit favorite persistence, request races, errors/retries, and the sample/live boundary. Browser tests cover desktop and mobile workflows, keyboard accessibility, reloading saved preferences, offline/stale errors, responsive layout, and zero provider requests in sample mode. See `docs/VERIFICATION.md` for the exact executed checks and any environment limitations.

Browser tests use sandboxed Chromium. Set `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` to an installed official Chrome/Chromium if needed. Do not disable the sandbox or change host security settings to run tests.

## Historical repository hygiene

Legacy credential-bearing configuration and checked-in build artifacts are removed from this branch. This does not remove prior Git history or revoke anything. Repository owners should review any previously exposed provider credential privately; no validity testing, rotation, or history rewriting is performed here.
