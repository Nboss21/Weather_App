import { Router } from "express";
import { z } from "zod";
import prisma from "../db";
import { fetchWeatherAndLocation } from "../services/weather";
import { fetchWikipediaSummary } from "../services/wikipedia";
import { authenticateToken, optionalAuth } from "../middleware/auth";

const router = Router();

// Validation schema for creating a record
const createRecordSchema = z.object({
  locationQuery: z.string().min(1, "Location is required"),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Start date must be YYYY-MM-DD"),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "End date must be YYYY-MM-DD"),
  notes: z.string().optional()
});

// CREATE: Post a new weather query
router.post("/", optionalAuth, async (req, res) => {
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
    const weatherInfo = await fetchWeatherAndLocation(locationQuery, startDate, endDate);

    // 2. Save to database
    const record = await prisma.weatherRecord.create({
      data: {
        userId: (req as any).user?.id || null,
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
  } catch (error) {
    console.error("Create Record Error:", error);
    const msg = error instanceof Error ? error.message : "Internal Server Error";
    res.status(500).json({ error: msg });
  }
});

// READ: Get all records
router.get("/", authenticateToken, async (req, res) => {
  try {
    const records = await prisma.weatherRecord.findMany({
      where: { userId: (req as any).user.id },
      orderBy: { createdAt: "desc" }
    });
    res.json(records);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch records" });
  }
});

// READ: Get a single record with Wikipedia context (API Integration)
router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const id = parseInt(req.params.id as string, 10);
    const record = await prisma.weatherRecord.findUnique({ where: { id } });

    if (!record) {
      return res.status(404).json({ error: "Record not found" });
    }
    if (record.userId && record.userId !== (req as any).user.id) {
      return res.status(403).json({ error: "Forbidden" });
    }

    // "Stand Apart" feature: Wikipedia integration
    const wikiSummary = await fetchWikipediaSummary(record.locationName);

    res.json({
      ...record,
      weatherData: JSON.parse(record.weatherData),
      context: {
        wikipediaSummary: wikiSummary || "No Wikipedia summary available for this location."
      }
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch record" });
  }
});

// UPDATE: Update a record
router.put("/:id", authenticateToken, async (req, res) => {
  try {
    const id = parseInt(req.params.id as string, 10);
    const record = await prisma.weatherRecord.findUnique({ where: { id } });

    if (!record) {
      return res.status(404).json({ error: "Record not found" });
    }
    if (record.userId && record.userId !== (req as any).user.id) {
      return res.status(403).json({ error: "Forbidden" });
    }

    // Allow updating notes, or if date ranges / location change, re-fetch
    const { locationQuery, startDate, endDate, notes } = req.body;

    let updateData: any = { notes };

    // If any core field changes, we re-fetch the weather data
    if (
      (locationQuery && locationQuery !== record.locationQuery) ||
      (startDate && startDate !== record.startDate) ||
      (endDate && endDate !== record.endDate)
    ) {
      const q = locationQuery || record.locationQuery;
      const s = startDate || record.startDate;
      const e = endDate || record.endDate;

      if (new Date(s) > new Date(e)) {
        return res.status(400).json({ error: "startDate cannot be after endDate" });
      }

      const weatherInfo = await fetchWeatherAndLocation(q, s, e);
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

    const updated = await prisma.weatherRecord.update({
      where: { id },
      data: updateData
    });

    res.json(updated);
  } catch (error) {
    console.error("Update Record Error:", error);
    const msg = error instanceof Error ? error.message : "Failed to update record";
    res.status(500).json({ error: msg });
  }
});

// DELETE: Remove a record
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const id = parseInt(req.params.id as string, 10);
    const record = await prisma.weatherRecord.findUnique({ where: { id } });
    if (!record) return res.status(404).json({ error: "Record not found" });
    if (record.userId && record.userId !== (req as any).user.id) return res.status(403).json({ error: "Forbidden" });

    await prisma.weatherRecord.delete({ where: { id } });
    res.json({ message: "Record deleted successfully" });
  } catch (error) {
    // Prisma throws if record doesn't exist
    res.status(404).json({ error: "Record not found or already deleted" });
  }
});

export default router;
