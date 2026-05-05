export interface CurrentWeather {
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  weatherCode: number;
  locationName: string;
  country: string;
  latitude: number;
  longitude: number;
}

export interface DayForecast {
  date: string;
  dayName: string;
  high: number;
  low: number;
  weatherCode: number;
}

export interface WeatherAlert {
  event: string;
  headline: string;
  description: string;
  severity: string;
}

export interface WeatherResult {
  current: CurrentWeather;
  forecast: DayForecast[];
  alerts?: WeatherAlert[];
}

function buildDayName(dateStr: string): string {
  // dateStr = "2024-01-15"
  const d = new Date(dateStr + "T12:00:00");
  const today = new Date();
  if (d.toDateString() === today.toDateString()) return "Today";
  return d.toLocaleDateString("en-US", { weekday: "short" });
}

function getDateString(d: Date) {
  return d.toISOString().split("T")[0];
}

async function backendPostRecord(query: string): Promise<WeatherResult> {
  const today = new Date();
  const startDate = getDateString(today);
  const end = new Date(today);
  end.setDate(end.getDate() + 5); // next 5 days
  const endDate = getDateString(end);

  let res: Response;
  try {
    const token = typeof window !== "undefined" ? localStorage.getItem("skycast_token") : null;
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    res = await fetch("http://localhost:4000/api/records", {
      method: "POST",
      headers,
      body: JSON.stringify({
        locationQuery: query,
        startDate,
        endDate
      })
    });
  } catch (error) {
    throw new Error("API_ERROR");
  }

  const data = await res.json();
  
  if (!res.ok) {
    // Backend returns { error: "Location not found: ..." }
    if (data.error && data.error.toLowerCase().includes("location not found")) {
      throw new Error("LOCATION_NOT_FOUND");
    }
    throw new Error(data.error || "API_ERROR");
  }

  // data is the WeatherRecord from backend.
  // data.weatherData is a JSON string containing { current: {...}, daily: {...} }
  const weatherData = JSON.parse(data.weatherData);
  const c = weatherData.current;
  const d = weatherData.daily;

  const forecast: DayForecast[] = (d.time as string[]).slice(0, 5).map((date, i) => ({
    date,
    dayName: buildDayName(date),
    high: Math.round((d.temperature_2m_max as number[])[i]),
    low: Math.round((d.temperature_2m_min as number[])[i]),
    weatherCode: (d.weather_code as number[])[i],
  }));

  return {
    current: {
      temperature: Math.round(c.temperature_2m),
      feelsLike: Math.round(c.apparent_temperature),
      humidity: Math.round(c.relative_humidity_2m),
      windSpeed: Math.round(c.wind_speed_10m),
      weatherCode: c.weather_code,
      locationName: data.locationName,
      country: "", // we can omit country as it's not strictly necessary for the UI, or parse it if we want
      latitude: data.latitude,
      longitude: data.longitude
    },
    forecast,
    alerts: weatherData.alerts?.map((a: any) => ({
      event: a.properties?.event || "Alert",
      headline: a.properties?.headline || "Weather Alert",
      description: a.properties?.description || "",
      severity: a.properties?.severity || "Unknown"
    }))
  };
}

export async function fetchWeatherByQuery(query: string): Promise<WeatherResult> {
  return backendPostRecord(query);
}

export async function fetchWeatherByCoords(lat: number, lon: number): Promise<WeatherResult> {
  return backendPostRecord(`${lat},${lon}`);
}
