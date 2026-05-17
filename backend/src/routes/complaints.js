const express = require("express");
const Complaint = require("../models/Complaint");
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

    const complaint = new Complaint({
      userId: req.user.id,
      complaintType,
      faculty: faculty.trim(),
      complaintTitle: title.trim(),
      complaintBody: description,
    });

    await complaint.save();

    return res.status(201).json({
      status: "success",
      message: "Complaint submitted successfully",
      data: { uuid: complaint.uuid },
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
    const complaints = await Complaint.find({ userId: req.user.id }).sort({
      createdAt: -1,
    });

    const data = complaints.map((r) => ({
      uuid: r.uuid,
      complaint_type: r.complaintType,
      faculty: r.faculty,
      complaint_title: r.complaintTitle,
      complaint_status: r.complaintStatus,
      createdAt: r.createdAt,
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
    const query = { uuid: req.params.uuid };
    if (req.authRole !== "admin") {
      query.userId = req.user.id;
    }

    const complaint = await Complaint.findOne(query);

    if (!complaint) {
      return res.status(404).json({
        status: "error",
        message: "Complaint not found",
      });
    }

    return res.json({
      status: "success",
      data: {
        uuid: complaint.uuid,
        complaint_type: complaint.complaintType,
        complaint_title: complaint.complaintTitle,
        complaint_body: complaint.complaintBody,
        complaint_status: complaint.complaintStatus,
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
