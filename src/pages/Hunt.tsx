import type { FormEvent } from 'react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { supabase } from '../supabaseClient'
import { useAuth } from '../hooks/useAuth'

type Level = {
  id: number
  level_number: number
  title: string | null
  question_text: string | null
  question_image_url: string | null
  updated_at: string | null
}

type VerificationResult = {
  is_correct: boolean
  next_level: number | null
}

// hunt ui keeps lvl flow
export const HuntPage = () => {
  const { profile, refreshProfile } = useAuth()
  const [level, setLevel] = useState<Level | null>(null)
  const [loading, setLoading] = useState(true)
  const [answerField, setAnswerField] = useState('')
  const [status, setStatus] = useState<'idle' | 'checking' | 'correct' | 'incorrect' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const client = supabase!

  const levelNumber = profile?.current_level ?? null

  const loadLevel = useCallback(
    async (targetLevel?: number | null) => {
      const activeLevel = targetLevel ?? levelNumber
      if (activeLevel === null) {
        setLevel(null)
        setLoading(false)
        return
      }

      setLoading(true)
      // rst status + ans field for new lvl
      setStatus('idle')
      setAnswerField('')
      const { data, error } = await client
        .from('levels')
        .select('id, level_number, title, question_text, question_image_url, updated_at')
        .eq('level_number', activeLevel)
        .maybeSingle()

      if (error) {
        console.error('failed to load level', error)
        setErrorMessage('unable to load level right now.')
        setLevel(null)
      } else {
        setLevel(data ?? null)
        setErrorMessage(null)
      }
      setLoading(false)
    },
    [client, levelNumber],
  )

  useEffect(() => {
    loadLevel()
  }, [loadLevel])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (levelNumber === null || !answerField.trim()) {
      return
    }

    setStatus('checking')
    setErrorMessage(null)

    // normalize ans to lc + rm spaces before chk
    const { data, error } = await client.rpc('verify_answer', {
      p_level_number: levelNumber,
      p_attempt: answerField.trim().toLowerCase().replace(/\s+/g, ''),
    })

    if (error) {
      console.error('verification failure', error)
      setStatus('error')
      setErrorMessage('verification failed. try again soon.')
      return
    }

    // rpc returns array, get first result
    const result = (Array.isArray(data) && data.length > 0 ? data[0] : null) as VerificationResult | null

    if (result?.is_correct) {
      setStatus('correct')
      // show success msg before advancing
      setTimeout(async () => {
        await refreshProfile()
        await loadLevel(result.next_level ?? levelNumber)
      }, 1500)
    } else {
      setStatus('incorrect')
    }
  }

  const statusLabel = useMemo(() => {
    switch (status) {
      case 'checking':
        return 'checking encrypted trails...'
      case 'correct':
        return 'correct! new q unlocked.'
      case 'incorrect':
        return 'incorrect attempt. think again and retry.'
      case 'error':
        return 'systems down. give it a beat.'
      default:
        return ''
    }
  }, [status])

  return (
    <section className="hunt-shell">
      <div className="hunt-header">
        <p className="hunt-tag">current level</p>
        <h2 className="hunt-level">{levelNumber !== null ? `level ${levelNumber}` : 'no level assigned yet'}</h2>
      </div>

      {loading ? (
        <div className="hunt-card">
          <p className="hunt-status">loading level data...</p>
        </div>
      ) : null}

      {!loading && errorMessage ? (
        <div className="hunt-card">
          <p className="hunt-error">{errorMessage}</p>
        </div>
      ) : null}

      {!loading && level ? (
        <article className="hunt-card">
          <header className="hunt-card__header">
            <h3 className="hunt-card__title">{level.title ?? `level ${level.level_number}`}</h3>
            <p className="hunt-card__meta">updated {level.updated_at ? new Date(level.updated_at).toLocaleString() : 'recently'}</p>
          </header>
          {level.question_text ? <p className="hunt-card__question">{level.question_text}</p> : null}
          {level.question_image_url ? (
            <img src={level.question_image_url} alt="level puzzle visual" className="hunt-card__image" />
          ) : null}
          <form className="hunt-form" onSubmit={handleSubmit}>
            <label htmlFor="answer" className="hunt-form__label">
              answer submission
            </label>
            <div className="hunt-form__row">
              <input
                id="answer"
                name="answer"
                value={answerField}
                onChange={(event) => setAnswerField(event.target.value)}
                placeholder="type your answer"
                className="hunt-input"
                autoComplete="off"
              />
              <button type="submit" className="hunt-submit" disabled={status === 'checking'}>
                send
              </button>
            </div>
          </form>
          {statusLabel ? <p className={`hunt-feedback hunt-feedback--${status}`}>{statusLabel}</p> : null}
        </article>
      ) : null}
    </section>
  )
}

