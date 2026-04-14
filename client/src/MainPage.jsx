import { useState, useEffect } from 'react'
import TeamRoster from './TeamRoster'
import PlayerPool, { fetchPlayerStats } from './PlayerPool'
import Note from './Note'
import LeagueConfiguration from './LeagueConfig'
import UpdatePlayerEligibility from './UpdatePlayerEligibility'
import AddPlayerToPool from './AddPlayerToPool'
import PlayerNews from './PlayerNews'
import DraftHistory from './DraftHistory'
import Drawer from './Drawer'
import './css/mainPage.css'
import './css/settingsPage.css'
import Header from './Header';
import axios from "axios";
import { useQuery } from '@tanstack/react-query';
const pages = ['Main Page', 'Setting'];

function MainPage({user,onLogout}) {
  const [team, setTeam] = useState("")
  const [view, setView] = useState("roster") // roster or farm
  const [totalBudget, setTotalBudget] = useState(0);
  const [leagueName, setLeagueName] = useState("default league");
  const [year, setYear] = useState(2025);

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
        setYear(res.data.Year);
      } catch (err) {
        console.error("Failed to fetch league information")
      }
    }

    useEffect(() => {
      loadLeagueInfo();
    }, []);

  

  return (
    <div className="main-page">
        <Header pages={pages} onPageChange={handlePageChange} onLogout={onLogout}/>
        {currentPage === "Main Page" ? 
        <div className="drafting-page">

          <div className="team-roster">
              <h1>Team Rosters of {leagueName}</h1>
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
              />
          </div>
          <div className="news-history">
            <Drawer/>
          </div>
        </div> :         
        <div className="settings-page">
          <h1 className="settings-title">Draft Settings</h1>
          <LeagueConfiguration />
          <UpdatePlayerEligibility />
          <AddPlayerToPool />
        </div>
        }
    </div>
  );
}

export default MainPage;