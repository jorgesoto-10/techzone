import {
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";
import AdminSidebar from "../../features/admin/components/AdminSidebar";
import { useAuth } from "../../features/auth/context/AuthContext";
import {
  NotificacionesProvider,
} from "../../features/notificaciones/context/NotificacionesContext";
import CampanaNotificaciones from "../../features/notificaciones/components/CampanaNotificaciones";

const titles = {
  productos: "Productos",
  categorias: "Categorías",
  marcas: "Marcas",
  clientes: "Clientes",
  usuarios: "Usuarios y roles",
  ventas: "Ventas",
};

function ContenidoAdmin() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  const path = useLocation().pathname.split("/")[2];

  return (
    <div className="admin-shell">
      <AdminSidebar />

      <div className="admin-workspace">
        <header className="admin-topbar">
          <span>
            Administración
            <span className="text-muted mx-2">/</span>
            <strong>
              {titles[path] || "Resumen"}
            </strong>
          </span>

          <div className="d-flex gap-3 align-items-center">
            <CampanaNotificaciones />

            <span className="admin-status">
              <i />
              {usuario?.nombre}
            </span>

            <button
              type="button"
              className="btn btn-sm btn-light"
              onClick={() => {
                logout();
                navigate("/login", { replace: true });
              }}
            >
              Salir
            </button>
          </div>
        </header>

        <main className="admin-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default function AdminLayout() {
  return (
    <NotificacionesProvider>
      <ContenidoAdmin />
    </NotificacionesProvider>
  );
}