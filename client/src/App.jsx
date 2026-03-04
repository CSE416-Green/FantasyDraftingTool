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

  return (
    <>
      {/* <div>Welcome, Green.</div> */}
      <MainPage />
      <TeamRoster />
      <PlayerPool />
      <Note />
    </>
  )
}

export default App
