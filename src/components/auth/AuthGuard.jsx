import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

function AuthGuard({ children }) {
  const { isLoggedIn, isAuthLoading } = useAuth()
  const location = useLocation()

  if (isAuthLoading) {
    return <p className="status-text">Checking authentication...</p>
  }

  if (!isLoggedIn) {
    return <Navigate to="/auth" replace state={{ from: location.pathname }} />
  }

  return children
}

export default AuthGuard
