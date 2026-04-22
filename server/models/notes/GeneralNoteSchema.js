const mongoose = require("mongoose");

const GeneralNoteSchema = new mongoose.Schema({
  userId: String,
  leagueId: String,
  note: String,
});

module.exports = mongoose.model("GeneralNote", GeneralNoteSchema);