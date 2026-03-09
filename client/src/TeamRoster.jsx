import axios from "axios";
import { useEffect, useState, useMemo } from "react";
import EditRosterForm from "./EditRosterForm";
import DraftPlayerForm from "./DraftPlayerForm";
import EnterPastPlayerForm from "./EnterPastPlayerForm";
import { parsePlayerString } from './PlayerPool';
axios.defaults.baseURL = "http://localhost:3000";

if (process.env.NODE_ENV == "production") {
  axios.defaults.baseURL = "https://fantasydraftingtool.onrender.com/";
}
console.log("Current environment:", process.env.NODE_ENV);

const maxNumberofMembers = 23;

// these sample tables are AI generated
const rosterPlayers_Team1 = [
  { position: "C", name: "Loading...", status: "--", cost: "--" },
];

const rosterPlayers_Team2 = [
  { position: "C", name: "Just Team 2A", status: "--", cost: "7" },
];

const rosterPlayers_Team3 = [
  { position: "C", name: "Just Team 3", status: "--", cost: "9" },
];

const farmPlayers_Team1 = [
  { position: "P", name: "Farm Team 1-A", status: "--", cost: "1" },
];

const farmPlayers_Team2 = [
  { position: "1B", name: "Farm Team 2-A", status: "--", cost: "4" },
];

const farmPlayers_Team3 = [
  { position: "SS", name: "Farm Team 3-A", status: "--", cost: "2" },
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
  budget = budget,
  team = "Team 1",
  view = "roster",
  onTeamChange,
  onRosterPlayers,
  onFarmPlayers,
  playerStats
}) {

  const key = useMemo(() => team.replace(/\s/g, ""), [team]); 
  const [teams, setTeams] = useState([]);
  const [isEditingTeam, setIsEditingTeam] = useState(false);
  const [isDrafting, setIsDrafting] = useState(false);
  const [isEnteringPast, setIsEnteringPast] = useState(false);

  const playerPool = playerStats.map((player) => {
  const parsed = parsePlayerString(player.Player ?? "");

  const positions = parsed.position
    ? parsed.position.split(/[\/,]/).map(p => p.trim())
    : [];

  return {
    name: parsed.name,
    position: positions,
  };
});

  //  to reload teams
  const loadTeams = async () => {
    try {
      const res = await axios.get("/allteams");
      setTeams(res.data);
    } catch (e) {
      console.error("Failed to fetch teams: ", e);
    }
  };

  useEffect(() => {
    loadTeams();
  }, []);

  const listOfTeamNames = teams.map(t => t.teamName);


  // find selected team
  const teamData = useMemo(() => {
    return teams.find((t) => t.teamName === key) || null;
  }, [teams, key]);

  const rosterPlayers = teamData ? teamData.rosterPlayers : (rosters_backup[key] ?? []);
  const farmPlayers = teamData ? teamData.farmPlayers : (farmPlayers_backup[key] ?? []);

  // const rosterPlayers = rosters[key] ?? rosters[0];
  const spent = getBudget(rosterPlayers);
  const left = budget - spent;
  const maxNextCost = left - (maxNumberofMembers - rosterPlayers.length - 1); 
  
  function clickEnterPast() {
    setIsEnteringPast(!isEnteringPast);
    setIsDrafting(false);
    setIsEditingTeam(false);
  }
  function clickDraft() {
    setIsEnteringPast(false);
    setIsDrafting(!isDrafting);
    setIsEditingTeam(false);
  }

  function clickEdit() {
    setIsEnteringPast(false);
    setIsEditingTeam(!isEditingTeam);
    setIsDrafting(false);
  }


  return (
    <div className="roster-wrap">

        <div className="roster-setview">
            <select
            className="roster-select"
            value={team}
            onChange={(e) => onTeamChange?.(e.target.value)}
            >
                {teams.map(t => (
                  <option key={t.teamName} value={t.teamName}>
                    {t.teamName}
                  </option>
                ))}
            </select>

            <button className="form-buttom" type="button" onClick={onRosterPlayers}>
                Roster
            </button>
            <button className="form-buttom" type="button" onClick={onFarmPlayers}>
                Farm Players
            </button>
            
            
        </div>

        <div className="roster-budget">
            <div>Roster Players: {rosterPlayers.length}</div>
            <div>Farm Players: {farmPlayers.length}</div>
            <div>Total Roster Salary: ${spent}</div>
            <div>Total Farm Salary: ${getBudget(farmPlayers)}</div>
            <div>Budget left: ${left}</div>
            <div>Max Salary on Next Player: ${maxNextCost}</div>
        </div>

        <div>
          <div className="form-button-group">
            <button className="form-buttom" type="button" onClick={() => clickEnterPast()}>
                Enter Past Players
            </button>
            <button className="form-buttom" type="button" onClick={() => clickEdit()}>
                Edit
            </button>
            <button className="form-buttom" type="button" onClick={() => clickDraft()}>
                Draft
            </button>
          </div>

            {isEnteringPast && (
              <EnterPastPlayerForm
                team={teamData || { teamName: key, rosterPlayers, farmPlayers }}
                onCancel={() => setIsEnteringPast(false)}
                onSubmit={async() => {
                  await loadTeams();
                  setIsEnteringPast(false);
                }
                }
                maxNextCost={maxNextCost}
              />
            )}
            {isEditingTeam && (
              <EditRosterForm
                team={teamData || { teamName: key, rosterPlayers, farmPlayers }}
                view={view}
                onCancel={() => setIsEditingTeam(false)}
                onSave={async() => {
                  await loadTeams();
                  setIsEditingTeam(false);
                }}
                maxNextCost={maxNextCost}
              />
            )}
            {isDrafting && (
              <DraftPlayerForm
                team={teamData || { teamName: key, rosterPlayers, farmPlayers }}
                onCancel={() => setIsDrafting(false)}
                onDraft={async() => {
                  await loadTeams();
                  setIsDrafting(false);
                }}
                maxNextCost={maxNextCost}
                playerPool={playerPool}
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

// to convert the roster players to the order we want to display, and fill in the empty rows empty value
function ConvertToFormattedRoster(rosterPlayers) {
  
  const rosterOrder = [
    "C","C","1B","3B","CI","2B","SS","MI",
    "OF","OF","OF","OF","OF",
    "U",
    "P","P","P","P","P","P","P","P","P"
  ];

  const remaining = [...rosterPlayers];
  const formatted = rosterOrder.map(pos => {
    const index = remaining.findIndex(p => p.position === pos);
    if (index !== -1) { // if a player with the position exists
      const player = remaining.splice(index, 1)[0]; // remove the player from remaining
      return player;
    }
    // else that row is empty, fill in with default value
    return { position: pos, name: "", status: "", cost: "" };
  });
  return formatted;

}



function RosterTable({ rosterPlayers, view }) {

  let FormattedRoster = rosterPlayers;
  if (view === "roster") {
    FormattedRoster = ConvertToFormattedRoster(rosterPlayers);
  }

  return (
    <table className="roster-table">
      {/* {view === "roster" ? (
        <></>
      ) : (
        <caption>Farm's total Salary: ${getBudget(rosterPlayers)}</caption>
      )} */}
      <thead>
        <tr>
          <th>Position</th>
          <th>Name</th>
          <th>Status</th>
          <th>Salary</th>
        </tr>
      </thead>
      <tbody>
        {FormattedRoster.map((player, index) => (
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



