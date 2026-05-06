const mongoose = require("mongoose");
const PlayerSchema = require("./PlayerSchema");

const TeamSchema = new mongoose.Schema({
  teamName: {
    type: String,
    required: true
  },
  rosterPlayers: [PlayerSchema],
  farmPlayers: [PlayerSchema],
  taxiPlayers: [PlayerSchema],
});

module.exports = mongoose.model("Team", TeamSchema);