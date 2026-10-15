import api from "../../../shared/api/http";
export const authService = {
  me: () => api.get("/auth/me"),
  login: (correo, password) => api.post("/auth/login", { correo, password }),
  registrar: (datos) => api.post("/auth/registro", datos),
};
