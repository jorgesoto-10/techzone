import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api, { mensajeError } from "../../../shared/api/http";
import Icon from "../../../shared/components/Icon";
export default function Dashboard() {
  const [data, setData] = useState(null),
    [error, setError] = useState("");
  useEffect(() => {
    Promise.all([
      api.get("/admin/productos"),
      api.get("/admin/clientes"),
      api.get("/admin/ventas"),
    ])
      .then(([p, c, v]) =>
        setData({ productos: p.data, clientes: c.data, ventas: v.data }),
      )
      .catch((e) => setError(mensajeError(e)));
  }, []);
  if (error) return <div className="alert alert-danger">{error}</div>;
  if (!data) return <div className="loading-state">Preparando tu resumen…</div>;
  const total = data.ventas.reduce((s, v) => s + v.total, 0),
    stock = data.productos.filter((p) => p.stock < 10);
  const dias = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - 6 + i);
      const count = data.ventas.filter(
        (v) => new Date(v.fechaVenta).toDateString() === date.toDateString(),
      ).length;
      return {
        label: date.toLocaleDateString("es-PE", { weekday: "short" }),
        count,
      };
    }),
    max = Math.max(1, ...dias.map((d) => d.count));
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="section-label">TU TIENDA EN UN VISTAZO</span>
          <h1>Resumen general</h1>
          <p>Consulta tus ventas y el estado del catálogo.</p>
        </div>
        <Link className="btn btn-primary" to="/admin/productos">
          Gestionar productos
        </Link>
      </div>
      <div className="metric-grid">
        {[
          ["Productos", data.productos.length, "box", "violet"],
          ["Clientes", data.clientes.length, "users", "blue"],
          ["Ventas registradas", data.ventas.length, "sales", "green"],
          ["Importe registrado", `S/ ${total.toFixed(2)}`, "sales", "amber"],
        ].map(([label, value, icon, color]) => (
          <article className="metric-card" key={label}>
            <span className={"metric-icon " + color}>
              <Icon name={icon} />
            </span>
            <p>{label}</p>
            <strong>{value}</strong>
          </article>
        ))}
      </div>
      <div className="dashboard-grid">
        <section className="surface">
          <div className="surface-heading">
            <h2>Actividad de ventas</h2>
            <span className="small text-muted">Últimos 7 días</span>
          </div>
          <div
            className="sales-chart"
            role="img"
            aria-label={dias
              .map((d) => `${d.label}: ${d.count} ventas`)
              .join(", ")}
          >
            {dias.map((d, i) => (
              <div className="chart-day" key={i}>
                <span>{d.count}</span>
                <div
                  style={{ height: `${Math.max(3, (d.count / max) * 140)}px` }}
                />
                <small>{d.label}</small>
              </div>
            ))}
          </div>
        </section>
        <section className="surface">
          <div className="surface-heading">
            <h2>Atención de inventario</h2>
            <span className="pill">{stock.length}</span>
          </div>
          {stock.length ? (
            stock.slice(0, 5).map((p) => (
              <div className="inventory-row" key={p.idProducto}>
                <span>{p.nombreProducto}</span>
                <strong
                  className={p.stock === 0 ? "text-danger" : "text-warning"}
                >
                  {p.stock} uds.
                </strong>
              </div>
            ))
          ) : (
            <div className="empty-state">
              El inventario no presenta alertas.
            </div>
          )}
          <Link className="small" to="/admin/productos">
            Gestionar inventario →
          </Link>
        </section>
      </div>
      <section className="surface mt-4">
        <div className="surface-heading">
          <h2>Últimas ventas</h2>
          <Link to="/admin/ventas">Ver todas →</Link>
        </div>
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Venta</th>
                <th>Cliente</th>
                <th>Fecha</th>
                <th>Total</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {data.ventas.slice(0, 6).map((v) => (
                <tr key={v.idVenta}>
                  <td>
                    <Link to={`/admin/ventas/${v.idVenta}`}>#{v.idVenta}</Link>
                  </td>
                  <td>{v.nombreCliente}</td>
                  <td>{new Date(v.fechaVenta).toLocaleDateString("es-PE")}</td>
                  <td>S/ {v.total.toFixed(2)}</td>
                  <td>
                    <span className="pill">{v.estado}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!data.ventas.length && (
            <p className="empty-state">Las nuevas ventas aparecerán aquí.</p>
          )}
        </div>
      </section>
    </>
  );
}
