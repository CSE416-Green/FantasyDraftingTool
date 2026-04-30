import axios from "axios";
import { useState } from "react";

export default function EditRosterForm({ team, view = "roster", onSave, onCancel, maxNextCost }) {
  const POSITION_OPTIONS = [
    "C",
    "1B", "2B", "3B", "SS", "MI", "CI",
    "OF",
    "U",
    "P"
  ];
  const availablePositions = getAvailablePositions(team.rosterPlayers);

  const players = view === "roster" ? team.rosterPlayers : team.farmPlayers;
  
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [position, setPosition] = useState(players[0]?.position || "");
  const [status, setStatus] = useState(players[0]?.status || "");
  const [cost, setCost] = useState(players[0]?.cost || "");
  const oldCost = cost;
  function handlePlayerChange(e) {
    const index = Number(e.target.value);
    const player = players[index];

    setSelectedIndex(index);
    setPosition(player.position);
    setStatus(player.status);
    setCost(player.cost);
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const selectedPlayer = players[selectedIndex];

    const updatedInfo = {
      teamId: team._id,
      playerName: selectedPlayer.name,
      updatedPosition: position,
      updatedStatus: status,
      updatedCost: cost,
      view, // roster or farm
    };

    if (!selectedPlayer.name || !position || !status || !cost) {
        alert("Please fill in all fields");
        return;
    }

    if (cost > oldCost && (cost <= 0 || cost > maxNextCost)) {
      alert(`Cost must be between 1 and ${maxNextCost}`);
      return;
    }

    try {
      await axios.post("/updateTeam", updatedInfo);

      if (onSave) {
        onSave(updatedInfo);
      }
    } catch (err) {
      console.error("Failed to update team:", err);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>Edit {view === "roster" ? "Roster" : "Farm Players"} for {team.teamName}</h2>

      <div className="form-row">
        <label>Select Player: </label>
        <select className="form-select" value={selectedIndex} onChange={handlePlayerChange}>
          {players.map((player, index) => (
            <option key={index} value={index}>
              {player.name} - {player.position}
            </option>
          ))}
        </select>
      </div>

      <div className="form-row">
        <label>Position: </label>
        <select className="form-select" value={position} onChange={(e) => setPosition(e.target.value)}>
          <option value="">Select a Position:</option>
          {availablePositions.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </div>

      <div className="form-row">
        <label>Status: </label>
        <input
          className="form-input"
          type="text"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          placeholder="Status"
        />
      </div>

      <div className="form-row">
        <label>Cost: </label>
        <input
          className="form-input"
          type="number"
          value={cost}
          onChange={(e) => setCost(e.target.value)}
          placeholder="Cost"
        />
      </div>
      <div className="form-button-group">
          <button className="form-buttom" type="button" onClick={onCancel}>
            Cancel
          </button>
          <button className="form-buttom" type="submit">
            Save
          </button>
      </div>
    </form>
  );
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
