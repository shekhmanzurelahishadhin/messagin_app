// useEcho.js - Updated to use presence channels
import { useEffect, useRef } from 'react'
import { getEcho, disconnectEcho } from '../services/echo'
import useAuthStore from '../contexts/authStore'
import useThreadsStore from '../contexts/threadsStore'

export default function useEcho() {
  const { user, token } = useAuthStore()
  const { currentThread, pushMessage,
          pushThreadUpdate, fetchThreads,
          fetchUnreadCount, removeMessageLocally } = useThreadsStore()

  const echoRef = useRef(null)
  const threadChannelRef = useRef(null)
  const userChannelRef = useRef(null)

  // ── 1. Connect / disconnect Echo when auth state changes ────────────────
  useEffect(() => {
    if (!token || !user) {
      disconnectEcho()
      echoRef.current = null
      threadChannelRef.current = null
      userChannelRef.current = null
      return
    }

    const echo = getEcho(token)
    echoRef.current = echo

    // Initial data load
    fetchThreads()
    fetchUnreadCount()

    return () => {
      // Cleanup handled in individual effects
    }
  }, [token, user?.id])

  // ── 2. Subscribe to personal user channel (keep as private) ────────────
  useEffect(() => {
    if (!echoRef.current || !user) return

    if (userChannelRef.current) {
      echoRef.current.leave(`private-user.${user.id}`)
      userChannelRef.current = null
    }

    const channel = echoRef.current
      .private(`user.${user.id}`)
      .listen('.threads.updated', (e) => {
        pushThreadUpdate(e.thread_id, e.last_message, user.id)
      })

    userChannelRef.current = channel

    return () => {
      if (echoRef.current) {
        echoRef.current.leave(`private-user.${user.id}`)
      }
      userChannelRef.current = null
    }
  }, [user?.id, echoRef.current])

  // ── 3. Subscribe to active thread for messages (PRIVATE) ─────────────
  useEffect(() => {
    // Leave previous private channel
    if (threadChannelRef.current && echoRef.current) {
      const prevId = threadChannelRef.current.__threadId
      if (prevId) {
        echoRef.current.leave(`private-thread.${prevId}`)
      }
      threadChannelRef.current = null
    }

    if (!echoRef.current || !currentThread) return

    const threadId = currentThread.id

    // Use private() for thread messages
    const channel = echoRef.current
      .private(`thread.${threadId}`)
      .listen('.message.sent', (e) => {
        pushMessage(e.message, e.thread_id, user.id)
      })
      .listen('.message.deleted', (e) => {
        removeMessageLocally(e.message_id, e.thread_id)
      })

    // Tag the channel ref
    channel.__threadId = threadId
    threadChannelRef.current = channel

    return () => {
      if (echoRef.current && threadId) {
        echoRef.current.leave(`private-thread.${threadId}`)
      }
      threadChannelRef.current = null
    }
  }, [currentThread?.id, echoRef.current])
}