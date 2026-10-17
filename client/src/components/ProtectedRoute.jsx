
import { Navigate, useLocation } from "react-router-dom";
import { isLoggedIn } from "../api/auth";

// Dashboard pages: logged-out visitors are sent to /login, then back here after signing in.
export function ProtectedRoute({ children }) {
  const location = useLocation();
  if (!isLoggedIn()) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return children;
}

// Login / signup pages: logged-in users skip straight to the dashboard.
export function GuestRoute({ children }) {
  if (isLoggedIn()) return <Navigate to="/app" replace />;
  return children;
}