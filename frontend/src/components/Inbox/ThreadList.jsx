import { useState, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { RiSearchLine, RiEditLine, RiInboxLine } from 'react-icons/ri'
import ThreadItem from './ThreadItem'
import NewThreadModal from './NewThreadModal'
import LoadingSpinner from '../Common/LoadingSpinner'
import useThreadsStore from '../../contexts/threadsStore'

export default function ThreadList({ className = '' }) {
  const { threads, isLoadingList, fetchMoreThreads, threadPage, markThreadReadLocally } = useThreadsStore()
  const { id: activeId } = useParams()
  const navigate         = useNavigate()

  const [search, setSearch]   = useState('')
  const [showModal, setShowModal] = useState(false)

  const filtered = useMemo(() => {
    if (!search.trim()) return threads
    const q = search.toLowerCase()
    return threads.filter(
      (t) =>
        t.subject.toLowerCase().includes(q) ||
        t.last_message?.body.toLowerCase().includes(q)
    )
  }, [threads, search])

  const handleSelect = (thread) => {
    markThreadReadLocally(thread.id)
    navigate(`/threads/${thread.id}`)
  }

  const handleCreated = (thread) => {
    setShowModal(false)
    navigate(`/threads/${thread.id}`)
  }

  return (
    <aside className={`flex flex-col h-full ${className}`}>
      {/* Header */}
      <div className="px-3 pt-4 pb-3 shrink-0">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-semibold text-ink-500 uppercase tracking-widest">Messages</h2>
          <button
            onClick={() => setShowModal(true)}
            className="btn-ghost p-1.5 rounded-lg text-violet-400 hover:text-violet-300 hover:bg-violet-500/10"
            title="New thread"
          >
            <RiEditLine className="text-base" />
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-600 text-sm pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search threads…"
            className="input-field pl-9 py-2 text-xs"
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-2 pb-3 space-y-0.5">
        {isLoadingList && threads.length === 0 ? (
          <div className="flex justify-center pt-8">
            <LoadingSpinner />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center pt-12 gap-3 text-ink-600">
            <RiInboxLine className="text-3xl" />
            <p className="text-sm">{search ? 'No results found' : 'No threads yet'}</p>
          </div>
        ) : (
          filtered.map((thread) => (
            <ThreadItem
              key={thread.id}
              thread={thread}
              isActive={String(thread.id) === String(activeId)}
              onClick={() => handleSelect(thread)}
            />
          ))
        )}

        {/* Load more */}
        {threadPage?.links?.next && (
          <button
            onClick={fetchMoreThreads}
            className="w-full py-2 text-xs text-ink-500 hover:text-ink-300 transition-colors"
          >
            Load more
          </button>
        )}
      </div>

      {showModal && (
        <NewThreadModal onClose={() => setShowModal(false)} onCreated={handleCreated} />
      )}
    </aside>
  )
}
