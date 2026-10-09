import { Sun, CloudSun, CloudRain, CloudSnow, CloudFog, CloudLightning, CircleHelp, Moon } from 'lucide-react';
import { weatherKind } from '../lib/weather';
export default function WeatherIcon({ code, night = false, size = 32, className = '' }) {
 const Icon = { sun: night ? Moon : Sun, cloud: CloudSun, rain: CloudRain, snow: CloudSnow, fog: CloudFog, storm: CloudLightning, unknown: CircleHelp }[weatherKind(code)];
 return <Icon size={size} strokeWidth={1.6} className={`weather-icon ${className}`} aria-hidden="true" />;
}
