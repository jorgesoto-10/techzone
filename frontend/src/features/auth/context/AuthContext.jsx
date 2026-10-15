import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { authService } from "../services/authService";
const AuthContext = createContext(null);
function leer() {
  try {
    return JSON.parse(localStorage.getItem("tz_usuario"));
  } catch {
    return null;
  }
}
export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(leer),
    [cargando, setCargando] = useState(true);
  const logout = useCallback(() => {
    localStorage.removeItem("tz_token");
    localStorage.removeItem("tz_usuario");
    setUsuario(null);
  }, []);
  const refrescar = useCallback(async () => {
    if (!localStorage.getItem("tz_token")) {
      setCargando(false);
      return;
    }
    try {
      const { data } = await authService.me();
      const u = {
        ...data,
        id: String(data.idUsuario),
        rol: data.roles.includes("ADMIN") ? "ADMIN" : "CLIENTE",
      };
      localStorage.setItem("tz_usuario", JSON.stringify(u));
      setUsuario(u);
    } catch (e) {
      if (e.response?.status === 401) logout();
    } finally {
      setCargando(false);
    }
  }, [logout]);
  useEffect(() => {
    refrescar();
    const timer = setInterval(refrescar, 30000);
    window.addEventListener("focus", refrescar);
    window.addEventListener("tz-session-expired", logout);
    return () => {
      clearInterval(timer);
      window.removeEventListener("focus", refrescar);
      window.removeEventListener("tz-session-expired", logout);
    };
  }, [refrescar, logout]);
  function guardar(data) {
    localStorage.setItem("tz_token", data.token);
    const u = { ...data };
    delete u.token;
    localStorage.setItem("tz_usuario", JSON.stringify(u));
    setUsuario(u);
  }
  async function login(correo, password) {
    const { data } = await authService.login(correo, password);
    guardar(data);
    return data;
  }
  async function registrarCliente(payload) {
    const { data } = await authService.registrar(payload);
    guardar(data);
    return data;
  }
  return (
    <AuthContext.Provider
      value={{
        usuario,
        cargando,
        esCliente: usuario?.rol === "CLIENTE",
        esAdmin: usuario?.rol === "ADMIN",
        loginCliente: login,
        loginAdmin: login,
        registrarCliente,
        logout,
        refrescar,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
export const useAuth = () => useContext(AuthContext);
