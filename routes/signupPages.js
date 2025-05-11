const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const doctorModel = require('../models/doctor');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

// Route to render doctor sign-up response page
router.get('/DrSignUpRes', (req, res) => {
  const drName = req.session.doctorName || 'Doctor';
  delete req.session.doctorName;
  console.log(drName);

  res.render('DrResSignup', { name: drName });
});

// Doctor registration route
router.post('/dregister', generateCredentials, async (req, res) => {
  let { 
    name, registrationNumber, email, experience, expertise, 
    mobile, query, username, password 
  } = req.body;

  const plainPassword = password;

  // Check if the doctor already exists
  let existingDoctor = await doctorModel.findOne({ email });
  if (existingDoctor) {
    return res.send('User already exists');
  }

  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(password, salt, async (err, hash) => {
      if (err) {
        return res.status(500).send('Error hashing password');
      }

      let newDoctor = await doctorModel.create({
        name,
        registrationNumber,
        email,
        experience,
        expertise,
        mobile,
        query,
        username,
        password: hash
      });

      // Email credentials to the doctor
      const mailOptions = {
        from: '"Healthcare System" <genrativai@gmail.com>',
        to: newDoctor.email,
        subject: 'Welcome to Healthcare System - Your Credentials',
        text: `
          Dear ${newDoctor.name},
          
          Thank you for registering as a doctor on our platform.

          Here are your credentials:
          Username: ${newDoctor.username}
          Password: ${plainPassword}

          Please keep these credentials secure.

          Best regards,
          Healthcare System Team
        `,
        html: `
          <p>Dear <strong>${newDoctor.name}</strong>,</p>
          <p>Thank you for registering as a doctor on our platform.</p>
          <p><strong>Here are your credentials:</strong></p>
          <ul>
            <li>Username: <strong>${newDoctor.username}</strong></li>
            <li>Password: <strong>${plainPassword}</strong></li>
          </ul>
          <p>Please keep these credentials secure.</p>
          <p>Best regards,</p>
          <p><strong>Healthcare System Team</strong></p>
        `,
      };

      await transporter.sendMail(mailOptions);

      req.session.doctorName = req.body.name;
      res.redirect('/DrSignUpRes');
    });
  });
});

// Routes for rendering sign-up pages
router.get('/usersignup', (req, res) => {
  res.render('usersignup');
});

router.get('/DrSignup', (req, res) => {
  res.render('doctorSignup');
});

// Middleware to generate username and password
function generateCredentials(req, res, next) {
  const { name } = req.body;

  // Generate a username based on the name and a random suffix
  const username = `${name.split(' ')[0].toLowerCase()}_${crypto.randomBytes(3).toString('hex')}`;
  
  // Generate a secure random password
  const password = crypto.randomBytes(8).toString('hex');

  // Attach generated credentials to request body
  req.body.username = username;
  req.body.password = password;

  next();
}

// Email transporter configuration
const transporter = nodemailer.createTransport({
  service: 'gmail', // Email provider
  auth: {
    user: 'genrativai@gmail.com',  // Your email address
    pass: 'tcoe dudq vweu cywv',   // Email password or app-specific password
  },
});

module.exports = router;
