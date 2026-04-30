import axios from "axios";
import { useEffect, useState } from "react";
import '../../css/compete.css';

export default function WeeklyResult({ leagueId }) {

    const [history, setHistory] = useState([]);
    const [openCategory, setOpenCategory] = useState(false);

    useEffect(() => {
        async function fetchHistory() {
        try {
            if (!leagueId) return;

            const res = await axios.post(
            "/compete/getHistory",
            { leagueId }
            );

            const sorted = res.data.results.sort(
                (a, b) => new Date(a.StartDate) - new Date(b.StartDate)
            );

            setHistory(sorted || []);
        } catch (err) {
            console.error("Failed to fetch history:", err.response?.data || err.message);
        }
        }

        fetchHistory();
    }, [leagueId]);


    const teamTotals = history.reduce((acc, week) => {
        week.Scores?.forEach(team => {
            if (!acc[team.TeamName]) {
            acc[team.TeamName] = 0;
            }
            acc[team.TeamName] += team.Points;
        });
        return acc;
    }, {});

    const teamTotalsSorted = Object.entries(teamTotals)
        .map(([TeamName, totalPoints]) => ({
            TeamName,
            totalPoints,
        }))
        .sort((a, b) => b.totalPoints - a.totalPoints);

    return (
    <div className="compete-card">
      <button
        className="detail-buttom"
        onClick={() => setOpenCategory(!openCategory)}
      >
        {openCategory ? "Hide Details" : "Show Details"}
      </button>

        <h2>League Standings</h2>
        {teamTotalsSorted.map((team) => (
        <div key={team.TeamName} className="team-result">
            <div className="team-header">
                <span className="team-name">{team.TeamName}</span>
                <span className="team-score">{team.totalPoints} pts</span>
            </div>
        </div>
        
        ))}
      {history.map((week, index) => (
        <div key={week._id || index} className="weekly-result">
            <h3>
            Week of {" "}
            {new Date(week.StartDate).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
            })}
            {" "}-{" "}
            {new Date(week.EndDate).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
            })}
            </h3>

            {week.Scores?.map((team) => (
            <div key={team._id} className="team-result">
                <div className="team-header">
                <span className="team-name">{team.TeamName}</span>
                <span className="team-score">{team.Points} pts</span>
                </div>

                {openCategory && (
                <ul className="category-list">
                    {Object.entries(team.CategoryPoints || {}).map(
                    ([category, points]) => (
                        <li key={category}>
                        {category}: {points}
                        </li>
                    )
                    )}
                </ul>
                )}
            </div>
            ))}
        </div>
        ))}
    </div>
  );
}