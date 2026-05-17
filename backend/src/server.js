require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const { connectDB } = require("./db");
const Admin = require("./models/Admin");

const authRoutes = require("./routes/auth");
const complaintsRoutes = require("./routes/complaints");
const adminRoutes = require("./routes/admin");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(
  cors({
    origin: [
      "https://complaint-management-pi.vercel.app",
      "http://127.0.0.1:5500",
      "http://localhost:5500",
    ],
    credentials: true,
  })
);
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ ok: true, database: "mongodb" });
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

  const existing = await Admin.findOne({ email: email.trim().toLowerCase() });
  if (existing) return;

  const passwordHash = await bcrypt.hash(password, 10);
  const admin = new Admin({
    email: email.trim().toLowerCase(),
    passwordHash,
  });
  await admin.save();
  console.log(`Seeded admin user: ${email}`);
}

async function start() {
  await connectDB();
  await seedAdminIfConfigured();
  app.listen(PORT, () => {
    console.log(`Complaint API (MongoDB) listening on port ${PORT}`);
  });
}

start().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
