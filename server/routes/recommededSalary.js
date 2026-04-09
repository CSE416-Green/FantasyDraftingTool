const express = require("express");
const recommendedSalaryRouter = express.Router();
// app.use("/getSalaryForPlayers/compute", recommendedSalaryRouter);



recommendedSalaryRouter.post("/", async (req, res) => {
    try {
        // send a post request to calculate recommended salary
        console.log("Received request for recommended salary for:", req.body.players[0].Player);
        console.log("API KEY:", process.env.API_KEY);
        
        const response = await fetch(
            "https://fantasybaseballgateway.onrender.com/api/GetSalaryForPlayers/compute",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    // "Authorization": `apikey ${process.env.API_KEY}`,
                    "x-api-key": process.env.API_KEY,
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