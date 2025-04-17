const User = require("../models/userModel");
const Lead = require("../models/leadModel");

/**
 * @route   GET /api/users/managers
 * @desc    Get all managers
 * @access  Private
 * @returns {Array} List of manager users without sensitive information
 */
exports.getManagers = async (req, res) => {
  try {
    const managers = await User.find({ role: "manager" })
      .select("-password -__v -refreshToken")
      .sort({ name: 1 })
      .lean();

    res.status(200).json({
      success: true,
      count: managers.length,
      data: managers,
    });
  } catch (err) {
    console.error("Error fetching managers:", err.message);
    res.status(500).json({
      success: false,
      error: "Server error occurred while fetching managers",
    });
  }
};

/**
 * @route   GET /api/leads/stats
 * @desc    Get lead statistics (in progress, completed, canceled)
 * @access  Private
 * @returns {Object} Lead statistics counts
 */
exports.getLeadStats = async (req, res) => {
  try {
    // Using Promise.all for parallel queries
    const [inProgress, completed, canceled] = await Promise.all([
      Lead.countDocuments({ status: "IN_PROGRESS" }),
      Lead.countDocuments({ status: "COMPLETED" }),
      Lead.countDocuments({ status: "CANCELED" }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        leadsInProgress: inProgress,
        leadsCompleted: completed,
        leadsCanceled: canceled,
        totalLeads: inProgress + completed + canceled,
      },
    });
  } catch (err) {
    console.error("Error fetching lead stats:", err.message);
    res.status(500).json({
      success: false,
      error: "Server error occurred while fetching lead statistics",
    });
  }
};
exports.getAllManagers = async (req, res) => {
  try {
    const managers = await User.find({ role: "manager" })
      .select("-password")
      .sort({ name: 1 });
    
    res.json(managers);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};