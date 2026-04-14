const mongoose = require("mongoose");

const LeagueSchema = new mongoose.Schema({
    Name: {required: true, type: String},
    Year: {required: true, type: Number},
    TeamsID: [{type: mongoose.Schema.Types.ObjectId, ref: 'Team'}],
    InviteCode: {required: true, type: String, unique: true},
});

module.exports = mongoose.model("League", LeagueSchema);