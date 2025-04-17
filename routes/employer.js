const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const roleCheck = require("../middleware/roleCheck");
const {getAllLeads, getLeadStats ,getAllManagers } = require("../controllers/employerController");

// @route   GET api/employer/dashboard
// @desc    Get lead statistics for dashboard
// @access  Private
router.get("/dashboard", auth, roleCheck("employer"), getLeadStats);// Remove the parentheses
router.get("/managers", auth, roleCheck("employer"), getAllManagers); 
router.get("/leads", auth, roleCheck("employer"), getAllLeads); 


 // Remove the parentheses

module.exports = router;
