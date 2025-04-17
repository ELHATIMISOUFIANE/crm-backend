const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const roleCheck = require("../middleware/roleCheck");
const {
  getLeads,
  getLeadById,
  createLead,
  updateLead,
  deleteLead,
} = require("../controllers/leadController");

// @route   GET api/leads
// @desc    Get all leads
// @access  Private
router.get("/", auth, getLeads);

// @route   GET api/leads/:id
// @desc    Get lead by ID
// @access  Private
router.get("/:id", auth, getLeadById);

// @route   POST api/leads
// @desc    Create a lead
// @access  Private (managers only)
router.post("/", auth, roleCheck(["employer"]), createLead);

// @route   PUT api/leads/:id
// @desc    Update a lead
// @access  Private (manager who owns the lead only)
router.put("/:id", auth, roleCheck(["manager"]), updateLead);

// @route   DELETE api/leads/:id
// @desc    Delete a lead
// @access  Private (manager who owns the lead only)
router.delete("/:id", auth, roleCheck(["employer"]), deleteLead);

module.exports = router;
