const mongoose = require("mongoose");

const LeagueSchema = new mongoose.Schema({
    Name: {required: true, type: String},
    Year: {required: true, type: Number},
    TeamsID: [{type: mongoose.Schema.Types.ObjectId, ref: 'Team'}],
    InviteCode: {required: true, type: String, unique: true},
    HitterStats: {
        type: [String],
        default: ["AB", "R", "H", "Doubles", "Triples", "HR", "RBI", "BB", "K", "SB", "AVG", "OBP", "SLG"]
    },
    PitcherStats: {
        type: [String],
        default: ["IP", "W", "SV", "K", "BB", "ERA", "WHIP"]
    }
});

module.exports = mongoose.model("League", LeagueSchema);