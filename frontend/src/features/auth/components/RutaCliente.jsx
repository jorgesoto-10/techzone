import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function RutaCliente({ children }) {
  const { usuario, esCliente, cargando } = useAuth();

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

  if (!esCliente) {
    return <Navigate to="/admin" replace />;
  }

  return children;
}