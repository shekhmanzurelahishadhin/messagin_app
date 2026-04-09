import { formatDistanceToNowStrict, isValid } from 'date-fns'
import { RiChat3Line } from 'react-icons/ri'

export default function ThreadItem({ thread, isActive, onClick }) {
  const lastMsg    = thread.last_message
  const unread     = thread.unread_count || 0

  const getDate = (dateStr) => {
    if (!dateStr) return null
    const date = new Date(dateStr)
    return isValid(date) ? date : null
  }

  const dateToFormat = getDate(lastMsg?.created_at) || getDate(thread.created_at) || new Date()
  const timeStr      = formatDistanceToNowStrict(dateToFormat, { addSuffix: false })

  // Get participant avatars (up to 2)
  const participants = thread.participants?.slice(0, 2) || []

  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-3 py-3 rounded-xl transition-all duration-150 group
        ${isActive
          ? 'bg-violet-600/15 border border-violet-500/20'
          : 'hover:bg-ink-800/60 border border-transparent'
        }`}
    >
      <div className="flex items-start gap-3">
        {/* Avatar stack */}
        <div className="relative shrink-0 w-9 h-9">
          {participants[0] ? (
            <img
              src={participants[0].avatar_url}
              alt={participants[0].name}
              className="w-9 h-9 rounded-full object-cover ring-1 ring-ink-800"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-ink-700 flex items-center justify-center">
              <RiChat3Line className="text-ink-500 text-sm" />
            </div>
          )}
          {participants[1] && (
            <img
              src={participants[1].avatar_url}
              alt={participants[1].name}
              className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full object-cover ring-1 ring-ink-900"
            />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline justify-between gap-2">
            <span className={`text-sm font-medium truncate ${unread > 0 ? 'text-ink-100' : 'text-ink-300'}`}>
              {thread.subject}
            </span>
            <span className="text-[11px] text-ink-600 shrink-0">{timeStr}</span>
          </div>

          <div className="flex items-center justify-between gap-2 mt-0.5">
            <p className={`text-xs truncate ${unread > 0 ? 'text-ink-400' : 'text-ink-600'}`}>
              {lastMsg?.body ? lastMsg.body : (lastMsg.attachment_name ? `${lastMsg.attachment_name}` : 'No messages yet.')}
            </p>
            {unread > 0 && (
              <span className="shrink-0 min-w-[18px] h-[18px] px-1 rounded-full bg-violet-600 text-white text-[10px] font-semibold flex items-center justify-center animate-pulse-dot">
                {unread > 99 ? '99+' : unread}
              </span>
            )}
          </div>
        </div>
      </div>
    </button>
  )
}
