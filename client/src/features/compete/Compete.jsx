import axios from "axios";
import { useEffect, useState, useMemo } from "react";
import { convertToTwoTeams } from "./convertToTwoTeams";
import '../../css/compete.css';


export default function Compete({ team1, team2, startDate, endDate }) {
    const [game, setGame] = useState(null);

    useEffect(() => {
    if (!team1 || !team2) return;
    async function fetchGame() {
        const twoTeams = convertToTwoTeams(team1, team2);
        const res = await axios.post("/compete/teams", {
            teams: twoTeams,
            startDate,
            endDate
        });
        setGame(res.data);
    }

    fetchGame();
    }, [team1, team2]);

    if (!game) return (<div>{team1.teamName} vs.{team2.teamName} </div>);
    let title = "";
    if (game.team1Score > game.team2Score) title = `${team1.teamName} wins`
    else if (game.team1Score < game.team2Score) title = `${team2.teamName} wins`
    else title = "Tie"

    const team1Wins = game.team1Score > game.team2Score;
    const team2Wins = game.team2Score > game.team1Score;

    return (
    <div className="compete-card">
            <div className="team">
                <div className={`team ${team1Wins ? "winner" : ""}`}>
                    <h3>{team1.teamName}</h3>
                    <h2>{game.team1Score}</h2>
                </div>
            </div>

            <div className="vs">VS</div>
            <div className="team">
                <div className={`team ${team2Wins ? "winner" : ""}`}>
                    <h3>{team2.teamName}</h3>
                    <h2>{game.team2Score}</h2>
                </div>
                
            </div>
    </div>
    );
}
