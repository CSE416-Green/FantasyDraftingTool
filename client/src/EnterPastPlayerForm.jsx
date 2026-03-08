import axios from "axios";
import { useState } from "react";

export default function EnterPastPlayerForm({ team, onSubmit, onCancel, maxNextCost }) {

    const [playerName, setPlayerName] = useState("");
    const [position, setPosition] = useState("");
    const [cost, setCost] = useState("");
    const [status, setStatus] = useState("");
    const [RosterOrFarm, setRosterOrFarm] = useState("");

    const POSITIONS = [
    "C","1B","3B","CI","2B","SS","MI",
    "OF",
    "U",
    "P",];


    async function handleSubmit(e) {
        const availablePositions = getAvailablePositions(team.rosterPlayers);
        e.preventDefault();
        const player = {
            teamName: team.teamName,
            name: playerName,
            position,
            cost,
            status,
            rosterOrFarm: RosterOrFarm,
        };


        if (!playerName || !position || !cost || !status || !RosterOrFarm) {
            alert("Please fill in all fields");
            return;
        }
        
        if (cost <= 0 || cost > maxNextCost) {
            alert(`Cost must be between 1 and ${maxNextCost}`);
            return;
            }

        if (RosterOrFarm === "roster" && !availablePositions.includes(position)) {
            alert(`You cannot add a player at ${position}, your team already has the maximum number of player(s) allowed at this position.`);
            return;
        }

        // console.log("Submitting past player:", pastPlayer);
        try {
            await axios.post("/addPastPlayer", player);
            if(onSubmit) {
                onSubmit(player);
            }
        } catch (err) {
            console.error("Failed to add past player:", err);
        }
    }
    return (
        <form onSubmit={handleSubmit}>
            <h2>Enter Past Player for {team.teamName}</h2>

            <div className="form-row">
                <label>Player Name:</label>
                <input className="form-input" type="text" value={playerName} onChange={(e) => setPlayerName(e.target.value)} placeholder="Player Name" />
            </div>
            <div className="form-row">
                <label>Position:</label>
                <select className="form-input" value={position} onChange={(e) => setPosition(e.target.value)}>
                    <option value="">Select a Position</option>
                    {POSITIONS.map((pos) => (
                        <option key={pos} value={pos}>
                            {pos}
                        </option>
                    ))}
                </select>
            </div>
            <div className="form-row">
                <label>Cost:</label>
                <input className="form-input" type="number" value={cost} onChange={(e) => setCost(e.target.value)} placeholder="Cost" />
            </div>
            <div className="form-row">
                <label>Status:</label>
                <input className="form-input" type="text" value={status} onChange={(e) => setStatus(e.target.value)} placeholder="Status" />
            </div>
            <div className="form-row">
                <label>Add to:</label>
                {/* Roster or Farm */}
                <select className="form-input" value={RosterOrFarm} onChange={(e) => setRosterOrFarm(e.target.value)}>
                    <option value="">Select Roster or Farm</option>
                    <option value="roster">Roster</option>
                    <option value="farm">Farm</option>
                </select>
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


// to return the draftable positions based on the current roster
function getAvailablePositions(rosterPlayers) {
  // a team has 2 C, 1 1B, 1 3B, 1 CI, 1 2B, 1 SS, 1 MI, 5 OF, 1 U, 9 P
  let available = [
    "C","1B","3B","CI","2B","SS","MI",
    "OF",
    "U",
    "P",];
  const counts = {};
  rosterPlayers.forEach(p => {
    counts[p.position] = (counts[p.position] || 0) + 1;
  });
  if (counts["C"] >= 2) {
    available = available.filter(pos => pos !== "C"); 
  }
  if (counts["1B"] >= 1) {
    available = available.filter(pos => pos !== "1B");
  }
  if (counts["3B"] >= 1) {
    available = available.filter(pos => pos !== "3B");
  }
  if (counts["CI"] >= 1) {
    available = available.filter(pos => pos !== "CI");
  }
  if (counts["2B"] >= 1) {
    available = available.filter(pos => pos !== "2B");
  }
  if (counts["SS"] >= 1) {
    available = available.filter(pos => pos !== "SS");
  }
  if (counts["MI"] >= 1) {
    available = available.filter(pos => pos !== "MI");
  }
  if (counts["OF"] >= 5) {
    available = available.filter(pos => pos !== "OF");
  }
  if (counts["U"] >= 1) {
    available = available.filter(pos => pos !== "U");
  }
  if (counts["P"] >= 9) {
    available = available.filter(pos => pos !== "P");
  }
  return available;
}