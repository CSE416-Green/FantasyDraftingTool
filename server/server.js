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
const HitterStat = require("./models/HitterStatSchema");
const DraftHistory = require("./models/DraftHistorySchema");
const League = require("./models/LeagueSchema");
const User = require("./models/UserSchema");
const app = express()
app.use(cors());
app.use(express.json());
const playerStatsRouter = require("./routes/playerStats");
app.use("/playerStats", playerStatsRouter);
const userAuthRouter=require("./routes/userAuth");
app.use("/user", userAuthRouter);
const recommendedSalaryRouter = require("./routes/recommededSalary");
app.use("/GetSalaryForPlayers/compute", recommendedSalaryRouter);
const addedPlayerPoolRouter = require("./routes/addedPlayerPool");
app.use("/addedPlayerPool", addedPlayerPoolRouter);
const generalNoteRouter = require("./routes/notes/generalNote");
app.use("/generalNote", generalNoteRouter);
const playerNoteRouter = require("./routes/notes/playerNote");
app.use("/playerNote", playerNoteRouter);
const port = 3000

app.get('/', async (req, res) => {
  res.send("Hello World!");
})


// to get all teams and their rosters and farm players
app.post("/allteams", async (req, res) => {
  try {
    const leagueId = req.body.leagueId;
    const league = await League.findById(leagueId);
    const teams = await Team.find({
      _id: { $in: league.TeamsID },
    });
    res.json(teams);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// to update a team's roster or farm players
app.post("/updateTeam", async (req, res) => {
  try {
    const {
      teamId,
      playerName,
      updatedPosition,
      updatedStatus,
      updatedCost,
      view,
    } = req.body;


    if (!teamId || !playerName || !view) {
      console.warn("Missing required fields in request body");
      return res.status(400).json({ error: "Missing required fields" });
    }

    const team = await Team.findById(teamId);
    if (!team) {
      console.warn(`Team not found: `);
      return res.status(404).json({ error: "Team not found" });
    }

    const playerList = view === "roster" ? team.rosterPlayers : team.farmPlayers;

    const player = playerList.find((p) => p.name === playerName);

    if (!player) {
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
    console.error("Error updating team:", error);
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
app.post("/addPastPlayer", async (req, res) => {
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

app.post("/league/info", async (req, res) => {
  try {
    const leagueInfo = await League.findOne({
      _id: req.body.leagueId,
    });

    res.json(leagueInfo);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
})

app.get("/stat/hitter/:year", async(req, res) => {
  try {
    // const { AVG, OBP, SLG, HR, RBI, SB } = req.body;
    const year = Number(req.params.year);
    const stats = await HitterStat.findOne({ Year: year });

    if (!stats) {
      return res.status(404).json({ message: "No stats found for that year" });
    }

    res.send(stats);
  } catch(error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
})

app.get("/stat/pitcher", async(req, res) => {
  try {
    const { ERA, WHIP, K, W, SV, IP, BB } = req.body;

  } catch(error) {
    res.status(500).json({ error: err.message });
  }
})

// in mongodb, to create a draft history cluster (only used once when I first set up the database):
app.post("/draftHistory", async (req, res) => {
  try {
    const { leagueName, year, draftedPlayers } = req.body;
    const newHistory = new DraftHistory({
      LeagueName: leagueName,
      Year: year,
      DraftedPlayers: draftedPlayers
    });
    await newHistory.save();
    res.json({ message: "Draft history saved successfully!", history: newHistory });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// when a user drafts a player, add that player to the draft history for the league and year
app.post("/draftHistory/addPlayer", async (req, res) => {
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
app.post("/draftHistory/league", async (req, res) => {

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

//Start of new code
app.post("/tradePlayers", async (req, res) => {
  try {
    const {
      fromTeamId,
      toTeamId,
      fromPlayerName,
      toPlayerName,
      fromView,
      toView
    } = req.body;

    if (
      !fromTeamId||
      !toTeamId ||
      !fromPlayerName ||
      !toPlayerName ||
      !fromView ||
      !toView
    ) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (fromTeamId === toTeamId) {
      return res.status(400).json({ error: "Teams must be different" });
    }

    const fromTeam = await Team.findById({ _id: fromTeamId });
    const toTeam = await Team.findById({ _id: toTeamId });

    if (!fromTeam || !toTeam) {
      return res.status(404).json({ error: "One or both teams not found" });
    }

    const fromList =
      fromView === "roster" ? fromTeam.rosterPlayers : fromTeam.farmPlayers;
    const toList =
      toView === "roster" ? toTeam.rosterPlayers : toTeam.farmPlayers;

    const fromPlayerIndex = fromList.findIndex(
      (p) => p.name === fromPlayerName
    );
    const toPlayerIndex = toList.findIndex(
      (p) => p.name === toPlayerName
    );

    if (fromPlayerIndex === -1 || toPlayerIndex === -1) {
      return res.status(404).json({ error: "One or both players not found" });
    }

    const fromPlayer = fromList[fromPlayerIndex].toObject
      ? fromList[fromPlayerIndex].toObject()
      : { ...fromList[fromPlayerIndex] };

    const toPlayer = toList[toPlayerIndex].toObject
      ? toList[toPlayerIndex].toObject()
      : { ...toList[toPlayerIndex] };

    fromList.splice(fromPlayerIndex, 1);
    toList.splice(toPlayerIndex, 1);

    fromList.push(toPlayer);
    toList.push(fromPlayer);

    await fromTeam.save();
    await toTeam.save();

    res.json({
      message: "Trade completed successfully!",
      fromTeam,
      toTeam
    });
  } catch (error) {
    console.error("Error trading players:", error);
    res.status(500).json({ error: "Server error" });
  }
});
//End of new code


// create a new league 
app.post("/createLeague", async (req, res) => {
  try {
    const { leagueName, year, userId, teamName } = req.body;
    let inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    while (await League.findOne({ InviteCode: inviteCode })) {
      inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    }

    const newLeague = new League({
      Name: leagueName,
      Year: year,
      TeamsID: [],
      InviteCode: inviteCode,
    });


    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    user.league = newLeague._id;

    const newDraftHistory = new DraftHistory({
      LeagueName: leagueName,
      Year: year,
      DraftedPlayers: [],
      League: newLeague._id
    });

    const newTeam = new Team({
      teamName: teamName,
      rosterPlayers: [],
      farmPlayers: []
    });

    await newLeague.save();
    await user.save();
    await newDraftHistory.save();
    await newTeam.save();
    newLeague.TeamsID.push(newTeam._id);
    await newLeague.save();

    res.json({ message: "League created successfully!", 
      league: newLeague,
      user: user,});

  } catch (error) {
    console.error("Error creating league:", error);
    res.status(500).json({ error: "Server error" });
  }
})

// join an existing league
app.post("/joinLeague", async (req, res) => {
  try {
    const { inviteCode, userId, teamName } = req.body;
    const league = await League.findOne({ InviteCode: inviteCode });
    if (!league) {
      return res.status(404).json({ message: "League not found" });
    }
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const newTeam = new Team({
      teamName: teamName,
      rosterPlayers: [],
      farmPlayers: []
    });

    user.league = league._id;
    await user.save();

    await newTeam.save();

    league.TeamsID.push(newTeam._id);
    await league.save();

    res.json({ message: "Successfully joined the league!", user, newTeam });

  } catch (error) {
    console.error("Error joining league:", error);
    res.status(500).json({ error: "Server error" });
  }
})

// app.listen(port, () => {
//   console.log(`fantasyDraftingTool server listening on port ${port}`)
// })

if (require.main === module) {
  app.listen(port, () => {
    console.log(`fantasyDraftingTool server listening on port ${port}`)
  })
}

module.exports = { app, port };
