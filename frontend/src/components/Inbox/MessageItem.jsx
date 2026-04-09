import { format, isToday, isYesterday } from 'date-fns'
import { RiDeleteBin7Line, RiFileDownloadLine, RiFileTextLine } from 'react-icons/ri'
import useAuthStore from '../../contexts/authStore'
import useThreadsStore from '../../contexts/threadsStore'

function formatTime(dateStr) {
  const d = new Date(dateStr)
  if (isToday(d))     return format(d, 'h:mm a')
  if (isYesterday(d)) return `Yesterday ${format(d, 'h:mm a')}`
  return format(d, 'MMM d, h:mm a')
}

export default function MessageItem({ message }) {
  const { user } = useAuthStore()
  const { deleteMessage } = useThreadsStore()
  const isMine   = message.user_id === user?.id
  const sender   = message.user

  const handleDelete = async () => {
    if (window.confirm('Delete this message for everyone?')) {
      await deleteMessage(message.id)
    }
  }

  const isImage = message.attachment_type?.startsWith('image/')

  return (
    <div className={`group flex items-end gap-2.5 message-enter ${isMine ? 'flex-row-reverse' : 'flex-row'}`}>
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
        <div className="relative group/bubble">
          <div
            className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed overflow-hidden
              ${isMine
                ? 'bg-violet-600 text-white rounded-br-sm shadow-md shadow-violet-900/20'
                : 'bg-ink-800 text-ink-100 rounded-bl-sm border border-ink-700/50'
              }`}
          >
            {/* Attachment */}
            {message.attachment_url && (
              <div className="mb-2">
                {isImage ? (
                  <a href={message.attachment_url} target="_blank" rel="noopener noreferrer" className="block rounded-lg overflow-hidden border border-white/10 hover:opacity-90 transition-opacity">
                    <img src={message.attachment_url} alt={message.attachment_name} className="max-w-full max-h-60 object-cover" />
                  </a>
                ) : (
                  <a 
                    href={message.attachment_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={`flex items-center gap-3 p-2.5 rounded-xl border transition-colors
                      ${isMine 
                        ? 'bg-white/10 border-white/20 hover:bg-white/20' 
                        : 'bg-ink-900/50 border-ink-700/50 hover:bg-ink-900'
                      }`}
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center
                      ${isMine ? 'bg-white/20 text-white' : 'bg-ink-800 text-ink-300'}`}
                    >
                      <RiFileTextLine size={22} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{message.attachment_name}</p>
                      <p className={`text-[10px] uppercase ${isMine ? 'text-white/60' : 'text-ink-500'}`}>
                        {message.attachment_type?.split('/')[1] || 'FILE'}
                      </p>
                    </div>
                    <RiFileDownloadLine size={18} className={isMine ? 'text-white/70' : 'text-ink-400'} />
                  </a>
                )}
              </div>
            )}

            {message.body && <p className="whitespace-pre-wrap">{message.body}</p>}
          </div>

          {/* Actions */}
          {isMine && (
            <button
              onClick={handleDelete}
              className="absolute -left-10 top-1/2 -translate-y-1/2 p-2 opacity-0 group-hover:opacity-100 
                         hover:text-rose-400 text-ink-600 transition-all scale-90 hover:scale-100"
              title="Delete message"
            >
              <RiDeleteBin7Line size={16} />
            </button>
          )}
        </div>

        {/* Time */}
        <span className="text-[10px] text-ink-700 px-1">{formatTime(message.created_at)}</span>
      </div>
    </div>
  )
}
