import { useState } from "react";
import axios from "axios";

export default function JoinLeagueForm({ user, setUser }) {
    const userId = user._id;
    const [inviteCode, setInviteCode] = useState("");
    const [teamName, setTeamName] = useState("");

    async function handleSubmit(e) {
        e.preventDefault();

        if (!inviteCode || !teamName) {
            alert("Please enter the league invitation code");
            return;
        }
        try {
            // server req: const { inviteCode, userId, teamName } = req.body;
            const res = await axios.post("/joinLeague", {
                inviteCode,
                userId,
                teamName,
            })

            const updatedUser = res.data.user;

            localStorage.setItem("user", JSON.stringify(updatedUser));
            setUser(updatedUser);

            alert("You have successfully joined the league!");
        } catch (err) {
            console.error("Failed to join league: ", err);
            alert("Failed to join league. Please check the invitation code and try again.");
        }

    }

    return (
        <div className="league-form">
            <h2>Join an Existing League</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-row">
                    <label>League Invitation Code:</label>
                    <input
                        className="form-input"
                        type="text"
                        value={inviteCode}
                        onChange={(e) => setInviteCode(e.target.value)}
                        required
                    />
                </div>
                <div className="form-row">
                    <label>Team Name for your Team:</label>
                    <input
                        className="form-input"
                        type="text"
                        value={teamName}
                        onChange={(e) => setTeamName(e.target.value)}
                        required
                    />
                </div>
                <button type="submit" className="form-button">Join League</button>
            </form>
        </div>
    )
}