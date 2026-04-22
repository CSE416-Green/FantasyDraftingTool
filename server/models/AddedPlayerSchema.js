const mongoose = require("mongoose");

const AddedPlayerSchema = new mongoose.Schema(
  {
    position: String,
    name: String,
    team: String,
    note: String,
  }, {timestamps:true}
);

module.exports = mongoose.model("ManualPlayer", AddedPlayerSchema);