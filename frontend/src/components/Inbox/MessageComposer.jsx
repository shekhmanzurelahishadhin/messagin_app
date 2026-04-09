import { useState, useRef, useEffect } from 'react'
import { RiSendPlaneFill, RiAttachment2, RiCloseLine, RiFileTextLine, RiEmotionLine } from 'react-icons/ri'
import EmojiPicker from 'emoji-picker-react'
import useThreadsStore from '../../contexts/threadsStore'
import useAuthStore from '../../contexts/authStore'
import useTyping from '../../hooks/useTyping'
import TypingIndicator from './TypingIndicator'
import LoadingSpinner from '../Common/LoadingSpinner'

const MAX_CHARS = 5000

export default function MessageComposer({ threadId }) {
  const { user } = useAuthStore()
  const { sendMessage, isSending } = useThreadsStore()
  const { typingUsers, onTyping }  = useTyping(threadId)

  const [body, setBody]   = useState('')
  const [file, setFile]   = useState(null)
  const [showEmoji, setShowEmoji] = useState(false)
  const textareaRef       = useRef(null)
  const fileInputRef      = useRef(null)
  const emojiRef          = useRef(null)

  // Auto-focus when thread changes
  useEffect(() => {
    textareaRef.current?.focus()
    setBody('')
    setFile(null)
    setShowEmoji(false)
  }, [threadId])

  // Close emoji picker when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (emojiRef.current && !emojiRef.current.contains(event.target)) {
        setShowEmoji(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSend = async () => {
    const trimmed = body.trim()
    if ((!trimmed && !file) || isSending) return
    
    const currentFile = file
    const currentBody = trimmed
    
    setBody('')
    setFile(null)
    setShowEmoji(false)
    
    await sendMessage(threadId, currentBody, currentFile)
    textareaRef.current?.focus()
  }

  const handleEmojiClick = (emojiData) => {
    const textarea = textareaRef.current
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const text = body.substring(0, start) + emojiData.emoji + body.substring(end)
    setBody(text)
    
    // Reset focus and cursor position
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + emojiData.emoji.length, start + emojiData.emoji.length)
    }, 0)
  }

  const handleFileChange = (e) => {
    const selected = e.target.files[0]
    if (selected) {
      setFile(selected)
    }
  }

  const removeFile = () => {
    setFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
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

      <div className="flex items-start gap-3">
        {/* User Avatar */}
        <div className="shrink-0 pt-1.5 hidden sm:block">
          <img
            src={user?.avatar_url}
            alt={user?.name}
            className="w-8 h-8 rounded-full object-cover ring-2 ring-ink-800 shadow-lg"
          />
        </div>

        <div className="flex-1 glass-panel rounded-2xl p-3 shadow-lg">
          {file && (
            <div className="flex items-center gap-3 mb-3 p-2 rounded-xl bg-ink-800/40 border border-ink-800/60">
              <div className="w-10 h-10 rounded-lg bg-ink-700/50 flex items-center justify-center text-ink-300">
                <RiFileTextLine size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-ink-100 truncate">{file.name}</p>
                <p className="text-[10px] text-ink-500 uppercase">{(file.size / 1024).toFixed(1)} KB</p>
              </div>
              <button
                onClick={removeFile}
                className="p-1 hover:bg-ink-700 rounded-full text-ink-500 transition-colors"
              >
                <RiCloseLine size={18} />
              </button>
            </div>
          )}

          <textarea
            ref={textareaRef}
            value={body}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={file ? "Add a description… (optional)" : "Write a message… (Enter to send, Shift+Enter for new line)"}
            rows={1}
            className="w-full bg-transparent text-ink-100 placeholder-ink-600 text-sm resize-none
                       focus:outline-none leading-relaxed min-h-[38px] max-h-40"
          />

          <div className="flex items-center justify-between mt-2 pt-2 border-t border-ink-800/60">
            <div className="flex items-center gap-1">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-2 hover:bg-ink-800 rounded-lg text-ink-500 hover:text-ink-300 transition-colors"
                title="Attach file"
              >
                <RiAttachment2 size={18} />
              </button>

              <div className="relative" ref={emojiRef}>
                <button
                  onClick={() => setShowEmoji(!showEmoji)}
                  className={`p-2 rounded-lg transition-colors ${showEmoji ? 'bg-violet-600/20 text-violet-400' : 'hover:bg-ink-800 text-ink-500 hover:text-ink-300'}`}
                  title="Add emoji"
                >
                  <RiEmotionLine size={18} />
                </button>
                {showEmoji && (
                  <div className="absolute bottom-full left-0 mb-3 z-50 shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-200">
                    <EmojiPicker 
                      theme="dark" 
                      onEmojiClick={handleEmojiClick}
                      width={320}
                      height={400}
                      skinTonesDisabled
                      searchPlaceholder="Search emojis..."
                    />
                  </div>
                )}
              </div>

              <span className={`text-[11px] transition-colors ${nearLimit ? 'text-rose-400' : 'text-ink-700'}`}>
                {nearLimit ? `${charsLeft} left` : ''}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] text-ink-700 hidden sm:block">
                Enter ↵ to send
              </span>
              <button
                onClick={handleSend}
                disabled={(!body.trim() && !file) || isSending}
                className="btn-primary px-3 py-1.5 text-xs rounded-lg disabled:opacity-40"
              >
                {isSending ? <LoadingSpinner size="sm" /> : <RiSendPlaneFill className="text-sm" />}
                <span className="hidden sm:inline">Send</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
