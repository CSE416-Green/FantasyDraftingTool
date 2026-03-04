const dotenv = require('dotenv');
dotenv.config({ path: './.env' });

const mongoose = require("mongoose");
let mongoDB = "mongodb://127.0.0.1/cse416-FantasyDraftingTool";
if (process.env.ENVIRONMENT == "prod") {
  mongoDB = process.env.MONGODB_URL;
}

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
