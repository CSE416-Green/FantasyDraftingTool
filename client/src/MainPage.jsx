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
  const [team, setTeam] = useState("Team 1")
  const [view, setView] = useState("roster") // roster or farm
  const [totalBudget, setTotalBudget] = useState(0);

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

    const leagueName = "LeagueNo1";
    const year = 2025;
  

  return (
    <div className="main-page">
        <Header pages={pages} onPageChange={handlePageChange} onLogout={onLogout}/>
        {currentPage === "Main Page" ? 
        <div className="drafting-page">

          <div className="team-roster">
              <h1>Team Rosters</h1>
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
              />
          </div>
          <div className="notes"> 
              <Note />

          </div>
          <div className="draft-history">
              <DraftHistory 
                leagueName={leagueName}
                year={year}
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