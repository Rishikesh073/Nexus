// src/components/AdminRoute.jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function AdminRoute({ children }) {
  const { currentUser, isAdmin } = useAuth();

  if (!currentUser) {
    return <Navigate to="/admin-login" />;
  }

  // If they are logged in but NOT an admin, boot them to the client portal
  if (!isAdmin) {
    return <Navigate to="/client" />;
  }

  return children;
}