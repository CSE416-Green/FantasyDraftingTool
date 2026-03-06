import axios from "axios";
import { useState } from "react";

export default function EditRosterForm({ team, view = "roster", onSave, onCancel }) {
  const POSITION_OPTIONS = [
    "C",
    "1B", "2B", "3B", "SS", "MI", "CI",
    "OF",
    "U",
    "P"
  ];

  const players = view === "roster" ? team.rosterPlayers : team.farmPlayers;

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [position, setPosition] = useState(players[0]?.position || "");
  const [status, setStatus] = useState(players[0]?.status || "");
  const [cost, setCost] = useState(players[0]?.cost || "");

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
      teamName: team.teamName,
      playerName: selectedPlayer.name,
      updatedPosition: position,
      updatedStatus: status,
      updatedCost: cost,
      view, // roster or farm
    };

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
          {POSITION_OPTIONS.map((p) => (
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

      <button className="form-buttom" type="button" onClick={onCancel}>
        Cancel
      </button>
      <button className="form-buttom" type="submit">
        Save
      </button>
    </form>
  );
}