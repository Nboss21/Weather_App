import { DayForecast } from "../lib/weather";
import { getWeatherMeta } from "../lib/weatherCodes";
import WeatherIcon from "./WeatherIcon";

export default function ForecastStrip({ days }: { days: DayForecast[] }) {
  return (
    <div style={{ width: "100%" }}>
      <p style={{
        fontSize: 10, fontWeight: 700, letterSpacing: "0.12em",
        textTransform: "uppercase", color: "rgba(56,189,248,0.7)",
        marginBottom: 12,
      }}>
        5-Day Forecast
      </p>

      {/* Scrollable on mobile, grid on desktop */}
      <div style={{ overflowX: "auto", paddingBottom: 4 }}>
        <div style={{
          display: "flex",
          gap: 8,
          minWidth: "fit-content",
        }}>
          {days.map((day) => {
            const meta = getWeatherMeta(day.weatherCode);
            const isToday = day.dayName === "Today";
            return (
              <div
                key={day.date}
                style={{
                  flex: "0 0 auto",
                  width: 100,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 8,
                  padding: "16px 8px",
                  borderRadius: 18,
                  background: isToday
                    ? "rgba(56,189,248,0.12)"
                    : "rgba(255,255,255,0.05)",
                  border: isToday
                    ? "1px solid rgba(56,189,248,0.25)"
                    : "1px solid rgba(255,255,255,0.09)",
                  backdropFilter: "blur(12px)",
                  WebkitBackdropFilter: "blur(12px)",
                }}
              >
                {/* Day name */}
                <span style={{
                  fontSize: 11, fontWeight: 700,
                  color: isToday ? "#7dd3fc" : "rgba(255,255,255,0.55)",
                  textTransform: "uppercase", letterSpacing: "0.05em",
                }}>
                  {day.dayName}
                </span>

                {/* Icon */}
                <WeatherIcon type={meta.iconType} size={44} />

                {/* Condition */}
                <span style={{
                  fontSize: 10, color: "rgba(255,255,255,0.38)",
                  textAlign: "center", lineHeight: 1.4,
                }}>
                  {meta.label}
                </span>

                {/* High / Low */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                  <span style={{ fontSize: 16, fontWeight: 700, color: "white" }}>
                    {day.high}°
                  </span>
                  <span style={{ fontSize: 12, color: "rgba(255,255,255,0.38)" }}>
                    {day.low}°
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
