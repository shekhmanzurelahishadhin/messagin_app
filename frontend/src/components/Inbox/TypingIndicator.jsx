/**
 * TypingIndicator
 *
 * Shows an animated "Alice is typing…" strip above the composer
 * when one or more other participants are actively typing.
 */
export default function TypingIndicator({ typingUsers }) {
  if (!typingUsers || typingUsers.length === 0) return null

  let label
  if (typingUsers.length === 1)      label = `${typingUsers[0]} is typing`
  else if (typingUsers.length === 2) label = `${typingUsers[0]} and ${typingUsers[1]} are typing`
  else                               label = 'Several people are typing'

  return (
    <div className="flex items-center gap-2 px-5 py-1.5 animate-fade-in">
      {/* Bouncing dots */}
      <div className="flex items-center gap-[3px]">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-violet-400"
            style={{
              animation:      'typingBounce 1.2s ease-in-out infinite',
              animationDelay: `${i * 0.2}s`,
            }}
          />
        ))}
      </div>
      <span className="text-xs text-ink-500 italic">{label}…</span>

      <style>{`
        @keyframes typingBounce {
          0%, 60%, 100% { transform: translateY(0);    opacity: 0.4; }
          30%            { transform: translateY(-4px); opacity: 1;   }
        }
      `}</style>
    </div>
  )
}
