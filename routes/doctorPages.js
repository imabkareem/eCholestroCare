const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const DoctorRules = require('../models/DoctorRules');

// Handle doctor rules submission
router.post('/drules', async (req, res) => {
  console.log('IN DRULES:', req.body);

  try {
    const { doctorId, rules } = req.body;
    console.log('Doctor ID:', doctorId);

    // Validate required fields
    if (!doctorId || !rules || !Array.isArray(rules)) {
      return res.status(400).json({ error: 'Doctor ID and valid rules are required.' });
    }

    // Ensure all rules have required fields
    for (let rule of rules) {
      if (!rule.minValue || !rule.maxValue || !rule.attribute) {
        return res.status(400).json({ error: 'Each rule must have minValue, maxValue, and attribute.' });
      }
    }

    // Save rules to the database
    const doctorRules = new DoctorRules({ doctorId, rules });
    await doctorRules.save();

    res.redirect('/success');
  } catch (err) {
    console.error('Error while saving doctor rules:', err);
    res.status(500).json({ error: 'An error occurred while saving rules.' });
  }
});

// Doctor dashboard route
router.get('/drDashboard', (req, res) => {
  console.log('Accessing doctor dashboard');

  // Retrieve token from cookies
  const token = req.cookies.token;
  if (!token) {
    return res.redirect('/login'); // Redirect if no token is found
  }

  try {
    // Decode token using the secret key
    const decoded = jwt.verify(token, "secretkey");
    const doctorId = decoded.doctorId;
    console.log('Decoded doctor ID:', doctorId);

    // Define cholesterol levels
    const cholesterolLevels = [
      'Total Cholesterol',
      'HDL',
      'LDL',
      'Triglycerides',
      'VLDL',
      'Non-HDL',
    ];

    // Render the DoctorDashboard template
    res.render('DoctorDashboard', { doctorId, cholesterolLevels });
  } catch (err) {
    console.error('Token verification error:', err);
    res.clearCookie('token'); // Clear invalid token
    return res.redirect('/login'); // Redirect to login on error
  }
});

module.exports = router;
