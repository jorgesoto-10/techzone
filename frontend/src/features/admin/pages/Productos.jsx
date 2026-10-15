import { useEffect, useState } from "react";
import api, { mensajeError } from "../../../shared/api/http";
const VACIO = {
  idProducto: null,
  nombreProducto: "",
  precio: "",
  stock: "",
  sku: "",
  descripcion: "",
  estado: "disponible",
  imagen: "",
  tipo: "",
  idCategoria: "",
  idMarca: "",
};
export default function Productos() {
  const [items, setItems] = useState([]),
    [cats, setCats] = useState([]),
    [brands, setBrands] = useState([]),
    [search, setSearch] = useState(""),
    [form, setForm] = useState(VACIO),
    [open, setOpen] = useState(false),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  const load = () => api.get("/admin/productos").then((r) => setItems(r.data));
  useEffect(() => {
    Promise.all([
      load(),
      api.get("/admin/categorias").then((r) => setCats(r.data)),
      api.get("/admin/marcas").then((r) => setBrands(r.data)),
    ]).catch((e) => setError(mensajeError(e)));
  }, []);
  async function save(e) {
    e.preventDefault();
    setBusy(true);
    try {
      const payload = {
        ...form,
        precio: Number(form.precio),
        stock: Number(form.stock),
        idCategoria: Number(form.idCategoria),
        idMarca: Number(form.idMarca),
        activo: form.estado !== "descontinuado",
      };
      await api[form.idProducto ? "put" : "post"](
        "/admin/productos" + (form.idProducto ? "/" + form.idProducto : ""),
        payload,
      );
      await load();
      setOpen(false);
      setError("");
    } catch (e) {
      setError(mensajeError(e));
    } finally {
      setBusy(false);
    }
  }
  async function remove(id) {
    if (!confirm("¿Eliminar producto? Si tiene ventas, deberás desactivarlo."))
      return;
    try {
      await api.delete(`/admin/productos/${id}`);
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
          <h1>Productos</h1>
          <p>Gestiona precios, marcas y disponibilidad.</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => {
            setForm(VACIO);
            setError("");
            setOpen(true);
          }}
        >
          + Nuevo producto
        </button>
      </div>
      {error && !open && <div className="alert alert-danger">{error}</div>}
      <section className="surface">
        <div className="d-flex justify-content-between gap-3 align-items-center mb-4">
          <input
            className="form-control"
            style={{ maxWidth: 360 }}
            placeholder="Buscar por nombre o SKU"
            aria-label="Buscar productos"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <span className="text-muted small">{items.length} productos</span>
        </div>
        <div className="table-responsive">
          <table className="table align-middle">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Marca / categoría</th>
                <th>Precio</th>
                <th>Stock</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {items
                .filter((p) =>
                  (p.nombreProducto + " " + p.sku)
                    .toLowerCase()
                    .includes(search.toLowerCase()),
                )
                .map((p) => (
                  <tr key={p.idProducto}>
                    <td>
                      <strong>{p.nombreProducto}</strong>
                      <small className="d-block text-muted">{p.sku}</small>
                    </td>
                    <td>
                      {p.nombreMarca}
                      <small className="d-block text-muted">
                        {p.nombreCategoria}
                      </small>
                    </td>
                    <td>S/ {p.precio.toFixed(2)}</td>
                    <td>
                      <span className={p.stock < 10 ? "stock-low" : ""}>
                        {p.stock} uds.
                      </span>
                    </td>
                    <td>
                      <span className="pill">{p.estado}</span>
                    </td>
                    <td className="text-nowrap">
                      <button
                        className="btn btn-sm btn-outline-primary me-2"
                        onClick={() => {
                          setForm({
                            ...p,
                            tipo: p.tipo || "",
                            imagen: p.imagen || "",
                            descripcion: p.descripcion || "",
                          });
                          setError("");
                          setOpen(true);
                        }}
                      >
                        Editar
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => remove(p.idProducto)}
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
          {!items.length && (
            <p className="empty-state">
              Agrega tu primer producto o importa tu catálogo anterior.
            </p>
          )}
        </div>
      </section>
      {open && (
        <div
          className="modal d-block"
          role="dialog"
          aria-modal="true"
          aria-labelledby="producto-title"
          style={{ background: "rgba(9,17,34,.6)" }}
        >
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <form className="modal-content" onSubmit={save}>
              <div className="modal-header">
                <div>
                  <span className="section-label">CATÁLOGO</span>
                  <h2 className="h4 mb-0" id="producto-title">
                    {form.idProducto ? "Editar producto" : "Nuevo producto"}
                  </h2>
                </div>
                <button
                  type="button"
                  aria-label="Cerrar"
                  className="btn-close"
                  onClick={() => setOpen(false)}
                />
              </div>
              <div className="modal-body">
                {error && (
                  <div role="alert" className="alert alert-danger">
                    {error}
                  </div>
                )}
                <div className="row g-3">
                  {[
                    ["nombreProducto", "Nombre"],
                    ["sku", "SKU"],
                    ["precio", "Precio en soles"],
                    ["stock", "Stock"],
                    ["tipo", "Tipo de producto"],
                    ["imagen", "Imagen (nombre de archivo o URL)"],
                  ].map(([key, label]) => (
                    <div
                      className={
                        key === "nombreProducto" ? "col-12" : "col-sm-6"
                      }
                      key={key}
                    >
                      <label htmlFor={key} className="form-label">
                        {label}
                      </label>
                      <input
                        id={key}
                        className="form-control"
                        required={[
                          "nombreProducto",
                          "sku",
                          "precio",
                          "stock",
                        ].includes(key)}
                        type={
                          key === "precio" || key === "stock"
                            ? "number"
                            : "text"
                        }
                        min={
                          key === "precio" || key === "stock" ? 0 : undefined
                        }
                        step={key === "precio" ? "0.01" : undefined}
                        value={form[key]}
                        onChange={(e) =>
                          setForm({ ...form, [key]: e.target.value })
                        }
                      />
                    </div>
                  ))}
                  <div className="col-sm-6">
                    <label className="form-label" htmlFor="categoria">
                      Categoría
                    </label>
                    <select
                      id="categoria"
                      className="form-select"
                      required
                      value={form.idCategoria}
                      onChange={(e) =>
                        setForm({ ...form, idCategoria: e.target.value })
                      }
                    >
                      <option value="">Seleccionar</option>
                      {cats.map((c) => (
                        <option key={c.idCategoria} value={c.idCategoria}>
                          {c.nombreCategoria}
                          {!c.activo ? " (inactiva)" : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-sm-6">
                    <label className="form-label" htmlFor="marca">
                      Marca
                    </label>
                    <select
                      id="marca"
                      className="form-select"
                      required
                      value={form.idMarca}
                      onChange={(e) =>
                        setForm({ ...form, idMarca: e.target.value })
                      }
                    >
                      <option value="">Seleccionar</option>
                      {brands.map((m) => (
                        <option key={m.idMarca} value={m.idMarca}>
                          {m.nombre}
                          {!m.activo ? " (inactiva)" : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-sm-6">
                    <label className="form-label" htmlFor="estado">
                      Visibilidad
                    </label>
                    <select
                      id="estado"
                      className="form-select"
                      value={
                        form.estado === "descontinuado"
                          ? "descontinuado"
                          : "disponible"
                      }
                      onChange={(e) =>
                        setForm({ ...form, estado: e.target.value })
                      }
                    >
                      <option value="disponible">Activo en catálogo</option>
                      <option value="descontinuado">Desactivado</option>
                    </select>
                  </div>
                  <div className="col-12">
                    <label className="form-label" htmlFor="descripcion">
                      Descripción
                    </label>
                    <textarea
                      id="descripcion"
                      className="form-control"
                      rows={3}
                      value={form.descripcion}
                      onChange={(e) =>
                        setForm({ ...form, descripcion: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-light"
                  onClick={() => setOpen(false)}
                >
                  Cancelar
                </button>
                <button disabled={busy} className="btn btn-primary">
                  {busy ? "Guardando…" : "Guardar producto"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
