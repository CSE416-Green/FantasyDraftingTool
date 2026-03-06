import { useState } from 'react'
import TeamRoster from './TeamRoster'
import PlayerPool from './PlayerPool'
import Note from './Note'
import LeagueConfiguration from './LeagueConfig'
import UpdatePlayerEligibility from './UpdatePlayerEligibility'
import AddPlayerToPool from './AddPlayerToPool'
import PlayerNews from './PlayerNews'
import Drawer from './Drawer'
import './css/mainPage.css'
import './css/settingsPage.css'
import Header from './Header';

const pages = ['Main Page', 'Setting'];

function MainPage() {
  const [team, setTeam] = useState("Team 1")
  const [view, setView] = useState("roster") // roster or farm

  const [currentPage, setCurrentPage] = useState(pages[0]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="main-page">
        <Header pages={pages} onPageChange={handlePageChange}/>
        {currentPage === "Main Page" ? 
        <div className="drafting-page">
          <div className="team-roster">
              <PlayerPool
                    team={team}
                    view={view}
                    onTeamChange={setTeam}
                    onRosterPlayers={() => setView("roster")} 
                    onFarmPlayers={() => setView("farm")}
              />
          </div>
          <div className="player-pool">
              <TeamRoster/>
          </div>
          <div className="notes"> 
          <Note />
          <div>Domonstration Purpose, not actually on this page...</div>
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