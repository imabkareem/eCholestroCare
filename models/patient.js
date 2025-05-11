const mongoose = require('mongoose');

// Define the patient schema
const patientSchema = mongoose.Schema({
    name: String,
    age: Number,
    phone: Number,
    email: String,
    password: String
});

// Export the patient model
module.exports = mongoose.model('Patient', patientSchema);
