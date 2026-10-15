import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api, { mensajeError } from "../../../shared/api/http";
import PagoAdmin from "../components/PagoAdmin";
export default function VentaDetalle() {
  const { id } = useParams(),
    [venta, setVenta] = useState(null),
    [products, setProducts] = useState([]),
    [quantities, setQuantities] = useState({}),
    [producto, setProducto] = useState(""),
    [cantidad, setCantidad] = useState(1),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  const load = () =>
    Promise.all([
      api.get(`/admin/ventas/${id}`),
      api.get("/admin/productos"),
    ]).then(([v, p]) => {
      setVenta(v.data);
      setQuantities(
        Object.fromEntries(
          v.data.detalles.map((d) => [d.idDetalle, d.cantidad]),
        ),
      );
      setProducts(p.data);
    });
  useEffect(() => {
    load().catch((e) => setError(mensajeError(e)));
  }, [id]);
  async function action(method, url, body) {
    setBusy(true);
    try {
      await api[method](url, body);
      await load();
      setError("");
      return true;
    } catch (e) {
      setError(mensajeError(e));
      return false;
    } finally {
      setBusy(false);
    }
  }
  if (!venta) return <p>{error || "Cargando venta…"}</p>;
  const editable = venta.estado === "REGISTRADA";
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="section-label">OPERACIONES</span>
          <h1>Venta #{venta.idVenta}</h1>
          <p>{venta.numeroVenta}</p>
        </div>
        <Link className="btn btn-light" to="/admin/ventas">
          ← Volver
        </Link>
      </div>
      {error && (
        <div role="alert" className="alert alert-danger">
          {error}
        </div>
      )}
      <div className="sale-summary">
        <article className="surface">
          <span className="section-label">CLIENTE</span>
          <h2 className="h5 mt-2">{venta.nombreCliente}</h2>
          <p className="text-muted mb-0">DNI {venta.dniCliente}</p>
        </article>
        <article className="surface">
          <span className="section-label">ENTREGA Y PAGO</span>
          <p className="mt-2 mb-1">
            {venta.envio} · {venta.direccion || "Recojo en tienda"}
          </p>
          <span className="pill">{venta.estado}</span>{" "}
          <span className="pill">{venta.estadoPago}</span>
        </article>
        <article className="surface">
          <span className="section-label">TOTAL</span>
          <strong className="sale-total">S/ {venta.total.toFixed(2)}</strong>
          <small className="text-muted">
            {new Date(venta.fechaVenta).toLocaleString("es-PE")}
          </small>
        </article>
      </div>

      <PagoAdmin id={id} onChange={load} />

      <section className="surface mt-4">
        <div className="surface-heading">
          <h2>Productos de la venta</h2>
          <span className="small text-muted">Precio conservado al comprar</span>
        </div>
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Precio unitario</th>
                <th>Cantidad</th>
                <th>Subtotal</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {venta.detalles.map((d) => (
                <tr key={d.idDetalle}>
                  <td>{d.nombreProducto}</td>
                  <td>S/ {d.precioUnitario.toFixed(2)}</td>
                  <td>
                    <input
                      className="form-control"
                      aria-label={`Cantidad ${d.nombreProducto}`}
                      style={{ width: 85 }}
                      type="number"
                      min={1}
                      disabled={!editable || busy}
                      value={quantities[d.idDetalle] ?? d.cantidad}
                      onChange={(e) =>
                        setQuantities({
                          ...quantities,
                          [d.idDetalle]: e.target.value,
                        })
                      }
                    />
                  </td>
                  <td>S/ {d.subtotal.toFixed(2)}</td>
                  <td className="text-nowrap">
                    <button
                      disabled={!editable || busy}
                      className="btn btn-sm btn-outline-primary me-2"
                      onClick={() =>
                        action(
                          "put",
                          `/admin/ventas/${id}/detalles/${d.idDetalle}`,
                          { cantidad: Number(quantities[d.idDetalle]) },
                        )
                      }
                    >
                      Actualizar
                    </button>
                    <button
                      disabled={!editable || busy}
                      className="btn btn-sm btn-outline-danger"
                      onClick={() =>
                        confirm("¿Retirar producto y devolver el stock?") &&
                        action(
                          "delete",
                          `/admin/ventas/${id}/detalles/${d.idDetalle}`,
                        )
                      }
                    >
                      Retirar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {editable && (
          <form
            className="row g-3 mt-2 align-items-end"
            onSubmit={async (e) => {
              e.preventDefault();
              if (
                await action("post", `/admin/ventas/${id}/detalles`, {
                  idProducto: Number(producto),
                  cantidad: Number(cantidad),
                })
              ) {
                setProducto("");
                setCantidad(1);
              }
            }}
          >
            <div className="col-md-7">
              <label className="form-label">Agregar un producto</label>
              <select
                className="form-select"
                required
                value={producto}
                onChange={(e) => setProducto(e.target.value)}
              >
                <option value="">Seleccionar producto</option>
                {products
                  .filter(
                    (p) =>
                      !venta.detalles.some(
                        (d) => d.idProducto === p.idProducto,
                      ),
                  )
                  .map((p) => (
                    <option key={p.idProducto} value={p.idProducto}>
                      {p.nombreProducto} · stock {p.stock}
                    </option>
                  ))}
              </select>
            </div>
            <div className="col-md-2">
              <label className="form-label">Cantidad</label>
              <input
                className="form-control"
                type="number"
                min={1}
                required
                value={cantidad}
                onChange={(e) => setCantidad(e.target.value)}
              />
            </div>
            <div className="col-md-3">
              <button disabled={busy} className="btn btn-primary w-100">
                Agregar
              </button>
            </div>
          </form>
        )}
      </section>
    </>
  );
}
