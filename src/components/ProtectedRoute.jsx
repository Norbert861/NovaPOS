import { Navigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

/**
 * Wraps a route and redirects to /login if:
 *  - no user is logged in, OR
 *  - allowedRoles is specified and the user's role is not in it
 *
 * Usage:
 *   <ProtectedRoute allowedRoles={['owner']}>
 *     <Reports />
 *   </ProtectedRoute>
 */
export default function ProtectedRoute({ children, allowedRoles }) {
  const { currentUser } = useApp();

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    // Redirect unauthorised roles to dashboard instead of crashing
    return <Navigate to="/" replace />;
  }

  return children;
}
