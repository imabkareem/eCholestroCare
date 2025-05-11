const mongoose = require('mongoose');

const ruleSchema = new mongoose.Schema({
  minValue: { type: Number, required: true },
  maxValue: { type: Number, required: true },
  attribute: { type: String, required: true }, // Still required but auto-filled
  suggestion: { type: String, required: true },
});

const doctorRulesSchema = new mongoose.Schema({
  doctorId: { type: String, required: true },
  rules: { type: [ruleSchema], required: true },
});

module.exports = mongoose.model('DoctorRules', doctorRulesSchema);
