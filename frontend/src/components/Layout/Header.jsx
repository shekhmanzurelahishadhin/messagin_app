import { RiMailLine, RiLogoutBoxLine, RiNotification3Line } from 'react-icons/ri'
import useAuthStore from '../../contexts/authStore'
import useThreadsStore from '../../contexts/threadsStore'
import ConnectionStatus from '../Common/ConnectionStatus'

export default function Header() {
  const { user, logout }  = useAuthStore()
  const { unreadCount }   = useThreadsStore()

  return (
    <header className="h-14 shrink-0 flex items-center justify-between px-5 border-b border-ink-800/60 glass-panel">
      {/* Brand */}
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg bg-violet-600 flex items-center justify-center">
          <RiMailLine className="text-white text-sm" />
        </div>
        <span className="font-semibold text-ink-100 tracking-tight">Inbox</span>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        {/* WebSocket connection indicator */}
        <ConnectionStatus />

        {/* Unread badge */}
        {unreadCount > 0 && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-violet-600/15 border border-violet-500/20">
            <RiNotification3Line className="text-violet-400 text-xs" />
            <span className="text-violet-300 text-xs font-medium">{unreadCount > 99 ? '99+' : unreadCount}</span>
          </div>
        )}

        {/* User */}
        <div className="flex items-center gap-2.5">
          <img
            src={user?.avatar_url}
            alt={user?.name}
            className="w-7 h-7 rounded-full object-cover ring-1 ring-ink-700"
          />
          <span className="text-sm text-ink-300 font-medium hidden sm:block">{user?.name}</span>
        </div>

        {/* Logout */}
        <button
          onClick={logout}
          className="btn-ghost text-ink-500 hover:text-rose-400 hover:bg-rose-500/10 px-2"
          title="Logout"
        >
          <RiLogoutBoxLine className="text-base" />
        </button>
      </div>
    </header>
  )
}
