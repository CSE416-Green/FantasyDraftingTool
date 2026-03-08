import axios from "axios";
import { useEffect, useState, useMemo } from "react";
import EditRosterForm from "./EditRosterForm";
import DraftPlayerForm from "./DraftPlayerForm";
import EnterPastPlayerForm from "./EnterPastPlayerForm";
axios.defaults.baseURL = "http://localhost:3000";

if (process.env.NODE_ENV == "production") {
  axios.defaults.baseURL = "https://fantasydraftingtool.onrender.com/";
}
console.log("Current environment:", process.env.NODE_ENV);

const maxNumberofMembers = 23;

// these sample tables are AI generated
const rosterPlayers_Team1 = [
  { position: "C", name: "JJust Team 1", status: "--", cost: "10" },
  { position: "1B", name: "Player 3", status: "--", cost: "5" },
  { position: "3B", name: "Player 4", status: "--", cost: "7" },
  { position: "CI", name: "Player 5", status: "--", cost: "8" },
  { position: "2B", name: "Player 6", status: "--", cost: "10" },
  { position: "SS", name: "Player 7", status: "--", cost: "9" },
  { position: "OF", name: "Player 9", status: "--", cost: "3" },
  { position: "OF", name: "Player 10", status: "--", cost: "4" },
  { position: "OF", name: "Player 12", status: "--", cost: "5" },
  { position: "U", name: "Player 14", status: "--", cost: "8" },
  { position: "P", name: "Player 15", status: "--", cost: "6" },
  { position: "P", name: "Player 16", status: "--", cost: "5" },
  { position: "P", name: "Player 17", status: "--", cost: "5" },
  { position: "P", name: "Player 19", status: "--", cost: "8" },
  { position: "P", name: "Player 21", status: "--", cost: "4" },
  { position: "P", name: "Player 22", status: "--", cost: "5" },
];

const rosterPlayers_Team2 = [
  { position: "C", name: "Just Team 2A", status: "--", cost: "7" },
  { position: "C", name: "Just Team 2B", status: "--", cost: "3" },
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
  const [isDrafting, setIsDrafting] = useState(false);
  const [isEnteringPast, setIsEnteringPast] = useState(false);

  // // fetch from backend
  // useEffect(() => {
  //   async function load() {
  //     try {
  //       const res = await axios.get("/allteams");

  //       setTeams(res.data); 

  //     } catch (e) {
  //       console.error("Failed to fetch teams: ", e);
  //     }
  //   }

  //   load();
  // }, []); 

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



  // find selected team
  const teamData = useMemo(() => {
    return teams.find((t) => t.teamName === key) || null;
  }, [teams, key]);

  const rosterPlayers = teamData ? teamData.rosterPlayers : rosters_backup[key] ?? rosters_backup[0];
  const farmPlayers = teamData ? teamData.farmPlayers : farmPlayers_backup[key] ?? farmPlayers_backup[0];


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



