import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
export default function RutaCliente({ children }) {
  const { esCliente, cargando } = useAuth();
  return cargando ? (
    <div className="loading-state">Verificando acceso…</div>
  ) : esCliente ? (
    children
  ) : (
    <Navigate to="/login" replace />
  );
}
