import axios from "axios";
import { useState, useEffect } from "react";
import RecommendedSalary from './RecommendedSalary';

// desired format
// name: string
// position: string array
const fakePool = [
    {name: "Shohei Ohtani", position: ["P", "U", "GOAT"]},
    {name: "Juan Soto", position: ["OF"]},
    {name: "Kyle Tucker", position: ["OF"]},
    {name: "Fernando Tatis Jr.", position: ["OF"]},
    {name: "Francisco Lindor", position: ["SS"]},
    {name: "Trea Turner", position: ["SS"]},
    {name: "Corbin Carroll", position: ["OF"]},
    {name: "Elly De La Cruz", position: ["SS"]},
    {name: "Ketel Marte", position: ["2B"]},
    {name: "Luis Robert", position: ["OF"]},
    {name: "Oneil Cruz", position: ["OF"]},
    {name: "Kyle Schwarber", position: ["DH"]},
    {name: "Paul Skenes", position: ["P"]},
    {name: "Yoshinobu Yamamoto", position: ["P"]},
    {name: "Tarik Skubal", position: ["P"]},
]
export default function DraftPlayerForm({ 
    team, 
    onDraft, 
    onCancel, 
    playerPool, 
    maxNextCost, 
    leagueName, 
    year, 
    teams, 
    leagueId,
    setDraftHistory,
    draftedNames,
    remainingSpots}) {
    // for now the [playerPool] only has name and position
    const [selectedPlayer, setSelectedPlayer] = useState("");
    const [position, setPosition] = useState("");
    const [cost, setCost] = useState("");
    const [status, setStatus] = useState("");
    const [broughtupby, setBroughtupby] = useState("");

    const fullPlayer = playerPool.find(p => p.name === selectedPlayer);

    async function handleSubmit(e) {
        e.preventDefault();


        const draftedPlayer = {
            teamId: team._id,
            name: selectedPlayer,
            position,
            cost,
            status,
            broughtupby
        };

        if (!selectedPlayer || !position || !cost || !status || !broughtupby) {
            alert("Please fill in all fields");
            return;
        };

        if (cost <= 0 || cost > maxNextCost) {
            alert(`Cost must be between 1 and ${maxNextCost}`);
            return;
        }

        const availablePositions = getAvailablePositions(team.rosterPlayers);

        if (!availablePositions.includes(position)) {
            alert(`Your team already has a player at position ${position}. You may not draft another player at this position.`);
            return;
        }

        // add the player to the [teamName] through server
        try{
            await axios.post("/draftPlayer", draftedPlayer);
            if(onDraft) {
                onDraft(draftedPlayer);
            }
        } catch (err) {
            console.error("Failed to draft player:", err);
        }

        // also update the draft history
        try {
            const res = await axios.post("/draftHistory/addPlayer", {
                leagueId: leagueId,
                year: year,
                playerName: selectedPlayer,
                cost: cost,
                teamName: team.teamName,
                position: position,
                broughtupby: broughtupby
            });
            // update draft history in TeamRoster
            // server res.json({ message: "Player added to draft history successfully!", history });
            setDraftHistory(res.data.history.DraftedPlayers);
        } catch (err) {
            console.error("Failed to update draft history:", err);
        }
    }

    return (
        <form onSubmit={handleSubmit}>
            <h2>Draft Player for <u>{team.teamName}</u></h2>

            <div className="form-row">
                <label>Brought up by:</label>
                <select
                    className="form-select"
                    value={broughtupby}
                    onChange={(e) => setBroughtupby(e.target.value)}
                >
                    <option value="">Select a Team:</option>
                    {teams.map((t, index) => (
                        <option key={index} value={t.teamName}>
                            {t.teamName}
                        </option>
                    ))}
                </select>
            </div>

            <div className="form-row">
                <label>Select Player:</label>
                <input
                    list="players"
                    value={selectedPlayer}
                    onChange={(e) => setSelectedPlayer(e.target.value)}
                    className="form-select"
                    placeholder="Type to Search"
                />
                <datalist id="players">
                    {playerPool.filter(p => !draftedNames.includes(p.name))
                        .map((player, index) => (
                        <option key={index} value={player.name}>
                        {player.position.join(" ")}
                        </option>
                    ))}
                </datalist>
            </div>
            
            <div className="form-row">
                {fullPlayer && (
                    <RecommendedSalary
                        player={fullPlayer}
                        maxNextCost={maxNextCost}
                        remainingSpots={remainingSpots}
                    />
                )}
            </div>

            <div className="form-row">
                <label>Position:</label>
                <select className="form-select" value={position} onChange={(e) => setPosition(e.target.value)}>
                    <option value="">Select a Position:</option>
                    {selectedPlayer && playerPool && (() => {
                        const playerPositions = playerPool.find(p => p.name === selectedPlayer)?.position || [];

                        const primaryPosition = playerPositions[0];
                        const allPositions = positionDictionary[primaryPosition] || [];

                        return allPositions.map((pos, index) => (
                        <option key={index} value={pos}>
                            {pos}
                        </option>
                        ));
                    })()}
                </select>
            </div>

            <div className="form-row">
                <label>Cost:</label>
                <input 
                    className="form-input"
                    type="number"
                    value={cost}
                    placeholder="Cost"
                    onChange={(e) => setCost(e.target.value)}
                />
            </div>

            <div className="form-row">
                <label>Status:</label>
                <input className="form-input" type="text" placeholder="Status" value={status} onChange={(e) => setStatus(e.target.value)} />
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

// dictionary for position
const positionDictionary = {
    "C": ["C", "DH", "U"],
    "1B": ["1B", "CI", "U"],
    "3B": ["3B", "CI", "U"],
    "CI": ["1B", "3B", "CI", "U"],
    "2B": ["2B", "MI", "U"],
    "SS": ["SS", "MI", "U"],
    "MI": ["2B", "SS", "MI", "U"],
    "OF": ["OF", "U"],
    "RF": ["OF", "U"],
    "CF": ["OF", "U"],
    "LF": ["OF", "U"],
    "DH": ["U"],
    "TWP": ["P", "U"]
}