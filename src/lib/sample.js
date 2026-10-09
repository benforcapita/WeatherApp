import { SAMPLE_CITIES } from './weather';
export function searchSampleCities(query) { const search = query.trim().toLowerCase(); return SAMPLE_CITIES.filter(city => `${city.name}, ${city.country}`.toLowerCase().includes(search)); }
export function sampleWeather(city, now = Date.now()) {
  const time = Math.floor(now / 3600000) * 3600;
  const base = city.name === 'Tokyo' ? 24 : city.name === 'New York' ? 15 : 20;
  // Deliberately synthetic values. Never used as a fallback for live requests.
  const hourly = Array.from({ length: 48 }, (_, i) => Math.round(base + 3 * Math.sin(i / 4)));
  const offsetParts = new Intl.DateTimeFormat('en', { timeZone: city.timezone, timeZoneName: 'longOffset' }).formatToParts(now);
  const offset = offsetParts.find(part => part.type === 'timeZoneName')?.value.match(/GMT([+-])(\d{2}):(\d{2})/);
  const seconds = offset ? (offset[1] === '-' ? -1 : 1) * (Number(offset[2]) * 3600 + Number(offset[3]) * 60) : 0;
  const midnight = Math.floor((time + seconds) / 86400) * 86400 - seconds;
  return { sample: true, receivedAt: now, timezone: city.timezone, utc_offset_seconds: seconds,
    current: { time, temperature_2m: base, apparent_temperature: base - 1, weather_code: 2, is_day: 1, wind_speed_10m: 12, relative_humidity_2m: 60 },
    hourly: { time: hourly.map((_, i) => time + i * 3600), temperature_2m: hourly, weather_code: hourly.map((_, i) => i > 7 ? 3 : 2), precipitation_probability: hourly.map((_, i) => i > 7 ? 30 : 10) },
    daily: { time: Array.from({ length: 7 }, (_, i) => midnight + i * 86400), temperature_2m_max: [base + 3, base + 2, base + 1, base, base + 2, base + 4, base + 3], temperature_2m_min: [base - 6, base - 5, base - 7, base - 6, base - 5, base - 4, base - 5], weather_code: [2, 1, 61, 3, 2, 0, 1], precipitation_probability_max: [10, 5, 70, 25, 15, 0, 5], sunrise: Array.from({ length: 7 }, (_, i) => midnight + i * 86400 + 7 * 3600), sunset: Array.from({ length: 7 }, (_, i) => midnight + i * 86400 + 18 * 3600) },
  };
}
