const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");
const User = require("../models/User");
const Complaint = require("../models/Complaint");
const { requireAdmin } = require("../middleware/auth");

const router = express.Router();

function signAdminToken(admin) {
  return jwt.sign(
    {
      sub: admin._id,
      uuid: admin.uuid,
      role: "admin",
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        status: "error",
        message: "Email and password are required",
      });
    }

    const admin = await Admin.findOne({ email: email.trim().toLowerCase() });
    if (!admin) {
      return res.status(401).json({
        status: "error",
        message: "Invalid email or password",
      });
    }

    const ok = await bcrypt.compare(password, admin.passwordHash);
    if (!ok) {
      return res.status(401).json({
        status: "error",
        message: "Invalid email or password",
      });
    }

    const token = signAdminToken(admin);

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

router.get("/get-complaints", requireAdmin, async (req, res) => {
  try {
    const total = await Complaint.countDocuments();
    const pending = await Complaint.countDocuments({ complaintStatus: "Pending" });
    const resolved = await Complaint.countDocuments({ complaintStatus: "Resolved" });

    const complaints = await Complaint.find().sort({ updatedAt: -1 });

    const data = {
      count: total,
      pendingComplaints: pending,
      resolvedComplaints: resolved,
      complaints: complaints.map((c) => ({
        uuid: c.uuid,
        complaint_type: c.complaintType,
        faculty: c.faculty,
        complaint_title: c.complaintTitle,
        complaint_status: c.complaintStatus,
        updatedAt: c.updatedAt.toISOString(),
      })),
    };

    return res.json({ status: "success", data });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      status: "error",
      message: "Could not load complaints",
    });
  }
});

router.put("/complaints/update/:uuid", requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    if (!status || !["Resolved", "Pending"].includes(status)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid status",
      });
    }

    const complaint = await Complaint.findOneAndUpdate(
      { uuid: req.params.uuid },
      { complaintStatus: status },
      { new: true }
    );

    if (!complaint) {
      return res.status(404).json({
        status: "error",
        message: "Complaint not found",
      });
    }

    return res.json({
      status: "success",
      message: "Complaint updated successfully",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      status: "error",
      message: "Could not update complaint",
    });
  }
});

router.get("/users", requireAdmin, async (req, res) => {
  try {
    const usersList = await User.find().sort({ createdAt: -1 });

    const users = usersList.map((u) => ({
      uuid: u.uuid,
      fullName: u.fullName,
      matricNo: u.matricNo,
      email: u.email,
    }));

    return res.json({
      status: "success",
      data: {
        count: users.length,
        users,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      status: "error",
      message: "Could not load users",
    });
  }
});

router.delete("/user/:userId", requireAdmin, async (req, res) => {
  try {
    const user = await User.findOneAndDelete({ uuid: req.params.userId });

    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    // Also delete their complaints
    await Complaint.deleteMany({ userId: user._id });

    return res.sendStatus(204);
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      status: "error",
      message: "Could not delete user",
    });
  }
});

module.exports = router;
