import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

// layout cmp keeps nav lean
export const Layout = () => {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/signin', { replace: true })
  }

  return (
    <div className="app-shell">
      <div className="grid-overlay" />
      <div className="glow-overlay" />
      <header className="shell-header">
        <div>
          <p className="shell-subhead">gdg cryptic hunt :3</p>
          <h1 className="shell-title">im done hiding now im shining like im born to be we dreaming hard we came so far no i believe were going up up up its our moment</h1>
        </div>
        <div className="shell-actions">
          <nav className="shell-nav">
            <NavLink to="/hunt" className={({ isActive }) => (isActive ? 'nav-chip nav-chip--active' : 'nav-chip')}>
              hunt
            </NavLink>
            <NavLink
              to="/leaderboard"
              className={({ isActive }) => (isActive ? 'nav-chip nav-chip--active' : 'nav-chip')}
            >
              board
            </NavLink>
          </nav>
          <div className="shell-profile">
            <p className="shell-profile__name">{profile?.display_name ?? 'anon'}</p>
            <button type="button" className="shell-signout" onClick={handleSignOut}>
              sign out
            </button>
          </div>
        </div>
      </header>
      <main className="shell-main">
        <Outlet />
      </main>
    </div>
  )
}

