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

/**
 * @route   GET /api/leads
 * @desc    Get all leads
 * @access  Private
 * @returns {Array} List of all leads
 */
exports.getAllLeads = async (req, res) => {
  try {
    const leads = await Lead.find()
      .populate('manager', 'name email -_id')
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      count: leads.length,
      data: leads,
    });
  } catch (err) {
    console.error("Error fetching leads:", err.message);
    res.status(500).json({
      success: false,
      error: "Server error occurred while fetching leads",
    });
  }
};


exports.updateManager = async (req, res) => {
  try {
    // Vérifier si l'utilisateur actuel est un employeur
    if (req.user.role !== 'employer') {
      return res.status(403).json({
        success: false,
        error: "Accès refusé. Seuls les employeurs peuvent modifier des managers"
      });
    }

    const { name, email } = req.body;
    const managerId = req.params.id;

    // Vérifier si le manager existe
    let manager = await User.findById(managerId);
    if (!manager || manager.role !== 'manager') {
      return res.status(404).json({
        success: false,
        error: "Manager non trouvé"
      });
    }

    // Mise à jour des champs
    if (name) manager.name = name;
    if (email) manager.email = email;

    await manager.save();

    res.status(200).json({
      success: true,
      data: {
        id: manager._id,
        name: manager.name,
        email: manager.email,
        role: manager.role
      }
    });
  } catch (err) {
    console.error("Error updating manager:", err.message);
    res.status(500).json({
      success: false,
      error: "Erreur serveur lors de la mise à jour du manager"
    });
  }
};


/**
 * @route   DELETE /api/users/managers/:id
 * @desc    Delete a manager
 * @access  Private (Employer only)
 */
exports.deleteManager = async (req, res) => {
  try {
    // Vérifier si l'utilisateur actuel est un employeur
    if (req.user.role !== 'employer') {
      return res.status(403).json({
        success: false,
        error: "Accès refusé. Seuls les employeurs peuvent supprimer des managers"
      });
    }

    const managerId = req.params.id;

    // Vérifier si le manager existe
    let manager = await User.findById(managerId);
    if (!manager || manager.role !== 'manager') {
      return res.status(404).json({
        success: false,
        error: "Manager non trouvé"
      });
    }

    // Supprimer le manager
    await User.findByIdAndDelete(managerId);

    res.status(200).json({
      success: true,
      message: "Manager supprimé avec succès"
    });
  } catch (err) {
    console.error("Error deleting manager:", err.message);
    res.status(500).json({
      success: false,
      error: "Erreur serveur lors de la suppression du manager"
    });
  }
};