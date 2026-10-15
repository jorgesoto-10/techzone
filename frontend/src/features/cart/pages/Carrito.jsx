import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api, { mensajeError } from "../../../shared/api/http";
import { useAuth } from "../../auth/context/AuthContext";
import { useCarrito } from "../context/CarritoContext";
import { imagenProducto } from "../../../shared/utils/imagenes";

const soles = (n) => Number(n).toFixed(2);

export default function Carrito() {
  const {
    items,
    quitar,
    actualizarCantidad,
    vaciar,
  } = useCarrito();

  const { esCliente } = useAuth();
  const nav = useNavigate();

  const [form, setForm] = useState({
    envio: "recojo",
    destinatario: "",
    telefono: "",
    direccion: "",
    agencia: "",
    metodo: "YAPE",
  });

  const [archivo, setArchivo] = useState(null);
  const [resumen, setResumen] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState(null);
  const [revision, setRevision] = useState(0);

  const lineas = JSON.stringify(
    items.map((i) => ({
      idProducto: i.idProducto,
      cantidad: i.cantidad,
    })),
  );

  function cambiar(e) {
    setForm((f) => ({
      ...f,
      [e.target.name]: e.target.value,
    }));
  }

  useEffect(() => {
    let activo = true;

    setResumen(null);

    if (!esCliente || !items.length) return;

    setError("");

    api
      .post("/ventas/cotizar", {
        envio: form.envio,
        items: JSON.parse(lineas),
      })
      .then(({ data }) => {
        if (activo) {
          setResumen(data);
        }
      })
      .catch((e) => {
        if (activo) {
          setError(mensajeError(e));
        }
      });

    return () => {
      activo = false;
    };
  }, [lineas, form.envio, esCliente, revision]);

  async function comprar(e) {
    e.preventDefault();

    if (!esCliente) {
      nav("/login");
      return;
    }

    if (busy || !resumen) return;

    if (!archivo || archivo.size > 5 * 1024 * 1024) {
      setError(
        "Adjunta un comprobante JPG/PNG de hasta 5 MB",
      );
      return;
    }

    setBusy(true);
    setError("");

    try {
      const body = new FormData();

      body.append(
        "datos",
        new Blob(
          [
            JSON.stringify({
              ...form,
              totalEsperado: resumen.total,
              items: JSON.parse(lineas),
            }),
          ],
          { type: "application/json" },
        ),
      );

      body.append("comprobante", archivo);

      const { data } = await api.post(
        "/ventas/checkout",
        body,
      );

      setSuccess(data.venta.numeroVenta);
      vaciar();
    } catch (e) {
      setError(mensajeError(e));

      if (e.response?.status === 409) {
        setResumen(null);
      }
    } finally {
      setBusy(false);
    }
  }

  if (success) {
    return (
      <div className="container py-5">
        <section className="surface empty-state">
          <h1>Pedido registrado</h1>
          <p>{success}</p>

          <p>
            Tu comprobante está pendiente de verificación.
            Aún no se ha aprobado el pago.
          </p>

          <Link
            className="btn btn-primary"
            to="/perfil"
          >
            Ver mis compras
          </Link>
        </section>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="page-heading">
        <div>
          <span className="section-label">
            FINALIZA TU PEDIDO
          </span>
          <h1>Carrito de compras</h1>
          <p>
            Elige la entrega y envía tu comprobante.
          </p>
        </div>

        <Link className="btn btn-light" to="/">
          Seguir comprando →
        </Link>
      </div>

      <div className="alert alert-warning">
        <strong>Pago de prueba.</strong>{" "}
        No realices transferencias reales.
        El comprobante será revisado manualmente
        por el administrador.
      </div>

      {error && (
        <div role="alert" className="alert alert-danger">
          {error}
        </div>
      )}

      {!items.length ? (
        <section className="surface empty-state">
          <h2>Tu carrito está vacío</h2>
          <Link className="btn btn-primary" to="/">
            Explorar productos
          </Link>
        </section>
      ) : (
        <div className="cart-layout">
          <section className="surface">
            {items.map((i) => (
              <article
                className="cart-item"
                key={i.idProducto}
              >
                <img
                  src={imagenProducto(i)}
                  alt={i.nombreProducto}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src =
                      "/Imagenes/INICIO/logo.png";
                  }}
                />

                <div className="cart-item-info">
                  <h2>{i.nombreProducto}</h2>
                  <p>S/ {soles(i.precio)}</p>

                  <button
                    disabled={busy}
                    className="btn btn-link text-danger p-0"
                    onClick={() =>
                      quitar(i.idProducto)
                    }
                  >
                    Quitar
                  </button>
                </div>

                <div className="cart-quantity">
                  <label
                    htmlFor={`qty-${i.idProducto}`}
                  >
                    Cantidad
                  </label>

                  <input
                    id={`qty-${i.idProducto}`}
                    className="form-control"
                    type="number"
                    min={1}
                    max={i.stock}
                    value={i.cantidad}
                    disabled={busy}
                    onChange={(e) =>
                      actualizarCantidad(
                        i.idProducto,
                        Number(e.target.value),
                      )
                    }
                  />

                  <strong>
                    S/ {soles(i.precio * i.cantidad)}
                  </strong>
                </div>
              </article>
            ))}

            <p className="small text-muted mt-3">
              El resumen utiliza los precios actuales
              del servidor.
            </p>
          </section>

          {!esCliente ? (
            <section className="surface">
              <h2>Continúa con tu cuenta</h2>

              <Link
                className="btn btn-primary"
                to="/login"
              >
                Iniciar sesión como cliente
              </Link>
            </section>
          ) : (
            <form
              className="surface cart-checkout"
              onSubmit={comprar}
            >
              <fieldset disabled={busy}>
                <h2 className="h4">1. Entrega</h2>

                <label
                  htmlFor="entrega"
                  className="form-label"
                >
                  Modalidad
                </label>

                <select
                  id="entrega"
                  name="envio"
                  className="form-select mb-3"
                  value={form.envio}
                  onChange={cambiar}
                >
                  <option value="recojo">
                    Recojo en tienda · gratis
                  </option>
                  <option value="delivery">
                    Delivery · S/ 10.00
                  </option>
                  <option value="shalom">
                    Shalom · S/ 15.00
                  </option>
                </select>

                <label
                  htmlFor="destinatario"
                  className="form-label"
                >
                  Nombre completo del destinatario
                </label>

                <input
                  id="destinatario"
                  name="destinatario"
                  className="form-control mb-3"
                  required
                  maxLength={150}
                  value={form.destinatario}
                  onChange={cambiar}
                />

                <label
                  htmlFor="telefono"
                  className="form-label"
                >
                  Celular (9 dígitos)
                </label>

                <input
                  id="telefono"
                  name="telefono"
                  className="form-control mb-3"
                  type="tel"
                  inputMode="numeric"
                  pattern="[0-9]{9}"
                  maxLength={9}
                  required
                  value={form.telefono}
                  onChange={cambiar}
                />

                {form.envio === "delivery" && (
                  <>
                    <label
                      htmlFor="direccion"
                      className="form-label"
                    >
                      Dirección y referencia
                    </label>

                    <input
                      id="direccion"
                      name="direccion"
                      className="form-control mb-3"
                      required
                      maxLength={255}
                      value={form.direccion}
                      onChange={cambiar}
                    />
                  </>
                )}

                {form.envio === "shalom" && (
                  <>
                    <label
                      htmlFor="agencia"
                      className="form-label"
                    >
                      Ciudad y agencia Shalom de destino
                    </label>

                    <input
                      id="agencia"
                      name="agencia"
                      className="form-control mb-3"
                      required
                      maxLength={255}
                      value={form.agencia}
                      onChange={cambiar}
                    />
                  </>
                )}

                <h2 className="h4 mt-4">
                  2. Resumen
                </h2>

                {resumen ? (
                  <>
                    <div className="d-flex justify-content-between">
                      <span>Productos</span>
                      <span>
                        S/ {soles(resumen.subtotal)}
                      </span>
                    </div>

                    <div className="d-flex justify-content-between">
                      <span>Envío</span>
                      <span>
                        S/ {soles(resumen.costoEnvio)}
                      </span>
                    </div>

                    <div className="checkout-total">
                      <span>Total</span>
                      <strong>
                        S/ {soles(resumen.total)}
                      </strong>
                    </div>
                  </>
                ) : (
                  <p>
                    Actualiza el resumen para
                    consultar el importe.
                  </p>
                )}

                <button
                  type="button"
                  className="btn btn-link px-0 mb-3"
                  onClick={() =>
                    setRevision((n) => n + 1)
                  }
                >
                  Actualizar resumen
                </button>

                <h2 className="h4">
                  3. Pago de demostración
                </h2>

                <label
                  htmlFor="metodo"
                  className="form-label"
                >
                  Método de pago
                </label>

                <select
                  id="metodo"
                  name="metodo"
                  className="form-select mb-3"
                  value={form.metodo}
                  onChange={cambiar}
                >
                  <option value="YAPE">Yape</option>
                  <option value="PLIN">Plin</option>
                  <option value="TRANSFERENCIA">
                    Transferencia bancaria
                  </option>
                </select>

                <div className="bg-light border rounded-3 p-3 text-center mb-3">
                  {form.metodo === "TRANSFERENCIA" ? (
                    <>
                      <strong>
                        Banco de demostración
                      </strong>
                      <p className="mb-0">
                        Titular: TECHZONE DEMO
                        <br />
                        Cuenta: CUENTA-DEMO
                        <br />
                        CCI: CCI-DEMO
                      </p>
                    </>
                  ) : (
                    <>
                      <svg
                        width="150"
                        height="150"
                        viewBox="0 0 150 150"
                        role="img"
                        aria-label="QR de demostración no válido para pagos"
                      >
                        <rect
                          width="150"
                          height="150"
                          fill="white"
                        />

                        {[
                          "8,8",
                          "102,8",
                          "8,102",
                        ].map((xy) => (
                          <g
                            key={xy}
                            transform={`translate(${xy})`}
                          >
                            <rect
                              width="40"
                              height="40"
                              fill="#172033"
                            />
                            <rect
                              x="7"
                              y="7"
                              width="26"
                              height="26"
                              fill="white"
                            />
                            <rect
                              x="14"
                              y="14"
                              width="12"
                              height="12"
                              fill="#172033"
                            />
                          </g>
                        ))}

                        <text
                          x="75"
                          y="80"
                          textAnchor="middle"
                          fontSize="22"
                          fontWeight="bold"
                          fill="#8b3fd1"
                        >
                          DEMO
                        </text>

                        <text
                          x="95"
                          y="125"
                          textAnchor="middle"
                          fontSize="10"
                          fill="#172033"
                        >
                          SIN COBRO
                        </text>
                      </svg>

                      <p className="mb-0">
                        {form.metodo} · TECHZONE DEMO
                        <br />
                        Celular: DEMO
                      </p>
                    </>
                  )}

                  <small className="text-danger">
                    Datos ficticios.
                    No permiten realizar pagos.
                  </small>
                </div>

                <label
                  htmlFor="comprobante"
                  className="form-label"
                >
                  Comprobante de prueba
                  (JPG/PNG, hasta 5 MB)
                </label>

                <input
                  id="comprobante"
                  className="form-control mb-3"
                  type="file"
                  accept="image/png,image/jpeg"
                  required
                  onChange={(e) =>
                    setArchivo(e.target.files[0])
                  }
                />

                <button
                  disabled={!resumen || busy}
                  className="btn btn-primary w-100"
                >
                  {busy
                    ? "Registrando…"
                    : "Registrar pedido y enviar comprobante"}
                </button>

                <p className="small text-muted mt-3 mb-0">
                  El stock queda reservado hasta
                  la entrega o cancelación del pedido.
                </p>
              </fieldset>
            </form>
          )}
        </div>
      )}
    </div>
  );
}