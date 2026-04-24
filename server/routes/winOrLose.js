const express = require("express");
const winOrLoseRouter = express.Router();
// app.use("/compete", winOrLoseRouter);


winOrLoseRouter.post("/teams", async (req, res) => {
    try {
        const response = await fetch(
            // "https://fantasybaseballgateway.onrender.com/api/compete/teams",
            "http://localhost:8080/compete/teams",
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
        // sample {"result":"abc123","team1Score":7,"team2Score":1}
        const data = await response.json();

        res.json(data);
        

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
})

module.exports = winOrLoseRouter;