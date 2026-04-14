const mongoose = require("mongoose");
const DraftedPlayerSchema = require("./DraftedPlayerSchema");

const DraftHistorySchema = new mongoose.Schema({
  LeagueName: { type: String, required: true },
  Year: { type: Number, required: true },
  DraftedPlayers: { type: [DraftedPlayerSchema], required: true },
  League: { type: mongoose.Schema.Types.ObjectId, ref: 'League', required: true }
});

module.exports = mongoose.model("DraftHistory", DraftHistorySchema);