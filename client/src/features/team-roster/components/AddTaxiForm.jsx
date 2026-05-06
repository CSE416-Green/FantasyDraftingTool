import axios from "axios";
import { useState, useEffect } from "react";

export default function AddTaxiForm({ team, onSubmit, onCancel, playerPool, draftedNames, draftedIDs }) {
    const [selectedPlayer, setSelectedPlayer] = useState("");
    const [playerID, setPlayerID] = useState("");
    const [position, setPosition] = useState("");

    async function handleSubmit(e) {
        e.preventDefault();
        const player = {
            teamId: team._id,
            name: selectedPlayer,
            playerID,
            position: String(position)
        };


        if (!team._id || !selectedPlayer || !playerID || !position) {
            alert("Please fill in all fields");
            return;
        }
        
        if (isNaN(position) || position < 1) {
            alert("Position must be a positive number");
            return;
        }
        try {
            await axios.post("/draftPlayer/addToTaxi", player);
            if(onSubmit) {
                onSubmit(player);
            }
        } catch (err) {
            console.error("Failed to add player to taxi:", err);
            // if status(400) alert "Invalid Fields"
            if (err.response && err.response.status === 400) {
                alert("Invalid fields: " + err.response.data.error);
            }
        }
    }

    return (
        <form onSubmit={handleSubmit}>
            <h2>Taxi Draft for {team.teamName}</h2>

            <div className="form-row">
                <label>Select Player:</label>
                <input
                    list="players"
                    value={selectedPlayer}
                    onChange={(e) => {
                        const name = e.target.value;
                        setSelectedPlayer(name);
                        const player = playerPool.find((p) => p.name === name);
                        setPlayerID(player?.ID || "");

                    }}
                    className="form-input"
                    placeholder="Type to Search"
                /> 
                <datalist id="players">
                    {playerPool.filter(p => !draftedNames.includes(p.name) && !draftedIDs.includes(p.ID))
                        .map((player, index) => (
                        <option key={index} value={player.name}>
                        {player.position.join(" ")}
                        </option>
                    ))}
                </datalist>
            </div>
            <div className="form-row">
                <label>Position:</label>
                <input
                    type="text"
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    className="form-input"
                    placeholder="Enter Order"
                />
            </div>
            <div className="form-button-group">
                <button className="form-buttom" type="button" onClick={onCancel}>
                Cancel
                </button>
                <button className="form-buttom" type="submit">
                Enter
                </button>
            </div>
            
        </form>
    )
}