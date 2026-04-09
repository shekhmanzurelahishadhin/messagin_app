import { Navigate, Outlet } from 'react-router-dom'
import useAuthStore from '../../contexts/authStore'

export default function ProtectedRoute() {
  const { user } = useAuthStore()
  return user ? <Outlet /> : <Navigate to="/login" replace />
}
