import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useNotificaciones } from "../context/NotificacionesContext";
import { mensajeError } from "../../../shared/api/http";

function fechaNotificacion(valor) {
  const fecha = new Date(valor);

  if (Number.isNaN(fecha.getTime())) {
    return "";
  }

  return fecha.toLocaleString("es-PE", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function CampanaNotificaciones() {
  const {
    notificaciones,
    noLeidas,
    estado,
    error,
    recargar,
    marcarLeida,
  } = useNotificaciones();

  const [abierta, setAbierta] = useState(false);
  const [procesando, setProcesando] = useState(null);
  const [errorAccion, setErrorAccion] = useState("");

  const contenedorRef = useRef(null);
  const botonRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!abierta) return;

    function cerrarFuera(evento) {
      if (
        !contenedorRef.current?.contains(evento.target)
      ) {
        setAbierta(false);
      }
    }

    function cerrarConEscape(evento) {
      if (evento.key === "Escape") {
        setAbierta(false);
        botonRef.current?.focus();
      }
    }

    document.addEventListener("pointerdown", cerrarFuera);
    document.addEventListener("keydown", cerrarConEscape);

    return () => {
      document.removeEventListener(
        "pointerdown",
        cerrarFuera,
      );

      document.removeEventListener(
        "keydown",
        cerrarConEscape,
      );
    };
  }, [abierta]);

  async function abrirPedido(notificacion) {
    if (procesando !== null) return;

    setProcesando(notificacion.idNotificacion);
    setErrorAccion("");

    try {
      if (!notificacion.leida) {
        await marcarLeida(
          notificacion.idNotificacion,
        );
      }

      setAbierta(false);

      navigate(
        `/admin/ventas/${notificacion.idVenta}`,
      );
    } catch (e) {
      setErrorAccion(mensajeError(e));
    } finally {
      setProcesando(null);
    }
  }

  const textoConexion = {
    conectado: "En tiempo real",
    conectando: "Conectando…",
    desconectado: "Reconectando…",
  }[estado];

  return (
    <div
      className="tz-notificaciones"
      ref={contenedorRef}
    >
      <button
        ref={botonRef}
        type="button"
        className="tz-notificaciones-boton"
        aria-label={
          noLeidas > 0
            ? `Notificaciones: ${noLeidas} sin leer`
            : "Notificaciones"
        }
        aria-expanded={abierta}
        aria-controls="panel-notificaciones"
        onClick={() => {
          const siguiente = !abierta;

          setAbierta(siguiente);
          setErrorAccion("");

          if (siguiente) {
            void recargar();
          }
        }}
      >
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
          <path d="M10 21h4" />
        </svg>

        {noLeidas > 0 && (
          <span className="tz-notificaciones-contador">
            {noLeidas > 99 ? "99+" : noLeidas}
          </span>
        )}
      </button>

      {abierta && (
        <section
          id="panel-notificaciones"
          className="tz-notificaciones-panel"
          aria-label="Notificaciones de pedidos"
        >
          <div className="tz-notificaciones-cabecera">
            <div>
              <h2>Notificaciones</h2>

              <span>
                {noLeidas === 1
                  ? "1 notificación sin leer"
                  : `${noLeidas} notificaciones sin leer`}
              </span>
            </div>

            <button
              type="button"
              className="tz-notificaciones-cerrar"
              aria-label="Cerrar notificaciones"
              onClick={() => setAbierta(false)}
            >
              ×
            </button>
          </div>

          <div className="tz-notificaciones-conexion">
            <span
              className={
                estado === "conectado"
                  ? "tz-notificaciones-punto activo"
                  : "tz-notificaciones-punto"
              }
            />
            {textoConexion}
          </div>

          {(errorAccion || error) && (
            <div
              className="tz-notificaciones-error"
              role="alert"
            >
              {errorAccion || error}

              <button
                type="button"
                onClick={() => void recargar()}
              >
                Reintentar
              </button>
            </div>
          )}

          <div className="tz-notificaciones-lista">
            {notificaciones.length === 0 ? (
              <div className="tz-notificaciones-vacio">
                <strong>No hay notificaciones todavía</strong>
                <p>
                  Los nuevos pedidos aparecerán aquí.
                </p>
              </div>
            ) : (
              notificaciones.map((notificacion) => (
                <button
                  key={notificacion.idNotificacion}
                  type="button"
                  className={
                    "tz-notificaciones-item" +
                    (!notificacion.leida
                      ? " sin-leer"
                      : "")
                  }
                  disabled={procesando !== null}
                  onClick={() =>
                    abrirPedido(notificacion)
                  }
                >
                  <span className="tz-notificaciones-item-cabecera">
                    <strong>
                      {notificacion.titulo}
                    </strong>

                    {!notificacion.leida && (
                      <span
                        className="tz-notificaciones-indicador"
                        aria-label="Sin leer"
                      />
                    )}
                  </span>

                  <span className="tz-notificaciones-mensaje">
                    {notificacion.mensaje}
                  </span>

                  <span className="tz-notificaciones-fecha">
                    {fechaNotificacion(
                      notificacion.fechaCreacion,
                    )}

                    <span>
                      {procesando ===
                      notificacion.idNotificacion
                        ? "Abriendo…"
                        : "Ver pedido →"}
                    </span>
                  </span>
                </button>
              ))
            )}
          </div>

          <div className="tz-notificaciones-pie">
            Se muestran las últimas 20 notificaciones.
          </div>
        </section>
      )}
    </div>
  );
}