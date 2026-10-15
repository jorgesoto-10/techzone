import { Route, Routes, Link } from "react-router-dom";
import TiendaLayout from "../shared/layouts/TiendaLayout";
import AdminLayout from "../shared/layouts/AdminLayout";
import RutaAdmin from "../features/auth/components/RutaAdmin";
import RutaCliente from "../features/auth/components/RutaCliente";
import Home from "../features/catalog/pages/Home";
import Login from "../features/auth/pages/Login";
import Registro from "../features/auth/pages/Registro";
import Carrito from "../features/cart/pages/Carrito";
import Perfil from "../features/account/pages/Perfil";
import Dashboard from "../features/admin/pages/Dashboard";
import Productos from "../features/admin/pages/Productos";
import Categorias from "../features/admin/pages/Categorias";
import Marcas from "../features/admin/pages/Marcas";
import Usuarios from "../features/admin/pages/Usuarios";
import Clientes from "../features/admin/pages/Clientes";
import ClienteDetalle from "../features/admin/pages/ClienteDetalle";
import Ventas from "../features/admin/pages/Ventas";
import VentaDetalle from "../features/admin/pages/VentaDetalle";
export default function App() {
  return (
    <Routes>
      <Route element={<TiendaLayout />}>
        <Route index element={<Home />} />
        <Route path="carrito" element={<Carrito />} />
        <Route
          path="perfil"
          element={
            <RutaCliente>
              <Perfil />
            </RutaCliente>
          }
        />
        <Route
          path="*"
          element={
            <div className="container py-5">
              <h1>Página no encontrada</h1>
              <Link to="/">Volver a la tienda</Link>
            </div>
          }
        />
      </Route>
      <Route path="/login" element={<Login />} />
      <Route path="/registro" element={<Registro />} />
      <Route path="/admin/login" element={<Login />} />
      <Route
        path="/admin"
        element={
          <RutaAdmin>
            <AdminLayout />
          </RutaAdmin>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="productos" element={<Productos />} />
        <Route path="categorias" element={<Categorias />} />
        <Route path="marcas" element={<Marcas />} />
        <Route path="usuarios" element={<Usuarios />} />
        <Route path="clientes" element={<Clientes />} />
        <Route path="clientes/:dni" element={<ClienteDetalle />} />
        <Route path="ventas" element={<Ventas />} />
        <Route path="ventas/:id" element={<VentaDetalle />} />
        <Route
          path="*"
          element={
            <div className="surface">
              <h1>Sección no encontrada</h1>
              <Link to="/admin">Volver al resumen</Link>
            </div>
          }
        />
      </Route>
    </Routes>
  );
}
