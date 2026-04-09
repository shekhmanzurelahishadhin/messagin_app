import { RiErrorWarningLine, RiCloseLine } from 'react-icons/ri'

export default function ErrorAlert({ message, onClose }) {
  if (!message) return null
  return (
    <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm animate-fade-in">
      <RiErrorWarningLine className="shrink-0 mt-0.5 text-base" />
      <span className="flex-1">{message}</span>
      {onClose && (
        <button onClick={onClose} className="shrink-0 hover:text-rose-300 transition-colors">
          <RiCloseLine />
        </button>
      )}
    </div>
  )
}
