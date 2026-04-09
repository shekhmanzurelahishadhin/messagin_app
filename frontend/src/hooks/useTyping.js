import { useEffect, useRef, useState, useCallback } from 'react'
import { getEcho } from '../services/echo'
import useAuthStore from '../contexts/authStore'

const TYPING_TIMEOUT_MS = 2500

/**
 * useTyping(threadId)
 *
 * Returns:
 *   - typingUsers  : string[]  – names of OTHER users currently typing
 *   - onTyping()   : void      – call this whenever the local user types
 *
 * Uses a Reverb presence channel (presence-thread.{id}) so all members
 * are visible. We whisper a client event rather than going through the
 * server to keep it zero-latency and zero-database.
 */
export default function useTyping(threadId) {
  const { user, token }        = useAuthStore()
  const [typingUsers, setTypingUsers] = useState([])

  const channelRef   = useRef(null)
  const timeoutsRef  = useRef({})   // userId → clearTimeout handle
  const isTypingRef  = useRef(false)
  const stopTimerRef = useRef(null)

  // ── Subscribe to presence channel ──────────────────────────────────────
  useEffect(() => {
    if (!threadId || !token || !user) return

    const echo = getEcho(token)
    if (!echo) return

    const channel = echo.join(`thread.${threadId}`)
      // Someone started typing
      .listenForWhisper('typing', (e) => {
        if (e.userId === user.id) return      // ignore our own whispers

        const name = e.userName ?? 'Someone'

        // Show this user as typing
        setTypingUsers((prev) =>
          prev.includes(name) ? prev : [...prev, name]
        )

        // Auto-clear after timeout if we don't receive another whisper
        clearTimeout(timeoutsRef.current[e.userId])
        timeoutsRef.current[e.userId] = setTimeout(() => {
          setTypingUsers((prev) => prev.filter((n) => n !== name))
        }, TYPING_TIMEOUT_MS)
      })
      // Someone stopped typing explicitly
      .listenForWhisper('stop-typing', (e) => {
        if (e.userId === user.id) return
        clearTimeout(timeoutsRef.current[e.userId])
        setTypingUsers((prev) => prev.filter((n) => n !== e.userName))
      })

    channelRef.current = channel

    return () => {
      // Whisper stop-typing on unmount
      channel.whisper('stop-typing', { userId: user.id, userName: user.name })
      echo.leave(`presence-thread.${threadId}`)
      channelRef.current = null
      setTypingUsers([])
      Object.values(timeoutsRef.current).forEach(clearTimeout)
    }
  }, [threadId, token, user?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── onTyping — call from the composer's onChange ────────────────────────
  const onTyping = useCallback(() => {
    if (!channelRef.current) return

    if (!isTypingRef.current) {
      isTypingRef.current = true
      channelRef.current.whisper('typing', {
        userId:   user.id,
        userName: user.name,
      })
    }

    // Reset the stop-typing timer
    clearTimeout(stopTimerRef.current)
    stopTimerRef.current = setTimeout(() => {
      isTypingRef.current = false
      channelRef.current?.whisper('stop-typing', {
        userId:   user.id,
        userName: user.name,
      })
    }, TYPING_TIMEOUT_MS)
  }, [user?.id, user?.name])

  return { typingUsers, onTyping }
}
