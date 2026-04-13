const express = require("express");
const recommendedSalaryRouter = express.Router();
// app.use("/getSalaryForPlayers/compute", recommendedSalaryRouter);



recommendedSalaryRouter.post("/", async (req, res) => {
    try {
        console.log("calling gateway to calculate salary for player:", req.body.players[0].Player);
        
        const response = await fetch(
            "https://fantasybaseballgateway.onrender.com/api/GetSalaryForPlayers/compute",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    // "Authorization": `apikey ${process.env.API_KEY}`,
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
});

module.exports=recommendedSalaryRouter;