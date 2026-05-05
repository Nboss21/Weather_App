"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const json2csv_1 = require("json2csv");
const xml2js_1 = require("xml2js");
const db_1 = __importDefault(require("../db"));
const router = (0, express_1.Router)();
router.get("/:format", async (req, res) => {
    try {
        const format = req.params.format.toLowerCase();
        const validFormats = ["json", "csv", "xml", "markdown"];
        if (!validFormats.includes(format)) {
            return res.status(400).json({ error: `Invalid format. Supported formats: ${validFormats.join(", ")}` });
        }
        const records = await db_1.default.weatherRecord.findMany({
            where: { userId: req.user.id },
            orderBy: { createdAt: "desc" }
        });
        // Strip out long weatherData JSON string for cleaner CSV/XML/MD exports,
        // or parse it. For simplicity in CSV/MD, we'll summarize it.
        const cleanRecords = records.map(r => {
            const parsedWeather = JSON.parse(r.weatherData);
            const maxArr = parsedWeather?.daily?.temperature_2m_max ?? [];
            const minArr = parsedWeather?.daily?.temperature_2m_min ?? [];
            const avgMax = maxArr.length
                ? (maxArr.reduce((a, b) => a + b, 0) / maxArr.length).toFixed(1)
                : "N/A";
            const avgMin = minArr.length
                ? (minArr.reduce((a, b) => a + b, 0) / minArr.length).toFixed(1)
                : "N/A";
            return {
                id: r.id,
                query: r.locationQuery,
                resolvedLocation: r.locationName,
                lat: r.latitude,
                lon: r.longitude,
                startDate: r.startDate,
                endDate: r.endDate,
                avgMaxTemp: `${avgMax}°C`,
                avgMinTemp: `${avgMin}°C`,
                notes: r.notes || "",
                dateCreated: r.createdAt.toISOString()
            };
        });
        if (format === "json") {
            res.setHeader("Content-Type", "application/json");
            res.setHeader("Content-Disposition", 'attachment; filename="weather_records.json"');
            return res.send(JSON.stringify(cleanRecords, null, 2));
        }
        if (format === "csv") {
            const parser = new json2csv_1.Parser();
            const csv = parser.parse(cleanRecords);
            res.setHeader("Content-Type", "text/csv; charset=utf-8");
            res.setHeader("Content-Disposition", 'attachment; filename="weather_records.csv"');
            return res.send(Buffer.from(csv, "utf-8"));
        }
        if (format === "xml") {
            const builder = new xml2js_1.Builder({ rootName: "WeatherRecords" });
            const xml = builder.buildObject({ Record: cleanRecords });
            res.setHeader("Content-Type", "application/xml; charset=utf-8");
            res.setHeader("Content-Disposition", 'attachment; filename="weather_records.xml"');
            return res.send(Buffer.from(xml, "utf-8"));
        }
        if (format === "markdown") {
            let md = "# Weather Records Export\n\n";
            md += `> Generated: ${new Date().toISOString()}\n\n`;
            md += "| ID | Location | Start Date | End Date | Avg Max Temp | Avg Min Temp | Notes |\n";
            md += "|---|---|---|---|---|---|---|\n";
            cleanRecords.forEach(r => {
                md += `| ${r.id} | ${r.resolvedLocation} | ${r.startDate} | ${r.endDate} | ${r.avgMaxTemp} | ${r.avgMinTemp} | ${r.notes} |\n`;
            });
            res.setHeader("Content-Type", "text/markdown");
            res.setHeader("Content-Disposition", 'attachment; filename="weather_records.md"');
            return res.send(md);
        }
    }
    catch (error) {
        console.error("Export Error:", error);
        res.status(500).json({ error: "Failed to generate export" });
    }
});
exports.default = router;
