const mongoose = require("mongoose");

const WeeklyPointSchema = mongoose.Schema({
    StartDate: {type: Date, required: true },
    EndDate: {type: Date, required: true },
    Scores: [
        {
        TeamId: { type: mongoose.Schema.Types.ObjectId, required: true },
        TeamName: { type: String, require: true },
        Points: { type: Number, required: true },
        CategoryPoints: {
            AVG: { type: Number },
            R: { type: Number },
            HR: { type: Number },
            SB: { type: Number },
            RBI: { type: Number },
            K: { type: Number },
            W: { type: Number },
            SV: { type: Number },
            ERA: { type: Number },
            WHIP: {type: Number }
        }
        }
    ]

})
module.exports = WeeklyPointSchema; 