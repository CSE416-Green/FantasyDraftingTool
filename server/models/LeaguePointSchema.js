const mongoose = require("mongoose");
const WeeklyPointSchema = require("./WeeklyPointSchema");

const LeaguePointSchema = mongoose.Schema({
    League: { type: mongoose.Schema.Types.ObjectId, ref: 'League', required: true },
    Results: [WeeklyPointSchema],
})

module.exports = mongoose.model("LeaguePoint", LeaguePointSchema);