import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api, { mensajeError } from "../../../shared/api/http";
import Icon from "../../../shared/components/Icon";
import { useNotificaciones } from "../../notificaciones/context/NotificacionesContext";

export default function Dashboard() {
  const { revision } = useNotificaciones();

  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [actualizando, setActualizando] = useState(false);
  const [reintento, setReintento] = useState(0);

  useEffect(() => {
    let activo = true;

    async function cargarResumen() {
      setActualizando(true);
      setError("");

      try {
        const [p, c, v] = await Promise.all([
          api.get("/admin/productos"),
          api.get("/admin/clientes"),
          api.get("/admin/ventas"),
        ]);

        if (!activo) return;

        setData({
          productos: p.data,
          clientes: c.data,
          ventas: [...v.data].sort(
            (a, b) => Number(b.idVenta) - Number(a.idVenta),
          ),
        });
      } catch (e) {
        if (activo) {
          setError(mensajeError(e));
        }
      } finally {
        if (activo) {
          setActualizando(false);
        }
      }
    }

    void cargarResumen();

    return () => {
      // Impide que una respuesta anterior sobrescriba
      // los datos de una actualización más reciente.
      activo = false;
    };
  }, [revision, reintento]);

  if (!data) {
    if (error) {
      return (
        <div className="alert alert-danger" role="alert">
          <p className="mb-2">{error}</p>

          <button
            type="button"
            className="btn btn-sm btn-outline-danger"
            onClick={() => setReintento((valor) => valor + 1)}
          >
            Reintentar
          </button>
        </div>
      );
    }

    return (
      <div className="loading-state">
        Preparando tu resumen…
      </div>
    );
  }

  const total = data.ventas.reduce(
    (suma, venta) => suma + Number(venta.total || 0),
    0,
  );

  const stock = data.productos.filter(
    (producto) => producto.stock < 10,
  );

  const dias = Array.from({ length: 7 }, (_, i) => {
    const fecha = new Date();

    fecha.setDate(fecha.getDate() - 6 + i);

    const cantidad = data.ventas.filter(
      (venta) =>
        new Date(venta.fechaVenta).toDateString() ===
        fecha.toDateString(),
    ).length;

    return {
      label: fecha.toLocaleDateString("es-PE", {
        weekday: "short",
      }),
      count: cantidad,
    };
  });

  const max = Math.max(
    1,
    ...dias.map((dia) => dia.count),
  );

  return (
    <>
      <div className="page-heading">
        <div>
          <span className="section-label">
            TU TIENDA EN UN VISTAZO
          </span>

          <h1>Resumen general</h1>

          <p>
            Consulta tus ventas y el estado del catálogo.
          </p>

          {actualizando && (
            <span
              className="small text-muted"
              role="status"
            >
              Actualizando resumen…
            </span>
          )}
        </div>

        <Link
          className="btn btn-primary"
          to="/admin/productos"
        >
          Gestionar productos
        </Link>
      </div>

      {error && (
        <div
          className="alert alert-warning d-flex flex-wrap align-items-center justify-content-between gap-2"
          role="alert"
        >
          <span>
            No se pudo actualizar el resumen. Se muestran
            los últimos datos cargados. {error}
          </span>

          <button
            type="button"
            className="btn btn-sm btn-outline-dark"
            disabled={actualizando}
            onClick={() =>
              setReintento((valor) => valor + 1)
            }
          >
            Reintentar
          </button>
        </div>
      )}

      <div className="metric-grid">
        {[
          [
            "Productos",
            data.productos.length,
            "box",
            "violet",
          ],
          [
            "Clientes",
            data.clientes.length,
            "users",
            "blue",
          ],
          [
            "Ventas registradas",
            data.ventas.length,
            "sales",
            "green",
          ],
          [
            "Importe registrado",
            `S/ ${total.toFixed(2)}`,
            "sales",
            "amber",
          ],
        ].map(([label, value, icon, color]) => (
          <article className="metric-card" key={label}>
            <span className={`metric-icon ${color}`}>
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

            <span className="small text-muted">
              Últimos 7 días
            </span>
          </div>

          <div
            className="sales-chart"
            role="img"
            aria-label={dias
              .map(
                (dia) =>
                  `${dia.label}: ${dia.count} ventas`,
              )
              .join(", ")}
          >
            {dias.map((dia, i) => (
              <div className="chart-day" key={i}>
                <span>{dia.count}</span>

                <div
                  style={{
                    height: `${Math.max(
                      3,
                      (dia.count / max) * 140,
                    )}px`,
                  }}
                />

                <small>{dia.label}</small>
              </div>
            ))}
          </div>
        </section>

        <section className="surface">
          <div className="surface-heading">
            <h2>Atención de inventario</h2>

            <span className="pill">
              {stock.length}
            </span>
          </div>

          {stock.length ? (
            stock.slice(0, 5).map((producto) => (
              <div
                className="inventory-row"
                key={producto.idProducto}
              >
                <span>
                  {producto.nombreProducto}
                </span>

                <strong
                  className={
                    producto.stock === 0
                      ? "text-danger"
                      : "text-warning"
                  }
                >
                  {producto.stock} uds.
                </strong>
              </div>
            ))
          ) : (
            <div className="empty-state">
              El inventario no presenta alertas.
            </div>
          )}

          <Link
            className="small"
            to="/admin/productos"
          >
            Gestionar inventario →
          </Link>
        </section>
      </div>

      <section className="surface mt-4">
        <div className="surface-heading">
          <h2>Últimas ventas</h2>

          <Link to="/admin/ventas">
            Ver todas →
          </Link>
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
              {data.ventas.slice(0, 6).map((venta) => (
                <tr key={venta.idVenta}>
                  <td>
                    <Link
                      to={`/admin/ventas/${venta.idVenta}`}
                    >
                      #{venta.idVenta}
                    </Link>
                  </td>

                  <td>{venta.nombreCliente}</td>

                  <td>
                    {new Date(
                      venta.fechaVenta,
                    ).toLocaleDateString("es-PE")}
                  </td>

                  <td>
                    S/{" "}
                    {Number(venta.total || 0).toFixed(2)}
                  </td>

                  <td>
                    <span className="pill">
                      {venta.estado}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {!data.ventas.length && (
            <p className="empty-state">
              Las nuevas ventas aparecerán aquí.
            </p>
          )}
        </div>
      </section>
    </>
  );
}