import axios from "axios";
import { useState, useEffect } from "react";
// css
import "../../css/mainPage.css";


const fakeHistory = [
    {'name': "Loading...", 'order': "1", 'team': "-", 'cost': "-"}

];


export default function DraftHistory({leagueName, year, leagueId, history}) {

  return (
    <div className="historyWrapper">
      <h2>Draft History</h2>
      <table>
        <thead>
          <tr>
            <th className="history-th">Pick</th>
            <th className="history-th">Brought up by</th>
            <th className="history-th">Player</th>
            <th className="history-th">MLB Team</th>
            <th className="history-th">Position</th>
            <th className="history-th">Team</th>
            <th className="history-th">Salary</th>
          </tr>
        </thead>
        <tbody>
          {history.map((p) => (
            <tr key={p.Pick}>
              <td className="history-td">{p.Pick}</td>
              <td className="history-td">{p.BroughtUpBy}</td>
              <td className="history-td">{p.PlayerName}</td>
              <td className="history-td">{p.MLBTeam}</td>
              <td className="history-td">{p.Position}</td>
              <td className="history-td">{p.TeamName}</td>
              <td className="history-td">${p.Cost}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}