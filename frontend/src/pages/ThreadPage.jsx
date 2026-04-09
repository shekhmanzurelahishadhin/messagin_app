import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  RiArrowLeftLine,
  RiDeleteBin6Line,
  RiMenuLine,
  RiUserLine,
} from 'react-icons/ri'
import Header from '../components/Layout/Header'
import ThreadList from '../components/Inbox/ThreadList'
import MessageList from '../components/Inbox/MessageList'
import MessageComposer from '../components/Inbox/MessageComposer'
import LoadingSpinner from '../components/Common/LoadingSpinner'
import useThreadsStore from '../contexts/threadsStore'
import useThreads from '../hooks/useThreads'

export default function ThreadPage() {
  const { id }     = useParams()
  const navigate   = useNavigate()
  const { fetchThread, currentThread, isLoadingThread, deleteThread } = useThreadsStore()

  // Trigger polling
  useThreads()

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showParticipants, setShowParticipants] = useState(false)

  useEffect(() => {
    if (id) fetchThread(id)
  }, [id]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleDelete = async () => {
    if (!window.confirm('Leave this conversation? This cannot be undone.')) return
    const result = await deleteThread(id)
    if (result.success) navigate('/')
  }

  const participants = currentThread?.participants || []

  return (
    <div className="flex flex-col h-screen bg-ink-950 overflow-hidden">
      <Header />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar — thread list */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-20 bg-ink-950/60 backdrop-blur-sm md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        <div
          className={`
            fixed md:relative z-30 md:z-auto
            w-72 h-[calc(100vh-56px)]
            glass-panel border-r border-ink-800/60
            transition-transform duration-200
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          `}
        >
          <ThreadList />
        </div>

        {/* Main thread view */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Thread header bar */}
          <div className="shrink-0 px-4 py-3 border-b border-ink-800/60 glass-panel flex items-center gap-3">
            {/* Mobile: back + menu */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden btn-ghost p-1.5 rounded-lg"
            >
              <RiMenuLine />
            </button>
            <button
              onClick={() => navigate('/')}
              className="md:hidden btn-ghost p-1.5 rounded-lg"
            >
              <RiArrowLeftLine />
            </button>

            {/* Thread info */}
            <div className="flex-1 min-w-0">
              {isLoadingThread ? (
                <div className="h-4 w-40 bg-ink-800 rounded animate-pulse" />
              ) : (
                <h1 className="text-sm font-semibold text-ink-100 truncate">
                  {currentThread?.subject || '—'}
                </h1>
              )}
              {/* Participants pill */}
              {participants.length > 0 && (
                <button
                  onClick={() => setShowParticipants((v) => !v)}
                  className="flex items-center gap-1 mt-0.5 group"
                >
                  <div className="flex -space-x-1">
                    {participants.slice(0, 4).map((p) => (
                      <img
                        key={p.id}
                        src={p.avatar_url}
                        alt={p.name}
                        className="w-4 h-4 rounded-full ring-1 ring-ink-900 object-cover"
                      />
                    ))}
                  </div>
                  <span className="text-[11px] text-ink-600 group-hover:text-ink-400 transition-colors">
                    {participants.length} participant{participants.length !== 1 ? 's' : ''}
                  </span>
                </button>
              )}
            </div>

            {/* Actions */}
            <button
              onClick={handleDelete}
              className="btn-ghost p-2 rounded-lg text-ink-600 hover:text-rose-400 hover:bg-rose-500/10"
              title="Leave conversation"
            >
              <RiDeleteBin6Line className="text-sm" />
            </button>
          </div>

          {/* Participants dropdown */}
          {showParticipants && participants.length > 0 && (
            <div className="shrink-0 px-4 py-2 bg-ink-900/50 border-b border-ink-800/40 animate-fade-in">
              <div className="flex flex-wrap gap-2">
                {participants.map((p) => (
                  <div key={p.id} className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-ink-800 border border-ink-700">
                    <img src={p.avatar_url} alt={p.name} className="w-4 h-4 rounded-full object-cover" />
                    <span className="text-xs text-ink-300">{p.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Messages */}
          <MessageList />

          {/* Composer */}
          {currentThread && !isLoadingThread && (
            <MessageComposer threadId={currentThread.id} />
          )}
        </main>
      </div>
    </div>
  )
}
