import axios from "axios";
import { useState, useEffect } from "react";

export default function LeagueConfiguration({ leagueId, teams = [], loadTeams }) {
  const [teamInputs, setTeamInputs] = useState([]);

  useEffect(() => { // initial form
    setTeamInputs(
      teams.map((team) => ({
        _id: team._id,
        teamName: team.teamName || "",
      }))
    );
  }, [teams]);

  function handleTeamNameChange(index, value) {
    setTeamInputs((prev) =>
      prev.map((team, i) =>
        i === index ? { ...team, teamName: value } : team
      )
    );
  }

  function handleAddTeam() {
    setTeamInputs((prev) => [
      ...prev,
      {
        _id: null,
        teamName: "",
      },
    ]);
  }

  function handleDeleteTeam(index) {
    setTeamInputs((prev) => prev.filter((_, i) => i !== index));
  }

  function handleReset() {
    setTeamInputs(
        teams.map((team) => ({
        _id: team._id,
        teamName: team.teamName || "",
        }))
    );
    }

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      await axios.post("/settings/league/teams", {
        leagueId,
        teams: teamInputs.map((team) => ({
          _id: team._id,
          teamName: team.teamName,
        })),
      });

      if (loadTeams) {
        loadTeams();
      }
      alert("League teams updated successfully!");
    } catch (err) {
      console.error("Error saving teams:", err);
      alert(
        err.response?.data?.error ||
        "Failed to update league teams."
        );
    }
  }

  return (
    <div className="form-wrap">
      <h2 className="form-header">League Teams Configuration</h2>

      <form onSubmit={handleSubmit}>
        <div className="form-field">
            <h3>Edit team names, add, or delete teams</h3>
            <p>Number of Teams: {teamInputs.length}</p>
        </div>

        {teamInputs.map((team, index) => (
            <div className="SettingsForm" key={team._id || index}>
                <div className="form-field">
                    <label>Team {index + 1}:</label>

                    <input
                    type="text"
                    className="form-input"
                    value={team.teamName}
                    onChange={(e) => handleTeamNameChange(index, e.target.value)}
                    placeholder="Enter team name"
                    />
                </div>

                <button
                className="form-buttom"
                type="button"
                onClick={() => handleDeleteTeam(index)}
                >
                Delete This Team
                </button>
            </div>
        ))}

        <div className="form-button-group">
            <button
                className="form-buttom"
                type="button"
                onClick={handleAddTeam}
            >
                Add a Team
            </button>

            <button className="form-buttom" type="submit">
                Save
            </button>
            <button
                className="form-buttom"
                type="button"
                onClick={handleReset}
                >
                Reset Changes
            </button>
        </div>
      </form>
    </div>
  );
}