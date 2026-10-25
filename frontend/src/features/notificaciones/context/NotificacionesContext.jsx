import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { useAuth } from "../../auth/context/AuthContext";
import api, { mensajeError } from "../../../shared/api/http";

const NotificacionesContext = createContext(null);

function obtenerUrlSocket() {
  const base = String(api.defaults.baseURL || "/api")
    .replace(/\/+$/, "");

  return new URL(`${base}/ws`, window.location.origin).href;
}

export function NotificacionesProvider({ children }) {
  const { usuario, esAdmin, cargando, refrescar } = useAuth();

  const usuarioId = usuario?.id ?? usuario?.idUsuario;
  const token = localStorage.getItem("tz_token");

  const [notificaciones, setNotificaciones] = useState([]);
  const [noLeidas, setNoLeidas] = useState(0);
  const [estado, setEstado] = useState("conectando");
  const [error, setError] = useState("");
  const [revision, setRevision] = useState(0);

  const recargarRef = useRef(async () => {});

  useEffect(() => {
    if (cargando || !esAdmin || !token) {
      return;
    }

    let activo = true;
    let solicitud = 0;

    setNotificaciones([]);
    setNoLeidas(0);
    setError("");
    setEstado("conectando");

    async function cargar() {
      const numeroSolicitud = ++solicitud;

      try {
        const { data } = await api.get(
          "/admin/notificaciones",
          {
            params: {
              page: 0,
              size: 20,
            },
          },
        );

        if (!activo || numeroSolicitud !== solicitud) {
          return;
        }

        setNotificaciones(data.notificaciones);
        setNoLeidas(data.noLeidas);
        setError("");
      } catch (e) {
        if (!activo || numeroSolicitud !== solicitud) {
          return;
        }

        setError(mensajeError(e));
      }
    }

    recargarRef.current = cargar;

    const cliente = new Client({
      webSocketFactory: () => new SockJS(obtenerUrlSocket()),

      reconnectDelay: 5000,
      connectionTimeout: 15000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,

      // Evita imprimir mensajes o credenciales en consola.
      debug: () => {},

      beforeConnect: () => {
        if (
          !activo ||
          localStorage.getItem("tz_token") !== token
        ) {
          void cliente.deactivate();
          return;
        }

        cliente.connectHeaders = {
          Authorization: `Bearer ${token}`,
        };

        setEstado("conectando");
      },

      onConnect: () => {
        if (!activo) return;

        cliente.subscribe(
          "/user/queue/notificaciones",
          (mensaje) => {
            if (!activo) return;

            try {
              const nueva = JSON.parse(mensaje.body);

              if (!nueva.idNotificacion) return;

              // Se consulta MySQL para obtener la lista y
              // el contador reales, sin duplicar notificaciones.
              void cargar();

              setRevision((valor) => valor + 1);
            } catch {
              setError(
                "No se pudo interpretar una notificación recibida.",
              );
            }
          },
        );

        setEstado("conectado");

        // Recupera también las notificaciones recibidas
        // mientras el administrador estaba desconectado.
        void cargar();

        setRevision((valor) => valor + 1);
      },

      onWebSocketClose: () => {
        if (activo) {
          setEstado("desconectado");
        }
      },

      onWebSocketError: () => {
        if (activo) {
          setEstado("desconectado");
        }
      },

      onStompError: () => {
        if (!activo) return;

        setEstado("desconectado");

        // Comprueba si la sesión o el rol cambiaron.
        void refrescar();
      },
    });

    function alRecuperarFoco() {
      void cargar();
    }

    // El historial puede cargarse aunque el socket tarde
    // unos segundos en establecerse.
    void cargar();

    cliente.activate();

    window.addEventListener("focus", alRecuperarFoco);

    return () => {
      activo = false;
      solicitud += 1;

      recargarRef.current = async () => {};

      window.removeEventListener("focus", alRecuperarFoco);

      void cliente.deactivate();
    };
  }, [cargando, esAdmin, usuarioId, token, refrescar]);

  const recargar = useCallback(() => {
    return recargarRef.current();
  }, []);

  const marcarLeida = useCallback(
    async (idNotificacion) => {
      await api.put(
        `/admin/notificaciones/${idNotificacion}/leida`,
      );

      await recargar();
    },
    [recargar],
  );

  return (
    <NotificacionesContext.Provider
      value={{
        notificaciones,
        noLeidas,
        estado,
        error,
        revision,
        recargar,
        marcarLeida,
      }}
    >
      {children}
    </NotificacionesContext.Provider>
  );
}

export function useNotificaciones() {
  const contexto = useContext(NotificacionesContext);

  if (!contexto) {
    throw new Error(
      "useNotificaciones debe usarse dentro de NotificacionesProvider",
    );
  }

  return contexto;
}