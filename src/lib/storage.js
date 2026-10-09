import { cleanCity, validCity, validateForecast, MAX_CACHE_MS } from './weather';
export const PREFERENCES_KEY = 'weather-app:preferences:v1';
export const CACHE_KEY = 'weather-app:forecasts:v1';
export function storageForBrowser() { try { return window.localStorage; } catch { return null; } }
const key = (base, demo) => `${base}${demo ? ':sample' : ''}`;
export function loadPreferences(storage = storageForBrowser(), demo = false) {
  const defaults = { unit: 'celsius', favorites: [], selected: null, storageAvailable: true };
  try {
    if (!storage) return { ...defaults, storageAvailable: false };
    const data = JSON.parse(storage.getItem(key(PREFERENCES_KEY, demo)) || 'null');
    if (!data || data.version !== 1) return defaults;
    return { ...defaults, unit: data.unit === 'fahrenheit' ? 'fahrenheit' : 'celsius', favorites: Array.isArray(data.favorites) ? [...new Map(data.favorites.map(cleanCity).filter(Boolean).map(city => [city.id, city])).values()].slice(0, 20) : [], selected: cleanCity(data.selected) };
  } catch (error) { return { ...defaults, storageAvailable: error instanceof SyntaxError }; }
}
export function savePreferences(preferences, storage = storageForBrowser(), demo = false) {
  try { if (!storage) return false; storage.setItem(key(PREFERENCES_KEY, demo), JSON.stringify({ version: 1, unit: preferences.unit, favorites: preferences.favorites, selected: preferences.selected })); return true; } catch { return false; }
}
function entries(storage, demo) { try { const data = JSON.parse(storage?.getItem(key(CACHE_KEY, demo)) || 'null'); return data?.version === 1 && data.entries && !Array.isArray(data.entries) && typeof data.entries === 'object' ? data.entries : {}; } catch { return {}; } }
export function readCache(city, storage = storageForBrowser(), now = Date.now(), demo = false) {
  if (!validCity(city)) return null;
  const entry = entries(storage, demo)[String(city.id)];
  if (!entry || entry.latitude !== city.latitude || entry.longitude !== city.longitude || !Number.isFinite(entry.forecast?.receivedAt) || now - entry.forecast.receivedAt > MAX_CACHE_MS || entry.forecast.receivedAt > now + 300000) return null;
  try { return validateForecast(entry.forecast); } catch { return null; }
}
export function writeCache(city, forecast, storage = storageForBrowser(), demo = false) {
  try {
    if (!storage || !validCity(city)) return false;
    validateForecast(forecast);
    const all = entries(storage, demo);
    all[String(city.id)] = { latitude: city.latitude, longitude: city.longitude, forecast };
    const limited = Object.fromEntries(Object.entries(all).filter(([, entry]) => Number.isFinite(entry?.forecast?.receivedAt)).sort((a, b) => b[1].forecast.receivedAt - a[1].forecast.receivedAt).slice(0, 12));
    storage.setItem(key(CACHE_KEY, demo), JSON.stringify({ version: 1, entries: limited })); return true;
  } catch { return false; }
}
