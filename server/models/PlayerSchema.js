const mongoose = require("mongoose");

const PlayerSchema = new mongoose.Schema(
  {
    position: String,
    name: String,
    status: String,
    cost: Number,
    playerID: Number,
  }
);

module.exports = PlayerSchema;