import { useEffect, useRef } from 'react'
import { RiArrowUpLine } from 'react-icons/ri'
import MessageItem from './MessageItem'
import LoadingSpinner from '../Common/LoadingSpinner'
import useThreadsStore from '../../contexts/threadsStore'

export default function MessageList() {
  const { messages, isLoadingThread, pagination, loadMoreMessages, currentThread } = useThreadsStore()

  const bottomRef  = useRef(null)
  const listRef    = useRef(null)
  const prevLenRef = useRef(0)

  // Scroll to bottom on first load or new message
  useEffect(() => {
    if (messages.length !== prevLenRef.current) {
      // Only auto-scroll if we're near the bottom or it's a new thread load
      const list = listRef.current
      if (!list) return
      const isNearBottom = list.scrollHeight - list.scrollTop - list.clientHeight < 200
      if (isNearBottom || prevLenRef.current === 0) {
        bottomRef.current?.scrollIntoView({ behavior: prevLenRef.current === 0 ? 'instant' : 'smooth' })
      }
      prevLenRef.current = messages.length
    }
  }, [messages])

  // Reset scroll tracker on thread change
  useEffect(() => {
    prevLenRef.current = 0
  }, [currentThread?.id])

  if (isLoadingThread) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-ink-600 text-sm">
        No messages yet. Say hello!
      </div>
    )
  }

  return (
    <div ref={listRef} className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
      {/* Load older messages */}
      {pagination?.links?.next && (
        <div className="flex justify-center pb-2">
          <button
            onClick={loadMoreMessages}
            className="flex items-center gap-1.5 text-xs text-ink-500 hover:text-ink-300 transition-colors px-3 py-1.5 rounded-full border border-ink-800 hover:border-ink-700"
          >
            <RiArrowUpLine />
            Load earlier messages
          </button>
        </div>
      )}

      {messages.map((msg) => (
        <MessageItem key={msg.id} message={msg} />
      ))}

      {/* Scroll anchor */}
      <div ref={bottomRef} />
    </div>
  )
}
