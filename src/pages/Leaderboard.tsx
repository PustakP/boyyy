import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../supabaseClient'

type LeaderboardEntry = {
  id: string
  display_name: string | null
  current_level: number
  updated_at: string | null
}

// board ui keeps ranks tidy
export const LeaderboardPage = () => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshTick, setRefreshTick] = useState(0)
  const client = supabase!

  useEffect(() => {
    const loadLeaderboard = async () => {
      setLoading(true)
      const { data, error: queryError } = await client
        .from('profiles')
        .select('id, display_name, current_level, updated_at')
        .order('current_level', { ascending: false })
        .order('updated_at', { ascending: true })
        .limit(100)

      if (queryError) {
        console.error('failed to load leaderboard', queryError)
        setError('leaderboard offline. try again shortly.')
        setEntries([])
      } else {
        setEntries(data ?? [])
        setError(null)
      }
      setLoading(false)
    }

    loadLeaderboard()
  }, [client, refreshTick])

  useEffect(() => {
    const id = window.setInterval(() => setRefreshTick((tick) => tick + 1), 60000)
    return () => window.clearInterval(id)
  }, [])

  const renderEntries = useMemo(() => {
    return entries.map((entry, index) => {
      const place = index + 1
      return (
        <li key={entry.id} className="board-row">
          <span className="board-rank">{place}</span>
          <span className="board-name">{entry.display_name ?? 'anon'}</span>
          <span className="board-level">{entry.current_level}</span>
          <span className="board-updated">
            {entry.updated_at ? new Date(entry.updated_at).toLocaleTimeString() : 'just now'}
          </span>
        </li>
      )
    })
  }, [entries])

  return (
    <section className="board-shell">
      <header className="board-header">
        <div>
          <p className="board-tag">global standings</p>
          <h2 className="board-title">leaderboard</h2>
        </div>
        <button
          type="button"
          className="board-refresh"
          disabled={loading}
          onClick={() => setRefreshTick((tick) => tick + 1)}
        >
          refresh
        </button>
      </header>

      {loading ? <p className="board-status">syncing leaderboard data...</p> : null}
      {error ? <p className="board-error">{error}</p> : null}

      {!loading && !error ? (
        <ul className="board-list">
          <li className="board-row board-row--head">
            <span className="board-rank">rank</span>
            <span className="board-name">name</span>
            <span className="board-level">lvl</span>
            <span className="board-updated">last solve</span>
          </li>
          {renderEntries.length ? renderEntries : <li className="board-empty">nobody yet. be the first.</li>}
        </ul>
      ) : null}
    </section>
  )
}

