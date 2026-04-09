import { useState, useRef, useEffect } from 'react'
import { RiSendPlaneFill } from 'react-icons/ri'
import useThreadsStore from '../../contexts/threadsStore'
import useTyping from '../../hooks/useTyping'
import TypingIndicator from './TypingIndicator'
import LoadingSpinner from '../Common/LoadingSpinner'

const MAX_CHARS = 5000

export default function MessageComposer({ threadId }) {
  const { sendMessage, isSending } = useThreadsStore()
  const { typingUsers, onTyping }  = useTyping(threadId)

  const [body, setBody]   = useState('')
  const textareaRef       = useRef(null)

  // Auto-focus when thread changes
  useEffect(() => {
    textareaRef.current?.focus()
    setBody('')
  }, [threadId])

  const handleSend = async () => {
    const trimmed = body.trim()
    if (!trimmed || isSending) return
    setBody('')
    await sendMessage(threadId, trimmed)
    textareaRef.current?.focus()
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleChange = (e) => {
    if (e.target.value.length <= MAX_CHARS) {
      setBody(e.target.value)
      onTyping()
    }
  }

  // Auto-grow textarea
  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 160) + 'px'
  }, [body])

  const charsLeft = MAX_CHARS - body.length
  const nearLimit = charsLeft < 200

  return (
    <div className="shrink-0 px-4 pb-4">
      {/* Typing indicator sits just above the composer */}
      <TypingIndicator typingUsers={typingUsers} />

      <div className="glass-panel rounded-2xl p-3 shadow-lg">
        <textarea
          ref={textareaRef}
          value={body}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Write a message… (Enter to send, Shift+Enter for new line)"
          rows={1}
          className="w-full bg-transparent text-ink-100 placeholder-ink-600 text-sm resize-none
                     focus:outline-none leading-relaxed min-h-[38px] max-h-40"
        />

        <div className="flex items-center justify-between mt-2 pt-2 border-t border-ink-800/60">
          <span className={`text-[11px] transition-colors ${nearLimit ? 'text-rose-400' : 'text-ink-700'}`}>
            {nearLimit ? `${charsLeft} left` : ''}
          </span>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-ink-700 hidden sm:block">
              Enter ↵ to send
            </span>
            <button
              onClick={handleSend}
              disabled={!body.trim() || isSending}
              className="btn-primary px-3 py-1.5 text-xs rounded-lg disabled:opacity-40"
            >
              {isSending ? <LoadingSpinner size="sm" /> : <RiSendPlaneFill className="text-sm" />}
              <span className="hidden sm:inline">Send</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
