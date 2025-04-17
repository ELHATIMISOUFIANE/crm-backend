const mongoose = require("mongoose");

const LeadSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
  },
  company: {
    type: String,
  },
  status: {
    type: String,
    enum: ["IN_PROGRESS", "COMPLETED", "CANCELED"],
    default: "IN_PROGRESS",
  },
  value: {
    type: Number,
    default: 0,
  },  
  notes: {
    type: String,
  },
  manager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Lead", LeadSchema);
