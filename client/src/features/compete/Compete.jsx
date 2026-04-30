import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { convertToTeams } from "./convertToTeams";
import '../../css/compete.css';


export function Compete({ teamsData, startDate, endDate, leagueId }) {
    const [game, setGame] = useState(null);
    const [openCategory, setOpenCategory] = useState(false);

    useEffect(() => {
        if (!teamsData || teamsData.length === 0) return;

        async function fetchGame() {
        try {
            if (!teamsData || !startDate || !endDate || !leagueId) {
                return;
            }

            const teams = convertToTeams(teamsData);

            const res = await axios.post(
                // "/compete/teams",
            "https://fantasydraftingtool.onrender.com/compete/teams", 
            { leagueId, teams, startDate, endDate});

            setGame(res.data);
        } catch (err) {
            console.error("Failed to fetch game:", err);
        }
        }

        fetchGame();
    }, [teamsData, startDate, endDate]);

    if (!game) return (<div> Loading ... </div>);


    return (
    <div className="compete-card">

        <button
            className="detail-buttom"
            onClick={() => setOpenCategory(!openCategory)}
        >
            {openCategory ? "Hide Details" : "Show Details"}
        </button>

        {game.standings?.map((team) => (
            <div key={team.teamID} className="team-result">
            
            <div className="team-header">
                <span className="team-name">{team.teamName}</span>
                <span className="team-score">{team.score} pts</span>
            </div>

            {openCategory && (
                <ul className="category-list">
                {Object.entries(team.categoryPoints).map(([category, points]) => (
                    <li key={category}>
                    {category}: {points}
                    </li>
                ))}
                </ul>
            )}

            </div>
        ))}
    </div>
    );
}

export function CompeteAddHistory({ teamsData, startDate, endDate, leagueId }) {
  const [game, setGame] = useState(null);
  const hasRun = useRef(false); // do not trigger a re render when changed

  useEffect(() => {
    async function fetchGame() {
      if (hasRun.current) return;
      if (!teamsData || teamsData.length === 0) return;
      if (!startDate || !endDate || !leagueId) return;

      hasRun.current = true;

      try {
        const teams = convertToTeams(teamsData);

        const res = await axios.post(
            // "/compete/teams/addHistory", 
            "https://fantasydraftingtool.onrender.com/compete/teams/addHistory", 
            {
          leagueId,
          teams,
          startDate,
          endDate,
        });

        setGame(res.data);
      } catch (err) {
        console.error(
          "Failed to add history:",
          err.response?.data || err.message
        );
      }
    }

    fetchGame();
  }, [teamsData, startDate, endDate, leagueId]);

  return null;
}