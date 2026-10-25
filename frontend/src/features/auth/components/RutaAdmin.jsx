import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function RutaAdmin({ children }) {
  const { usuario, esAdmin, cargando } = useAuth();

  if (cargando) {
    return (
      <div className="loading-state">
        Verificando acceso…
      </div>
    );
  }

  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  if (!esAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
}