import { Navigate } from "react-router-dom";

export default function ProtectedRoute({
  children,
  allowedRoles = []
}) {

  const token = localStorage.getItem("token");

  const user = JSON.parse(
    localStorage.getItem("user") || "null"
  );

  // NO LOGIN

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // SIN PERMISO

  if (
    allowedRoles.length > 0 &&
    !allowedRoles.includes(user.role)
  ) {
    return <Navigate to="/login" replace />;
  }

  // ACCESO OK

  return children;
}