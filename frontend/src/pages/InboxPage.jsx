import { useState } from 'react'
import { RiMenuLine, RiMailLine } from 'react-icons/ri'
import Header from '../components/Layout/Header'
import ThreadList from '../components/Inbox/ThreadList'
import useThreads from '../hooks/useThreads'

export default function InboxPage() {
  // Trigger polling setup
  useThreads()

  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex flex-col h-screen bg-ink-950 overflow-hidden">
      <Header />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar / Thread list */}
        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-20 bg-ink-950/60 backdrop-blur-sm md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <div
          className={`
            fixed md:relative z-30 md:z-auto
            w-72 md:w-72 h-[calc(100vh-56px)]
            glass-panel border-r border-ink-800/60
            transition-transform duration-200
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          `}
        >
          <ThreadList />
        </div>

        {/* Empty state for desktop */}
        <main className="flex-1 flex flex-col items-center justify-center gap-4 text-ink-700">
          {/* Mobile menu button */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="absolute top-16 left-4 md:hidden btn-ghost"
          >
            <RiMenuLine />
          </button>

          <div className="w-16 h-16 rounded-2xl bg-ink-900 border border-ink-800 flex items-center justify-center">
            <RiMailLine className="text-3xl text-ink-700" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-ink-500">Select a conversation</p>
            <p className="text-xs text-ink-700 mt-1">or start a new one with the ✏️ button</p>
          </div>
        </main>
      </div>
    </div>
  )
}
