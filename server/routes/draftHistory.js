const express = require("express");
const draftHistoryRouter = express.Router();
const DraftHistory = require("../models/DraftHistorySchema");


// when a user drafts a player, add that player to the draft history for the league and year
draftHistoryRouter.post("/addPlayer", async (req, res) => {
  try {
    const { leagueId, year, playerName, teamName, cost, broughtupby, position } = req.body;

    const history = await DraftHistory.findOne({ League: leagueId });

    if (!history) {
      return res.status(404).json({ message: "No draft history found for that league and year" });
    }
    const pick = history.DraftedPlayers.length + 1;
    history.DraftedPlayers.push({
      PlayerName: playerName,
      Pick: pick,
      TeamName: teamName,
      Cost: cost,
      BroughtUpBy: broughtupby,
      Position: position
    });
    await history.save();
    res.json({ message: "Player added to draft history successfully!", history });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
})

// to get the draft history for a league and year
draftHistoryRouter.post("/league", async (req, res) => {

  try {
    const { year } = req.params;
    const leagueId = req.body.leagueId;

    const history = await DraftHistory.findOne({ League: leagueId });
    if (!history) {
      return res.status(404).json({ message: "No draft history found for that league and year" });
    }
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
})

module.exports = draftHistoryRouter;