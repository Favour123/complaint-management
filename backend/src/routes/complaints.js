const express = require("express");
const { pool } = require("../db");
const { requireUser, requireUserOrAdminComplaint } = require("../middleware/auth");

const router = express.Router();

router.post("/submit", requireUser, async (req, res) => {
  try {
    const { complaintType, faculty, title, description } = req.body;

    if (!complaintType || !faculty || !title || !description) {
      return res.status(400).json({
        status: "error",
        message: "Category, faculty, title, and details are required",
      });
    }

    const { rows } = await pool.query(
      `INSERT INTO complaints
        (user_id, complaint_type, faculty, complaint_title, complaint_body, complaint_status)
       VALUES ($1, $2, $3, $4, $5, 'Pending')
       RETURNING uuid`,
      [req.user.id, complaintType, faculty.trim(), title.trim(), description]
    );

    return res.status(201).json({
      status: "success",
      message: "Complaint submitted successfully",
      data: { uuid: rows[0].uuid },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      status: "error",
      message: "Could not submit complaint",
    });
  }
});

router.get("/user", requireUser, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT uuid, complaint_type, faculty, complaint_title, complaint_status, created_at
       FROM complaints
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [req.user.id]
    );

    const data = rows.map((r) => ({
      uuid: r.uuid,
      complaint_type: r.complaint_type,
      faculty: r.faculty,
      complaint_title: r.complaint_title,
      complaint_status: r.complaint_status,
      createdAt: r.created_at,
    }));

    return res.json({ status: "success", data });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      status: "error",
      message: "Could not load complaints",
    });
  }
});

router.get("/:uuid", requireUserOrAdminComplaint, async (req, res) => {
  try {
    let result;
    if (req.authRole === "admin") {
      result = await pool.query(
        `SELECT uuid, complaint_type, complaint_title, complaint_body, complaint_status
         FROM complaints WHERE uuid = $1`,
        [req.params.uuid]
      );
    } else {
      result = await pool.query(
        `SELECT uuid, complaint_type, complaint_title, complaint_body, complaint_status
         FROM complaints WHERE uuid = $1 AND user_id = $2`,
        [req.params.uuid, req.user.id]
      );
    }

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "Complaint not found",
      });
    }

    const c = result.rows[0];
    return res.json({
      status: "success",
      data: {
        uuid: c.uuid,
        complaint_type: c.complaint_type,
        complaint_title: c.complaint_title,
        complaint_body: c.complaint_body,
        complaint_status: c.complaint_status,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      status: "error",
      message: "Could not load complaint",
    });
  }
});

module.exports = router;
