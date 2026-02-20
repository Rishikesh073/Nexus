// src/components/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function ProtectedRoute({ children }) {
  const { currentUser } = useAuth();

  if (!currentUser) {
    // If they aren't logged in, kick them back to the login page
    return <Navigate to="/login" />;
  }

  // If they are logged in, let them view the page
  return children;
}