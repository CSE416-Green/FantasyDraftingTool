import { useState } from "react";
import axios from "axios";

export default function CreateLeagueForm({ user, setUser }) {

    const userId = user._id;
    const [leagueName, setLeagueName] = useState("");
    const [year, setYear] = useState("");
    const [teamName, setTeamName] = useState("");

    async function handleSubmit(e) {
        e.preventDefault();

        if (!leagueName || !year || !teamName) {
            alert("Please fill in all fields");
            return;
        }

        if (year < 2000 || year > 2026) {
            alert("Please enter a valid year between 2000 and 2026");
            return;
        }

        try {
            // server req const { leagueName, year, userId, teamName } = req.body;
            const res = await axios.post("/createLeague", {
                leagueName,
                year,
                userId,
                teamName
            });

            const updatedUser = res.data.user;

            localStorage.setItem("user", JSON.stringify(updatedUser));
            setUser(updatedUser);

            // success res:  res.json({ message: "League created successfully!", league: newLeague });
            alert("Your league has been created, Invite your friend with the code: " + res.data.league.InviteCode);
        } catch (err) {
            console.error("Failed to create league: ", err);
            alert("Failed to create league. Please try again.");
        }
    }

    return (
        <div className="league-form">
            <h2>Create a New League</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-row">
                    <label>League Name:</label>
                    <input
                        className="form-input"
                        type="text"
                        value={leagueName}
                        onChange={(e) => setLeagueName(e.target.value)}
                        required
                    />
                </div>
                <div className="form-row">
                    <label>Year(between 2000 and 2026):</label>
                    <input
                        className="form-input"
                        type="number"
                        value={year}
                        onChange={(e) => setYear(e.target.value)}
                        required
                    />
                </div>
                <div className="form-row">
                    <label>Team Name for your team':</label>
                    <input
                        className="form-input"
                        type="text"
                        value={teamName}
                        onChange={(e) => setTeamName(e.target.value)}
                        required
                    />
                </div>
                <button type="submit">Create League</button>
            </form>
        </div>

    )
}