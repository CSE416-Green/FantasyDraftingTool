const mongoose = require("mongoose");

const PlayerNoteSchema = new mongoose.Schema({
  playerName: String,
  leagueId: String,
  userId: String,
  note: String,
}, { timestamps: true });

module.exports = mongoose.model("PlayerNote", PlayerNoteSchema);