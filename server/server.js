const dotenv = require('dotenv');
dotenv.config({ path: './.env' });

const mongoose = require("mongoose");
let mongoDB = "mongodb://127.0.0.1/cse416-FantasyDraftingTool";
if (process.env.ENVIRONMENT == "prod") {
  mongoDB = process.env.MONGODB_URL;
}

if (process.env.NODE_ENV !== 'test') {
  mongoose.connect(mongoDB);
  
  let db = mongoose.connection;
  db.on("error", console.error.bind(console, "MongoDB connection error:"));
  db.on("connected", function () {
    console.log("Connected to database");
  });
}


// npm install express and cors
const http = require('http')
const express = require('express')
const cors = require("cors");
const Team = require("./models/TeamSchema");
const Settings = require('./models/settings');
const DraftHistory = require("./models/DraftHistorySchema");
const League = require("./models/LeagueSchema");
const User = require("./models/UserSchema");
const WeeklyRecord = require("./models/WeeklyRecordSchema");
const Scoreboard = require("./models/ScoreboardSchema");
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
const winOrLoseRouter = require("./routes/winOrLose.js")
app.use("/compete", winOrLoseRouter);
const draftPlayerRouter = require("./routes/draftPlayer")
app.use("/draftPlayer", draftPlayerRouter);
const draftHistoryRouter = require("./routes/draftHistory");
app.use("/draftHistory", draftHistoryRouter);
const presentationRouter = require("./routes/presentation");
app.use("/presentation", presentationRouter);
const depthChartRouter = require("./routes/depthChart");
app.use("/depthChart", depthChartRouter);
const port = 3000

const { setupWebSocket } = require("./routes/receiveNotif");

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

app.post("/league/userLeagues", async (req, res) => {
  try {
    const { leagueIds } = req.body;

    if (!leagueIds || !Array.isArray(leagueIds)) {
      return res.status(400).json({ error: "leagueIds must be an array" });
    }

    const leagues = await League.find({
      _id: { $in: leagueIds }
    }).select("_id Name Year");

    res.json(leagues);
  } catch (err) {
    console.error("Failed to fetch user leagues:", err);
    res.status(500).json({ error: "Server error" });
  }
});


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

    const fromPlayerCost = Number(fromPlayer.cost || 0);
    const toPlayerCost = Number(toPlayer.cost || 0);

    const getRosterCost = (team) =>
      team.rosterPlayers.reduce(
        (sum, player) => sum + Number(player.cost || 0),
        0
      );

    const teamBudget = Number((await Settings.findOne())?.teamBudget || 260);

    const fromRosterCost = getRosterCost(fromTeam);
    const toRosterCost = getRosterCost(toTeam);

    const newFromCost = fromRosterCost - (fromView === "roster" ? fromPlayerCost : 0) + (toView === "roster" ? toPlayerCost : 0);
    const newToCost = toRosterCost - (toView === "roster" ? toPlayerCost : 0) + (fromView === "roster" ? fromPlayerCost : 0);

    if (newFromCost > teamBudget) {
      return res.status(400).json({
        error: `${fromTeam.teamName} does not have enough budget for this trade.`,
      });
    }

    if (newToCost > teamBudget) {
      return res.status(400).json({
        error: `${toTeam.teamName} does not have enough budget for this trade.`,
      });
    }
    
    fromList.splice(fromPlayerIndex, 1);
    toList.splice(toPlayerIndex, 1);

    fromList.push(toPlayer);
    toList.push(fromPlayer);

    await fromTeam.save();
    await toTeam.save();

    const league= await League.findOne({TeamsID:fromTeamId});
    if(league){
      const history = await DraftHistory.findOne({ League: league._id });
      if (history) {
        history.Trades.push({
          fromTeamName: fromTeam.teamName,
          toTeamName: toTeam.teamName,
          fromPlayerName,
          toPlayerName,
          date: new Date()
        });
        await history.save();
      }
    }

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

// create a new league 
app.post("/createLeague", async (req, res) => {
  try {
    const { leagueName, year, userId, teamName,hitterStats,pitcherStats } = req.body;
    let inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    while (await League.findOne({ InviteCode: inviteCode })) {
      inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    }

    const newLeague = new League({
      Name: leagueName,
      Year: year,
      TeamsID: [],
      InviteCode: inviteCode,
      HitterStats: hitterStats || undefined,
      PitcherStats: pitcherStats || undefined,
    });


    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.league) {
      user.league = [];
    }
    user.league.push(newLeague._id);

    const newDraftHistory = new DraftHistory({
      LeagueName: leagueName,
      Year: year,
      OldPlayers: [],
      DraftedPlayers: [],
      League: newLeague._id
    });

    const newTeam = new Team({
      teamName: teamName,
      rosterPlayers: [],
      farmPlayers: [],
      taxiPlayers: [],
    });

    if (!user.team) {
      user.team = [];
    }
    user.team.push(newTeam._id);

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

    const cleanedTeamName = teamName?.trim();

    if (!cleanedTeamName) {
      return res.status(400).json({ message: "Team name is required" });
    }
    
    const league = await League.findOne({ InviteCode: inviteCode });
    if (!league) {
      return res.status(404).json({ message: "League not found" });
    }
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // check if user's league array exists, and see if they are already in the league
    if (user.league && user.league.includes(league._id)) {
      return res.status(400).json({ message: "User already in this league" });
    }

    const existingTeams = await Team.find({
      _id: { $in: league.TeamsID },
    });

    const duplicateTeam = existingTeams.find(
      (team) =>
        team.teamName.trim().toLowerCase() ===
        cleanedTeamName.toLowerCase()
    );

    if (duplicateTeam) {
      return res.status(400).json({
        message: "A team with this name already exists in this league",
      });
    }

    if (!user.league) {
      user.league = [];
    }
    user.league.push(league._id);
    

    const newTeam = new Team({
      teamName: cleanedTeamName,
      rosterPlayers: [],
      farmPlayers: [],
      taxiPlayers: [],
    });

    if (!user.team) {
      user.team = [];
    }
    user.team.push(newTeam._id);

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

app.post("/settings/league/teams", async (req, res) => {
  try {
    const { leagueId, teams } = req.body;

    if (!leagueId) {
      return res.status(400).json({ error: "leagueId is missing" });
    }

    if (!Array.isArray(teams)) {
      return res.status(400).json({ error: "teams must be an array" });
    }

    const cleanedTeams = teams.map((team) => ({
      _id: team._id || null,
      teamName: team.teamName?.trim(),
    }));

    const invalidTeam = cleanedTeams.find((team) => !team.teamName);

    if (invalidTeam) {
      return res.status(400).json({ error: "Team name cannot be empty" });
    }

    // handles teams with the same names
    const lowerCaseNames = cleanedTeams.map((team) =>
      team.teamName.toLowerCase()
    );

    const hasDuplicateNames =
      new Set(lowerCaseNames).size !== lowerCaseNames.length;

    if (hasDuplicateNames) {
      return res.status(400).json({
        error: "Teams cannot have the same name (case insensitive)",
      });
    }

    const league = await League.findById(leagueId);

    if (!league) {
      return res.status(404).json({ error: "League not found" });
    }

    const existingTeams = await Team.find({
      _id: { $in: league.TeamsID },
    });

    const submittedExistingIds = cleanedTeams
      .filter((team) => team._id)
      .map((team) => team._id.toString());

    // delete teams that are not in the req body
    const teamsToDelete = existingTeams.filter(
      (team) => !submittedExistingIds.includes(team._id.toString())
    );

    await Team.deleteMany({
      _id: { $in: teamsToDelete.map((team) => team._id) },
    });

    const finalTeamIds = [];

    for (const team of cleanedTeams) {
      if (team._id) {
        const updatedTeam = await Team.findByIdAndUpdate(
          team._id,
          { teamName: team.teamName },
          { returnDocument: "after" }
        );

        if (updatedTeam) {
          finalTeamIds.push(updatedTeam._id);
        }
      } else {
        // new team missing id -> create a new team
        const newTeam = await Team.create({
          teamName: team.teamName,
          rosterPlayers: [],
          farmPlayers: [],
          taxiPlayers: [],
        });

        finalTeamIds.push(newTeam._id);
      }
    }

    league.TeamsID = finalTeamIds;
    await league.save();

    const updatedTeams = await Team.find({
      _id: { $in: league.TeamsID },
    });

    res.json({
      message: "League teams updated successfully",
      teams: updatedTeams,
    });
  } catch (error) {
    console.error("Error editing league:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// get league stats settings
app.get("/settings/league/stats/:leagueId", async (req, res) => {
  try {
    const league = await League.findById(req.params.leagueId);
    if (!league) return res.status(404).json({ error: "League not found" });
    res.json({
      hitterStats: league.HitterStats,
      pitcherStats: league.PitcherStats
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// save league stats settings
app.post("/settings/league/stats", async (req, res) => {
  try {
    const { leagueId, hitterStats, pitcherStats } = req.body;
    const league = await League.findByIdAndUpdate(
      leagueId,
      { HitterStats: hitterStats, PitcherStats: pitcherStats },
      { new: true }
    );
    if (!league) return res.status(404).json({ error: "League not found" });
    res.json({ message: "Stats updated successfully", league });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// app.listen(port, () => {
//   console.log(`fantasyDraftingTool server listening on port ${port}`)
// })

const server = http.createServer(app);
server.listen(port, () => {
  console.log(`fantasyDraftingTool server listening on port ${port}`)
});
setupWebSocket(server);

const { connectToReceiveNotifications } = require("./routes/receiveNotif");
connectToReceiveNotifications();

module.exports = { app, port };