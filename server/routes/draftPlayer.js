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
    if (!teamId || !name || !position || !cost || !status ) {
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
      playerID: playerID || null
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
    const { teamId, name, position, cost, status, rosterOrFarm, playerID  } = req.body;
    if (!teamId || !name || !position || !cost || !status || !rosterOrFarm || !playerID ) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    const team = await Team.findById(teamId);
    if (!team) {
      console.warn(`Team not found: `);
      return res.status(404).json({ error: "Team not found" });
    }

    const newPlayer = {
      name: name,
      position: position,
      cost: cost,
      status: status,
      playerID: playerID
    };
    if (rosterOrFarm  === "roster") {
      team.rosterPlayers.push(newPlayer);
    } else {
      team.farmPlayers.push(newPlayer);
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
        pick, teamId, teamName, name, position, cost, status, broughtupby, playerID, MLBTeam
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
        Position: position,
        PlayerID: playerID,
        MLBTeam: MLBTeam
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

draftPlayerRouter.post("/addToTaxi", async (req, res) => {
  try {
    const { teamId, name, playerID, position  } = req.body;
    if (!teamId || !name || !playerID || !position) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    const team = await Team.findById(teamId);
    if (!team) {
      console.warn(`Team not found: `);
      return res.status(404).json({ error: "Team not found" });
    }

    // check if that position exists in the taxi already
    const existingPlayer = team.taxiPlayers.find(p => p.position === position);
    if (existingPlayer) {
      return res.status(400).json({ error: `Your team already has a player at position ${position} in the taxi squad.` });
    }

    const newPlayer = {
      name: name,
      playerID: playerID,
      position: position
    };
    
    team.taxiPlayers.push(newPlayer);

    await team.save();

    res.json({ message: "Taxi player drafted successfully!", team });

  } catch (error) {
    console.error("Error drafting taxi player:", error);
    res.status(500).json({ error: "Server error" });
  }
});


draftPlayerRouter.post("/updateTaxiOrder", async (req, res) => {
  try {
    const { teamId, taxiPlayers } = req.body;

    // check valid positions
    const positions = taxiPlayers.map(p => p.position);
    const uniquePositions = new Set(positions);
    if (uniquePositions.size !== taxiPlayers.length) {
      return res.status(400).json({ error: "Duplicate positions!" });
    }

    // check for <=0
    for (const p of positions) {
      if (p <= 0) {
        return res.status(400).json({ error: "Only positive positions are allowed!" });
      }
    }

    const team = await Team.findById(teamId);

    if (!team) {
      return res.status(404).json({ error: "Team not found" });
    }

    team.taxiPlayers = taxiPlayers;

    await team.save();

    res.json(team);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
module.exports = draftPlayerRouter;