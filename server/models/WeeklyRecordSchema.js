const mongoose = require("mongoose");

const WeeklyRecordSchema = new mongoose.Schema({
    league: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "League",
        required: true
    },
    scoreboards: [
        {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Scoreboard"
        }
    ]
});

module.exports = mongoose.model("WeeklyRecord", WeeklyRecordSchema);