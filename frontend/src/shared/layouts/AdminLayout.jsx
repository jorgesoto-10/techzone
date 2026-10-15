import { Outlet, useLocation, useNavigate } from "react-router-dom";
import AdminSidebar from "../../features/admin/components/AdminSidebar";
import { useAuth } from "../../features/auth/context/AuthContext";
const titles = {
  productos: "Productos",
  categorias: "Categorías",
  marcas: "Marcas",
  clientes: "Clientes",
  usuarios: "Usuarios y roles",
  ventas: "Ventas",
};
export default function AdminLayout() {
  const { usuario, logout } = useAuth(),
    navigate = useNavigate();
  const path = useLocation().pathname.split("/")[2];
  return (
    <div className="admin-shell">
      <AdminSidebar />
      <div className="admin-workspace">
        <header className="admin-topbar">
          <span>
            Administración <span className="text-muted mx-2">/</span>
            <strong>{titles[path] || "Resumen"}</strong>
          </span>
          <div className="d-flex gap-3 align-items-center">
            <span className="admin-status">
              <i />
              {usuario?.nombre}
            </span>
            <button
              className="btn btn-sm btn-light"
              onClick={() => {
                logout();
                navigate("/login");
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
