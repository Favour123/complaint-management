const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { bearerToken } = require("../middleware/auth");

const router = express.Router();

function signUserToken(user) {
  return jwt.sign(
    {
      sub: user._id,
      uuid: user.uuid,
      role: "user",
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}

router.post("/register", async (req, res) => {
  try {
    const { fullName, matricNo, email, password, confirmPassword } = req.body;

    if (!fullName || !matricNo || !email || !password || !confirmPassword) {
      return res.status(400).json({
        status: "error",
        message: "All fields are required",
      });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({
        status: "error",
        message: "Passwords do not match",
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = new User({
      fullName: fullName.trim(),
      matricNo: matricNo.trim(),
      email: email.trim().toLowerCase(),
      passwordHash,
    });

    await user.save();

    return res.status(201).json({
      status: "success",
      message: "Registration successful. You can sign in now.",
      data: { uuid: user.uuid },
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({
        status: "error",
        message: "Email or matric number already registered",
      });
    }
    console.error(err);
    return res.status(500).json({
      status: "error",
      message: "Registration failed",
    });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        status: "error",
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) {
      return res.status(401).json({
        status: "error",
        message: "Invalid email or password",
      });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({
        status: "error",
        message: "Invalid email or password",
      });
    }

    const token = signUserToken(user);

    return res.json({
      status: "success",
      message: "Login successful",
      data: { token },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      status: "error",
      message: "Login failed",
    });
  }
});

router.get("/verify-token", async (req, res) => {
  const token = bearerToken(req);
  if (!token) {
    return res.status(401).json({ status: "error", message: "No token provided" });
  }
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (payload.role !== "user") {
      return res.status(403).json({ status: "error", message: "Invalid token" });
    }
    const user = await User.findById(payload.sub);
    if (!user) {
      return res.status(401).json({ status: "error", message: "User not found" });
    }
    return res.json({
      status: "success",
      data: { fullName: user.fullName },
    });
  } catch {
    return res.status(401).json({ status: "error", message: "Invalid or expired token" });
  }
});

module.exports = router;
