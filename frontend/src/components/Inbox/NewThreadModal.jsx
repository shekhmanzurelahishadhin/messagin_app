import { useState, useEffect } from 'react'
import { RiCloseLine, RiUserAddLine, RiCheckLine } from 'react-icons/ri'
import useThreadsStore from '../../contexts/threadsStore'
import LoadingSpinner from '../Common/LoadingSpinner'
import ErrorAlert from '../Common/ErrorAlert'
import api from '../../services/api'

export default function NewThreadModal({ onClose, onCreated }) {
  const { createThread } = useThreadsStore()

  const [subject, setSubject]         = useState('')
  const [body, setBody]               = useState('')
  const [selectedIds, setSelectedIds] = useState([])
  const [users, setUsers]             = useState([])
  const [loadingUsers, setLoadingUsers] = useState(true)
  const [isCreating, setIsCreating]   = useState(false)
  const [errors, setErrors]           = useState({})
  const [globalError, setGlobalError] = useState('')

  useEffect(() => {
    api.get('/users').then(({ data }) => {
      setUsers(data.data)
      setLoadingUsers(false)
    })

    // Trap escape key
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const toggleUser = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!subject.trim() || !body.trim() || selectedIds.length === 0) {
      setGlobalError('Please fill in all fields and select at least one participant.')
      return
    }
    setIsCreating(true)
    setGlobalError('')
    setErrors({})
    const result = await createThread({ subject, participants: selectedIds, body })
    setIsCreating(false)
    if (result.success) {
      onCreated(result.thread)
    } else {
      setErrors(result.errors || {})
      if (!result.errors) setGlobalError('Failed to create thread.')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-ink-950/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md glass-panel rounded-2xl shadow-2xl shadow-black/50 animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-ink-800/60">
          <div className="flex items-center gap-2">
            <RiUserAddLine className="text-violet-400" />
            <h2 className="text-sm font-semibold text-ink-100">New Conversation</h2>
          </div>
          <button onClick={onClose} className="btn-ghost p-1 rounded-lg text-ink-500">
            <RiCloseLine className="text-base" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="px-5 py-4 flex flex-col gap-4">
          {globalError && <ErrorAlert message={globalError} onClose={() => setGlobalError('')} />}

          {/* Subject */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-ink-400 uppercase tracking-wider">Subject</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="What's this about?"
              maxLength={255}
              autoFocus
              className={`input-field ${errors.subject ? 'border-rose-500/50' : ''}`}
            />
            {errors.subject && <span className="text-xs text-rose-400">{errors.subject[0]}</span>}
          </div>

          {/* Participants */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-ink-400 uppercase tracking-wider">
              Participants
              {selectedIds.length > 0 && (
                <span className="ml-2 text-violet-400 normal-case">{selectedIds.length} selected</span>
              )}
            </label>

            <div className="max-h-40 overflow-y-auto rounded-xl border border-ink-700 bg-ink-800/50 divide-y divide-ink-800">
              {loadingUsers ? (
                <div className="flex justify-center py-4">
                  <LoadingSpinner size="sm" />
                </div>
              ) : users.length === 0 ? (
                <p className="text-center text-xs text-ink-600 py-4">No other users found.</p>
              ) : (
                users.map((u) => {
                  const isSelected = selectedIds.includes(u.id)
                  return (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => toggleUser(u.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 transition-colors text-left
                        ${isSelected ? 'bg-violet-600/10' : 'hover:bg-ink-700/50'}`}
                    >
                      <img
                        src={u.avatar_url}
                        alt={u.name}
                        className="w-7 h-7 rounded-full object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-ink-200 font-medium truncate">{u.name}</p>
                        <p className="text-xs text-ink-600 truncate">{u.email}</p>
                      </div>
                      {isSelected && (
                        <RiCheckLine className="text-violet-400 shrink-0" />
                      )}
                    </button>
                  )
                })
              )}
            </div>
            {errors.participants && (
              <span className="text-xs text-rose-400">{errors.participants[0]}</span>
            )}
          </div>

          {/* Message */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-ink-400 uppercase tracking-wider">Message</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Write your first message…"
              rows={3}
              className={`input-field resize-none ${errors.body ? 'border-rose-500/50' : ''}`}
            />
            {errors.body && <span className="text-xs text-rose-400">{errors.body[0]}</span>}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-1">
            <button type="button" onClick={onClose} className="btn-ghost">
              Cancel
            </button>
            <button type="submit" disabled={isCreating} className="btn-primary">
              {isCreating ? <LoadingSpinner size="sm" /> : 'Create conversation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
