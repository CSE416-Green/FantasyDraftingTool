const mongoose = require("mongoose");

const ScoreboardSchema = new mongoose.Schema({
    team1ID: { type: mongoose.Schema.Types.ObjectId, required: true },
    team2ID: { type: mongoose.Schema.Types.ObjectId, required: true },
    team1Name: { type: String, required: true },
    team2Name: { type: String, required: true },
    team1Score: { type: Number, required: true },
    team2Score: { type: Number, required: true }
});

module.exports = mongoose.model("Scoreboard", ScoreboardSchema);