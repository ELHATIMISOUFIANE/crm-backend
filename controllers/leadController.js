const Lead = require("../models/leadModel");
const User = require("../models/userModel");

// @route   GET api/leads
// @desc    Get all leads
// @access  Private
exports.getLeads = async (req, res) => {
  try {
    // Different behavior based on user role
    if (req.user.role === "manager") {
      // Managers only see leads assigned to them
      const leads = await Lead.find({ manager: req.user.id })
        .sort({ createdAt: -1 })
        .populate("manager", "name email");
      res.json(leads);
    } else {
      // Employees see all leads
      const leads = await Lead.find()
        .sort({ createdAt: -1 })
        .populate("manager", "name email");
      res.json(leads);
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

// @route   GET api/leads/:id
// @desc    Get lead by ID
// @access  Private
exports.getLeadById = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id).populate(
      "manager",
      "name email"
    );

    if (!lead) {
      return res.status(404).json({ msg: "Lead not found" });
    }

    // Check if user is authorized to view this lead (managers can only see their own leads)
    if (
      req.user.role === "manager" &&
      lead.manager.id.toString() !== req.user.id
    ) {
      return res.status(403).json({ msg: "Not authorized" });
    }

    res.json(lead);
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Lead not found" });
    }
    res.status(500).send("Server Error");
  }
};

// @route   POST api/leads
// @desc    Create a lead
// @access  Private (only managers)
exports.createLead = async (req, res) => {
  const { name, email, phone, company, status, value, notes } = req.body;

  try {
    // Create new lead
    const newLead = new Lead({
      name,
      email,
      phone,
      company,
      status,
      value,
      notes,
      manager: req.user.id, // Set current user as manager
    });

    const lead = await newLead.save();
    res.json(lead);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

// @route   PUT api/leads/:id
// @desc    Update a lead
// @access  Private (only manager who owns the lead)
exports.updateLead = async (req, res) => {
  const { name, email, phone, company, status, value, notes } = req.body;

  // Build lead object
  const leadFields = {};
  if (name) leadFields.name = name;
  if (email) leadFields.email = email;
  if (phone) leadFields.phone = phone;
  if (company) leadFields.company = company;
  if (status) leadFields.status = status;
  if (value !== undefined) leadFields.value = value;
  if (notes) leadFields.notes = notes;
  leadFields.updatedAt = Date.now();

  try {
    let lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({ msg: "Lead not found" });
    }

    // Make sure manager owns the lead
    if (lead.manager.toString() !== req.user.id) {
      return res.status(403).json({ msg: "Not authorized" });
    }

    // Update
    lead = await Lead.findByIdAndUpdate(
      req.params.id,
      { $set: leadFields },
      { new: true }
    );

    res.json(lead);
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Lead not found" });
    }
    res.status(500).send("Server Error");
  }
};

// @route   DELETE api/leads/:id
// @desc    Delete a lead
// @access  Private (only manager who owns the lead)
exports.deleteLead = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({ msg: "Lead not found" });
    }

    // Check ownership
    if (lead.manager.toString() !== req.user.id) {
      return res.status(403).json({ msg: "Not authorized" });
    }

    await lead.deleteOne();
    res.json({ msg: "Lead removed" });
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Lead not found" });
    }
    res.status(500).send("Server Error");
  }
};
