const express = require("express");
const axios = require("axios");
const depthChartRouter = express.Router();

depthChartRouter.get("/fetch", async (req, res) => {
  try {
    const response = await axios.get(
      "http://localhost:8080/depthChart/fetch"
    //   "https://fantasybaseballgateway.onrender.com/api/depthcharts/fetch"
    );

    res.status(200).json(response.data);

    } catch (err) {
    res.status(500).json({
      error: "Failed to fetch depth charts from backend",
      details: err.response?.data || err.message,
    });
  }
});

module.exports = depthChartRouter;