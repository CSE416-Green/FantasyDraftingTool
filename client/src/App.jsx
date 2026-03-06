import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './css/App.css'
import MainPage from './MainPage'
import TeamRoster from './TeamRoster'
import PlayerPool from './PlayerPool'
import Note from './Note'
import LeagueConfiguration from './LeagueConfig'
import UpdatePlayerEligibility from './UpdatePlayerEligibility'
import AddPlayerToPool from './AddPlayerToPool'
import PlayerNews from './PlayerNews'
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'

const queryClient = new QueryClient()

function App() {
  const [count, setCount] = useState(0)
  const [team, setTeam] = useState("Team 1")
  const [view, setView] = useState("roster") // roster or farm

  function handleTeamChange(newTeam) {
    setTeam(newTeam);
  }

  return (
    <QueryClientProvider client={queryClient}>
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

      <div>Domonstration Purpose, not actually on this page...</div>
      <LeagueConfiguration />
      <UpdatePlayerEligibility />
      <AddPlayerToPool />
      <PlayerNews />
    </QueryClientProvider>
  )
}

export default App
