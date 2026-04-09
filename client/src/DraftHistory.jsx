import axios from "axios";
import { useState, useEffect } from "react";
// css
import './css/mainPage.css';


const fakeHistory = [
    {'name': "Loading...", 'order': "1", 'team': "-", 'cost': "-"}

];


export default function DraftHistory({leagueName, year}) {
  const [history, setHistory] = useState(fakeHistory);



    const fetchHistory = async () => {
      try {
        const res = await axios.get(`/draftHistory/${leagueName}/${year}` );

        const data = res.data.DraftedPlayers.map((p) => ({
          name: p.PlayerName,
          order: p.Pick,
          team: p.TeamName,
          cost: p.Cost,
          broughtupby: p.BroughtUpBy,
          position: p.Position
        }));

        setHistory(data);

    } catch (err) {
        console.error("Failed to fetch draft history:", err);
      }
    };

  useEffect(() => {
    fetchHistory();
  }, []);

  return (
    <div className="historyWrapper">
      <h2>Draft History</h2>
      <button onClick={fetchHistory} className="form-buttom">
        Refresh History
      </button>
      <table>
        <thead>
          <tr>
            <th className="history-th">Pick</th>
            <th className="history-th">Brought up by</th>
            <th className="history-th">Player</th>
            <th className="history-th">Position</th>
            <th className="history-th">Team</th>
            <th className="history-th">Salary</th>
          </tr>
        </thead>
        <tbody>
          {history.map((p) => (
            <tr key={p.order}>
              <td className="history-td">{p.order}</td>
              <td className="history-td">{p.broughtupby}</td>
              <td className="history-td">{p.name}</td>
              <td className="history-td">{p.position}</td>
              <td className="history-td">{p.team}</td>
              <td className="history-td">${p.cost}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}