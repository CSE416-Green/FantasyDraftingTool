import { useState } from 'react'
import '../css/App.css'
import MainPage from '../pages/main-page/MainPage'
import Login from '../features/auth/Login'
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import LeagueFormContainer from '../forms/leagueFormContainer'

const queryClient = new QueryClient()

function App() {
  const [user,setUser]=useState(()=>{
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });
  const hasLeague = user?.league?.length > 0;
  console.log("hasLeague", hasLeague)
  return (
    <QueryClientProvider client={queryClient}>
      {user? ( 
        !hasLeague ? 
          (<LeagueFormContainer user={user} setUser={setUser}/>) : (<MainPage user={user} onLogout={() => setUser(null)}/>) ):
        (<Login onLogin={(userData)=>setUser(userData)}/>)}
     
    </QueryClientProvider>

  )
}

export default App
