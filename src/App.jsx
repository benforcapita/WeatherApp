import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, CloudSun, Search, Bookmark, WifiOff, MapPin, Compass } from 'lucide-react';
import Forecast from './components/Forecast';
import Favorites from './components/Favorites';
import { fetchWeather, searchCities, SAMPLE_CITIES, isStale } from './lib/weather';
import { loadPreferences, savePreferences, readCache, writeCache, storageForBrowser } from './lib/storage';
import { sampleWeather, searchSampleCities } from './lib/sample';
import './App.css';
const SAMPLE_BUILD = import.meta.env.MODE === 'demo';
export default function App({ mode = SAMPLE_BUILD ? 'demo' : 'live' }) {
 const demo = SAMPLE_BUILD || mode === 'demo';
 const [preferences, setPreferences] = useState(() => loadPreferences(storageForBrowser(), demo));
 const [page, setPage] = useState(() => window.location.hash.toLowerCase() === '#favorites' ? 'favorites' : 'forecast');
 const [query, setQuery] = useState('');
 const [search, setSearch] = useState({ results: [], loading: false, message: '', searched: false });
 const [weather, setWeather] = useState({ cityId: null, data: null, loading: false, error: '', source: '' });
 const [refresh, setRefresh] = useState(0);
 const [online, setOnline] = useState(navigator.onLine);
 const [storageWarning, setStorageWarning] = useState(!preferences.storageAvailable);
 const [favoriteWarning, setFavoriteWarning] = useState('');
 const [now, setNow] = useState(Date.now());
 const searchSequence = useRef(0);
 const searchAbort = useRef(null);
 const forecastSequence = useRef(0);
 const selected = preferences.selected;
 useEffect(() => { const hash = () => setPage(window.location.hash.toLowerCase() === '#favorites' ? 'favorites' : 'forecast'); const connectivity = () => { setOnline(navigator.onLine); setNow(Date.now()); }; window.addEventListener('hashchange', hash); window.addEventListener('online', connectivity); window.addEventListener('offline', connectivity); const timer = setInterval(() => setNow(Date.now()), 60000); return () => { window.removeEventListener('hashchange', hash); window.removeEventListener('online', connectivity); window.removeEventListener('offline', connectivity); clearInterval(timer); }; }, []);
 useEffect(() => { if (!savePreferences(preferences, storageForBrowser(), demo)) setStorageWarning(true); }, [preferences, demo]);
 useEffect(() => () => { searchSequence.current++; searchAbort.current?.abort(); }, []);
 useEffect(() => {
  if (!selected) return;
  const sequence = ++forecastSequence.current;
  const controller = new AbortController();
  const cached = readCache(selected, storageForBrowser(), Date.now(), demo);
  const active = () => sequence === forecastSequence.current && !controller.signal.aborted;
  if (demo) { const data = sampleWeather(selected); setWeather({ cityId: selected.id, data, loading: false, error: '', source: 'sample' }); if (!writeCache(selected, data, storageForBrowser(), true)) setStorageWarning(true); return () => controller.abort(); }
  if (!navigator.onLine) { setWeather({ cityId: selected.id, data: cached, loading: false, error: cached ? '' : 'You’re offline and no saved forecast is available for this city. Reconnect to try again.', source: 'cache' }); return () => controller.abort(); }
  if (cached && !isStale(cached) && refresh === 0) { setWeather({ cityId: selected.id, data: cached, loading: false, error: '', source: 'cache' }); return () => controller.abort(); }
  setWeather({ cityId: selected.id, data: cached, loading: true, error: '', source: 'cache' });
  fetchWeather(selected, controller.signal).then(data => { if (!active()) return; setNow(Date.now()); setWeather({ cityId: selected.id, data, loading: false, error: '', source: 'network' }); if (!writeCache(selected, data)) setStorageWarning(true); }).catch(error => { if (!active() || error.name === 'AbortError') return; setWeather({ cityId: selected.id, data: cached, loading: false, error: error.message, source: 'cache' }); });
  return () => controller.abort();
 }, [selected, demo, refresh]);
 function navigate(next) { window.location.hash = next === 'favorites' ? 'favorites' : 'forecast'; setPage(next); }
 function choose(city) { searchSequence.current++; searchAbort.current?.abort(); setSearch({ results: [], loading: false, message: '', searched: false }); setQuery(''); setRefresh(0); setPreferences(previous => ({ ...previous, selected: city })); navigate('forecast'); }
 function editQuery(value) { searchSequence.current++; searchAbort.current?.abort(); setQuery(value); setSearch({ results: [], loading: false, message: '', searched: false }); }
 async function submitSearch(event) {
  event.preventDefault();
  if (query.trim().length < 2) { setSearch({ results: [], loading: false, message: 'Enter at least two letters to search for a city.', searched: true }); return; }
  searchAbort.current?.abort(); const controller = new AbortController(); searchAbort.current = controller; const sequence = ++searchSequence.current;
  if (!online && !demo) { setSearch({ results: [], loading: false, message: 'You’re offline. Open a saved place, or reconnect to search.', searched: true }); return; }
  setSearch({ results: [], loading: true, message: '', searched: true });
  try { const results = demo ? searchSampleCities(query) : await searchCities(query, controller.signal); if (sequence !== searchSequence.current) return; setSearch({ results, loading: false, message: results.length ? '' : demo ? 'No sample city matches. Try Berlin, Tokyo, or New York.' : 'No cities found. Try another spelling or add a country.', searched: true }); } catch (error) { if (sequence === searchSequence.current && error.name !== 'AbortError') setSearch({ results: [], loading: false, message: error.message, searched: true }); }
 }
 function toggleFavorite(city) { const exists = preferences.favorites.some(item => item.id === city.id); if (!exists && preferences.favorites.length >= 20) { setFavoriteWarning('You can save up to 20 places. Remove one to add another.'); return; } setFavoriteWarning(''); setPreferences(previous => ({ ...previous, favorites: exists ? previous.favorites.filter(item => item.id !== city.id) : [...previous.favorites, city] })); }
 const currentWeather = weather.cityId === selected?.id ? weather : { data: null, loading: true, error: '', source: '' };
 return <div className="app-shell"><a className="skip-link" href="#main-content" onClick={event => { event.preventDefault(); document.getElementById('main-content')?.focus(); }}>Skip to content</a>
  <header className="site-header"><a href="#forecast" className="brand" onClick={() => navigate('forecast')}><span className="brand-mark"><CloudSun size={24}/></span><span>weather<span className="brand-dot">.</span></span></a><nav aria-label="Main navigation"><a href="#forecast" aria-current={page === 'forecast' ? 'page' : undefined} onClick={() => navigate('forecast')}><Compass size={17}/><span>Forecast</span></a><a href="#favorites" aria-current={page === 'favorites' ? 'page' : undefined} onClick={() => navigate('favorites')}><Bookmark size={17}/><span>Saved places</span><span className="count">{preferences.favorites.length}</span></a></nav><div className="unit-switch" role="group" aria-label="Temperature unit"><button aria-label="Celsius" aria-pressed={preferences.unit === 'celsius'} onClick={() => setPreferences(previous => ({ ...previous, unit: 'celsius' }))}>°C</button><button aria-label="Fahrenheit" aria-pressed={preferences.unit === 'fahrenheit'} onClick={() => setPreferences(previous => ({ ...previous, unit: 'fahrenheit' }))}>°F</button></div></header>
  <main id="main-content" tabIndex="-1">
   {demo && <div className="demo-notice"><span className="pill">Sample data</span><p>Explore a working demo with synthetic weather. Live requests are disabled.</p></div>}
   {!online && !demo && <p className="notice" role="status"><WifiOff size={18}/>You’re offline. Available saved forecasts are shown with their original times.</p>}
   {storageWarning && <p className="notice" role="status">Browser storage is unavailable or full. Changes will last only for this visit; forecasts may not be saved.</p>}
   {favoriteWarning && <p className="notice" role="status">{favoriteWarning}</p>}
   {page === 'favorites' ? <Favorites favorites={preferences.favorites} unit={preferences.unit} onChoose={choose} onRemove={toggleFavorite} demo={demo} onExplore={() => navigate('forecast')}/> : <>
    <section className={`search-section ${selected ? 'compact' : ''}`} aria-label="Find a place">{!selected && <div className="welcome"><p className="eyebrow">MAKE A LITTLE ROOM FOR OUTSIDE</p><h1>A clearer look<br/>at your day<span>.</span></h1><p>From your morning walk to your next adventure.<br className="desktop-break"/> Find the weather in the places that matter.</p><div className="welcome-sun" aria-hidden="true"><CloudSun/></div></div>}
     <form onSubmit={submitSearch} className="search-form"><Search size={21} aria-hidden="true"/><input type="search" aria-label="Search for a city" placeholder="Search city or city, country" maxLength="100" value={query} onChange={event => editQuery(event.target.value)} autoComplete="off" aria-describedby="search-help"/><button className="button" type="submit">Search<ArrowUpRight size={17}/></button></form>
     <p id="search-help" className="search-help">{demo ? 'Sample cities: Berlin, Tokyo, and New York.' : 'Choose a city manually. We never request your device location.'}</p>
     {search.loading && <p className="search-message" role="status">Finding matching cities…</p>}
     {search.message && <p className="search-message" role="status">{search.message}</p>}
     {search.results.length > 0 && <div className="search-results"><p className="eyebrow">CHOOSE A PLACE</p><ul>{search.results.map(city => <li key={city.id}><button onClick={() => choose(city)}><MapPin size={18}/><span><strong>{city.name}, {city.country}</strong><small>{city.admin1} · {city.timezone}</small></span><ArrowUpRight size={17}/></button></li>)}</ul></div>}
     <div className="quick-places"><span>{selected ? 'Or explore' : 'Somewhere to start'}</span>{SAMPLE_CITIES.map(city => <button key={city.id} onClick={() => choose(city)} aria-label={`Explore ${city.name}`}><MapPin size={13}/>{city.name}</button>)}</div>
    </section>
    {selected ? <Forecast city={selected} state={currentWeather} unit={preferences.unit} saved={preferences.favorites.some(city => city.id === selected.id)} onSave={() => toggleFavorite(selected)} onRefresh={() => setRefresh(value => value + 1)} online={online} demo={demo} now={now}/> : <div className="welcome-foot"><span><span className="status-dot"/> {demo ? 'Interactive sample experience' : 'No account. Just the forecast.'}</span><span>Today, tomorrow, and the week ahead.</span></div>}
   </>}
  </main>
  <footer className="site-footer"><div><span className="footer-brand">weather.</span><p>A little perspective on the day ahead.</p></div><div className="credits">{demo ? <p>Synthetic sample data. Not a weather forecast.</p> : <><p>Weather by <a href="https://open-meteo.com/" target="_blank" rel="noreferrer">Open-Meteo</a> · Locations by <a href="https://www.geonames.org/" target="_blank" rel="noreferrer">GeoNames</a> · <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noreferrer">CC BY 4.0</a></p><p>Personal, non-commercial use. <a href="https://open-meteo.com/en/terms" target="_blank" rel="noreferrer">Provider terms & privacy</a></p></>}<p>{demo ? 'For exploring this demo only. No live weather requests.' : 'Model estimates, not official alerts. Never use for safety-critical decisions.'}</p></div></footer>
 </div>;
}
