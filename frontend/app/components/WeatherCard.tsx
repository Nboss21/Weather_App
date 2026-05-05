import { CurrentWeather } from "../lib/weather";
import { getWeatherMeta } from "../lib/weatherCodes";
import WeatherIcon from "./WeatherIcon";
import WeatherMap from "./WeatherMap";

interface Props {
  weather: CurrentWeather;
}

const stats = [
  {
    key: "feelsLike" as const,
    label: "Feels Like",
    unit: "°C",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
        <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z" />
      </svg>
    ),
  },
  {
    key: "humidity" as const,
    label: "Humidity",
    unit: "%",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
        <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
      </svg>
    ),
  },
  {
    key: "windSpeed" as const,
    label: "Wind",
    unit: " km/h",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
        <path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2" />
      </svg>
    ),
  },
];

export default function WeatherCard({ weather }: Props) {
  const meta = getWeatherMeta(weather.weatherCode);

  return (
    <div
      className="w-full rounded-3xl overflow-hidden shadow-2xl"
      style={{
        background: "rgba(255,255,255,0.06)",
        border: "1px solid rgba(255,255,255,0.12)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        animation: "fadeInUp 0.5s ease both",
      }}
    >
      {/* Top section */}
      <div className="flex flex-col items-center gap-2 pt-8 pb-6 px-6 text-center">
        {/* Location */}
        <div className="flex items-center gap-1.5 text-white/50 text-sm">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 text-sky-400">
            <path d="M21 10c0 6.627-9 13-9 13S3 16.627 3 10a9 9 0 1 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          <span className="font-medium text-white/75">{weather.locationName}</span>
          {weather.country && <span className="text-white/40">· {weather.country}</span>}
        </div>

        {/* Icon */}
        <div className="my-3 drop-shadow-xl">
          <WeatherIcon type={meta.iconType} size={96} />
        </div>

        {/* Temperature */}
        <div className="text-7xl font-bold text-white tracking-tight leading-none">
          {weather.temperature}
          <span className="text-4xl font-light text-white/60 ml-1">°C</span>
        </div>

        {/* Condition label */}
        <span
          className="mt-2 px-4 py-1 rounded-full text-sm font-medium"
          style={{
            background: "rgba(56,189,248,0.15)",
            border: "1px solid rgba(56,189,248,0.25)",
            color: "#7dd3fc",
          }}
        >
          {meta.label}
        </span>
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: "rgba(255,255,255,0.08)", margin: "0 24px" }} />

      {/* Stats row */}
      <div className="grid grid-cols-3 divide-x" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
        {stats.map(({ key, label, unit, icon }) => (
          <div key={key} className="flex flex-col items-center gap-1 py-5 px-3">
            <span className="text-sky-400/70">{icon}</span>
            <span className="text-xl font-semibold text-white">
              {weather[key]}{unit}
            </span>
            <span className="text-xs text-white/40 uppercase tracking-wider">{label}</span>
          </div>
        ))}
      </div>

      {/* Map Integration */}
      <div className="p-4" style={{ background: "rgba(255,255,255,0.02)", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
        <p className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2 px-2">Location Map</p>
        <WeatherMap latitude={weather.latitude} longitude={weather.longitude} locationName={weather.locationName} />
      </div>
    </div>
  );
}
