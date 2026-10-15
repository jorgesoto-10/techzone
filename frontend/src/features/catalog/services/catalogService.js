import api from "../../../shared/api/http";
export const catalogService = {
  categorias: () => api.get("/categorias"),
  productos: (params) => api.get("/productos", { params }),
};
