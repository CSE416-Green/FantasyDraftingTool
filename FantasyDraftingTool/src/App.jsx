import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import MainPage from './MainPage'
// Fantasy Drafting Tool
function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div>Welcome, Green.</div>
      <MainPage />
    </>
  )
}

export default App
