import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api, { mensajeError } from "../../../shared/api/http";
import { useAuth } from "../../auth/context/AuthContext";
import PagoCliente from "../components/PagoCliente";

export default function Perfil() {
  const { usuario, refrescar } = useAuth();

  const [compras, setCompras] = useState([]);
  const [error, setError] = useState("");
  const [dni, setDni] = useState(usuario?.dniCliente || "");
  const [telefono, setTelefono] = useState("");
  const [busy, setBusy] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    api
      .get("/ventas/mis-compras")
      .then((r) => setCompras(r.data))
      .catch((e) => setError(mensajeError(e)))
      .finally(() => setLoaded(true));
  }, []);

  async function save(e) {
    e.preventDefault();
    setBusy(true);

    try {
      await api.put("/perfil", {
        dniCliente: dni,
        telefono,
      });

      await refrescar();
      setError("");
    } catch (e) {
      setError(mensajeError(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="container py-5">
      <div className="profile-banner">
        <div className="profile-avatar">
          {usuario.nombre.charAt(0)}
          {usuario.apellido?.charAt(0)}
        </div>

        <div>
          <span className="section-label">
            MI CUENTA
          </span>

          <h1>
            {usuario.nombre} {usuario.apellido}
          </h1>

          <p>{usuario.correo}</p>

          <span className="role-badge role-client">
            Cliente
          </span>
        </div>

        <Link
          to="/"
          className="btn btn-light ms-auto"
        >
          Explorar catálogo →
        </Link>
      </div>

      {error && (
        <div
          role="alert"
          className="alert alert-danger mt-3"
        >
          {error}
        </div>
      )}

      {!usuario.dniCliente && (
        <form
          onSubmit={save}
          className="surface row g-3 my-4"
        >
          <h2 className="h5">
            Completa tu perfil de comprador
          </h2>

          <div className="col-sm-5">
            <label className="form-label">
              DNI
            </label>

            <input
              className="form-control"
              pattern="[0-9]{8}"
              maxLength={8}
              required
              value={dni}
              onChange={(e) =>
                setDni(e.target.value)
              }
            />
          </div>

          <div className="col-sm-5">
            <label className="form-label">
              Teléfono
            </label>

            <input
              className="form-control"
              maxLength={20}
              value={telefono}
              onChange={(e) =>
                setTelefono(e.target.value)
              }
            />
          </div>

          <div className="col-sm-2 align-self-end">
            <button
              className="btn btn-primary"
              disabled={busy}
            >
              Guardar
            </button>
          </div>
        </form>
      )}

      <div className="page-heading mt-4">
        <div>
          <h2>Mis compras</h2>
          <p>
            Consulta el detalle de tus pedidos.
          </p>
        </div>

        <span className="pill">
          {compras.length} compras
        </span>
      </div>

      {!loaded ? (
        <p>Cargando compras…</p>
      ) : !compras.length ? (
        <div className="surface empty-state">
          <h3>
            Tu primera compra está por llegar.
          </h3>

          <p>
            Encontrarás aquí el historial
            de tus equipos y componentes.
          </p>
        </div>
      ) : (
        compras.map((v) => (
          <article
            className="surface order-card mb-3"
            key={v.idVenta}
          >
            <div className="surface-heading">
              <div>
                <h2>Pedido #{v.idVenta}</h2>

                <small className="text-muted">
                  {new Date(
                    v.fechaVenta,
                  ).toLocaleString("es-PE")}{" "}
                  · {v.envio}
                </small>
              </div>

              <span className="pill">
                {v.estado}
              </span>
            </div>

            {v.detalles.map((d) => (
              <div
                className="order-line"
                key={d.idDetalle}
              >
                <div>
                  {d.nombreProducto}

                  <small className="d-block text-muted">
                    {d.cantidad} × S/{" "}
                    {d.precioUnitario.toFixed(2)}
                  </small>
                </div>

                <strong>
                  S/ {d.subtotal.toFixed(2)}
                </strong>
              </div>
            ))}

            <PagoCliente
              id={v.idVenta}
              onChange={() =>
                api
                  .get("/ventas/mis-compras")
                  .then((r) => setCompras(r.data))
              }
            />

            <div className="order-total">
              <span>
                Pago {v.estadoPago.toLowerCase()}
              </span>

              <strong>
                Total S/ {v.total.toFixed(2)}
              </strong>
            </div>
          </article>
        ))
      )}
    </div>
  );
}