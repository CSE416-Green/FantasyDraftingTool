const express = require("express");
const draftPlayerRouter = express.Router();
const Team = require("../models/TeamSchema");
const DraftHistory = require("../models/DraftHistorySchema");

// draft player to roster
        // const draftedPlayer = {
        //     teamName: teamName,
        //     name: selectedPlayer,
        //     position,
        //     cost,
        //     status,
        // };
// app.post("/draftPlayer", async (req, res) => {
draftPlayerRouter.post("/onePlayer", async (req, res) => {
  try {
    const { teamId, name, position, cost, status, playerID } = req.body;
    if (!teamId || !name || !position || !cost || !status || !playerID ) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ error: "Team not found" });
    }

    // add the player to the team's roster
    const newPlayer = {
      name: name,
      position: position,
      cost: cost,
      status: status,
      playerID: playerID
    };

    team.rosterPlayers.push(newPlayer);
    await team.save();
    
    res.json({ message: "Player drafted successfully!", team });

  } catch (error) {
    console.error("Error drafting player:", error);
    res.status(500).json({ error: "Server error" });
  }
});


// User add players they drafted in the past to the roster
draftPlayerRouter.post("/addPastPlayer", async (req, res) => {
  try {
    const { teamId, name, position, cost, status, rosterOrFarm  } = req.body;
    const team = await Team.findById(teamId);
    if (!team) {
      console.warn(`Team not found: `);
      return res.status(404).json({ error: "Team not found" });
    }

    if (rosterOrFarm  === "roster") {
      team.rosterPlayers.push({
      name: name,
      position: position,
      cost: cost,
      status: status
      });
    } else {
      team.farmPlayers.push({
        name: name,
        position: position,
        cost: cost,
        status: status
      });
    }

    await team.save();

    res.json({ message: "Player drafted successfully!", team });

  } catch (error) {
    console.error("Error drafting player:", error);
    res.status(500).json({ error: "Server error" });
  }
});

draftPlayerRouter.post("/group", async (req, res) => {
  try {
    const { leagueId, players } = req.body;

    if (!leagueId || !Array.isArray(players) || players.length === 0) {
      return res.status(400).json({
        error: "leagueId and non-empty players array are required"
      });
    }

    const history = await DraftHistory.findOne({ League: leagueId });

    if (!history) {
      return res.status(404).json({
        error: "No draft history found for that league"
      });
    }

    const processed = [];
    const failed = [];

    for (const player of players) {
      const {
        pick, teamId, teamName, name, position, cost, status, broughtupby, playerID
      } = player;

      if (
        !teamId || !teamName || !name || !position ||
        cost === undefined || !status || !broughtupby || !playerID
      ) {
        failed.push({
          pick,
          name,
          reason: "Missing required fields"
        });
        continue;
      }

      const team = await Team.findById(teamId);

      if (!team) {
        failed.push({
          pick,
          name,
          reason: "Team not found"
        });
        continue;
      }

      // Add player to team roster
      team.rosterPlayers.push({
        name,
        position,
        cost,
        status,
        playerID
      });

      await team.save();

      // Add player to draft history
      history.DraftedPlayers.push({
        PlayerName: name,
        Pick: pick,
        TeamName: teamName,
        Cost: cost,
        BroughtUpBy: broughtupby,
        Position: position
      });

      processed.push({
        pick,
        name,
        teamName
      });
    }

    await history.save();

    res.json({
      processed,
      failed
    });

  } catch (error) {
    console.error("Error processing group draft:", error);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = draftPlayerRouter;