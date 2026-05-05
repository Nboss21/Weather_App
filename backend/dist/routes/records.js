"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const db_1 = __importDefault(require("../db"));
const weather_1 = require("../services/weather");
const wikipedia_1 = require("../services/wikipedia");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Validation schema for creating a record
const createRecordSchema = zod_1.z.object({
    locationQuery: zod_1.z.string().min(1, "Location is required"),
    startDate: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Start date must be YYYY-MM-DD"),
    endDate: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "End date must be YYYY-MM-DD"),
    notes: zod_1.z.string().optional()
});
// CREATE: Post a new weather query
router.post("/", auth_1.optionalAuth, async (req, res) => {
    try {
        const parsed = createRecordSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ error: "Invalid input", details: parsed.error.format() });
        }
        const { locationQuery, startDate, endDate, notes } = parsed.data;
        // Validate dates
        if (new Date(startDate) > new Date(endDate)) {
            return res.status(400).json({ error: "startDate cannot be after endDate" });
        }
        // 1. Fetch weather and geocode
        const weatherInfo = await (0, weather_1.fetchWeatherAndLocation)(locationQuery, startDate, endDate);
        // 2. Save to database
        const record = await db_1.default.weatherRecord.create({
            data: {
                userId: req.user?.id || null,
                locationQuery,
                locationName: weatherInfo.locationName,
                latitude: weatherInfo.latitude,
                longitude: weatherInfo.longitude,
                startDate,
                endDate,
                weatherData: JSON.stringify({ current: weatherInfo.current, daily: weatherInfo.daily }),
                notes
            }
        });
        res.status(201).json(record);
    }
    catch (error) {
        console.error("Create Record Error:", error);
        const msg = error instanceof Error ? error.message : "Internal Server Error";
        res.status(500).json({ error: msg });
    }
});
// READ: Get all records
router.get("/", auth_1.authenticateToken, async (req, res) => {
    try {
        const records = await db_1.default.weatherRecord.findMany({
            where: { userId: req.user.id },
            orderBy: { createdAt: "desc" }
        });
        res.json(records);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch records" });
    }
});
// READ: Get a single record with Wikipedia context (API Integration)
router.get("/:id", auth_1.authenticateToken, async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        const record = await db_1.default.weatherRecord.findUnique({ where: { id } });
        if (!record) {
            return res.status(404).json({ error: "Record not found" });
        }
        if (record.userId && record.userId !== req.user.id) {
            return res.status(403).json({ error: "Forbidden" });
        }
        // "Stand Apart" feature: Wikipedia integration
        const wikiSummary = await (0, wikipedia_1.fetchWikipediaSummary)(record.locationName);
        res.json({
            ...record,
            weatherData: JSON.parse(record.weatherData),
            context: {
                wikipediaSummary: wikiSummary || "No Wikipedia summary available for this location."
            }
        });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch record" });
    }
});
// UPDATE: Update a record
router.put("/:id", auth_1.authenticateToken, async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        const record = await db_1.default.weatherRecord.findUnique({ where: { id } });
        if (!record) {
            return res.status(404).json({ error: "Record not found" });
        }
        if (record.userId && record.userId !== req.user.id) {
            return res.status(403).json({ error: "Forbidden" });
        }
        // Allow updating notes, or if date ranges / location change, re-fetch
        const { locationQuery, startDate, endDate, notes } = req.body;
        let updateData = { notes };
        // If any core field changes, we re-fetch the weather data
        if ((locationQuery && locationQuery !== record.locationQuery) ||
            (startDate && startDate !== record.startDate) ||
            (endDate && endDate !== record.endDate)) {
            const q = locationQuery || record.locationQuery;
            const s = startDate || record.startDate;
            const e = endDate || record.endDate;
            if (new Date(s) > new Date(e)) {
                return res.status(400).json({ error: "startDate cannot be after endDate" });
            }
            const weatherInfo = await (0, weather_1.fetchWeatherAndLocation)(q, s, e);
            updateData = {
                ...updateData,
                locationQuery: q,
                locationName: weatherInfo.locationName,
                latitude: weatherInfo.latitude,
                longitude: weatherInfo.longitude,
                startDate: s,
                endDate: e,
                weatherData: JSON.stringify({ current: weatherInfo.current, daily: weatherInfo.daily })
            };
        }
        const updated = await db_1.default.weatherRecord.update({
            where: { id },
            data: updateData
        });
        res.json(updated);
    }
    catch (error) {
        console.error("Update Record Error:", error);
        const msg = error instanceof Error ? error.message : "Failed to update record";
        res.status(500).json({ error: msg });
    }
});
// DELETE: Remove a record
router.delete("/:id", auth_1.authenticateToken, async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        const record = await db_1.default.weatherRecord.findUnique({ where: { id } });
        if (!record)
            return res.status(404).json({ error: "Record not found" });
        if (record.userId && record.userId !== req.user.id)
            return res.status(403).json({ error: "Forbidden" });
        await db_1.default.weatherRecord.delete({ where: { id } });
        res.json({ message: "Record deleted successfully" });
    }
    catch (error) {
        // Prisma throws if record doesn't exist
        res.status(404).json({ error: "Record not found or already deleted" });
    }
});
exports.default = router;
