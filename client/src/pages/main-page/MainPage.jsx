import { useState, useEffect } from 'react'
import TeamRoster from '../../features/team-roster/TeamRoster'
import PlayerPool, { fetchPlayerStats } from '../../features/player-pool/PlayerPool'
import Note from '../../shared/components/Note'
import LeagueConfiguration from '../../features/league-config/LeagueConfig'
import AddPlayerToPool from '../../features/add-player-to-pool/AddPlayerToPool'
import DraftHistory from '../../features/draft-history/DraftHistory'
import Drawer from '../../features/player-news/Drawer'
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

  const {
    data: playerStats = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["player-stats"],
    queryFn: fetchPlayerStats,
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
        const res = await axios.post("/league/info", { leagueId: user.league });
        setLeagueName(res.data.Name);
        setLeagueInviteCode(res.data.InviteCode);
        setYear(res.data.Year);
      } catch (err) {
        console.error("Failed to fetch league information")
      }
    }

    useEffect(() => {
      loadLeagueInfo();
    }, []);


    const fetchHistory = async () => {
      try {
        const leagueId = user.league;
        const res = await axios.post('/draftHistory/league', { leagueId: leagueId});

        const data = res.data.DraftedPlayers.map((p) => ({
          PlayerName: p.PlayerName,
          Pick: p.Pick,
          TeamName: p.TeamName,
          Cost: p.Cost,
          BroughtUpBy: p.BroughtUpBy,
          Position: p.Position
        }));

        setDraftHistory(data);

    } catch (err) {
        console.error("Failed to fetch draft history:", err);
      }
    };

  useEffect(() => {
    fetchHistory();
  }, []);

  

  return (
    <div className="main-page">
        <Header pages={pages} onPageChange={handlePageChange} onLogout={onLogout} user={user}/>
        {currentPage === "Main Page" ? 
        <div className="drafting-page">

          <div className="team-roster">
              <h1>Team Rosters of {leagueName} of {year} season</h1>
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
              />
          </div>
          <div className="player-pool">
              <h1>Player Pool</h1>
              <PlayerPool
                playerStats={playerStats}
                isLoading={isLoading}
                error={error}
                leagueName={leagueName}
                year={year}
                leagueId={user.league}
              />
          </div>
          <div className="notes"> 
              <Note />

          </div>
          <div className="draft-history">
              <DraftHistory 
                leagueName={leagueName}
                year={year}
                leagueId={user.league}
                history={draftHistory}
              />
          </div>
          <div className="news-history">
            <Drawer/>
          </div>
        </div> :         
        <div className="settings-page">
          <h1 className="settings-title">Draft Settings</h1>
          <LeagueConfiguration />
          <AddPlayerToPool leagueId={user.league} />
        </div>
        }
    </div>
  );
}

export default MainPage;