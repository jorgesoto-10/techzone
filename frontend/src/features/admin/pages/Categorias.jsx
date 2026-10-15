import { useEffect, useState } from "react";
import api from "../../../shared/api/http.js";

const VACIO = {
  idCategoria: null,
  nombreCategoria: "",
  descripcion: "",
  activo: true,
};

export default function Categorias() {
  const [categorias, setCategorias] = useState([]);
  const [form, setForm] = useState(VACIO);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [mensaje, setMensaje] = useState(null);

  function cargar() {
    api.get("/admin/categorias").then((res) => setCategorias(res.data));
  }

  useEffect(cargar, []);

  function abrirNuevo() {
    setForm(VACIO);
    setMostrarModal(true);
  }

  function abrirEditar(c) {
    setForm(c);
    setMostrarModal(true);
  }

  async function guardar(e) {
    e.preventDefault();
    const payload = {
      nombreCategoria: form.nombreCategoria,
      descripcion: form.descripcion,
      activo: form.activo,
    };
    try {
      if (form.idCategoria) {
        await api.put(`/admin/categorias/${form.idCategoria}`, payload);
      } else {
        await api.post("/admin/categorias", payload);
      }
      setMostrarModal(false);
      cargar();
      setMensaje({ tipo: "success", texto: "Categoría guardada" });
    } catch (err) {
      setMensaje({
        tipo: "danger",
        texto: err.response?.data?.mensaje || "Error al guardar",
      });
    }
  }

  async function eliminar(id) {
    if (!confirm("¿Eliminar esta categoría?")) return;
    try {
      await api.delete(`/admin/categorias/${id}`);
      cargar();
      setMensaje({ tipo: "success", texto: "Categoría eliminada" });
    } catch (err) {
      setMensaje({
        tipo: "danger",
        texto: err.response?.data?.mensaje || "No se pudo eliminar",
      });
    }
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>Categorías</h3>
        <button className="btn btn-primary" onClick={abrirNuevo}>
          + Nueva Categoría
        </button>
      </div>

      {mensaje && (
        <div
          className={`alert alert-${mensaje.tipo}`}
          onClick={() => setMensaje(null)}
        >
          {mensaje.texto}
        </div>
      )}

      <div className="card shadow-sm">
        <table className="table mb-0 align-middle">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Descripción</th>
              <th>Productos</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {categorias.map((c) => (
              <tr key={c.idCategoria}>
                <td>{c.nombreCategoria}</td>
                <td>{c.descripcion}</td>
                <td>{c.totalProductos}</td>
                <td className="text-end">
                  <button
                    className="btn btn-sm btn-outline-secondary me-2"
                    onClick={() => abrirEditar(c)}
                  >
                    Editar
                  </button>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => eliminar(c.idCategoria)}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {mostrarModal && (
        <div
          className="modal d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          onClick={() => setMostrarModal(false)}
        >
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <form onSubmit={guardar}>
                <div className="modal-header">
                  <h5 className="modal-title">
                    {form.idCategoria ? "Editar categoría" : "Nueva categoría"}
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setMostrarModal(false)}
                  />
                </div>
                <div className="modal-body">
                  <div className="mb-2">
                    <label className="form-label">Nombre</label>
                    <input
                      className="form-control"
                      value={form.nombreCategoria}
                      onChange={(e) =>
                        setForm({ ...form, nombreCategoria: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="mb-2">
                    <label className="form-label">Descripción</label>
                    <textarea
                      className="form-control"
                      value={form.descripcion || ""}
                      onChange={(e) =>
                        setForm({ ...form, descripcion: e.target.value })
                      }
                    />
                  </div>
                </div>
                <label className="form-check mx-3 mb-3">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    checked={form.activo ?? true}
                    onChange={(e) =>
                      setForm({ ...form, activo: e.target.checked })
                    }
                  />{" "}
                  Categoría activa
                </label>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setMostrarModal(false)}
                  >
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Guardar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
