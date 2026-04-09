import { useEffect, useState } from 'react'
import { getEcho } from '../../services/echo'
import useAuthStore from '../../contexts/authStore'

const STATES = {
  connecting:   { label: 'Connecting',   dot: 'bg-yellow-400 animate-pulse' },
  connected:    { label: 'Live',         dot: 'bg-emerald-400' },
  unavailable:  { label: 'Reconnecting', dot: 'bg-yellow-400 animate-pulse' },
  failed:       { label: 'Disconnected', dot: 'bg-rose-500' },
  disconnected: { label: 'Offline',      dot: 'bg-ink-600' },
}

export default function ConnectionStatus() {
  const { token }         = useAuthStore()
  const [status, setStatus] = useState('connecting')

  useEffect(() => {
    if (!token) return

    // Small delay so Echo has time to initialize
    const t = setTimeout(() => {
      const echo = getEcho(token)
      const connector = echo?.connector?.pusher

      if (!connector) return

      const update = (state) => setStatus(state)

      connector.connection.bind('state_change', ({ current }) => update(current))
      // Seed with the current state immediately
      update(connector.connection.state)

      return () => {
        connector.connection.unbind('state_change')
      }
    }, 300)

    return () => clearTimeout(t)
  }, [token])

  const s = STATES[status] ?? STATES.connecting

  // Only show when NOT connected — stay out of the way when everything is fine
  if (status === 'connected') return null

  return (
    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-ink-800/60 border border-ink-700/40">
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      <span className="text-[11px] text-ink-500 font-medium">{s.label}</span>
    </div>
  )
}
