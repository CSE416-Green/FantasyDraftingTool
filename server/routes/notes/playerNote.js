const express = require("express");
const playerNoteRouter = express.Router();
const PlayerNote = require("../../models/notes/PlayerNoteSchema");

//save or update a player note
playerNoteRouter.post("/save", async (req, res) => {
  try {
    const { playerName, leagueId, userId, note } = req.body;
    if (!playerName || !leagueId || !userId) {
      return res.status(400).json({ error: "playerName, leagueId and userId are required" });
    }
    const updatedNote = await PlayerNote.findOneAndUpdate(
      { playerName, leagueId, userId },
      { note },
      { upsert: true, new: true }
    );
    res.json({ message: "Note saved", note: updatedNote });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//get a player note
playerNoteRouter.get("/:leagueId/:userId/:playerName", async (req, res) => {
  try {
    const { leagueId, userId, playerName } = req.params;
    const note = await PlayerNote.findOne({ leagueId, userId, playerName });
    res.json({ note: note?.note || "" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = playerNoteRouter;