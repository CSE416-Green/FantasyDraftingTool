const express = require("express");
const addedPlayerPool = express.Router();
const AddedPlayer = require("../models/AddedPlayerSchema");

//save notes for added player 
const PlayerNote = require("../models/notes/PlayerNoteSchema");
//add player 
addedPlayerPool.post("/add", async (req, res) => {
  try {
    const { name, position, team, note, leagueId, userId } = req.body;
    if (!name || !position || !leagueId) {
      return res.status(400).json({ error: "Name, position and leagueId are required" });
    }
    const newPlayer = new AddedPlayer({ name, position, team, note, leagueId });
    await newPlayer.save();
    
    //if note provided, save to PlayerNoteSchema
    if (note && userId) {
      await PlayerNote.findOneAndUpdate(
        { playerName: name, leagueId, userId },
        { note },
        { upsert: true, new: true }
      );
    }

    res.json({ message: "Player added to pool", player: newPlayer });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//all added players
addedPlayerPool.get("/manualPlayers/:leagueId", async (req, res) => {
  try {
    const players = await AddedPlayer.find({leagueId: req.params.leagueId});
    res.json(players);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});




module.exports = addedPlayerPool;