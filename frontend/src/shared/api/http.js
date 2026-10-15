import axios from "axios";
const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || "/api" });
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("tz_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
api.interceptors.response.use(
  (r) => r,
  (error) => {
    if (
      error.response?.status === 401 &&
      !error.config.url?.includes("/login")
    ) {
      localStorage.removeItem("tz_token");
      localStorage.removeItem("tz_usuario");
      window.dispatchEvent(new Event("tz-session-expired"));
    }
    return Promise.reject(error);
  },
);
export const mensajeError = (error) =>
  error.response?.data?.mensaje ||
  "No se pudo completar la operación. Revisa la conexión.";
export default api;
