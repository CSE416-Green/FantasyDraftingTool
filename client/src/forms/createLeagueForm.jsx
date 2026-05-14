import { useState } from "react";
import axios from "axios";

const ALL_HITTER_STATS = ["AB", "R", "H", "Doubles", "Triples", "HR", "RBI", "BB", "K", "SB", "AVG", "OBP", "SLG"];
const ALL_PITCHER_STATS = ["IP", "W", "SV", "K", "BB", "ERA", "WHIP"];

export default function CreateLeagueForm({ user, setUser }) {

    const userId = user._id;
    const [leagueName, setLeagueName] = useState("");
    const [year, setYear] = useState("");
    const [teamName, setTeamName] = useState("");
    const [hitterStats,setHitterStats]=useState([...ALL_HITTER_STATS]);
    const [pitcherStats,setPitcherStats]=useState([...ALL_PITCHER_STATS]);

    //toggle on/off stats in table
    function toggleStats(stat,list,setList){
        if (list.includes(stat)) {
            setList(list.filter(s => s !== stat));
        } else {
            setList([...list, stat]);
        }
    }

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
            // server req const { leagueName, year, userId, teamName, stats for pitcher and hitter } = req.body;
            const res = await axios.post("/createLeague", {
                leagueName,
                year,
                userId,
                teamName,
                hitterStats,
                pitcherStats
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
                <div className="form-row" >
                    <h4 style={{ marginRight:"70px", whiteSpace: "nowrap", paddingTop: "5px" }}>Hitter Stats:</h4>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "15px" }}>
                        {ALL_HITTER_STATS.map(stat => (
                            <label key={stat} style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                                <input
                                    type="checkbox"
                                    checked={hitterStats.includes(stat)}
                                    onChange={() => toggleStats(stat, hitterStats, setHitterStats)}
                                />
                                {stat}
                            </label>
                        ))}
                    </div>
                </div>
                <div className="form-row">
                <h4 style={{ marginRight:"15px", whiteSpace: "nowrap", paddingTop: "5px" }}>Pitcher Stats:</h4>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "25px"}}>
                        {ALL_PITCHER_STATS.map(stat => (
                            <label key={stat} style={{ display: "flex", alignItems: "center", gap: "4px", padding:"5px" }}>
                                <input
                                    type="checkbox"
                                    checked={pitcherStats.includes(stat)}
                                    onChange={() => toggleStats(stat, pitcherStats, setPitcherStats)}
                                />
                                {stat}
                            </label>
                        ))}
                    </div>
                </div>
                <button type="submit">Create League</button>
            </form>
        </div>

    )
}