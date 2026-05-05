import express from "express";
import cors from "cors";
import recordsRouter from "./routes/records";
import exportRouter from "./routes/export";
import authRouter from "./routes/auth";
import { authenticateToken } from "./middleware/auth";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
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
