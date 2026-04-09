/**
 * useThreads
 *
 * Previously held a 10-second polling interval.
 * Now simply delegates to useEcho which manages the full
 * Reverb WebSocket connection and real-time subscriptions.
 *
 * Kept as a thin re-export so existing import sites don't need to change.
 */
import useEcho from './useEcho'
import useThreadsStore from '../contexts/threadsStore'

const useThreads = () => {
  useEcho()
  return useThreadsStore()
}

export default useThreads
