export interface WeatherData {
  latitude: number;
  longitude: number;
  locationName: string;
  startDate: string;
  endDate: string;
  current: any;
  daily: any;
  alerts?: any[];
}

export async function fetchWeatherAndLocation(
  query: string,
  startDate: string,
  endDate: string
): Promise<WeatherData> {
  let lat: number, lon: number, name: string;

  // Detect GPS coordinate input: "lat,lon" with optional spaces and unicode minus
  const coordPattern = /^(-?\d+(?:\.\d+)?)\s*,\s*([-−]?\d+(?:\.\d+)?)$/;
  const coordMatch = query.trim().replace("−", "-").match(coordPattern);

  if (coordMatch) {
    // ── GPS mode: bypass geocoding ──────────────────────────────────────────
    lat = parseFloat(coordMatch[1]);
    lon = parseFloat(coordMatch[2].replace("−", "-"));

    // Reverse-geocode to get a display name using Open-Meteo's geocoding by coords
    // (We use Nominatim's reverse-geocode — no API key required)
    try {
      const revUrl = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`;
      const revRes = await fetch(revUrl, { headers: { "User-Agent": "SkyCastWeatherApp/1.0" } });
      if (revRes.ok) {
        const revData = await revRes.json();
        const addr = revData.address ?? {};
        name = addr.city || addr.town || addr.village || addr.county || addr.state || revData.display_name || `${lat}, ${lon}`;
      } else {
        name = `${lat}, ${lon}`;
      }
    } catch {
      name = `${lat}, ${lon}`;
    }
  } else {
    // ── Name / zip / landmark geocoding ────────────────────────────────────
    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=1&language=en&format=json`;
    const geoRes = await fetch(geoUrl);

    if (!geoRes.ok) {
      throw new Error("Failed to reach geocoding service");
    }

    const geoData = await geoRes.json();
    if (!geoData.results || geoData.results.length === 0) {
      // Fallback: try Nominatim search (handles postal codes, landmarks, etc.)
      const nomUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`;
      const nomRes = await fetch(nomUrl, { headers: { "User-Agent": "SkyCastWeatherApp/1.0" } });
      if (!nomRes.ok) throw new Error(`Location not found: ${query}`);
      const nomData = await nomRes.json();
      if (!nomData.length) throw new Error(`Location not found: ${query}`);
      lat = parseFloat(nomData[0].lat);
      lon = parseFloat(nomData[0].lon);
      name = nomData[0].display_name.split(",")[0];
    } else {
      const location = geoData.results[0];
      lat = location.latitude;
      lon = location.longitude;
      name = location.name;
    }
  }

  const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&start_date=${startDate}&end_date=${endDate}&current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&temperature_unit=celsius&wind_speed_unit=kmh&timezone=auto`;

  const [weatherRes, alertsRes] = await Promise.all([
    fetch(weatherUrl),
    // NWS requires a User-Agent. It only works for US coordinates.
    fetch(`https://api.weather.gov/alerts/active?point=${lat},${lon}`, {
      headers: { "User-Agent": "SkyCastWeatherApp/1.0" }
    }).catch(() => null)
  ]);

  if (!weatherRes.ok) {
    throw new Error("Failed to fetch weather data for the specified date range. Ensure dates are within available limits.");
  }

  const weatherData = await weatherRes.json();
  
  let alerts: any[] = [];
  if (alertsRes && alertsRes.ok) {
    try {
      const alertsData = await alertsRes.json();
      alerts = alertsData.features || [];
    } catch (e) {
      // ignore
    }
  }

  return {
    latitude: lat,
    longitude: lon,
    locationName: name,
    startDate,
    endDate,
    current: weatherData.current,
    daily: weatherData.daily,
    alerts
  };
}
