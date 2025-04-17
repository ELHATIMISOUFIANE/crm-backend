const Lead = require("../models/leadModel");
const User = require("../models/userModel");
/**
 * @route   GET /api/leads
 * @desc    Get leads based on user role (all for employer, only own leads for manager)
 * @access  Private
 */
exports.getLeads = async (req, res) => {
  try {
    let leads;
    
    // Si c'est un employeur, récupérer tous les leads
    if (req.user.role === 'employer') {
      leads = await Lead.find()
        .populate('manager', 'name email')
        .sort({ createdAt: -1 })
        .lean();
    } 
    // Si c'est un manager, récupérer uniquement ses leads
    else if (req.user.role === 'manager') {
      leads = await Lead.find({ manager: req.user._id })
        .sort({ createdAt: -1 })
        .lean();
    } else {
      return res.status(403).json({
        success: false,
        error: "Accès non autorisé"
      });
    }

    res.status(200).json({
      success: true,
      count: leads.length,
      data: leads
    });
  } catch (err) {
    console.error("Error fetching leads:", err.message);
    res.status(500).json({
      success: false,
      error: "Erreur serveur lors de la récupération des leads"
    });
  }
};

/**
 * @route   POST /api/leads
 * @desc    Create a new lead
 * @access  Private (Employer only)
 */
exports.createLead = async (req, res) => {
  try {
    // Vérifier si l'utilisateur est un employeur
    if (req.user.role !== 'employer') {
      return res.status(403).json({
        success: false,
        error: "Accès refusé. Seuls les employeurs peuvent créer des leads"
      });
    }

    const { name, email, phone, company, value, notes, manager } = req.body;

    // Vérifier si le manager existe
    const managerExists = await User.findOne({ _id: manager, role: 'manager' });
    if (!managerExists) {
      return res.status(404).json({
        success: false,
        error: "Manager non trouvé"
      });
    }

    // Créer un nouveau lead
    const lead = new Lead({
      name,
      email,
      phone,
      company,
      value,
      notes,
      manager
    });

    await lead.save();

    res.status(201).json({
      success: true,
      data: lead
    });
  } catch (err) {
    console.error("Error creating lead:", err.message);
    res.status(500).json({
      success: false,
      error: "Erreur serveur lors de la création du lead"
    });
  }
};

/**
 * @route   PUT /api/leads/:id
 * @desc    Update a lead
 * @access  Private (Employer or assigned Manager)
 */
exports.updateLead = async (req, res) => {
  try {
    const leadId = req.params.id;
    
    // Récupérer le lead existant
    const lead = await Lead.findById(leadId);
    if (!lead) {
      return res.status(404).json({
        success: false,
        error: "Lead non trouvé"
      });
    }

    // Vérifier si l'utilisateur est autorisé à modifier ce lead
    if (req.user.role === 'manager' && lead.manager.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: "Vous ne pouvez modifier que vos propres leads"
      });
    }

    const { name, email, phone, company, status, value, notes, manager } = req.body;

    // Si c'est un employeur qui veut changer le manager, vérifier si le nouveau manager existe
    if (req.user.role === 'employer' && manager) {
      const managerExists = await User.findOne({ _id: manager, role: 'manager' });
      if (!managerExists) {
        return res.status(404).json({
          success: false,
          error: "Manager non trouvé"
        });
      }
      lead.manager = manager;
    }

    // Mise à jour des champs
    if (name) lead.name = name;
    if (email) lead.email = email;
    if (phone) lead.phone = phone;
    if (company) lead.company = company;
    if (status) lead.status = status;
    if (value !== undefined) lead.value = value;
    if (notes) lead.notes = notes;
    
    lead.updatedAt = Date.now();

    await lead.save();

    res.status(200).json({
      success: true,
      data: lead
    });
  } catch (err) {
    console.error("Error updating lead:", err.message);
    res.status(500).json({
      success: false,
      error: "Erreur serveur lors de la mise à jour du lead"
    });
  }
};

/**
 * @route   DELETE /api/leads/:id
 * @desc    Delete a lead
 * @access  Private (Employer only)
 */
exports.deleteLead = async (req, res) => {
  try {
    // Vérifier si l'utilisateur est un employeur
    if (req.user.role !== 'employer') {
      return res.status(403).json({
        success: false,
        error: "Accès refusé. Seuls les employeurs peuvent supprimer des leads"
      });
    }

    const leadId = req.params.id;
    
    // Vérifier si le lead existe
    const lead = await Lead.findById(leadId);
    if (!lead) {
      return res.status(404).json({
        success: false,
        error: "Lead non trouvé"
      });
    }

    await Lead.findByIdAndDelete(leadId);

    res.status(200).json({
      success: true,
      message: "Lead supprimé avec succès"
    });
  } catch (err) {
    console.error("Error deleting lead:", err.message);
    res.status(500).json({
      success: false,
      error: "Erreur serveur lors de la suppression du lead"
    });
  }
};