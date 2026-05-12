const express = require("express");
const axios = require("axios");
const depthChartRouter = express.Router();

depthChartRouter.get("/fetch", async (req, res) => {
  try {
    const response = await fetch(
      "https://fantasybaseballgateway.onrender.com/api/depthChart/fetch",
      {
        method: "GET",
        headers: {
          Authorization: `apikey ${process.env.API_KEY}`,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({
        error: errorText || "Failed to fetch depth chart",
      });
    }

    const data = await response.json();
    res.json(data);

    } catch (err) {
    res.status(500).json({
      error: "Failed to fetch depth charts from backend",
      details: err.response?.data || err.message,
    });
  }
});

module.exports = depthChartRouter;