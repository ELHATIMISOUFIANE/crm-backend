const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
require("dotenv").config();

// Initialize app
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json({ extended: false }));

// Basic route
app.get("/", (req, res) => res.send("CRM API is running"));

// Define Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/employer", require("./routes/employer"));


// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port http://localhost:${PORT}`));
 