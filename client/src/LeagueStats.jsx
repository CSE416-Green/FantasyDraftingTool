import { useState } from "react";
import axios from "axios";

const ALL_STATS = ["AB", "R", "H", "1B", "2B", "3B", "HR", "RBI", "BB", "K", "SB", "CS", "AVG", "OBP", "SLG", "FPTS"];

export default function LeagueStats() {
  const [selectedStats, setSelectedStats] = useState(ALL_STATS);

  function toggleStat(stat) {
    setSelectedStats(prev =>
      prev.includes(stat) ? prev.filter(s => s !== stat) : [...prev, stat]
    );
  }

  function handleSubmit(e) {
    e.preventDefault();
    axios.post("/settings/stats", { stats: selectedStats })
      .then(res => console.log("Stats saved!", res.data))
      .catch(err => console.error("Error:", err));
  }

  return (
    <div className="form-wrap">
      <h2 className="form-header">League Stats</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-field">
          <label>Select stat columns to display:</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", marginTop: "12px" }}>
            {ALL_STATS.map(stat => (
              <label key={stat} style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={selectedStats.includes(stat)}
                  onChange={() => toggleStat(stat)}
                />
                {stat}
              </label>
            ))}
          </div>
        </div>
        <div className="form-button-group">
          <button className="form-buttom" type="button" onClick={() => setSelectedStats(ALL_STATS)}>Reset</button>
          <button className="form-buttom" type="submit">Save</button>
        </div>
      </form>
    </div>
  );
}