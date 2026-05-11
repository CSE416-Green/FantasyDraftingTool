import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { convertToTeams } from "./convertToTeams";
import '../../css/compete.css';


export function Compete({ teamsData, startDate, endDate, leagueId }) {
    const [game, setGame] = useState(null);
    const [openCategory, setOpenCategory] = useState(false);

    useEffect(() => {
        if (!teamsData || teamsData.length === 0) return;

        setGame(null);

        async function fetchGame() {
        try {
        if (!teamsData || !startDate || !endDate || !leagueId) return;

        function formattedDate(date) {
            return new Date(date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            });
        }

        const cacheKey = `compete-${leagueId}-${formattedDate(startDate)}-${formattedDate(endDate)}`;
        const cached = sessionStorage.getItem(cacheKey);

        if (cached) {
            const parsed = JSON.parse(cached);
            const TWELVE_HOURS = 12 * 60 * 60 * 1000;

            if (Date.now() - parsed.timestamp < TWELVE_HOURS) {
            setGame(parsed.data);
            return;
            }
        }

        const teams = convertToTeams(teamsData);

        const res = await axios.post(
            "https://fantasydraftingtool.onrender.com/compete/teams",
            { leagueId, teams, startDate, endDate }
        );

        setGame(res.data);

        sessionStorage.setItem(
            cacheKey,
            JSON.stringify({
            timestamp: Date.now(),
            data: res.data,
            })
        );
        } catch (err) {
        console.error("Failed to fetch game:", err);
        }
    }

    fetchGame();
    }, [teamsData, startDate, endDate, leagueId]);

    if (!game) return (<div className="compete-card"> <h2>Loading ...</h2> </div>);


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