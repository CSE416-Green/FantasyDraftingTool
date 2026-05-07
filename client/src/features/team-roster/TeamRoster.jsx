import axios from "axios";
import { useEffect, useState, useMemo } from "react";
import EditRosterForm from "./components/EditRosterForm";
import DraftPlayerForm from "./components/DraftPlayerForm";
import EnterPastPlayerForm from "./components/EnterPastPlayerForm";
import { parsePlayerString } from "../player-pool/PlayerPool";
import TradePlayersForm from "./components/TradePlayersForm";
import AddTaxiForm from "./components/AddTaxiForm";
import DraftHistory from "../draft-history/DraftHistory";
import EditTaxiOrder from "./components/EditTaxiOrder";
axios.defaults.baseURL = "http://localhost:3000";

if (process.env.NODE_ENV == "production") {
  axios.defaults.baseURL = "https://fantasydraftingtool.onrender.com/";
}

const maxNumberofMembers = 23;

const AL_TEAMS = [
  "Baltimore Orioles",
  "Boston Red Sox",
  "New York Yankees",
  "Tampa Bay Rays",
  "Toronto Blue Jays",
  "Chicago White Sox",
  "Cleveland Guardians",
  "Detroit Tigers",
  "Kansas City Royals",
  "Minnesota Twins",
  "Houston Astros",
  "Los Angeles Angels",
  "Athletics",
  "Seattle Mariners",
  "Texas Rangers"
];
const NL_TEAMS = [
  "Atlanta Braves",
  "Miami Marlins",
  "New York Mets",
  "Philadelphia Phillies",
  "Washington Nationals",
  "Chicago Cubs",
  "Cincinnati Reds",
  "Milwaukee Brewers",
  "Pittsburgh Pirates",
  "St. Louis Cardinals",
  "Arizona Diamondbacks",
  "Colorado Rockies",
  "Los Angeles Dodgers",
  "San Diego Padres",
  "San Francisco Giants"
];

export default function TeamRoster({
  budget = budget,
  team = "",
  view = "roster",
  onTeamChange,
  onRosterPlayers,
  onFarmPlayers,
  onTaxiPlayers,
  playerStats,
  leagueName,
  year,
  user,
  setDraftHistory,
  draftHistory,
  teams,
  loadTeams,
  fetchTrades,
  draftState,
  draftedIDs,
  leagueId,
  draftLeague,
  setDraftLeague
}) {
  const [isEditingTeam, setIsEditingTeam] = useState(false);
  const [isDrafting, setIsDrafting] = useState(false);
  const [isEnteringPast, setIsEnteringPast] = useState(false);
  const [isTrading, setIsTrading] = useState(false);
  const [isTaxi, setIsTaxi] = useState(false);
  const [manualPlayers, setManualPlayers] = useState([]);

useEffect(() => {
  if (!leagueId) return;

  async function fetchManualPlayers() {
    try {
      const res = await axios.get(`/addedPlayerPool/manualPlayers/${leagueId}`);
      setManualPlayers(res.data);
    } catch (err) {
      console.error("Failed to fetch manual players:", err);
    }
  }

  fetchManualPlayers();
}, [leagueId]);
 
  const playerPool = [
    ...playerStats.map((player) => {
    const parsed = parsePlayerString(player.Player ?? "");

    const positions = parsed.position
      ? parsed.position.split(/[\/,]/).map(p => p.trim())
      : [];

    return {
      name: parsed.name,
      position: positions,
      ID: player.ID,
      MLBTeam: parsed.team
    };
    }),
    ...manualPlayers.map((player)=>({
      name:player.name,
      position:[player.position],
      ID: player.playerID || null,
      MLBTeam: player.team
    }))
  ];

  const filteredPlayerPool = playerPool.filter((player) => {
    if (draftLeague === "MLB") return true;
    if (draftLeague === "AL") return AL_TEAMS.includes(player.MLBTeam);
    if (draftLeague === "NL") return NL_TEAMS.includes(player.MLBTeam);
    return true;
  });

  useEffect(() => {
    if (teams.length > 0 && !team) {
      onTeamChange?.(teams[0].teamName);
    }
  }, [teams, team]);



  // find selected team
  const teamData = teams.find(t => t.teamName === team);
  const maxRosterPlayer = 23;
  const rosterPlayers = teamData?.rosterPlayers ?? [];
  const farmPlayers = teamData?.farmPlayers ?? [];
  const taxiPlayers = teamData?.taxiPlayers ?? [];
  const userOwnsTeam = !user?.team?.length || user.team.map(String).includes(String(teamData?._id));

  // const rosterPlayers = rosters[key] ?? rosters[0];
  const spent = getBudget(rosterPlayers);
  const left = budget - spent;
  const maxNextCost = left - (maxNumberofMembers - rosterPlayers.length - 1); 
  
  function clickEnterPast() {
    setIsEnteringPast(!isEnteringPast);
    setIsDrafting(false);
    setIsEditingTeam(false);
    setIsTrading(false);
    setIsTaxi(false);
  }

  function clickDraft() {
    setIsEnteringPast(false);
    setIsDrafting(!isDrafting);
    setIsEditingTeam(false);
    setIsTrading(false);
    setIsTaxi(false);
  }

  function clickEdit() {
    setIsEnteringPast(false);
    setIsEditingTeam(!isEditingTeam);
    setIsDrafting(false);
    setIsTrading(false);
    setIsTaxi(false);
  }

  function clickTrade() {
    setIsEnteringPast(false);
    setIsEditingTeam(false);
    setIsDrafting(false);
    setIsTrading(!isTrading);
    setIsTaxi(false);
  }

  function clickTaxi() {
    setIsEnteringPast(false);
    setIsEditingTeam(false);
    setIsDrafting(false);
    setIsTrading(false);
    setIsTaxi(!isTaxi);
  }

  return (
    <div className="roster-wrap">
      <AllTeamBudgets teams={teams} budget={budget} />
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
            <button className="form-buttom" type="button" onClick={onTaxiPlayers}>
                Taxi Players
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
            <button className="form-buttom" type="button" onClick={() => clickEnterPast()} disabled={!userOwnsTeam}>
                Enter Past Players
            </button>
            <button className="form-buttom" type="button" onClick={() => clickEdit()} disabled={!userOwnsTeam}>
                Edit
            </button>
            {draftState &&
            <button className="form-buttom" type="button" onClick={() => clickDraft()} disabled={!userOwnsTeam}>
                Draft
            </button>
            }
            <button className="form-buttom" type="button" onClick={() => clickTrade()} disabled={!userOwnsTeam}>
                Trade
            </button>
            {/* {!draftState && */}
            <button className="form-buttom" type="button" onClick={() => clickTaxi()} disabled={!userOwnsTeam}>
                Taxi Draft
            </button>
            {/* } */}
          </div>

            {userOwnsTeam && isEnteringPast && (
              <EnterPastPlayerForm
                team={teamData}
                onCancel={() => setIsEnteringPast(false)}
                onSubmit={async() => {
                  await loadTeams();
                  setIsEnteringPast(false);
                }
                }
                maxNextCost={maxNextCost}
                playerPool={playerPool}
                draftedNames={draftHistory.map(p => p.PlayerName)}
                draftedIDs={draftedIDs}
              />
            )}
            {userOwnsTeam && isEditingTeam && (
              <EditRosterForm
                team={teamData}
                view={view}
                onCancel={() => setIsEditingTeam(false)}
                onSave={async() => {
                  await loadTeams();
                  setIsEditingTeam(false);
                }}
                maxNextCost={maxNextCost}
              />
            )}
            {userOwnsTeam && isDrafting && (
              <>
                <div style={{ marginBottom: "12px" }}>
                  <label style={{ fontWeight: "bold", marginRight: "8px" }}>
                    Draft Type:
                  </label>

                  <select
                    className="form-select"
                    value={draftLeague}
                    onChange={(e) => setDraftLeague(e.target.value)}
                  >
                    <option value="MLB">MLB</option>
                    <option value="AL">AL</option>
                    <option value="NL">NL</option>
                  </select>
                </div>

                <DraftPlayerForm
                team={teamData}
                onCancel={() => setIsDrafting(false)}
                onDraft={async() => {
                  await loadTeams();
                  setIsDrafting(false);
                }}
                maxNextCost={maxNextCost}
                playerPool={filteredPlayerPool}
                leagueName={leagueName}
                year={year}
                teams={teams}
                leagueId={leagueId}
                setDraftHistory={setDraftHistory}
                draftedNames={draftHistory.map(p => p.PlayerName)}
                remainingSpots={maxRosterPlayer - rosterPlayers.length}
                draftedIDs={draftedIDs}
              />
              </>
            )}
            {userOwnsTeam && isTrading && (
              <TradePlayersForm
                teams={teams}
                currentTeamId={teamData?._id || ""}
                onCancel={() => setIsTrading(false)}
                onTrade={async () => {
                  await loadTeams();
                  await fetchTrades(); 
                  setIsTrading(false);
                }}
              />
            )}  
            {userOwnsTeam && isTaxi && (
              <AddTaxiForm
                team={teamData}
                onCancel={() => setIsTaxi(false)}
                onSubmit={async() => {
                  await loadTeams();
                  setIsTaxi(false);
                }}
                playerPool={playerPool}
                draftedNames={draftHistory.map(p => p.PlayerName)}
                draftedIDs={draftedIDs}
              ></AddTaxiForm>
            )}
        </div>

        {view === "roster" && (
          <h2>Roster Players for {teamData?.teamName}</h2>
        )}
        {view === "farm" && (
          <h2>Farm Players for {teamData?.teamName}</h2>
        )}
        {view === "taxi" && (
          <h2>Taxi Players for {teamData?.teamName}</h2>
        )}
        {view === "roster" && (
          <RosterTable rosterPlayers={rosterPlayers} view={view} />
        )}

        {view === "farm" && (
          <RosterTable rosterPlayers={farmPlayers} view={view} />
        )}

        {view === "taxi" && (
          <TaxiTable 
            taxiPlayers={taxiPlayers}
            team={teamData}
            loadTeams={loadTeams}
          />
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

function TaxiTable({ taxiPlayers, team, loadTeams }) {
  const [isEditingTaxiOrder, setIsEditingTaxiOrder] = useState(false);

  const sorted = [...taxiPlayers].sort(
    (a, b) => Number(a.position) - Number(b.position)
  );

  return (
    <div>
      {isEditingTaxiOrder && (
        <EditTaxiOrder
          team={team}
          onCancel={() => setIsEditingTaxiOrder(false)}
          onSubmit={async () => {
            await loadTeams();
            setIsEditingTaxiOrder(false);
          }}
        />
      )}

      <table className="roster-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Name</th>
          </tr>
        </thead>

        <tbody>
          {sorted.map((player) => (
            <tr key={player._id || `${player.position}-${player.name}`}>
              <td>{player.position}</td>
              <td>{player.name}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <button
        className="form-buttom"
        type="button"
        onClick={() => setIsEditingTaxiOrder(true)}
      >
        Edit Taxi Order
      </button>

    </div>
  );
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

function AllTeamBudgets({ teams = [], budget = 260 }) {
  const [showAllBudgets, setShowAllBudgets] = useState(false);

  return (
    <div>
      <div className="roster-budget-header">
        <h3>All Team Budgets</h3>
        <button
          className="form-buttom"
          onClick={() => setShowAllBudgets(!showAllBudgets)}
        >
          {showAllBudgets ? "Close" : "Show"}
        </button>
      </div>
      {showAllBudgets && 
        <div className="roster-budget-grid">
        {teams.map((team) => {
          const rosterPlayers = team.rosterPlayers || [];
          const farmPlayers = team.farmPlayers || [];
          const rosterSpent = getBudget(team.rosterPlayers);
          const farmSpent = getBudget(team.farmPlayers);
          const totalSpent = rosterSpent; // or rosterSpent + farmSpent if farm counts
          const left = budget - totalSpent;

          return (
            <div key={team._id || team.teamName} className="roster--budget-card">
              <strong>{team.teamName}</strong>
              <div>Roster Players: {rosterPlayers.length}</div>
              <div>Farm Players: {farmPlayers.length}</div>
              <div>Roster Salary: ${rosterSpent}</div>
              <div>Farm Salary: ${farmSpent}</div>
              <div>Budget Left: ${left}</div>
            </div>
          );
        })}
      </div>
      }

      
    </div>
  );
}