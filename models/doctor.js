const mongoose = require('mongoose');

// Define the schema
const doctorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  registrationNumber: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  experience: { type: String, required: true },
  expertise: { type: String, required: true },
  mobile: { type: String, required: true },
  query: { type: String },
  username: { type: String, required: true },
  password: { type: String, required: true },
});

// Create the model
module.exports = mongoose.model('doctor', doctorSchema);
