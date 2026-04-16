const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { pool } = require("../db");
const { requireAdmin } = require("../middleware/auth");

const router = express.Router();

function signAdminToken(admin) {
  return jwt.sign(
    {
      sub: admin.id,
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

    const { rows } = await pool.query(
      `SELECT id, uuid, email, password_hash FROM admins WHERE email = $1`,
      [email.trim().toLowerCase()]
    );
    if (rows.length === 0) {
      return res.status(401).json({
        status: "error",
        message: "Invalid email or password",
      });
    }

    const admin = rows[0];
    const ok = await bcrypt.compare(password, admin.password_hash);
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
    const stats = await pool.query(`
      SELECT
        COUNT(*)::int AS total,
        COUNT(*) FILTER (WHERE complaint_status = 'Pending')::int AS pending,
        COUNT(*) FILTER (WHERE complaint_status = 'Resolved')::int AS resolved
      FROM complaints
    `);

    const { rows: complaints } = await pool.query(`
      SELECT uuid, complaint_type, faculty, complaint_title, complaint_status, updated_at
      FROM complaints
      ORDER BY updated_at DESC
    `);

    const s = stats.rows[0];
    const data = {
      count: s.total,
      pendingComplaints: s.pending,
      resolvedComplaints: s.resolved,
      complaints: complaints.map((c) => ({
        uuid: c.uuid,
        complaint_type: c.complaint_type,
        faculty: c.faculty,
        complaint_title: c.complaint_title,
        complaint_status: c.complaint_status,
        updatedAt: c.updated_at.toISOString(),
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

    const result = await pool.query(
      `UPDATE complaints
       SET complaint_status = $1, updated_at = NOW()
       WHERE uuid = $2
       RETURNING uuid`,
      [status, req.params.uuid]
    );

    if (result.rowCount === 0) {
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
    const { rows } = await pool.query(
      `SELECT uuid, full_name, matric_no, email FROM users ORDER BY created_at DESC`
    );

    const users = rows.map((u) => ({
      uuid: u.uuid,
      fullName: u.full_name,
      matricNo: u.matric_no,
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
    const result = await pool.query(`DELETE FROM users WHERE uuid = $1`, [req.params.userId]);

    if (result.rowCount === 0) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

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
