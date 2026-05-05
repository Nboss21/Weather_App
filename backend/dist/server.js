"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const records_1 = __importDefault(require("./routes/records"));
const export_1 = __importDefault(require("./routes/export"));
const auth_1 = __importDefault(require("./routes/auth"));
const auth_2 = require("./middleware/auth");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 4000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use("/api/auth", auth_1.default);
app.use("/api/records", auth_2.authenticateToken, records_1.default);
app.use("/api/export", auth_2.authenticateToken, export_1.default);
// Health check
app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
});
app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
});
