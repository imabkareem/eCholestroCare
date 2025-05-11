const mongoose = require('mongoose');

const userResultSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  cholesterolLevels: { type: Map, of: Number, required: true },
  suggestions: { type: [String], default: [] },
},{ timestamps: true }
);

module.exports= mongoose.model('UserResult', userResultSchema);

 
  