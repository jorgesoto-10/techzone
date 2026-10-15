import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
export default function RutaAdmin({ children }) {
  const { esAdmin, cargando } = useAuth();
  return cargando ? (
    <div className="loading-state">Verificando acceso…</div>
  ) : esAdmin ? (
    children
  ) : (
    <Navigate to="/login" replace />
  );
}
