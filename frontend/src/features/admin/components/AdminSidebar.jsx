import { NavLink, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/context/AuthContext";
import Icon from "../../../shared/components/Icon";
const enlaces = [
  ["/admin", "Resumen", "grid"],
  ["/admin/productos", "Productos", "box"],
  ["/admin/categorias", "Categorías", "tag"],
  ["/admin/marcas", "Marcas", "tag"],
  ["/admin/clientes", "Clientes", "users"],
  ["/admin/usuarios", "Usuarios y roles", "shield"],
  ["/admin/ventas", "Ventas", "sales"],
];
export default function AdminSidebar() {
  const { usuario, logout } = useAuth();
  const nav = useNavigate();
  return (
    <aside className="admin-sidebar">
      <Link to="/" className="sidebar-brand">
        TECH<span>ZONE</span>
        <small>ADMINISTRACIÓN</small>
      </Link>
      <span className="sidebar-label">ESPACIO DE TRABAJO</span>
      <nav>
        {enlaces.map(([to, label, icon]) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/admin"}
            className={({ isActive }) =>
              "sidebar-link " + (isActive ? "active" : "")
            }
          >
            <Icon name={icon} />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="sidebar-bottom">
        <Link to="/" className="sidebar-link">
          <Icon name="arrow" />
          Ir a la tienda
        </Link>
        <div className="sidebar-user">
          <span className="avatar">{usuario?.nombre?.charAt(0)}</span>
          <div>
            <strong>{usuario?.nombre}</strong>
            <small>Administrador</small>
          </div>
        </div>
        <button
          className="sidebar-link w-100"
          onClick={() => {
            logout();
            nav("/login");
          }}
        >
          <Icon name="logout" />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
