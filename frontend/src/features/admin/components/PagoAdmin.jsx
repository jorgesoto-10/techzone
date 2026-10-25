import { useEffect, useState } from "react";
import api, { mensajeError } from "../../../shared/api/http";
import Comprobante from "../../../shared/components/Comprobante";

const soles = (n) => Number(n).toFixed(2);

const CONFIRMACIONES = {
  APROBADO: {
    titulo: "Aprobar pago",
    texto:
      "Confirma que revisaste el comprobante. " +
      "El pedido quedará autorizado para su preparación.",
    boton: "Sí, aprobar pago",
    peligro: false,
  },
  RECHAZADO: {
    titulo: "Rechazar comprobante",
    texto:
      "El cliente verá tu observación y podrá " +
      "enviar un comprobante corregido.",
    boton: "Sí, rechazar comprobante",
    peligro: true,
  },
  CANCELADA: {
    titulo: "Cancelar pedido",
    texto:
      "El pedido se cancelará y sus productos " +
      "regresarán al stock disponible.",
    boton: "Sí, cancelar pedido",
    peligro: true,
  },
  ENTREGADA: {
    titulo: "Finalizar entrega",
    texto:
      "Confirma que el cliente ya recibió el pedido. " +
      "Esta acción finalizará su seguimiento.",
    boton: "Sí, confirmar entrega",
    peligro: false,
  },
};

const MENSAJES_EXITO = {
  APROBADO: "Pago aprobado. El pedido está confirmado.",
  RECHAZADO:
    "Comprobante rechazado. Se guardó tu observación.",
  PREPARANDO: "El pedido está en preparación.",
  LISTO_ENTREGA: "El pedido está listo para su entrega.",
  ENTREGADA: "Pedido entregado correctamente.",
  CANCELADA: "Pedido cancelado. El stock fue devuelto.",
};

const NOMBRES_ESTADO = {
  REGISTRADA: "Registrado",
  PENDIENTE_PAGO: "Pendiente de verificación",
  CONFIRMADA: "Confirmado",
  PREPARANDO: "En preparación",
  LISTO_ENTREGA: "Listo para entrega",
  ENTREGADA: "Entregado",
  CANCELADA: "Cancelado",
};

export default function PagoAdmin({ id, onChange }) {
  const [resumen, setResumen] = useState(null);
  const [error, setError] = useState("");
  const [observacion, setObservacion] = useState("");
  const [busy, setBusy] = useState(false);
  const [confirmacion, setConfirmacion] = useState(null);
  const [exito, setExito] = useState("");

  useEffect(() => {
    let activo = true;

    setResumen(null);
    setError("");
    setExito("");
    setConfirmacion(null);
    setObservacion("");

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

  async function ejecutar(tipo, estado, confirmado = false) {
    if (busy) return;

    setError("");
    setExito("");

    if (
      tipo === "pago" &&
      estado === "RECHAZADO" &&
      !observacion.trim()
    ) {
      setError("Escribe el motivo del rechazo");
      return;
    }

    const aviso = CONFIRMACIONES[estado];

    // Solo las acciones importantes necesitan confirmación.
    if (aviso && !confirmado) {
      setConfirmacion({
        tipo,
        estado,
        ...aviso,
      });
      return;
    }

    setConfirmacion(null);
    setBusy(true);

    try {
      const { data } = await api.put(
        `/admin/ventas/${id}/${tipo}`,
        { estado, observacion },
      );

      setResumen(data);

      setExito(
        MENSAJES_EXITO[estado] ||
          "Cambio guardado correctamente.",
      );

      // Actualiza también el resumen superior de la venta.
      try {
        await onChange?.();
      } catch {
        setError(
          "El cambio se guardó, pero no se pudo actualizar " +
            "el resumen superior. Recarga la página.",
        );
      }
    } catch (e) {
      setError(mensajeError(e));
    } finally {
      setBusy(false);
    }
  }

  if (!resumen) {
    return (
      <p role={error ? "alert" : undefined}>
        {error || "Cargando pago…"}
      </p>
    );
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

  const textoBotonSiguiente = {
    PREPARANDO: "Iniciar preparación",
    LISTO_ENTREGA: "Marcar listo para entrega",
    ENTREGADA: "Confirmar entrega",
  };

  const accionesBloqueadas =
    busy || confirmacion !== null;

  return (
    <section className="surface mt-4">
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <h2 className="h4 mb-0">
          Revisión de pago y entrega
        </h2>

        {busy && (
          <span
            className="small text-muted d-flex align-items-center gap-2"
            role="status"
          >
            <span
              className="spinner-border spinner-border-sm"
              aria-hidden="true"
            />
            Guardando…
          </span>
        )}
      </div>

      {exito && (
        <div
          className="alert alert-success d-flex justify-content-between align-items-center gap-3"
          role="status"
        >
          <span>{exito}</span>

          <button
            type="button"
            className="btn-close"
            aria-label="Cerrar mensaje de éxito"
            onClick={() => setExito("")}
          />
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="alert alert-danger"
        >
          {error}
        </div>
      )}

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
              {NOMBRES_ESTADO[venta.estado] ||
                venta.estado}
            </span>
          </p>

          {pago.observacion && (
            <div className="alert alert-info">
              <strong>Observación:</strong>{" "}
              {pago.observacion}
            </div>
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
                  rows={3}
                  disabled={accionesBloqueadas}
                  value={observacion}
                  onChange={(e) =>
                    setObservacion(e.target.value)
                  }
                />

                <div className="d-flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={accionesBloqueadas}
                    className="btn btn-success"
                    onClick={() =>
                      ejecutar("pago", "APROBADO")
                    }
                  >
                    Aprobar pago
                  </button>

                  <button
                    type="button"
                    disabled={accionesBloqueadas}
                    className="btn btn-outline-danger"
                    onClick={() =>
                      ejecutar("pago", "RECHAZADO")
                    }
                  >
                    Rechazar pago
                  </button>
                </div>
              </>
            )}

          {siguiente &&
            pago.estado === "APROBADO" && (
              <button
                type="button"
                disabled={accionesBloqueadas}
                className="btn btn-primary"
                onClick={() =>
                  ejecutar("estado", siguiente)
                }
              >
                {busy
                  ? "Guardando…"
                  : textoBotonSiguiente[siguiente]}
              </button>
            )}

          {venta.estado === "PENDIENTE_PAGO" && (
            <button
              type="button"
              disabled={accionesBloqueadas}
              className="btn btn-outline-danger d-block mt-3"
              onClick={() =>
                ejecutar("estado", "CANCELADA")
              }
            >
              Cancelar pedido y devolver stock
            </button>
          )}

          {venta.estado === "ENTREGADA" && (
            <div className="bg-light border rounded-3 p-3 mt-3">
              <strong className="text-success">
                Pedido completado
              </strong>

              <p className="small text-muted mb-0 mt-1">
                La entrega de este pedido ya fue registrada.
              </p>
            </div>
          )}

          {confirmacion && (
            <div
              className="bg-light border rounded-4 p-4 mt-4"
              role="region"
              aria-label="Confirmación de la operación"
              style={{
                borderLeft: "4px solid #7254e8",
              }}
            >
              <span className="section-label">
                CONFIRMAR OPERACIÓN
              </span>

              <h3 className="h5 mt-2">
                {confirmacion.titulo}
              </h3>

              <p className="text-muted mb-3">
                {confirmacion.texto}
              </p>

              <div className="d-flex flex-wrap gap-2">
                <button
                  type="button"
                  className={
                    confirmacion.peligro
                      ? "btn btn-danger"
                      : "btn btn-primary"
                  }
                  disabled={busy}
                  onClick={() =>
                    ejecutar(
                      confirmacion.tipo,
                      confirmacion.estado,
                      true,
                    )
                  }
                >
                  {confirmacion.boton}
                </button>

                <button
                  type="button"
                  className="btn btn-light"
                  disabled={busy}
                  onClick={() =>
                    setConfirmacion(null)
                  }
                >
                  Volver
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
