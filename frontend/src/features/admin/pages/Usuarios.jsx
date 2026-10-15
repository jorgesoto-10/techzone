import { useEffect, useState } from "react";
import api, { mensajeError } from "../../../shared/api/http";
import { useAuth } from "../../auth/context/AuthContext";
export default function Usuarios() {
  const [items, setItems] = useState([]),
    [search, setSearch] = useState(""),
    [error, setError] = useState(""),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(null);
  const { refrescar } = useAuth();
  const load = () => api.get("/admin/usuarios").then((r) => setItems(r.data));
  useEffect(() => {
    load().catch((e) => setError(mensajeError(e)));
  }, []);
  async function change(u, rol) {
    if (!confirm(`¿Asignar el rol ${rol} a ${u.nombre}?`)) return;
    setBusy(u.idUsuario);
    setError("");
    setMessage("");
    try {
      await api.put(`/admin/usuarios/${u.idUsuario}/rol`, { rol });
      setMessage("Rol actualizado. La cuenta conserva sus datos y compras.");
      await refrescar();
      await load();
    } catch (e) {
      setError(mensajeError(e));
    } finally {
      setBusy(null);
    }
  }
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="section-label">CONTROL DE ACCESO</span>
          <h1>Usuarios y roles</h1>
          <p>Administra quién compra y quién gestiona la tienda.</p>
        </div>
        <span className="pill">{items.length} cuentas</span>
      </div>
      {error && (
        <div role="alert" className="alert alert-danger">
          {error}
        </div>
      )}
      {message && (
        <div role="status" className="alert alert-success">
          {message}
        </div>
      )}
      <section className="surface">
        <input
          className="form-control mb-4"
          placeholder="Buscar por nombre o correo"
          aria-label="Buscar usuarios"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="table-responsive">
          <table className="table align-middle">
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Correo</th>
                <th>Rol actual</th>
                <th>Cambiar rol</th>
              </tr>
            </thead>
            <tbody>
              {items
                .filter((u) =>
                  (u.nombre + " " + u.apellido + " " + u.correo)
                    .toLowerCase()
                    .includes(search.toLowerCase()),
                )
                .map((u) => (
                  <tr key={u.idUsuario}>
                    <td>
                      <strong>
                        {u.nombre} {u.apellido}
                      </strong>
                      <small className="d-block text-muted">
                        Cuenta #{u.idUsuario}
                      </small>
                    </td>
                    <td>{u.correo}</td>
                    <td>
                      <span
                        className={
                          "role-badge " +
                          (u.roles.includes("ADMIN")
                            ? "role-admin"
                            : "role-client")
                        }
                      >
                        {u.roles.includes("ADMIN") ? "ADMIN" : "CLIENTE"}
                      </span>
                    </td>
                    <td>
                      <button
                        disabled={busy === u.idUsuario}
                        className="btn btn-sm btn-outline-primary"
                        onClick={() =>
                          change(
                            u,
                            u.roles.includes("ADMIN") ? "CLIENTE" : "ADMIN",
                          )
                        }
                      >
                        {busy === u.idUsuario
                          ? "Guardando…"
                          : u.roles.includes("ADMIN")
                            ? "Cambiar a cliente"
                            : "Cambiar a admin"}
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        <p className="small text-muted mb-0">
          El último administrador activo debe conservar su rol.
        </p>
      </section>
    </>
  );
}
