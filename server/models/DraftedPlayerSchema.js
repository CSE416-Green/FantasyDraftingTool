const mongoose = require("mongoose");

const DraftedPlayerSchema = new mongoose.Schema({
    PlayerName: {type:String, required: true},
    Pick: {type:Number, required: true},
    TeamName: {type:String, required: true},
    Cost: {type:Number, required: true}
});

module.exports = DraftedPlayerSchema;