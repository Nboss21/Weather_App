export type IconType =
  | "sunny"
  | "partly-cloudy"
  | "cloudy"
  | "foggy"
  | "drizzle"
  | "rainy"
  | "snowy"
  | "stormy";

export interface WeatherMeta {
  label: string;
  iconType: IconType;
}

const MAP: Record<number, WeatherMeta> = {
  0:  { label: "Clear Sky",          iconType: "sunny" },
  1:  { label: "Mainly Clear",       iconType: "partly-cloudy" },
  2:  { label: "Partly Cloudy",      iconType: "partly-cloudy" },
  3:  { label: "Overcast",           iconType: "cloudy" },
  45: { label: "Foggy",              iconType: "foggy" },
  48: { label: "Icy Fog",            iconType: "foggy" },
  51: { label: "Light Drizzle",      iconType: "drizzle" },
  53: { label: "Drizzle",            iconType: "drizzle" },
  55: { label: "Heavy Drizzle",      iconType: "drizzle" },
  61: { label: "Light Rain",         iconType: "rainy" },
  63: { label: "Rain",               iconType: "rainy" },
  65: { label: "Heavy Rain",         iconType: "rainy" },
  71: { label: "Light Snow",         iconType: "snowy" },
  73: { label: "Snow",               iconType: "snowy" },
  75: { label: "Heavy Snow",         iconType: "snowy" },
  77: { label: "Snow Grains",        iconType: "snowy" },
  80: { label: "Light Showers",      iconType: "rainy" },
  81: { label: "Rain Showers",       iconType: "rainy" },
  82: { label: "Heavy Showers",      iconType: "stormy" },
  85: { label: "Snow Showers",       iconType: "snowy" },
  86: { label: "Heavy Snow Showers", iconType: "snowy" },
  95: { label: "Thunderstorm",       iconType: "stormy" },
  96: { label: "Thunderstorm",       iconType: "stormy" },
  99: { label: "Severe Storm",       iconType: "stormy" },
};

export function getWeatherMeta(code: number): WeatherMeta {
  return MAP[code] ?? { label: "Unknown", iconType: "cloudy" };
}
