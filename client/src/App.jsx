import { useState } from 'react'
import './css/App.css'
import MainPage from './MainPage'
import Login from './Login'
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'

const queryClient = new QueryClient()

function App() {
  const [user,setUser]=useState(()=>{
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });
  return (
    <QueryClientProvider client={queryClient}>
      {user? ( <MainPage user={user} onLogout={() => setUser(null)}/>):(<Login onLogin={(userData)=>setUser(userData)}/>)}
     
    </QueryClientProvider>

  )
}

export default App
