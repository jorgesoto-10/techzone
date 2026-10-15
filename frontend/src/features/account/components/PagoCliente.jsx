import { useEffect, useState } from "react";
import api, { mensajeError } from "../../../shared/api/http";
import Comprobante from "../../../shared/components/Comprobante";

const soles = (n) => Number(n).toFixed(2);

export default function PagoCliente({ id, onChange }) {
  const [resumen, setResumen] = useState(null);
  const [error, setError] = useState("");
  const [archivo, setArchivo] = useState(null);
  const [busy, setBusy] = useState(false);
  const [mostrar, setMostrar] = useState(false);

  useEffect(() => {
    let activo = true;

    api
      .get(`/ventas/${id}/pago`)
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

  async function reenviar(e) {
    e.preventDefault();

    if (!archivo || archivo.size > 5 * 1024 * 1024) {
      setError("Selecciona una imagen JPG/PNG de hasta 5 MB");
      return;
    }

    setBusy(true);
    setError("");

    try {
      const body = new FormData();
      body.append("comprobante", archivo);

      const { data } = await api.put(
        `/ventas/${id}/comprobante`,
        body,
      );

      setResumen(data);
      setArchivo(null);
      onChange?.();
      e.target.reset();
    } catch (err) {
      setError(mensajeError(err));
    } finally {
      setBusy(false);
    }
  }

  if (!resumen) {
    return <p>{error || "Cargando pago…"}</p>;
  }

  const { pago, venta } = resumen;

  return (
    <section className="border-top pt-3 mt-3">
      <div className="d-flex justify-content-between">
        <span>Productos</span>
        <span>S/ {soles(resumen.subtotal)}</span>
      </div>

      <div className="d-flex justify-content-between">
        <span>Envío</span>
        <span>S/ {soles(resumen.costoEnvio)}</span>
      </div>

      <p className="mt-2 mb-1">
        <strong>Entrega:</strong>{" "}
        {resumen.destinatario || venta.nombreCliente}
        {resumen.telefono && ` · ${resumen.telefono}`}
      </p>

      <p>
        {resumen.agencia ||
          venta.direccion ||
          "Recojo en tienda"}
      </p>

      {pago ? (
        <>
          <p>
            <strong>{pago.metodo}</strong> · Pago{" "}
            {pago.estado} · Pedido {venta.estado}
          </p>

          {pago.observacion && (
            <div className="alert alert-info">
              {pago.observacion}
            </div>
          )}

          <button
            type="button"
            className="btn btn-outline-secondary btn-sm"
            onClick={() => setMostrar(!mostrar)}
          >
            {mostrar
              ? "Ocultar comprobante"
              : "Ver comprobante"}
          </button>

          {mostrar && (
            <div className="mt-3">
              <Comprobante
                id={id}
                version={pago.fechaEnvio}
              />
            </div>
          )}

          {pago.estado === "RECHAZADO" &&
            venta.estado !== "CANCELADA" && (
              <form className="mt-3" onSubmit={reenviar}>
                <label
                  className="form-label"
                  htmlFor={`corregir-${id}`}
                >
                  Subir comprobante corregido
                  (JPG/PNG, máximo 5 MB)
                </label>

                <input
                  id={`corregir-${id}`}
                  className="form-control"
                  type="file"
                  accept="image/png,image/jpeg"
                  required
                  onChange={(e) =>
                    setArchivo(e.target.files[0])
                  }
                />

                <button
                  disabled={busy}
                  className="btn btn-primary mt-2"
                >
                  {busy
                    ? "Enviando…"
                    : "Reenviar comprobante"}
                </button>
              </form>
            )}
        </>
      ) : (
        <p className="text-muted">
          Compra anterior: sin comprobante registrado.
        </p>
      )}

      {error && (
        <p role="alert" className="text-danger mt-2">
          {error}
        </p>
      )}
    </section>
  );
}