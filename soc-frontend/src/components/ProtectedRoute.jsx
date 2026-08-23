import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  // Check the browser's vault for the keycard
  const token = localStorage.getItem('token');

  // If there is no token, redirect to the login page immediately.
  // We use "replace" so they can't hit the back button and return to the dashboard.
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // If they have a token, let them through to the protected content
  return children;
};

export default ProtectedRoute;