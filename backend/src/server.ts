import "dotenv/config";
import express from "express";
import cors from "cors";
import recordsRouter from "./routes/records";
import exportRouter from "./routes/export";
import authRouter from "./routes/auth";
import { authenticateToken } from "./middleware/auth";

const app = express();
const PORT = process.env.PORT || 4000;
const allowedOrigin =
  process.env.CORS_ALLOWED_ORIGIN || "http://localhost:3000";

app.use(cors({ origin: allowedOrigin }));
app.use(express.json());

app.use("/api/auth", authRouter);
app.use("/api/records", recordsRouter);
app.use("/api/export", authenticateToken, exportRouter);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});

setInterval(() => {}, 1000 * 60 * 60);

// Restart trigger
