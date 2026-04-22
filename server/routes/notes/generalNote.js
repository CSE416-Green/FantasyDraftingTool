const express = require("express");
const generalNoteRouter = express.Router();
const GeneralNote = require("../../models/notes/GeneralNoteSchema");

// save or update note
generalNoteRouter.post("/save", async (req, res) => {
  try {
    const { userId, leagueId, note } = req.body;
    if (!userId || !leagueId) {
      return res.status(400).json({ error: "userId and leagueId are required" });
    }
    const updatedNote = await GeneralNote.findOneAndUpdate(
      { userId, leagueId },
      { note },
      { upsert: true, new: true }
    );
    res.json({ message: "Note saved", note: updatedNote });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//get note
generalNoteRouter.get("/:leagueId/:userId", async (req, res) => {
  try {
    const { leagueId, userId } = req.params;
    const note = await GeneralNote.findOne({ leagueId, userId });
    res.json({ note: note?.note || "" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = generalNoteRouter;