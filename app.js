const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const session = require('express-session');
const cookieParser = require('cookie-parser');
require('dotenv').config(); // Load environment variables from .env

// ✅ Connect to MongoDB Atlas (only once here)
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB Atlas'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// View engine and middleware setup
app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());
app.use(session({
  secret: 'secret',
  resave: false,
  saveUninitialized: true,
}));

// Routes
const indexRoutes = require('./routes/index');
const loginRoutes = require('./routes/login');
const registerRoutes = require('./routes/signupPages');
const patientRoutes = require('./routes/patientPages');
const doctorRoutes = require('./routes/doctorPages');

app.use('/', indexRoutes);
app.use('/', loginRoutes);
app.use('/', registerRoutes);
app.use('/', patientRoutes);
app.use('/', doctorRoutes);

// ✅ Use environment PORT (for Render) or default to 3000
const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
