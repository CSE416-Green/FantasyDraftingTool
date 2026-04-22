const express = require("express");
const addedPlayerPool = express.Router();
const AddedPlayer = require("../models/AddedPlayerSchema");

// add a player manually to the pool
addedPlayerPool.post("/add", async (req, res) => {
  try {
    const { name, position, team, note, leagueId } = req.body;
    if (!name || !position || !leagueId) {
      return res.status(400).json({ error: "Name and position are required" });
    }
    const newPlayer = new AddedPlayer({ name, position, team, note, leagueId });
    await newPlayer.save();
    res.json({ message: "Player added to pool", player: newPlayer });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// get all added players
addedPlayerPool.get("/manualPlayers/:leagueId", async (req, res) => {
  try {
    const players = await AddedPlayer.find({leagueId: req.params.leagueId});
    res.json(players);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = addedPlayerPool;