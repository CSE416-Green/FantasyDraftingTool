import { useMemo, useState, useEffect } from "react";
import axios from "axios";

export default function TradePlayersForm({ teams, currentTeamId, onCancel, onTrade }) {
    const [fromTeamId, setFromTeamId] = useState(currentTeamId || "");
    const [toTeamId, setToTeamId] = useState("");

    const [fromView, setFromView] = useState("roster");
    const [toView, setToView] = useState("roster");

    useEffect(() => {
    if (teams.length > 0 && !toTeamId) {
        const otherTeam = teams.find(t => t._id !== fromTeamId);
        if (otherTeam) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setToTeamId(otherTeam._id);
        }
    }
}, [teams, fromTeamId, toTeamId]);
  
    const fromTeam = useMemo(
        () => teams.find((t) => t._id === fromTeamId),
        [teams, fromTeamId]
    );

    const toTeam = useMemo(
        () => teams.find((t) => t._id === toTeamId),
        [teams, toTeamId]
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
        !fromTeamId ||
        !toTeamId ||
        !fromPlayerName ||
        !toPlayerName ||
        !fromView ||
        !toView
    ) {
        setErrorMessage("Please fill out all fields.");
        return;
    }

    if (fromTeamId === toTeamId) {
        setErrorMessage("Please choose two different teams.");
        return;
    }

    try {
        await axios.post("/tradePlayers", {
            fromTeamId,
            toTeamId,
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
      <h2>Trade Players</h2>

      <div className="form-row">
        <label>From Team</label>
        <select
          className="form-select"
          value={fromTeamId}
          onChange={(e) => {
            setFromTeamId(e.target.value);
            setFromPlayerName("");
          }}
        >
          <option value="">Select Team</option>
          {teams.map((team) => (
            <option key={team._id} value={team._id}>
              {team.teamName}
            </option>
          ))}
        </select>
      </div>

      <div className="form-row">
        <label>From Team Section</label>
        <select
          className="form-select"
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

      <div className="form-row">
        <label>Player From First Team</label>
        <select
          className="form-select"
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

      <div className="form-row">
        <label>To Team</label>
        <select
          className="form-select"
          value={toTeamId}
          onChange={(e) => {
            setToTeamId(e.target.value);
            setToPlayerName("");
          }}
        >
          <option value="">Select Team</option>
          {teams.map((team) => (
            <option key={team._id} value={team._id}>
              {team.teamName}
            </option>
          ))}
        </select>
      </div>

      <div className="form-row">
        <label>To Team Section</label>
        <select
          className="form-select"
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

      <div className="form-row">
        <label>Player From Second Team</label>
        <select
          className="form-select"
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