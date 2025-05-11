const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const doctor = require('../models/doctor');
const DoctorRules = require('../models/DoctorRules');
const UserResult = require('../models/UserResult');
const patientModel = require('../models/patient');

// Middleware to get the doctor count
async function getCount(req, res, next) {
  try {
      const doctorCount = await doctor.countDocuments();
      const userCount = await patientModel.countDocuments();
      req.userCount = userCount;
      req.doctorCount = doctorCount;// Store count in request object for rendering
      next();
  } catch (error) {
      console.error('Error fetching doctor count:', error);
      res.status(500).json({ error: 'Error fetching doctor count' });
  }
}

// Patient Home Route
router.get('/patientHome',getCount, (req, res) => {
  const token = req.cookies.token;
  const {doctorCount,userCount} = req;

  if (!token) {
    return res.redirect('/login'); // Redirect to login if no token is found
  }

  try {
    const decoded = jwt.verify(token, "secretkey"); // Replace with your actual secret key
    const userId = decoded.userId; // Ensure token includes `userId`

    res.render('patientHome', { userId, doctorCount,userCount});
  } catch (err) {
    console.error('Token verification failed:', err);
    res.clearCookie('token'); // Clear invalid token
    return res.redirect('/login');
  }
});

// Process User Result
router.post('/UserResult', async (req, res) => {
  const { userId, cholesterolLevels } = req.body;

  console.log("Received userId:", userId);
  console.log("Received cholesterolLevels:", cholesterolLevels);

  try {
    const allDoctorRules = await DoctorRules.find();

    if (!allDoctorRules || allDoctorRules.length === 0) {
      return res.status(404).json({ error: 'No doctor rules found' });
    }

    const suggestions = new Set(); // Store unique suggestions

    for (const doctorRule of allDoctorRules) {
      for (const rule of doctorRule.rules) {
        for (const [attribute, value] of Object.entries(cholesterolLevels)) {
          const numericValue = Number(value);

          if (
            rule.attribute.toLowerCase() === attribute.toLowerCase() &&
            numericValue >= rule.minValue &&
            numericValue <= rule.maxValue &&
            rule.suggestion
          ) {
            suggestions.add(rule.suggestion);
          }
        }
      }
    }

    const suggestionsArray = Array.from(suggestions);

    const userResult = new UserResult({
      userId,
      cholesterolLevels,
      suggestions: suggestionsArray,
    });

    await userResult.save();

    res.redirect(`/getResult/${userId}`);
  } catch (error) {
    console.error("Error processing user result:", error);
    res.status(500).json({ error: 'Error generating result' });
  }
});

// Get User Result
router.get('/getResult/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const userResult = await UserResult.findOne({ userId }).sort({ createdAt: -1 });

    if (!userResult) {
      return res.status(404).render('error', { message: 'No results found for this user' });
    }

    res.render('result', {
      userId: userResult.userId,
      cholesterolLevels: userResult.cholesterolLevels,
      suggestions: userResult.suggestions,
    });
  } catch (error) {
    console.error("Error fetching user result:", error);
    res.status(500).render('error', { message: 'Error fetching user result' });
  }
});

// Success Page
router.get('/success', (req, res) => {
  res.render('success');
});

// Consultation Page
router.get('/consult', (req, res) => {
  const { userId } = req.query;
  console.log("userId in Consult", userId);

  if (!userId) {
    return res.redirect('/login');
  }

  const cholesterolLevels = [
    'Total Cholesterol',
    'HDL',
    'LDL',
    'Triglycerides',
    'VLDL',
    'Non-HDL',
  ];

  res.render('consultation', { userId, cholesterolLevels });
});

// Patient List Page for Doctor
router.get('/patientList', (req, res) => {
  res.render('DoctorViewPatientList');
});

// Register a New Patient
router.post('/register', async (req, res) => {
  let { name, age, phone, email, password, confirmPassword } = req.body;
  
  let user = await patientModel.findOne({ email });
  if (user) {
    return res.send('User already exists');
  } else {
    if (password !== confirmPassword) {
      return res.status(400).send('Passwords do not match');
    } else {
      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(password, salt, async (err, hash) => {
          if (err) {
            return res.status(500).send('Error encrypting password');
          }

          let user = await patientModel.create({
            name,
            age,
            phone,
            email,
            password: hash
          });

          // Generate JWT token
          let token = jwt.sign({ email: email, userId: user._id }, "secretkey");

          res.cookie('token', token);
          res.redirect('/login');
        });
      });
    }
  }
});

module.exports = router;
