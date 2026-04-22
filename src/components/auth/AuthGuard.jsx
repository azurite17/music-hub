import { Navigate, useLocation } from 'react-router-dom'
import LoadingSpinner from '../ui/LoadingSpinner'
import { useAuth } from '../../hooks/useAuth'

function AuthGuard({ children }) {
  const { isLoggedIn, isAuthLoading } = useAuth()
  const location = useLocation()

  if (isAuthLoading) {
    return <LoadingSpinner label="Checking authentication..." />
  }

  if (!isLoggedIn) {
    return <Navigate to="/auth" replace state={{ from: location.pathname }} />
  }

  return children
}

export default AuthGuard
