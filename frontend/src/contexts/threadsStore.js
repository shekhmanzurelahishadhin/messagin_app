import { create } from 'zustand'
import api from '../services/api'

const useThreadsStore = create((set, get) => ({
  threads:         [],
  currentThread:   null,
  messages:        [],
  unreadCount:     0,
  isLoadingList:   false,
  isLoadingThread: false,
  isSending:       false,
  error:           null,
  pagination:      null,
  threadPage:      null,

  // ------------------------------------------------------------------
  fetchThreads: async () => {
    set({ isLoadingList: true, error: null })
    try {
      const { data } = await api.get('/threads')
      const { currentThread } = get()
      const threads = data.data.map((t) =>
        t.id === currentThread?.id ? { ...t, unread_count: 0 } : t
      )
      set({ threads, threadPage: data.meta, isLoadingList: false })
    } catch {
      set({ error: 'Failed to load threads.', isLoadingList: false })
    }
  },

  fetchMoreThreads: async () => {
    const { threadPage, threads, currentThread } = get()
    if (!threadPage?.links?.next) return
    try {
      const { data } = await api.get(threadPage.links.next)
      const more = data.data.map((t) =>
        t.id === currentThread?.id ? { ...t, unread_count: 0 } : t
      )
      set({ threads: [...threads, ...more], threadPage: data.meta })
    } catch (_) {}
  },

  fetchThread: async (threadId) => {
    set({ isLoadingThread: true, currentThread: null, messages: [], error: null })

    try {
      const { data } = await api.get(`/threads/${threadId}`)
      // Backend returns { thread: ..., messages: { data: [], meta: ... } }
      const msgs = [...(data.messages?.data || [])].reverse()
      set({
        currentThread: data.thread,
        messages: msgs,
        pagination: data.messages?.meta || null,
        isLoadingThread: false,
      })

      get().markThreadReadLocally(threadId)
    } catch (error) {
      console.error(error)
      set({ error: 'Failed to load thread.', isLoadingThread: false })
    }
  },

  loadMoreMessages: async () => {
    const { currentThread, messages, pagination } = get()
    if (!pagination?.links?.next) return
    try {
      const { data } = await api.get(
        `/threads/${currentThread.id}?page=${pagination.current_page + 1}`
      )
      const older = [...(data.messages?.data || [])].reverse()
      set({ messages: [...older, ...messages], pagination: data.messages?.meta })
    } catch (_) {}
  },

  sendMessage: async (threadId, body) => {
    set({ isSending: true })
    try {
      const { data } = await api.post(`/threads/${threadId}/messages`, { body })
      // Sender sees own message immediately (Echo won't echo back to sender)
      set((state) => ({ messages: [...state.messages, data.data], isSending: false }))
      get().bumpThread(threadId, data.data)
      return { success: true }
    } catch {
      set({ isSending: false })
      return { success: false }
    }
  },

  createThread: async ({ subject, participants, body }) => {
    try {
      const { data } = await api.post('/threads', { subject, participants, body })
      set((state) => ({ threads: [data.data, ...state.threads] }))
      return { success: true, thread: data.data }
    } catch (err) {
      return { success: false, errors: err.response?.data?.errors }
    }
  },

  deleteThread: async (threadId) => {
    try {
      await api.delete(`/threads/${threadId}`)
      set((state) => ({
        threads:       state.threads.filter((t) => t.id !== threadId),
        currentThread: state.currentThread?.id === threadId ? null : state.currentThread,
        messages:      state.currentThread?.id === threadId ? [] : state.messages,
      }))
      return { success: true }
    } catch (_) {
      return { success: false }
    }
  },

  fetchUnreadCount: async () => {
    try {
      const { data } = await api.get('/threads/unread/count')
      set({ unreadCount: data.unread_count })
    } catch (_) {}
  },

  // ── Real-time push handlers called by useEcho ─────────────────────────────

  /**
   * Called when MessageSent fires on thread.{threadId}.
   * Only appends if the user is currently viewing that thread;
   * otherwise increments the unread badge.
   */
  pushMessage: (message, threadId, userId) => {
    const { currentThread, messages } = get()
    const alreadyExists = messages.some((m) => m.id === message.id)
    const isFromMe = message.user_id === userId

    if (currentThread?.id === threadId && !alreadyExists && !isFromMe) {
      set({ messages: [...messages, message] })
      // Mark read silently since user is looking at the thread
      api.put(`/threads/${threadId}/read`).catch(() => {})
      get().markThreadReadLocally(threadId)
    } else if (currentThread?.id !== threadId && !isFromMe) {
      set((state) => ({
        unreadCount: state.unreadCount + 1,
        threads: state.threads.map((t) =>
          t.id === threadId
            ? { ...t, unread_count: (t.unread_count || 0) + 1 }
            : t
        ),
      }))
    }

    get().bumpThread(threadId, message)
  },

  /**
   * Called when UserThreadsUpdated fires on user.{userId}.
   * Keeps the thread list preview up-to-date without a full refetch.
   */
  pushThreadUpdate: (threadId, lastMessage, userId) => {
    const { threads, currentThread, unreadCount } = get()
    const exists = threads.find((t) => t.id === threadId)

    if (!exists) {
      // Unknown thread — could be brand-new, do a full list refresh
      get().fetchThreads()
      get().fetchUnreadCount()
      return
    }

    const isViewing = currentThread?.id === threadId
    const isFromMe = lastMessage.user_id === userId
    
    // Only increment unread if NOT viewing and NOT from me
    const shouldIncrement = !isViewing && !isFromMe
    const newUnreadCount = shouldIncrement ? (exists.unread_count || 0) + 1 : (isViewing ? 0 : exists.unread_count || 0)

    const updated = {
      ...exists,
      last_message: {
        ...lastMessage,
        created_at: lastMessage.created_at || new Date().toISOString(),
      },
      updated_at:   lastMessage.created_at || new Date().toISOString(),
      unread_count: newUnreadCount,
    }

    set({
      threads: [updated, ...threads.filter((t) => t.id !== threadId)],
      unreadCount: shouldIncrement ? unreadCount + 1 : unreadCount,
    })
  },

  // ── Local helpers ──────────────────────────────────────────────────────────

  markThreadReadLocally: (threadId) => {
    set((state) => ({
      threads: state.threads.map((t) =>
        t.id === threadId ? { ...t, unread_count: 0 } : t
      ),
      unreadCount: Math.max(
        0,
        state.unreadCount -
          (state.threads.find((t) => t.id === threadId)?.unread_count || 0)
      ),
    }))
  },

  bumpThread: (threadId, message) => {
    set((state) => {
      const thread = state.threads.find((t) => t.id === threadId)
      if (!thread) return {}
      const now = new Date().toISOString()
      const updated = {
        ...thread,
        last_message: {
          id:         message.id,
          body:       message.body,
          user_id:    message.user_id,
          created_at: message.created_at || now,
        },
        updated_at: message.created_at || now,
      }
      return { threads: [updated, ...state.threads.filter((t) => t.id !== threadId)] }
    })
  },

  setCurrentThread: (thread) => set({ currentThread: thread }),
  clearError:       () => set({ error: null }),
}))

export default useThreadsStore
