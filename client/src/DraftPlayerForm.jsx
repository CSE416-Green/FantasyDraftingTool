import axios from "axios";
import { useState } from "react";


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
export default function DraftPlayerForm({ teamName, onDraft, onCancel, playerPool=fakePool }) {

    // for now the [playerPool] only has name and position
    const [selectedPlayer, setSelectedPlayer] = useState("");
    const [position, setPosition] = useState("");
    const [cost, setCost] = useState("");
    const [status, setStatus] = useState("--");


    async function handleSubmit(e) {
        e.preventDefault();

        const draftedPlayer = {
            teamName: teamName,
            name: selectedPlayer,
            position,
            cost,
            status,
        };

        // add the player to the [teamName] through server
        try{
            await axios.post("/draftPlayer", draftedPlayer);
            if(onDraft) {
                onDraft(draftedPlayer);
            }
        } catch (err) {
            console.error("Failed to draft player:", err);
        }
    }

    return (
        <form onSubmit={handleSubmit}>
            <h2>Draft Player for {teamName}</h2>

            <div className="form-row">
                <label>Select Player:</label>
                <select className="form-select" value={selectedPlayer} onChange={(e) => setSelectedPlayer(e.target.value)}>
                    <option value="">Select a player:</option>
                    {playerPool.map((player, index) => (
                        <option key={index} value={player.name}>
                            {player.name} | {player.position.join(" ")}
                        </option>
                    ))}
                </select>
            </div>

            <div className="form-row">
                <label>Position:</label>
                <select className="form-select" value={position} onChange={(e) => setPosition(e.target.value)}>
                    <option value="">Select a position:</option>
                    {selectedPlayer && playerPool
                        .find(p => p.name === selectedPlayer)?.position
                        .map((pos, index) => (
                            <option key={index} value={pos}>{pos}</option>
                        ))}
                </select>
            </div>

            <div className="form-row">
                <label>Cost:</label>
                <input className="form-input" type="number" value={cost} onChange={(e) => setCost(e.target.value)} />
            </div>

            <div className="form-row">
                <label>Status:</label>
                <input className="form-input" type="text" value={status} onChange={(e) => setStatus(e.target.value)} />
            </div>

            <button className="form-buttom" type="button" onClick={onCancel}>
                Cancel
            </button>
            <button className="form-buttom" type="submit">
                Save
            </button>
        </form>
    )
}

