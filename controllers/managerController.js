const User = require("../models/userModel");

// @route   GET api/users/managers
// @desc    Get all managers
// @access  Private
exports.getManagers = async (req, res) => {
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
