const express = require("express");
const playerStatsRouter = express.Router();

playerStatsRouter.get("/:year", async (req, res) => {
  try {
    const year =  req.params.year;
    if (!year) {
      return res.status(400).json({ error: "Year parameter is required" });
    }

    const response = await fetch(
        `https://fantasybaseballplayerstatsapi.onrender.com/stats/${year}`,
        {
            methods: "GET",
            headers: {
                "Content-Type": "application/json",
                "x-api-key": process.env.API_KEY,
            },
        }
    );
    if (!response.ok) {
        throw new Error(`Failed to fetch player stats for year ${year}: ${response.statusText}`);
    }
    const playerStats = await response.json();
    res.json(playerStats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = playerStatsRouter;