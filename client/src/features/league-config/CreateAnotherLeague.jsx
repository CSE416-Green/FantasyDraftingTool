import { useState } from "react"; 
import axios from "axios";

const ALL_HITTER_STATS = ["AB", "R", "H", "Doubles", "Triples", "HR", "RBI", "BB", "K", "SB", "AVG", "OBP", "SLG"];
const ALL_PITCHER_STATS = ["IP", "W", "SV", "K", "BB", "ERA", "WHIP"];


export default function CreateAnotherLeague({ userId }) {
  const [hitterStats, setHitterStats] = useState([...ALL_HITTER_STATS]);
  const [pitcherStats, setPitcherStats] = useState([...ALL_PITCHER_STATS]);

  //toggle on/off stats in table
  function toggleStats(stat, list, setList) {
    if (list.includes(stat)) {
      setList(list.filter(s => s !== stat));
    } else {
      setList([...list, stat]);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const leagueName = formData.get("leagueName");
    const year = formData.get("year");
    const teamName = formData.get("teamName");

    try {
      const res = await axios.post("/createLeague", {
        leagueName,
        year,
        userId,
        teamName,
        hitterStats,
        pitcherStats,
      });

      const updatedUser = res.data.user;

      localStorage.setItem("user", JSON.stringify(updatedUser));

      alert("Successfully created league!");
      e.target.reset();

      window.location.reload();
    } catch (err) {
      console.error("Failed to create league:", err);
      alert(err.response?.data?.message || "Failed to create league. Please try again.");
    }
  }

  return (
    <div className="form-wrap">
      <h2 className="form-header">Create Another League</h2>

      <form onSubmit={handleSubmit}>
        <div className="form-field">
          <label>League Name: </label>
          <input
            type="text"
            className="form-input"
            name="leagueName"
            required
          />
        </div>

        <div className="form-field">
          <label>Year: </label>
          <input
            type="number"
            className="form-input"
            name="year"
            required
          />
        </div>

        <div className="form-field">
          <label>Your Team Name: </label>
          <input
            type="text"
            className="form-input"
            name="teamName"
            required
          />
        </div>

        <div style={{ display: "flex", alignItems: "flex-start", gap: "30px", marginBottom: "10px" }}>
          <h4 style={{ margin: 0, whiteSpace: "nowrap", paddingTop: "2px", minWidth: "100px" }}>Hitter Stats:</h4>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
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
        <div style={{ display: "flex", alignItems: "flex-start", gap: "8px", marginBottom: "10px" }}>
            <h4 style={{ margin: 0, whiteSpace: "nowrap", paddingTop: "2px", minWidth: "100px" }}>Pitcher Stats:</h4>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                {ALL_PITCHER_STATS.map(stat => (
                    <label key={stat} style={{ display: "flex", alignItems: "center", gap: "4px" }}>
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

        <div className="form-button-group">
          <button className="form-buttom" type="button">
            Cancel
          </button>
          <button className="form-buttom" type="submit">
            Create League
          </button>
        </div>
      </form>
    </div>
  );
}