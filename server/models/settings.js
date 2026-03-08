const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  numTeams: Number,
  teamBudget: Number
});

module.exports = mongoose.model('settings', settingsSchema);