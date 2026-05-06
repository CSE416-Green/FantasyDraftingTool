import { useState, useEffect } from 'react'
import TeamRoster from '../../features/team-roster/TeamRoster'
import PlayerPool, { fetchPlayerStats } from '../../features/player-pool/PlayerPool'
import Note from '../../shared/components/Note'
import LeagueConfiguration from '../../features/league-config/LeagueConfig'
import AddPlayerToPool from '../../features/add-player-to-pool/AddPlayerToPool'
import DraftHistory from '../../features/draft-history/DraftHistory'
import TradeHistory from '../../features/draft-history/TradeHistory'
import Drawer from '../../features/player-news/Drawer'
import CompeteContainer from '../../features/compete/CompeteContainer'
import JoinAnotherLeague from '../../features/league-config/JoinAnotherLeague'
import CreateAnotherLeague from '../../features/league-config/CreateAnotherLeague'
import '../../css/mainPage.css'
import '../../css/settingsPage.css'
import Header from '../../shared/components/Header'
import axios from "axios";
import { useQuery } from '@tanstack/react-query';
const pages = ['Main Page', 'Setting'];

function MainPage({user,onLogout}) {
  const [team, setTeam] = useState("")
  const [view, setView] = useState("roster") // roster or farm
  const [totalBudget, setTotalBudget] = useState(0);
  const [leagueName, setLeagueName] = useState("default league");
  const [leagueInviteCode, setLeagueInviteCode] = useState("N/A");
  const [year, setYear] = useState();
  const [draftHistory, setDraftHistory] = useState([]);

  const [currentPage, setCurrentPage] = useState(pages[0]);
  const [teams, setTeams] = useState([]);
  const [draftState, setDraftState] = useState(true);

  const [tradeHistory, setTradeHistory] = useState([]);
  const [draftedIDs, setDraftedIDs] = useState([]);
  const [selectedLeagueId, setSelectedLeagueId] = useState("");
  const [leagueOptions, setLeagueOptions] = useState([]);
  const [totalTeams, setTotalTeams] = useState(0);
  const [draftLeague, setDraftLeague] = useState("MLB");

const fetchTrades = async () => {
  try {
    const res = await axios.get(`/draftHistory/trades/${selectedLeagueId}`);
    setTradeHistory(res.data.trades);
  } catch (err) {
    console.error("Failed to fetch trade history:", err);
  }
};

useEffect(() => {
  if (selectedLeagueId) fetchTrades();
}, [selectedLeagueId]);

  const {
      data: playerStats = [],
      isLoading,
      error,
    } = useQuery({
      queryKey: ["player-stats", year],
      queryFn: () => fetchPlayerStats(year),
      enabled: draftState && !!year,
    });

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

    // to load league settings
    const loadLeagueSettings = async () => {
      try {
        const res = await axios.get("/settings/league");

        setTotalBudget(res.data.teamBudget);
      } catch (e) {
        console.error("Failed to fetch league settings");
      }
    }
  
    useEffect(() => {
      loadLeagueSettings();
    }, []);

    const loadLeagueInfo = async () => {
      try {
        const res = await axios.post("/league/info", {
          leagueId: selectedLeagueId
        });
        setLeagueName(res.data.Name);
        setLeagueInviteCode(res.data.InviteCode);
        setYear(res.data.Year);
        setTotalTeams(res.data.TeamsID.length)
      } catch (err) {
        console.error("Failed to fetch league information");
      }
    };

    useEffect(() => {
      if (selectedLeagueId) loadLeagueInfo();
    }, [selectedLeagueId]);


    const fetchHistory = async () => {
      try {
        const res = await axios.post("/draftHistory/league", {
          leagueId: selectedLeagueId
        });

        const data = res.data.DraftedPlayers.map((p) => ({
          PlayerName: p.PlayerName,
          Pick: p.Pick,
          TeamName: p.TeamName,
          Cost: p.Cost,
          BroughtUpBy: p.BroughtUpBy,
          Position: p.Position,
          MLBTeam: p.MLBTeam
        }));

        setDraftHistory(data);
      } catch (err) {
        console.error("Failed to fetch draft history:", err);
      }
    };

    useEffect(() => {
      if (selectedLeagueId) fetchHistory();
    }, [selectedLeagueId]);

    //  to reload teams
  const loadTeams = async () => {
    try {
      const res = await axios.post("/allteams", {
        leagueId: selectedLeagueId
      });

      setTeams(res.data);

      if (res.data.length > 0) {
        setTeam(res.data[0].teamName);
      }

      const allFull = res.data.every(
        (team) => team.rosterPlayers.length === 23
      );

      setDraftState(!allFull);
    } catch (e) {
      console.error("Failed to fetch teams: ", e);
    }
  };

  useEffect(() => {
    if (selectedLeagueId) loadTeams();
  }, [selectedLeagueId]);


  const loadUserLeagues = async () => {
    try {
      if (!user?.league || user.league.length === 0) return;

      const res = await axios.post("/league/userLeagues", {
        leagueIds: user.league
      });

      setLeagueOptions(res.data);

      if (res.data.length > 0) {
        setSelectedLeagueId(res.data[0]._id);
      }
    } catch (err) {
      console.error("Failed to load user leagues:", err);
    }
  };

  useEffect(() => {
    loadUserLeagues();
  }, [user]);

  return (
    <div className="main-page">
        <Header pages={pages} onPageChange={handlePageChange} onLogout={onLogout} user={user}/>
        {currentPage === "Main Page" ? 
        
        <div className="drafting-page">
          <div className="select-league-row">
            <label>Select League:</label>
            <select 
              className="league-select"
              value={selectedLeagueId}
              onChange={(e) => {
                setSelectedLeagueId(e.target.value);
                setTeam("");
                setTeams([]);
              }}
            >
              {leagueOptions.map((league) => (
                <option key={league._id} value={league._id}>
                  {league.Name} ({league.Year})
                </option>
              ))}
            </select>
          </div>

          <div className="team-roster">
              <h1>Team Rosters of {leagueName} ({year})</h1>
              <div>League Invitation Code: {leagueInviteCode}</div>
              <TeamRoster
                    budget={totalBudget}
                    team={team}
                    view={view}
                    onTeamChange={setTeam}
                    onRosterPlayers={() => setView("roster")} 
                    onFarmPlayers={() => setView("farm")}
                    playerStats={playerStats}
                    leagueName={leagueName}
                    year={year}
                    user={user}
                    setDraftHistory={setDraftHistory}
                    draftHistory={draftHistory}
                    teams={teams}
                    loadTeams={loadTeams}
                    fetchTrades={fetchTrades}
                    draftState={draftState}
                    draftedIDs={draftedIDs}
                    leagueId={selectedLeagueId}
                    draftLeague={draftLeague}
                    setDraftLeague={setDraftLeague}
              />
              <CompeteContainer
                    teams={teams}
                    leagueId={selectedLeagueId}
                    draftState={draftState}
                    totalTeams={totalTeams}
              />
          </div>
          {/* {draftState && <> */}
            <div className="player-pool">
              <h1>Player Pool</h1>
              <PlayerPool
                playerStats={playerStats}
                isLoading={isLoading}
                error={error}
                leagueName={leagueName}
                year={year}
                leagueId={selectedLeagueId}
                user={user}
                teams={teams}
                draftedIDs={draftedIDs}
                setDraftedIDs={setDraftedIDs}
                draftLeague={draftLeague}
              />
          </div>
          {/* </>} */}
          <div className="notes"> 
            <Note user={user} leagueId={selectedLeagueId} />

          </div>
          <div className="draft-history">
              <DraftHistory 
                leagueName={leagueName}
                year={year}
                leagueId={selectedLeagueId}
                history={draftHistory}
              />
              <TradeHistory leagueId={selectedLeagueId} trades={tradeHistory} fetchTrades={fetchTrades} />
          </div>
          <div className="news-history">
            <Drawer/>
          </div>
        </div> :         
        <div className="settings-page">
          <h1 className="settings-title">Draft Settings</h1>
          {/* <LeagueConfiguration /> */}
          <AddPlayerToPool leagueId={selectedLeagueId} userId={user._id}/>

          <h1 className="settings-title">Join Another League</h1>
          <JoinAnotherLeague userId={user._id}/>

          <h1 className="settings-title">Create Another League</h1>
          <CreateAnotherLeague userId={user._id}/>
        </div>
        }
    </div>
  );
}

export default MainPage;