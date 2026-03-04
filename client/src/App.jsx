import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import MainPage from './MainPage'
import TeamRoster from './TeamRoster'
import PlayerPool from './PlayerPool'
import Note from './Note'
function App() {
  const [count, setCount] = useState(0)
  const [team, setTeam] = useState("Team 1")
  const [view, setView] = useState("roster") // roster or farm

  function handleTeamChange(newTeam) {
    setTeam(newTeam);
  }

  return (
    <>
      {/* <div>Welcome, Green.</div> */}
      <MainPage />
      <TeamRoster />
      <PlayerPool
        team={team}
        view={view}
        onTeamChange={setTeam}
        onRosterPlayers={() => setView("roster")} 
        onFarmPlayers={() => setView("farm")}
      />
      <Note />
    </>
  )
}

export default App
