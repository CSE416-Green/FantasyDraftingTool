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

// npm install express and cors
const express = require('express')
const cors = require("cors");
const Team = require("./models/TeamSchema");
const Settings = require('./models/settings');
const app = express()
app.use(cors());
app.use(express.json());
const port = 3000

app.get('/', async (req, res) => {
  res.send("Hello World!");
})


// to get all teams and their rosters and farm players
app.get("/allteams", async (req, res) => {
  try {
    // console.log("GET /allteams");
    const teams = await Team.find({});
    res.json(teams);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// to update a team's roster or farm players
app.post("/updateTeam", async (req, res) => {
  try {
    // console.log("POST /updateTeam with body: ", req.body);
    const {
      teamName,
      playerName,
      updatedPosition,
      updatedStatus,
      updatedCost,
      view,
    } = req.body;

    if (!teamName || !playerName || !view) {
      console.log("Missing required fields in request body");
      return res.status(400).json({ error: "Missing required fields" });
    }

    const team = await Team.findOne({ teamName });
    if (!team) {
      console.log(`Team ${teamName} not found: `);
      return res.status(404).json({ error: "Team not found" });
    }

    const playerList = view === "roster" ? team.rosterPlayers : team.farmPlayers;

    const player = playerList.find((p) => p.name === playerName);

    if (!player) {
      console.log(`Player not found: ${playerName} in team ${teamName} (${view})`);
      return res.status(404).json({ error: "Player not found" });
    }

    player.position = updatedPosition;
    player.status = updatedStatus;
    player.cost = updatedCost;

    await team.save();

    res.json({
      message: "Team updated successfully!!",
      team,
    });
  } catch (error) {
    console.log("Error updating team:", error);
    res.status(500).json({ error: "Server error" });
  }
});


// draft player to roster
        // const draftedPlayer = {
        //     teamName: teamName,
        //     name: selectedPlayer,
        //     position,
        //     cost,
        //     status,
        // };
app.post("/draftPlayer", async (req, res) => {
  try {
    const { teamName, name, position, cost, status } = req.body;
    if (!teamName || !name || !position || !cost || !status) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const team = await Team.findOne({ teamName });
    if (!team) {
      console.log(`Team ${teamName} not found: `);
      return res.status(404).json({ error: "Team not found" });
    }

    // add the player to the team's roster
    const newPlayer = {
      name: name,
      position: position,
      cost: cost,
      status: status,
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
app.post("/addPastPlayer", async (req, res) => {
  try {
    console.log("POST /addPastPlayer with body: ", req.body);
    const { teamName, name, position, cost, status, rosterOrFarm  } = req.body;

    const team = await Team.findOne({ teamName });
    if (!team) {
      console.log(`Team ${teamName} not found: `);
      return res.status(404).json({ error: "Team not found" });
    }

    if (rosterOrFarm  === "roster") {
      console.log(`Adding player ${name} to roster of team ${teamName}`);
      team.rosterPlayers.push({
      name: name,
      position: position,
      cost: cost,
      status: status
      });
    } else {
        console.log(`Adding player ${name} to farm players of team ${teamName}`);
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

app.post("/settings/league", async (req, res) => {
  try {
    const { numTeams, teamBudget } = req.body;
    
    const settings = await Settings.findOneAndUpdate(
      {},
      { numTeams, teamBudget },
      { upsert: true, new: true }
    );

    //number of Teams
    const existingTeams = await Team.find({});
    const currentCount = existingTeams.length;

    if (currentCount < numTeams) {
      for (let i = currentCount + 1; i <= numTeams; i++) {
        await Team.create({
          teamName: `Team${i}`,
          rosterPlayers: [],
          farmPlayers: []
        });
      }
    } else if (currentCount > numTeams) {
      for (let i = numTeams + 1; i <= currentCount; i++) {
        await Team.deleteOne({ teamName: `Team${i}` });
      }
    }

    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/settings/league", async (req, res) => {
  try {
    const settings = await Settings.findOne();
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(port, () => {
  console.log(`fantasyDraftingTool server listening on port ${port}`)
})

