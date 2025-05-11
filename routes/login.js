const express = require('express');
const router = express.Router();
const patientModel = require('../models/patient');
const doctorModel = require('../models/doctor');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');




// router.get('/doctorCount', getDoctorCount);


// Render doctor login page
router.get('/Drlogin', (req, res) => {
    res.render('doctorlogin');
});

// Render patient login page
router.get('/login', (req, res) => {
    res.render('userlogin');
});

// Handle patient login
router.post('/login',async (req, res) => {
    const { email, password, rememberMe } = req.body; // Destructure request body
    const patient = await patientModel.findOne({ email });

    if (!patient) {
        return res.status(401).send('Invalid email or password');
    }

    bcrypt.compare(password, patient.password, (err, result) => {
        if (err) {
            return res.status(500).send('Error during password comparison');
        }

        if (result) {
            // Generate JWT token with expiry based on rememberMe option
            const token = jwt.sign(
                { email: email, userId: patient._id },
                "secretkey",
                { expiresIn: rememberMe ? '30d' : '1h' } // 30 days if "Remember Me" is checked, otherwise 1 hour
            );

            // Set the token in a cookie
            res.cookie('token', token, {
                httpOnly: true,
                maxAge: rememberMe ? 30 * 24 * 60 * 60 * 1000 : 60 * 60 * 1000 // 30 days or 1 hour
            });

            return res.redirect('/patientHome');
        } else {
            return res.status(401).send('Invalid email or password');
        }
    });
});

// Handle doctor login
router.post('/Drlogin', async (req, res) => {
    const { username, password } = req.body; 
    const doctor = await doctorModel.findOne({ username });

    console.log('Attempting doctor login');

    if (!doctor) {
        return res.status(401).send('Invalid username or password');
    }

    bcrypt.compare(password, doctor.password, (err, result) => {
        if (err) {
            return res.status(500).send('Error during password verification');
        }

        if (result) {
            // Generate JWT token for doctor
            const token = jwt.sign({ doctorId: doctor._id }, "secretkey");

            // Set the token in a cookie
            res.cookie('token', token, { httpOnly: true });

            return res.redirect('/drDashboard');
        } else {
            console.log('Redirecting to doctor login due to incorrect credentials');
            return res.redirect('/Drlogin');
        }
    });
});

module.exports = router;
