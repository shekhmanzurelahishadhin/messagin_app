import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import useAuthStore from './contexts/authStore'
import ProtectedRoute from './components/Common/ProtectedRoute'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import InboxPage from './pages/InboxPage'
import ThreadPage from './pages/ThreadPage'
import LoadingSpinner from './components/Common/LoadingSpinner'

export default function App() {
  const { initialize, initialized, user } = useAuthStore()

  useEffect(() => {
    initialize()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (!initialized) {
    return (
      <div className="flex h-screen items-center justify-center bg-ink-950">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login"    element={user ? <Navigate to="/" replace /> : <LoginPage />} />
        <Route path="/register" element={user ? <Navigate to="/" replace /> : <RegisterPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/"              element={<InboxPage />} />
          <Route path="/threads/:id"   element={<ThreadPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
