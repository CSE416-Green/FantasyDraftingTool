const mongoose = require("mongoose");
const DraftedPlayerSchema = require("./DraftedPlayerSchema");

const TradeSchema = new mongoose.Schema({
  fromTeamName: { type: String, required: true },
  toTeamName: { type: String, required: true },
  fromPlayerName: { type: String, required: true },
  toPlayerName: { type: String, required: true },
});


const DraftHistorySchema = new mongoose.Schema({
  LeagueName: { type: String, required: true },
  Year: { type: Number, required: true },
  OldPlayers: { type: [DraftedPlayerSchema], required: true },
  DraftedPlayers: { type: [DraftedPlayerSchema], required: true },
  League: { type: mongoose.Schema.Types.ObjectId, ref: 'League', required: true },
  Trades: { type: [TradeSchema], default: [] }
});

module.exports = mongoose.model("DraftHistory", DraftHistorySchema);