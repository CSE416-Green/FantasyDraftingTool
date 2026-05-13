import { useState, useEffect, useMemo } from 'react'
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
import TabularComparison from '../../features/Tabular/TabularComparison'
import { fetchUnmatchedPlayers } from "../../features/Tabular/fetchUnmatchedPlayers";
import DepthChart from '../../features/depthchart/DepthChart'
import '../../css/mainPage.css'
import '../../css/settingsPage.css'
import Header from '../../shared/components/Header'
import axios from "axios";
import { useQuery } from '@tanstack/react-query';
const pages = ['Main Page', 'Setting', "Estimations", "Scores", "Depth Chart"];

function MainPage({user,onLogout}) {
  const [team, setTeam] = useState("")
  const [view, setView] = useState("roster") // roster or farm or taxi
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
  const [extraPlayerStats, setExtraPlayerStats] = useState([]);

  const [depthCharts, setDepthCharts] = useState([]);
  const [loading_depth, setLoading_depth] = useState(true);
  const [error_depth, setError_depth] = useState("");

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
      data: playerStatsByYear = {},
      isLoading,
      error,
    } = useQuery({
      queryKey: ["player-stats", year],
      queryFn: () => fetchPlayerStats(year),
      enabled: !!year
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


  const unmatchedIDs = useMemo(() => {
    if (!teams || !playerStatsByYear) return [];

    const playerStats = playerStatsByYear?.lastYear || [];

    const apiIDs = new Set(playerStats.map((p) => Number(p.ID)));

    return [
    ...new Set(
      teams
        .flatMap((team) => team?.rosterPlayers ?? [])
        .map((p) => Number(p.playerID ?? p.ID))
        .filter(Boolean)
        .filter((id) => !apiIDs.has(id))
    ),
  ];
  }, [teams, playerStatsByYear]);

  
  const unmatchedKey = useMemo(() => {
    return unmatchedIDs.join(",");
  }, [unmatchedIDs]);

  useEffect(() => {
    async function loadExtraPlayers() {
      try {
        const results = await fetchUnmatchedPlayers(unmatchedIDs, year);
        setExtraPlayerStats(results);
      } catch (err) {
        console.error(err);
        setExtraPlayerStats([]);
      }
    }

    if (!year || unmatchedIDs.length === 0) {
      setExtraPlayerStats([]);
      return;
    }

    loadExtraPlayers();
  }, [unmatchedKey, year]);

  useEffect(() => {

    async function fetchDepthCharts() {
        setLoading_depth(true);
        setError_depth("");
        try {
        const today = new Date().toLocaleDateString("en-US", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
        });

        const cacheKey = `depthcharts-${today}`;
        const cached = sessionStorage.getItem(cacheKey);

        if (cached) {
            const parsed = JSON.parse(cached);

            const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;

            if (Date.now() - parsed.timestamp < TWENTY_FOUR_HOURS) {
            setDepthCharts(parsed.data);
            setLoading_depth(false);
            return;
            }
        }
        const response = await axios.get("/depthChart/fetch");
        const data = response.data
        setDepthCharts(data);

        sessionStorage.setItem(
            cacheKey,
            JSON.stringify({
            timestamp: Date.now(),
            data,
            })
        );
        } catch (err) {
            setError_depth(err.message);
        } finally {
            setLoading_depth(false);
        }
    }

    fetchDepthCharts();
    }, []);

  return (
    <div className="main-page">
        <Header pages={pages} onPageChange={handlePageChange} onLogout={onLogout} user={user}/>
        {currentPage === "Main Page" && 
        
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
                    onTaxiPlayers={() => setView("taxi")}
                    playerStats={playerStatsByYear?.thisYear || []}
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
          </div>
          {/* {draftState && <> */}
            <div className="player-pool">
              <h1>Player Pool</h1>
              <PlayerPool
                playerStatsByYear={playerStatsByYear}
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
                depthCharts={depthCharts}
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
        </div> }
        {currentPage === "Setting" &&        
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

        {currentPage === "Estimations" &&
          <TabularComparison
            playerStatsByYear={playerStatsByYear}
            year={year}
            teams={teams}
            leagueName={leagueName}
            extraPlayerStats={extraPlayerStats}
          />}
        {currentPage === "Scores" &&
          <CompeteContainer
                teams={teams}
                leagueId={selectedLeagueId}
                draftState={draftState}
                totalTeams={totalTeams}
          />
        }
        {currentPage === "Depth Chart" &&
          <DepthChart
            depthCharts={depthCharts}
            loading_depth={loading_depth}
            error_depth={error_depth}
          />
          }
    </div>
  );
}

export default MainPage;