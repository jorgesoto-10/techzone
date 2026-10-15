import { useEffect, useState } from "react";
import api, { mensajeError } from "../../../shared/api/http";
import Comprobante from "../../../shared/components/Comprobante";

const soles = (n) => Number(n).toFixed(2);

export default function PagoAdmin({ id, onChange }) {
  const [resumen, setResumen] = useState(null);
  const [error, setError] = useState("");
  const [observacion, setObservacion] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let activo = true;

    api
      .get(`/admin/ventas/${id}/pago`)
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
  }, [id]);

  async function ejecutar(tipo, estado) {
    if (busy) return;

    if (
      tipo === "pago" &&
      estado === "RECHAZADO" &&
      !observacion.trim()
    ) {
      setError("Escribe el motivo del rechazo");
      return;
    }

    const confirmar = window.confirm(
      `¿Confirmar ${estado
        .toLowerCase()
        .replaceAll("_", " ")}?`,
    );

    if (!confirmar) return;

    setBusy(true);
    setError("");

    try {
      const { data } = await api.put(
        `/admin/ventas/${id}/${tipo}`,
        { estado, observacion },
      );

      setResumen(data);
      await onChange?.();
    } catch (e) {
      setError(mensajeError(e));
    } finally {
      setBusy(false);
    }
  }

  if (!resumen) {
    return <p>{error || "Cargando pago…"}</p>;
  }

  const { pago, venta } = resumen;

  if (!pago) {
    return (
      <p className="text-muted">
        Venta anterior sin comprobante:
        conserva su edición habitual.
      </p>
    );
  }

  const siguiente = {
    CONFIRMADA: "PREPARANDO",
    PREPARANDO: "LISTO_ENTREGA",
    LISTO_ENTREGA: "ENTREGADA",
  }[venta.estado];

  return (
    <section className="surface mt-4">
      <h2 className="h4">
        Revisión de pago y entrega
      </h2>

      <div className="row g-4 mt-1">
        <div className="col-md-6">
          <p>
            <strong>{pago.metodo}</strong> · S/{" "}
            {soles(pago.monto)} · {pago.estado}
          </p>

          <Comprobante
            id={id}
            admin
            version={pago.fechaEnvio}
          />

          <p className="small text-muted mt-2">
            Entorno de demostración. En operación real,
            verifica el ingreso en tu cuenta.
          </p>
        </div>

        <div className="col-md-6">
          <p>
            <strong>Destinatario:</strong>{" "}
            {resumen.destinatario} · {resumen.telefono}
          </p>

          <p>
            <strong>Entrega:</strong> {venta.envio} ·{" "}
            {resumen.agencia ||
              venta.direccion ||
              "Recojo en tienda"}
          </p>

          <p>
            Productos: S/ {soles(resumen.subtotal)} ·
            Envío: S/ {soles(resumen.costoEnvio)}
          </p>

          <p>
            <strong>
              Total: S/ {soles(venta.total)}
            </strong>
          </p>

          <p>
            Pedido:{" "}
            <span className="pill">
              {venta.estado}
            </span>
          </p>

          {pago.observacion && (
            <p className="alert alert-info">
              {pago.observacion}
            </p>
          )}

          {pago.estado === "PENDIENTE" &&
            venta.estado === "PENDIENTE_PAGO" && (
              <>
                <label
                  className="form-label"
                  htmlFor="observacion-pago"
                >
                  Observación (obligatoria al rechazar)
                </label>

                <textarea
                  id="observacion-pago"
                  className="form-control mb-3"
                  maxLength={500}
                  value={observacion}
                  onChange={(e) =>
                    setObservacion(e.target.value)
                  }
                />

                <button
                  disabled={busy}
                  className="btn btn-success me-2"
                  onClick={() =>
                    ejecutar("pago", "APROBADO")
                  }
                >
                  Aprobar pago
                </button>

                <button
                  disabled={busy}
                  className="btn btn-outline-danger"
                  onClick={() =>
                    ejecutar("pago", "RECHAZADO")
                  }
                >
                  Rechazar pago
                </button>
              </>
            )}

          {siguiente &&
            pago.estado === "APROBADO" && (
              <button
                disabled={busy}
                className="btn btn-primary"
                onClick={() =>
                  ejecutar("estado", siguiente)
                }
              >
                Pasar a{" "}
                {siguiente
                  .replaceAll("_", " ")
                  .toLowerCase()}
              </button>
            )}

          {venta.estado === "PENDIENTE_PAGO" && (
            <button
              disabled={busy}
              className="btn btn-outline-danger d-block mt-3"
              onClick={() =>
                ejecutar("estado", "CANCELADA")
              }
            >
              Cancelar pedido y devolver stock
            </button>
          )}
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="alert alert-danger mt-3"
        >
          {error}
        </div>
      )}
    </section>
  );
}