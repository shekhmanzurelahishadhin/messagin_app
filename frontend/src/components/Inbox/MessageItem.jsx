import { format, isToday, isYesterday } from 'date-fns'
import useAuthStore from '../../contexts/authStore'

function formatTime(dateStr) {
  const d = new Date(dateStr)
  if (isToday(d))     return format(d, 'h:mm a')
  if (isYesterday(d)) return `Yesterday ${format(d, 'h:mm a')}`
  return format(d, 'MMM d, h:mm a')
}

export default function MessageItem({ message }) {
  const { user } = useAuthStore()
  const isMine   = message.user_id === user?.id
  const sender   = message.user

  return (
    <div className={`flex items-end gap-2.5 message-enter ${isMine ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar */}
      {!isMine && (
        <img
          src={sender?.avatar_url}
          alt={sender?.name}
          className="w-7 h-7 rounded-full object-cover ring-1 ring-ink-800 shrink-0 mb-0.5"
        />
      )}

      <div className={`flex flex-col gap-1 max-w-[72%] ${isMine ? 'items-end' : 'items-start'}`}>
        {/* Sender name */}
        {!isMine && (
          <span className="text-[11px] text-ink-500 font-medium px-1">{sender?.name}</span>
        )}

        {/* Bubble */}
        <div
          className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed
            ${isMine
              ? 'bg-violet-600 text-white rounded-br-sm'
              : 'bg-ink-800 text-ink-100 rounded-bl-sm border border-ink-700/50'
            }`}
        >
          {message.body}
        </div>

        {/* Time */}
        <span className="text-[10px] text-ink-700 px-1">{formatTime(message.created_at)}</span>
      </div>
    </div>
  )
}
