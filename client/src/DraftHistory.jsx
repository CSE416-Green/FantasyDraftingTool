import axios from "axios";
import { useState, useEffect } from "react";



const fakeHistory = [
    {'name': "Loading...", 'order': "-", 'team': "-", 'cost': "-"}

];


export default function DraftHistory() {
  const [history, setHistory] = useState(fakeHistory);

  const leagueName = "LeagueNo1";
  const year = 2025;

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await axios.get(`/draftHistory/${leagueName}/${year}` );

        const data = res.data.DraftedPlayers.map((p) => ({
          name: p.PlayerName,
          order: p.Pick,
          team: p.TeamName,
          cost: p.Cost
        }));

        setHistory(data);

    } catch (err) {
        console.error("Failed to fetch draft history:", err);
      }
    };

    fetchHistory();
  }, []);

  return (
    <div className="historyWrapper">
      <h2>Draft History</h2>
      <table>
        <thead>
          <tr>
            <th>Pick</th>
            <th>Player</th>
            <th>Team</th>
            <th>Salary</th>
          </tr>
        </thead>
        <tbody>
          {history.map((p) => (
            <tr key={p.order}>
              <td>{p.order}</td>
              <td>{p.name}</td>
              <td>{p.team}</td>
              <td>{p.cost}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}