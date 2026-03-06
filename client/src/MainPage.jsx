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

function MainPage() {
  const [count, setCount] = useState(0)
  const [team, setTeam] = useState("Team 1")
  const [view, setView] = useState("roster") // roster or farm

  return (
    <div className="main-page">
        <header className="main-header">
            <span>Fantasy Baseball Draft Kit</span>
            <button>Main Page</button >
            <button>Settings</button >
        </header>
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
          <div className="news-history">
            <Drawer/>
          </div>
        </div>

        <LeagueConfiguration />
        <UpdatePlayerEligibility />
        <AddPlayerToPool />
        <Note />
        <div>Domonstration Purpose, not actually on this page...</div>
    </div>
  );
}

export default MainPage;

/**
 * 
 *      <LeagueConfiguration />
        <UpdatePlayerEligibility />
        <AddPlayerToPool />
        <Note />
        <div>Domonstration Purpose, not actually on this page...</div>

 */