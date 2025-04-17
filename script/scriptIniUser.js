// scripts/scriptIniUser.js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/userModel");
const Lead = require("../models/leadModel");
require("dotenv").config();

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connecté"))
  .catch((err) => console.error(err));

const scriptIniUserDatabase = async () => {
  try {
    // Nettoyer la base de données
    await User.deleteMany({});
    await Lead.deleteMany({});

    // Créer des utilisateurs
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("password123", salt);

    const manager = await User.create({
      name: "Jean Dupont",
      email: "jean@exemple.fr",
      password: hashedPassword,
      role: "manager",
    });

    await User.create({
      name: "Marie Martin",
      email: "marie@exemple.fr",
      password: hashedPassword,
      role: "employer",
    });

    // Créer des leads
    await Lead.create({
      name: "Société ABC",
      email: "contact@abc.fr",
      phone: "0123456789",
      company: "ABC SARL",
      status: "new",
      value: 5000,
      notes: "Client potentiel intéressé par notre offre premium",
      manager: manager._id,
    });

    await Lead.create({
      name: "Entreprise XYZ",
      email: "info@xyz.fr",
      phone: "0987654321",
      company: "XYZ SA",
      status: "contacted",
      value: 10000,
      notes: "A demandé un devis détaillé",
      manager: manager._id,
    });

    console.log("Base de données initialisée avec succès");
    process.exit(0);
  } catch (err) {
    console.error("Erreur lors de l'initialisation:", err);
    process.exit(1);
  }
};

scriptIniUserDatabase();
