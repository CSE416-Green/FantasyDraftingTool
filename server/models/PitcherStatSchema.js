const mongoose = require("mongoose");

const PitcherStatSchema = new mongoose.Schema({
    year: Number,
    ERA: {
        weight: Number,
        min: Number,
        max: Number
    },
    WHIP: {
        weight: Number,
        min: Number,
        max: Number
    },
    K: {
        weight: Number,
        max: Number
    },
    W: {
        weight: Number,
        max: Number
    },
    SV: {
        weight: Number,
        max: Number
    },
    IP: {
        weight: Number,
        max: Number
    },
    BB: {
        weight: Number,
        max: Number
    }
});

module.exports = mongoose.model("PitcherStat", PitcherStatSchema);