import axios from "axios";
import { useEffect, useState, useMemo } from "react";
import EditRosterForm from "./EditRosterForm";
axios.defaults.baseURL = "http://localhost:3000";

// these sample tables are AI generated
const rosterPlayers_Team1 = [
  { position: "C", name: "JJust Team 1", status: "--", cost: "10" },
  { position: "C", name: "Just Team 1", status: "--", cost: "11" },
  { position: "1B", name: "Player 3", status: "--", cost: "5" },
  { position: "3B", name: "Player 4", status: "--", cost: "7" },
  { position: "CI", name: "Player 5", status: "--", cost: "8" },
  { position: "2B", name: "Player 6", status: "--", cost: "10" },
  { position: "SS", name: "Player 7", status: "--", cost: "9" },
  { position: "MI", name: "Player 8", status: "--", cost: "7" },
  { position: "OF", name: "Player 9", status: "--", cost: "3" },
  { position: "OF", name: "Player 10", status: "--", cost: "4" },
  { position: "OF", name: "Player 11", status: "--", cost: "8" },
  { position: "OF", name: "Player 12", status: "--", cost: "5" },
  { position: "OF", name: "Player 13", status: "--", cost: "10" },
  { position: "U", name: "Player 14", status: "--", cost: "8" },
  { position: "P", name: "Player 15", status: "--", cost: "6" },
  { position: "P", name: "Player 16", status: "--", cost: "5" },
  { position: "P", name: "Player 17", status: "--", cost: "5" },
  { position: "P", name: "Player 18", status: "--", cost: "3" },
  { position: "P", name: "Player 19", status: "--", cost: "8" },
  { position: "P", name: "Player 20", status: "--", cost: "9" },
  { position: "P", name: "Player 21", status: "--", cost: "4" },
  { position: "P", name: "Player 22", status: "--", cost: "5" },
  { position: "P", name: "Player 23", status: "--", cost: "7" },
];

const rosterPlayers_Team2 = [
  { position: "C", name: "Just Team 2", status: "--", cost: "7" },
  { position: "C", name: "Just Team 2", status: "--", cost: "3" },
  { position: "1B", name: "Player 3", status: "--", cost: "5" },
  { position: "3B", name: "Player 4", status: "--", cost: "7" },
  { position: "CI", name: "Player 5", status: "--", cost: "8" },
  { position: "2B", name: "Player 6", status: "--", cost: "10" },
  { position: "SS", name: "Player 7", status: "--", cost: "9" },
  { position: "MI", name: "Player 8", status: "--", cost: "7" },
  { position: "OF", name: "Player 9", status: "--", cost: "3" },
  { position: "OF", name: "Player 10", status: "--", cost: "4" },
  { position: "OF", name: "Player 11", status: "--", cost: "8" },
  { position: "OF", name: "Player 12", status: "--", cost: "5" },
  { position: "OF", name: "Player 13", status: "--", cost: "10" },
  { position: "U", name: "Player 14", status: "--", cost: "8" },
  { position: "P", name: "Player 15", status: "--", cost: "6" },
  { position: "P", name: "Player 16", status: "--", cost: "5" },
  { position: "P", name: "Player 17", status: "--", cost: "5" },
  { position: "P", name: "Player 18", status: "--", cost: "3" },
  { position: "P", name: "Player 19", status: "--", cost: "8" },
  { position: "P", name: "Player 20", status: "--", cost: "9" },
  { position: "P", name: "Player 21", status: "--", cost: "4" },
  { position: "P", name: "Player 22", status: "--", cost: "5" },
  { position: "P", name: "Player 23", status: "--", cost: "7" },
];

const rosterPlayers_Team3 = [
  { position: "C", name: "Just Team 3", status: "--", cost: "9" },
  { position: "C", name: "Just Team 3", status: "--", cost: "3" },
  { position: "1B", name: "Player 3", status: "--", cost: "5" },
  { position: "3B", name: "Player 4", status: "--", cost: "7" },
  { position: "CI", name: "Player 5", status: "--", cost: "8" },
  { position: "2B", name: "Player 6", status: "--", cost: "10" },
  { position: "SS", name: "Player 7", status: "--", cost: "9" },
  { position: "MI", name: "Player 8", status: "--", cost: "7" },
  { position: "OF", name: "Player 9", status: "--", cost: "3" },
  { position: "OF", name: "Player 10", status: "--", cost: "4" },
  { position: "OF", name: "Player 11", status: "--", cost: "8" },
  { position: "OF", name: "Player 12", status: "--", cost: "5" },
  { position: "OF", name: "Player 13", status: "--", cost: "10" },
  { position: "U", name: "Player 14", status: "--", cost: "8" },
  { position: "P", name: "Player 15", status: "--", cost: "6" },
  { position: "P", name: "Player 16", status: "--", cost: "5" },
  { position: "P", name: "Player 17", status: "--", cost: "5" },
  { position: "P", name: "Player 18", status: "--", cost: "3" },
  { position: "P", name: "Player 19", status: "--", cost: "8" },
  { position: "P", name: "Player 20", status: "--", cost: "9" },
  { position: "P", name: "Player 21", status: "--", cost: "4" },
  { position: "P", name: "Player 22", status: "--", cost: "5" },
  { position: "P", name: "Player 23", status: "--", cost: "7" },
];

const farmPlayers_Team1 = [
  { position: "P", name: "Farm Team 1-A", status: "--", cost: "1" },
  { position: "P", name: "Farm Team 1-B", status: "--", cost: "3" },
];

const farmPlayers_Team2 = [
  { position: "1B", name: "Farm Team 2-A", status: "--", cost: "4" },
  { position: "CF", name: "Farm Team 2-B", status: "--", cost: "1" },
];

const farmPlayers_Team3 = [
  { position: "SS", name: "Farm Team 3-A", status: "--", cost: "2" },
  { position: "P", name: "Farm Team 3-B", status: "--", cost: "2" },
];

const rosters_backup = {
  Team1: rosterPlayers_Team1,
  Team2: rosterPlayers_Team2,
  Team3: rosterPlayers_Team3,
};

const farmPlayers_backup = {
  Team1: farmPlayers_Team1,
  Team2: farmPlayers_Team2,
  Team3: farmPlayers_Team3,
};

export default function TeamRoster({
  budget = 160,
  team = "Team 1",
  view = "roster",
  onTeamChange,
  onRosterPlayers,
  onFarmPlayers,
}) {

  const key = useMemo(() => team.replace(/\s/g, ""), [team]); 
  const [teams, setTeams] = useState([]);
  const [isEditingTeam, setIsEditingTeam] = useState(false);

  // fetch from backend
  useEffect(() => {
    async function load() {
      try {
        const res = await axios.get("/allteams");

        setTeams(res.data); 

      } catch (e) {
        console.error("Failed to fetch teams: ", e);
      }
    }

    load();
  }, []); 


  // find selected team
  const teamData = useMemo(() => {
    return teams.find((t) => t.teamName === key) || null;
  }, [teams, key]);

  const rosterPlayers = teamData ? teamData.rosterPlayers : rosters_backup[key] ?? rosters_backup[0];
  const farmPlayers = teamData ? teamData.farmPlayers : farmPlayers_backup[key] ?? farmPlayers_backup[0];


  // const rosterPlayers = rosters[key] ?? rosters[0];
  const spent = getBudget(rosterPlayers);
  const left = budget - spent;


  return (
    <div className="roster-wrap">

        <div className="roster-setview">
            <select
            className="roster-select"
            value={team}
            onChange={(e) => onTeamChange?.(e.target.value)}
            >
                <option>Team 1</option>
                <option>Team 2</option>
                <option>Team 3</option>
            </select>

            <button type="button" onClick={onRosterPlayers}>
                Roster
            </button>
            <button type="button" onClick={onFarmPlayers}>
                Farm Players
            </button>
            
            
        </div>

        <div className="roster-budget">
            <div>Total Salary: ${spent}</div>
            <div>Budget left: ${left}</div>
        </div>

        <div>
            <button type="button" onClick={() => setIsEditingTeam(!isEditingTeam)}>
                Edit
            </button>
            {isEditingTeam && (
              <EditRosterForm
                team={teamData || { teamName: key, rosterPlayers, farmPlayers }}
                view={view}
                onCancel={() => setIsEditingTeam(false)}
                onSave={() => {
                  setIsEditingTeam(false);
                }}
              />
            )}
        </div>

        {view === "roster" ? (
          <RosterTable rosterPlayers={rosterPlayers} view={view} />
        ) : (
          <RosterTable rosterPlayers={farmPlayers} view={view} />
        )}



    </div>
  );
}

function getBudget(rosterPlayers = []) { // this function is AI generated to calculate the total salary of the roster players
  return rosterPlayers.reduce((sum, p) => sum + Number(p.cost || 0), 0);
}


function RosterTable({ rosterPlayers, view }) {
  return (
    <table className="roster-table">
      {view === "roster" ? (
        <></>
      ) : (
        <caption>Farm's total Salary: ${getBudget(rosterPlayers)}</caption>
      )}
      <thead>
        <tr>
          <th>Position</th>
          <th>Name</th>
          <th>Status</th>
          <th>Salary</th>
        </tr>
      </thead>
      <tbody>
        {rosterPlayers.map((player, index) => (
          <tr key={index}>
            <td>{player.position}</td>
            <td>{player.name}</td>
            <td>{player.status}</td>
            <td>${player.cost}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

