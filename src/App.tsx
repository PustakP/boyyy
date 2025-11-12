import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { useAuth } from './hooks/useAuth'
import { HuntPage } from './pages/Hunt'
import { LeaderboardPage } from './pages/Leaderboard'
import { SignInPage } from './pages/SignIn'
import { KonamiPage } from './pages/konami'

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/signin" element={<SignInPage />} />
        <Route path="konamicode" element={<KonamiPage />} />
        <Route path="/" element={<ProtectedLayout />}>
          
          <Route element={<Layout />}>
            <Route path="hunt" element={<HuntPage />} />
            <Route path="leaderboard" element={<LeaderboardPage />} />
          </Route>
          </Route>
          
        
        <Route path="*" element={<Navigate to="/hunt" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

const ProtectedLayout = () => {
  const { session, loading } = useAuth()

  if (loading) {
    return (
      <div className="loading-shell">
        <div className="loading-glow" />
        <p>loading hunt...</p>
      </div>
    )
  }

  if (!session) {
    return <Navigate to="/signin" replace />
  }

  return <Outlet />
}

export default App
