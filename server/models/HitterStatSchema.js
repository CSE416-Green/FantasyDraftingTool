const mongoose = require("mongoose");

const HitterStatSchema = new mongoose.Schema({
    Year: Number,
    AVG: {
        weight: Number,
        min: Number,
        max: Number
    },
    OBP: {
        weight: Number,
        min: Number,
        max: Number
    },
    SLG: {
        weight: Number,
        min: Number,
        max: Number
    },
    HR: {
        weight: Number,
        max: Number
    },
    RBI: {
        weight: Number,
        max: Number
    },
    SB: {
        weight: Number,
        max: Number
    }
});

module.exports = mongoose.model("HitterStat", HitterStatSchema);