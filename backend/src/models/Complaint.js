const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const complaintSchema = new mongoose.Schema(
  {
    uuid: { type: String, default: uuidv4, unique: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    complaintType: { type: String, required: true },
    faculty: { type: String, required: true },
    complaintTitle: { type: String, required: true },
    complaintBody: { type: String, required: true },
    complaintStatus: {
      type: String,
      enum: ["Pending", "Resolved"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Complaint", complaintSchema);
