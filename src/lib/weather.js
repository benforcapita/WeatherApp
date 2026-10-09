export const FRESH_MS = 30 * 60 * 1000;
export const MAX_CACHE_MS = 24 * 60 * 60 * 1000;
export const SAMPLE_CITIES = [
  { id: 2950159, name: 'Berlin', country: 'Germany', admin1: 'Berlin', latitude: 52.52, longitude: 13.41, timezone: 'Europe/Berlin' },
  { id: 1850147, name: 'Tokyo', country: 'Japan', admin1: 'Tokyo', latitude: 35.68, longitude: 139.69, timezone: 'Asia/Tokyo' },
  { id: 5128581, name: 'New York', country: 'United States', admin1: 'New York', latitude: 40.71, longitude: -74.01, timezone: 'America/New_York' },
];
export function validTimezone(value) {
  if (typeof value !== 'string') return false;
  try { new Intl.DateTimeFormat('en', { timeZone: value }).format(0); return true; } catch { return false; }
}
export function validCity(city) {
  return !!city && Number.isInteger(city.id) && city.id >= 0 && typeof city.name === 'string' && city.name.trim().length > 0 && city.name.length <= 160 && Number.isFinite(city.latitude) && Math.abs(city.latitude) <= 90 && Number.isFinite(city.longitude) && Math.abs(city.longitude) <= 180 && validTimezone(city.timezone);
}
export function cleanCity(city) {
  if (!validCity(city)) return null;
  return { id: city.id, name: city.name, country: typeof city.country === 'string' ? city.country.slice(0, 160) : '', admin1: typeof city.admin1 === 'string' ? city.admin1.slice(0, 160) : '', latitude: city.latitude, longitude: city.longitude, timezone: city.timezone };
}
async function requestJSON(url, signal, fetcher) {
  const controller = new AbortController();
  const abort = () => controller.abort();
  if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
  signal?.addEventListener('abort', abort, { once: true });
  let timedOut = false;
  const timeout = setTimeout(() => { timedOut = true; controller.abort(); }, 12000);
  try {
    const response = await fetcher(url, { signal: controller.signal, credentials: 'omit' });
    if (!response.ok) throw new Error(response.status === 429 ? 'The weather service is busy. Please wait a minute and try again.' : 'The weather service is unavailable. Please try again shortly.');
    const data = await response.json();
    if (!data || typeof data !== 'object' || data.error) throw new Error('The weather service returned an unexpected response. Please try again.');
    return data;
  } catch (error) {
    if (timedOut) throw new Error('The weather service took too long. Please try again.');
    if (error.name === 'AbortError') throw error;
    if (error instanceof TypeError) throw new Error('Could not connect to the weather service. Check your connection and try again.');
    if (error instanceof SyntaxError) throw new Error('The weather service returned an unexpected response. Please try again.');
    throw error;
  } finally { clearTimeout(timeout); signal?.removeEventListener('abort', abort); }
}
export async function searchCities(query, signal, fetcher = fetch) {
  if (query.trim().length < 2) return [];
  const url = new URL('https://geocoding-api.open-meteo.com/v1/search');
  url.search = new URLSearchParams({ name: query.trim().slice(0, 100), count: '8', language: 'en', format: 'json' });
  const data = await requestJSON(url.toString(), signal, fetcher);
  if (data.results === undefined) return [];
  if (!Array.isArray(data.results)) throw new Error('The weather service returned an unexpected response. Please try again.');
  const cities = data.results.map(cleanCity).filter(Boolean);
  if (data.results.length && !cities.length) throw new Error('The weather service returned an unexpected response. Please try again.');
  return [...new Map(cities.map(city => [city.id, city])).values()];
}
const nullableNumber = value => value === null || (typeof value === 'number' && Number.isFinite(value));
const validEpoch = value => Number.isFinite(value) && value > 0 && value < 8640000000000;
export function validateForecast(data) {
  const invalid = () => { throw new Error('The weather service returned an incomplete forecast. Please try again.'); };
  if (!data || !validTimezone(data.timezone) || !Number.isFinite(data.utc_offset_seconds) || Math.abs(data.utc_offset_seconds) > 86400 || !data.current || !validEpoch(data.current.time)) invalid();
  for (const key of ['temperature_2m', 'apparent_temperature', 'relative_humidity_2m', 'weather_code', 'is_day', 'wind_speed_10m']) if (!nullableNumber(data.current[key])) invalid();
  for (const [group, minimum, keys] of [
    ['hourly', 12, ['temperature_2m', 'weather_code', 'precipitation_probability']],
    ['daily', 7, ['temperature_2m_max', 'temperature_2m_min', 'weather_code', 'precipitation_probability_max', 'sunrise', 'sunset']],
  ]) {
    const part = data[group];
    if (!part || !Array.isArray(part.time) || part.time.length < minimum || !part.time.every(validEpoch) || part.time.some((t, i) => i > 0 && t <= part.time[i - 1])) invalid();
    for (const key of keys) {
      const validValue = ['sunrise', 'sunset'].includes(key) ? value => value === null || validEpoch(value) : nullableNumber;
      if (!Array.isArray(part[key]) || part[key].length !== part.time.length || !part[key].every(validValue)) invalid();
    }
  }
  return data;
}
export async function fetchWeather(city, signal, fetcher = fetch) {
  if (!validCity(city)) throw new Error('Choose a valid location first.');
  const url = new URL('https://api.open-meteo.com/v1/forecast');
  url.search = new URLSearchParams({ latitude: String(city.latitude), longitude: String(city.longitude), current: 'temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,wind_speed_10m', hourly: 'temperature_2m,weather_code,precipitation_probability', daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,sunrise,sunset', timezone: 'auto', forecast_days: '7', timeformat: 'unixtime', temperature_unit: 'celsius', wind_speed_unit: 'kmh' });
  return { ...validateForecast(await requestJSON(url.toString(), signal, fetcher)), receivedAt: Date.now() };
}
export function formatTemperature(value, unit) { return value == null || !Number.isFinite(value) ? '—' : `${Math.round(unit === 'fahrenheit' ? value * 9 / 5 + 32 : value)}°`; }
export function formatWind(value, unit) { return value == null || !Number.isFinite(value) ? '—' : `${Math.round(unit === 'fahrenheit' ? value / 1.609344 : value)} ${unit === 'fahrenheit' ? 'mph' : 'km/h'}`; }
export function formatTime(epoch, timezone) { return !validEpoch(epoch) ? '—' : new Intl.DateTimeFormat('en-US', { timeZone: timezone, hour: 'numeric', minute: '2-digit' }).format(epoch * 1000); }
export function formatTimestamp(epoch, timezone) { return new Intl.DateTimeFormat('en-US', { timeZone: timezone, month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', timeZoneName: 'short' }).format(epoch * 1000); }
export function dayLabel(epoch, offset) { return new Intl.DateTimeFormat('en-US', { timeZone: 'UTC', weekday: 'short', month: 'short', day: 'numeric' }).format((epoch + offset) * 1000); }
export function isStale(data, now = Date.now()) { return !data || !Number.isFinite(data.receivedAt) || now - data.receivedAt > FRESH_MS || data.receivedAt > now + 300000 || now / 1000 - data.current.time > 7200 || data.current.time > now / 1000 + 3600; }
const descriptions = { 0: 'Clear sky', 1: 'Mostly clear', 2: 'Partly cloudy', 3: 'Overcast', 45: 'Fog', 48: 'Icy fog', 51: 'Light drizzle', 53: 'Drizzle', 55: 'Heavy drizzle', 56: 'Freezing drizzle', 57: 'Heavy freezing drizzle', 61: 'Light rain', 63: 'Rain', 65: 'Heavy rain', 66: 'Freezing rain', 67: 'Heavy freezing rain', 71: 'Light snow', 73: 'Snow', 75: 'Heavy snow', 77: 'Snow grains', 80: 'Light showers', 81: 'Showers', 82: 'Heavy showers', 85: 'Snow showers', 86: 'Heavy snow showers', 95: 'Thunderstorms', 96: 'Thunderstorms with hail', 97: 'Heavy thunderstorms', 99: 'Thunderstorm with heavy hail' };
export function weatherDescription(code) { return descriptions[code] ?? 'Conditions unavailable'; }
export function weatherKind(code) { if (code == null) return 'unknown'; if ([0, 1].includes(code)) return 'sun'; if ([2, 3].includes(code)) return 'cloud'; if ([45, 48].includes(code)) return 'fog'; if ([71, 73, 75, 77, 85, 86].includes(code)) return 'snow'; if ([95, 96, 97, 99].includes(code)) return 'storm'; return descriptions[code] ? 'rain' : 'unknown'; }
