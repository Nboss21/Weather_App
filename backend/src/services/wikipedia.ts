export async function fetchWikipediaSummary(locationName: string): Promise<string | null> {
  try {
    // MediaWiki REST API to fetch a summary extract
    const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(locationName)}`;
    const res = await fetch(url, {
      headers: { "User-Agent": "WeatherAppBot/1.0" }
    });

    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    if (data && data.extract) {
      return data.extract as string;
    }
    return null;
  } catch (error) {
    console.error("Wikipedia fetch error:", error);
    return null;
  }
}
