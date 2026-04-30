const express = require("express");
const winOrLoseRouter = express.Router();
// app.use("/compete", winOrLoseRouter);



const LeaguePoint = require("../models/LeaguePointSchema");
const WeeklyPoint = require("../models/WeeklyPointSchema");

winOrLoseRouter.post("/teams", async (req, res) => {
    try {
        const leagueId = req.body.leagueId;
        const response = await fetch(
            "https://fantasybaseballgateway.onrender.com/api/compete/teams",
            // "http://localhost:8080/compete/teams",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `apikey ${process.env.API_KEY}`,
                },
                body: JSON.stringify(req.body)
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            return res.status(response.status).json({
                error: errorText || "Failed to fetch salary",
            });
        }
        const data = await response.json();

        res.json(data);
        

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
})

winOrLoseRouter.post("/teams/addHistory", async (req, res) => {
    try {
        const leagueId = req.body.leagueId;

        const existing = await LeaguePoint.findOne({
            League: leagueId,
            "Results.StartDate": req.body.startDate,
            "Results.EndDate": req.body.endDate,
        });

        if (existing) {
            return res.status(200).json({
                message: "History already exists for this week",
            });
        }

        const response = await fetch(
            "https://fantasybaseballgateway.onrender.com/api/compete/teams",
            // "http://localhost:8080/compete/teams",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `apikey ${process.env.API_KEY}`,
                },
                body: JSON.stringify(req.body)
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            return res.status(response.status).json({
                error: errorText || "Failed to fetch salary",
            });
        }

        const data = await response.json();
        const weeklyResult = {
            StartDate: req.body.startDate,
            EndDate: req.body.endDate,
            Scores: data.standings.map((team) => ({
                TeamId: team.teamID,
                TeamName: team.teamName,
                Points: team.score,
                CategoryPoints: team.categoryPoints,
            })),
        };

        const leaguePoint = await LeaguePoint.findOneAndUpdate(
            { League: leagueId },
            { $push: { Results: weeklyResult } },
            { returnDocument: "after", upsert: true }
        );

        res.json(data);
        

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
})

winOrLoseRouter.post("/getHistory", async (req, res) => {
  try {
    const { leagueId } = req.body;

    if (!leagueId) {
      return res.status(400).json({ error: "leagueId is required" });
    }

    const leaguePoint = await LeaguePoint.findOne({ League: leagueId });


    if (!leaguePoint) {
      return res.status(404).json({
        error: "No history found for this league",
        results: [],
      });
    }

    
    res.status(200).json({
      results: leaguePoint.Results,
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


module.exports = winOrLoseRouter;