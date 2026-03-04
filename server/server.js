// username: yufanghsu_db_user
// pw: W4vjg2MjSnHWEdjK
// run these commands to see if it connects: npm install mongodb -> node server.js
// success => "Pinged your deployment. You successfully connected to MongoDB!" in the terminal
//const uri = "mongodb+srv://yufanghsu_db_user:W4vjg2MjSnHWEdjK@cluster0.72vft27.mongodb.net/?appName=Cluster0";

let mongoose = require("mongoose");

const mongoDB = "mongodb://127.0.0.1/cse416-FantasyDraftingTool";

mongoose.connect(mongoDB)
let db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.on("connected", function () {
  console.log("Connected to database");
});

const express = require('express')
const app = express()
const port = 3000

app.get('/', async (req, res) => {
  res.send("Hello World!");
})

app.listen(port, () => {
  console.log(`fantasyDraftingTool server listening on port ${port}`)
})
