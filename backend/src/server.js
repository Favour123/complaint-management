require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const { pool } = require("./db");

const authRoutes = require("./routes/auth");
const complaintsRoutes = require("./routes/complaints");
const adminRoutes = require("./routes/admin");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(
  cors({
    origin: "https://complaint-management-pi.vercel.app",
    credentials: true,
  })
);
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ ok: true });
});

app.use("/api/auth", authRoutes);
app.use("/api/complaints", complaintsRoutes);
app.use("/api/admin", adminRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ status: "error", message: "Internal server error" });
});

async function seedAdminIfConfigured() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) return;

  const existing = await pool.query(`SELECT id FROM admins WHERE email = $1`, [
    email.trim().toLowerCase(),
  ]);
  if (existing.rows.length > 0) return;

  const password_hash = await bcrypt.hash(password, 10);
  await pool.query(`INSERT INTO admins (email, password_hash) VALUES ($1, $2)`, [
    email.trim().toLowerCase(),
    password_hash,
  ]);
  console.log(`Seeded admin user: ${email}`);
}

async function start() {
  await seedAdminIfConfigured();
  app.listen(PORT, () => {
    console.log(`Complaint API listening on port ${PORT}`);
  });
}

start().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
