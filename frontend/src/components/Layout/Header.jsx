import { useState, useRef, useEffect } from 'react'
import { RiMailLine, RiLogoutBoxLine, RiNotification3Line, RiCheckDoubleLine } from 'react-icons/ri'
import useAuthStore from '../../contexts/authStore'
import useThreadsStore from '../../contexts/threadsStore'
import ConnectionStatus from '../Common/ConnectionStatus'

export default function Header() {
  const { user, logout }  = useAuthStore()
  const { unreadCount, markAllThreadsAsRead } = useThreadsStore()
  const [showNotifications, setShowNotifications] = useState(false)
  const notificationRef = useRef(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleMarkAllRead = async () => {
    await markAllThreadsAsRead()
    setShowNotifications(false)
  }

  return (
    <header className="h-14 shrink-0 flex items-center justify-between px-5 border-b border-ink-800/60 glass-panel z-50">
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

        {/* Unread badge & Dropdown */}
        <div className="relative" ref={notificationRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border transition-all ${
              unreadCount > 0 
                ? 'bg-violet-600/15 border-violet-500/20 hover:bg-violet-600/25' 
                : 'bg-ink-800/40 border-ink-700/50 hover:bg-ink-800/60 text-ink-400'
            }`}
          >
            <RiNotification3Line className={unreadCount > 0 ? 'text-violet-400 text-xs' : 'text-xs'} />
            <span className={unreadCount > 0 ? 'text-violet-300 text-xs font-medium' : 'text-xs font-medium'}>
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-64 bg-ink-900 border border-ink-700 rounded-xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="px-4 py-2 border-b border-ink-800 flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-ink-400 uppercase tracking-wider">Notifications</span>
                {unreadCount > 0 && (
                  <button 
                    onClick={handleMarkAllRead}
                    className="text-[10px] text-violet-400 hover:text-violet-300 font-bold uppercase tracking-tighter flex items-center gap-1 transition-colors"
                  >
                    <RiCheckDoubleLine className="text-xs" />
                    Mark all read
                  </button>
                )}
              </div>
              
              <div className="max-h-80 overflow-y-auto">
                {unreadCount > 0 ? (
                  <div className="px-4 py-3 text-center">
                    <p className="text-sm text-ink-200">You have {unreadCount} unread messages.</p>
                    <p className="text-xs text-ink-500 mt-1">Check your threads to read them.</p>
                  </div>
                ) : (
                  <div className="px-4 py-6 text-center">
                    <div className="w-10 h-10 bg-ink-800 rounded-full flex items-center justify-center mx-auto mb-2">
                      <RiNotification3Line className="text-ink-600 text-lg" />
                    </div>
                    <p className="text-sm text-ink-400">No new notifications</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

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
