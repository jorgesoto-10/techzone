import { useEffect, useState } from "react";
import api, { mensajeError } from "../../../shared/api/http";
export default function Marcas() {
  const [items, setItems] = useState([]),
    [name, setName] = useState(""),
    [editing, setEditing] = useState(null),
    [activo, setActivo] = useState(true),
    [error, setError] = useState("");
  const load = () => api.get("/admin/marcas").then((r) => setItems(r.data));
  useEffect(() => {
    load().catch((e) => setError(mensajeError(e)));
  }, []);
  async function save(e) {
    e.preventDefault();
    try {
      await api[editing ? "put" : "post"](
        "/admin/marcas" + (editing ? "/" + editing : ""),
        { nombre: name, activo },
      );
      setName("");
      setEditing(null);
      setActivo(true);
      setError("");
      await load();
    } catch (e) {
      setError(mensajeError(e));
    }
  }
  async function del(id) {
    if (!confirm("¿Eliminar esta marca?")) return;
    try {
      await api.delete(`/admin/marcas/${id}`);
      await load();
    } catch (e) {
      setError(mensajeError(e));
    }
  }
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="section-label">CATÁLOGO</span>
          <h1>Marcas</h1>
          <p>Organiza los fabricantes de tus productos.</p>
        </div>
      </div>
      {error && <div className="alert alert-danger">{error}</div>}
      <form
        onSubmit={save}
        className="surface d-flex gap-3 align-items-end mb-4 flex-wrap"
      >
        <label className="flex-grow-1">
          {editing ? "Editar marca" : "Nueva marca"}
          <input
            className="form-control mt-2"
            required
            maxLength={100}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nombre del fabricante"
          />
        </label>
        <label className="form-check mb-2">
          <input
            className="form-check-input"
            type="checkbox"
            checked={activo}
            onChange={(e) => setActivo(e.target.checked)}
          />{" "}
          Activa
        </label>
        <button className="btn btn-primary">Guardar</button>
        {editing && (
          <button
            type="button"
            className="btn btn-light"
            onClick={() => {
              setEditing(null);
              setName("");
              setActivo(true);
            }}
          >
            Cancelar
          </button>
        )}
      </form>
      <section className="surface">
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Marca</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {items.map((m) => (
                <tr key={m.idMarca}>
                  <td>{m.nombre}</td>
                  <td>
                    <span className="pill">
                      {m.activo ? "Activa" : "Inactiva"}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn btn-sm btn-outline-primary me-2"
                      onClick={() => {
                        setEditing(m.idMarca);
                        setName(m.nombre);
                        setActivo(m.activo);
                      }}
                    >
                      Editar
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => del(m.idMarca)}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
