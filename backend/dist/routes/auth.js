"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const zod_1 = require("zod");
const db_1 = __importDefault(require("../db"));
const router = (0, express_1.Router)();
const JWT_SECRET = process.env.JWT_SECRET || "super-secret-key";
const authSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(6),
    name: zod_1.z.string().optional(),
});
// Register
router.post("/register", async (req, res) => {
    try {
        const parsed = authSchema.safeParse(req.body);
        if (!parsed.success)
            return res.status(400).json({ error: "Invalid input" });
        const { email, password, name } = parsed.data;
        const existingUser = await db_1.default.user.findUnique({ where: { email } });
        if (existingUser)
            return res.status(400).json({ error: "User already exists" });
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        const user = await db_1.default.user.create({
            data: { email, password: hashedPassword, name: name || email.split("@")[0] }
        });
        const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: "7d" });
        res.status(201).json({ token, user: { id: user.id, email: user.email, name: user.name } });
    }
    catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});
// Login
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password)
            return res.status(400).json({ error: "Email and password required" });
        const user = await db_1.default.user.findUnique({ where: { email } });
        if (!user)
            return res.status(400).json({ error: "Invalid credentials" });
        const validPassword = await bcryptjs_1.default.compare(password, user.password);
        if (!validPassword)
            return res.status(400).json({ error: "Invalid credentials" });
        const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: "7d" });
        res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
    }
    catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});
exports.default = router;
