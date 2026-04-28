const mongoose = require("mongoose");

const DraftedPlayerSchema = new mongoose.Schema({
    PlayerName: {type:String, required: true},
    Pick: {type:Number, required: false},
    TeamName: {type:String, required: false},
    Cost: {type:Number, required: true},
    BroughtUpBy: {type:String, required: false},
    Position: {type:String, required: true},
    PlayerID: {type:Number}
});

module.exports = DraftedPlayerSchema;