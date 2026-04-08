import { useMemo, useState, useEffect } from "react";
import axios from "axios";

export default function TradePlayersForm({ teams, currentTeamName, onCancel, onTrade }) {
    const [fromTeamName, setFromTeamName] = useState(currentTeamName || "");
    const [toTeamName, setToTeamName] = useState("");

    const [fromView, setFromView] = useState("roster");
    const [toView, setToView] = useState("roster");

    useEffect(() => {
        if (teams.length > 0 && !toTeamName) {
            const otherTeam = teams.find(t => t.teamName !== fromTeamName);
            if (otherTeam) {
                setToTeamName(otherTeam.teamName);
            }
        }
    }, [teams, fromTeamName]);
  
    const fromTeam = useMemo(
        () => teams.find((t) => t.teamName === fromTeamName),
        [teams, fromTeamName]
    );

    const toTeam = useMemo(
        () => teams.find((t) => t.teamName === toTeamName),
        [teams, toTeamName]
    );

    const fromPlayers = useMemo(() => {
        if (!fromTeam) return [];
        return fromView === "roster" ? fromTeam.rosterPlayers : fromTeam.farmPlayers;
    }, [fromTeam, fromView]);

    const toPlayers = useMemo(() => {
        if (!toTeam) return [];
        return toView === "roster" ? toTeam.rosterPlayers : toTeam.farmPlayers;
    }, [toTeam, toView]);

    const [fromPlayerName, setFromPlayerName] = useState("");
    const [toPlayerName, setToPlayerName] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    const submitTrade = async (e) => {
        e.preventDefault();
        setErrorMessage("");

    if (
        !fromTeamName ||
        !toTeamName ||
        !fromPlayerName ||
        !toPlayerName ||
        !fromView ||
        !toView
    ) {
        setErrorMessage("Please fill out all fields.");
        return;
    }

    if (fromTeamName === toTeamName) {
        setErrorMessage("Please choose two different teams.");
        return;
    }

    try {
        await axios.post("/tradePlayers", {
            fromTeamName,
            toTeamName,
            fromPlayerName,
            toPlayerName,
            fromView,
            toView
        });

        if (onTrade) {
            await onTrade();
        }
    } catch (error) {
        console.error("Trade failed:", error);
        setErrorMessage(
            error?.response?.data?.error || "Trade failed. Please try again."
        );
    }
  };

  return (
    <form onSubmit={submitTrade} className="edit-form">
      <h3>Trade Players</h3>

      <div>
        <label>From Team</label>
        <select
          value={fromTeamName}
          onChange={(e) => {
            setFromTeamName(e.target.value);
            setFromPlayerName("");
          }}
        >
          <option value="">Select Team</option>
          {teams.map((team) => (
            <option key={team.teamName} value={team.teamName}>
              {team.teamName}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label>From Team Section</label>
        <select
          value={fromView}
          onChange={(e) => {
            setFromView(e.target.value);
            setFromPlayerName("");
          }}
        >
          <option value="roster">Roster</option>
          <option value="farm">Farm</option>
        </select>
      </div>

      <div>
        <label>Player From First Team</label>
        <select
          value={fromPlayerName}
          onChange={(e) => setFromPlayerName(e.target.value)}
        >
          <option value="">Select Player</option>
          {fromPlayers.map((player, index) => (
            <option key={`${player.name}-${index}`} value={player.name}>
              {player.name} ({player.position})
            </option>
          ))}
        </select>
      </div>

      <div>
        <label>To Team</label>
        <select
          value={toTeamName}
          onChange={(e) => {
            setToTeamName(e.target.value);
            setToPlayerName("");
          }}
        >
          <option value="">Select Team</option>
          {teams.map((team) => (
            <option key={team.teamName} value={team.teamName}>
              {team.teamName}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label>To Team Section</label>
        <select
          value={toView}
          onChange={(e) => {
            setToView(e.target.value);
            setToPlayerName("");
          }}
        >
          <option value="roster">Roster</option>
          <option value="farm">Farm</option>
        </select>
      </div>

      <div>
        <label>Player From Second Team</label>
        <select
          value={toPlayerName}
          onChange={(e) => setToPlayerName(e.target.value)}
        >
          <option value="">Select Player</option>
          {toPlayers.map((player, index) => (
            <option key={`${player.name}-${index}`} value={player.name}>
              {player.name} ({player.position})
            </option>
          ))}
        </select>
      </div>

      {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}

      <div className="form-button-group">
        <button className="form-buttom" type="submit">
          Confirm Trade
        </button>
        <button className="form-buttom" type="button" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}