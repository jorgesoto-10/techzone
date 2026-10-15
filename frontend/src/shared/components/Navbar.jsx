import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../features/auth/context/AuthContext.jsx";
import { useCarrito } from "../../features/cart/context/CarritoContext.jsx";
import { CATEGORIAS_INFO } from "../utils/imagenes.js";

export default function Navbar() {
  const { usuario, esAdmin, esCliente, logout } = useAuth();
  const { cantidadTotal } = useCarrito();
  const navigate = useNavigate();

  function cerrarSesion() {
    logout();
    navigate("/");
  }

  return (
    <nav className="navbar navbar-expand-lg navbar-dark fixed-top">
      <div className="container-fluid">
        <Link className="navbar-brand" to="/">
          <img
            src="/Imagenes/INICIO/logo_black.png"
            alt="TECHZONE"
            width="120"
          />
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarTechzone"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarTechzone">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item dropdown">
              <a
                className="nav-link dropdown-toggle"
                href="#"
                role="button"
                data-bs-toggle="dropdown"
              >
                Componentes
              </a>
              <ul className="dropdown-menu">
                {Object.entries(CATEGORIAS_INFO).map(([id, info]) => (
                  <li key={id}>
                    <Link className="dropdown-item" to={`/?categoria=${id}`}>
                      {info.ruta.charAt(0).toUpperCase() + info.ruta.slice(1)}
                    </Link>
                  </li>
                ))}
              </ul>
            </li>

            <li className="nav-item">
              <Link className="nav-link" to="/?categoria=13">
                Computadoras
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/?categoria=12">
                Laptops
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/?categoria=8">
                Monitores
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/?categoria=3">
                Periféricos
              </Link>
            </li>
          </ul>

          <Link to="/carrito" className="me-3 position-relative">
            <img
              src="/Imagenes/INICIO/carrito-de-compras.png"
              alt="Carrito"
              width="30"
              className="carrito"
            />
            <span className="badge bg-danger rounded-pill position-absolute top-0 start-100 translate-middle">
              {cantidadTotal}
            </span>
          </Link>

          {esAdmin && (
            <div className="dropdown">
              <a
                className="d-flex align-items-center dropdown-toggle btn btn-danger fw-bold"
                href="#"
                role="button"
                data-bs-toggle="dropdown"
              >
                <img
                  src="/Imagenes/INICIO/user.png"
                  width="28"
                  className="rounded-circle me-2"
                  alt="Admin"
                />
                <span>{usuario.nombre}</span>
              </a>
              <ul className="dropdown-menu dropdown-menu-end">
                <li>
                  <Link className="dropdown-item" to="/admin">
                    Panel de Admin
                  </Link>
                </li>
                <li>
                  <a
                    className="dropdown-item text-danger"
                    href="#"
                    onClick={cerrarSesion}
                  >
                    Cerrar sesión
                  </a>
                </li>
              </ul>
            </div>
          )}

          {esCliente && (
            <div className="dropdown">
              <a
                className="d-flex align-items-center dropdown-toggle btn btn-warning fw-bold"
                href="#"
                role="button"
                data-bs-toggle="dropdown"
              >
                <img
                  src="/Imagenes/INICIO/user.png"
                  width="28"
                  className="rounded-circle me-2"
                  alt="Cliente"
                />
                <span>{usuario.nombre}</span>
              </a>
              <ul className="dropdown-menu dropdown-menu-end">
                <li>
                  <Link className="dropdown-item" to="/perfil">
                    Ver perfil
                  </Link>
                </li>
                <li>
                  <a
                    className="dropdown-item text-danger"
                    href="#"
                    onClick={cerrarSesion}
                  >
                    Cerrar sesión
                  </a>
                </li>
              </ul>
            </div>
          )}

          {!usuario && (
            <Link to="/login" className="btn btn-warning fw-bold">
              Iniciar Sesión
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
