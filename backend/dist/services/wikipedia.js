"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchWikipediaSummary = fetchWikipediaSummary;
async function fetchWikipediaSummary(locationName) {
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
            return data.extract;
        }
        return null;
    }
    catch (error) {
        console.error("Wikipedia fetch error:", error);
        return null;
    }
}
