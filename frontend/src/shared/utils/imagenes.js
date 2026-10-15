// Mapea el id de cada categoría a: la carpeta real de imágenes de productos
// (static/Imagenes/PRODUCTOS/<carpeta>/) y la ruta de navegación "amigable"
// que tenía cada página de categoría en la versión Thymeleaf.
export const CATEGORIAS_INFO = {
  1: { ruta: "adaptadores", carpeta: "ACCESORIOS" },
  2: { ruta: "almacenamiento", carpeta: "ALMACENAMIENTO" },
  3: { ruta: "perifericos", carpeta: "PERIFERICOS" },
  4: { ruta: "case", carpeta: "CASES" },
  5: { ruta: "cooler", carpeta: "COOLER" },
  6: { ruta: "fuentespoder", carpeta: "FUENTEPODER" },
  7: { ruta: "memoriaram", carpeta: "MEMORIARAM" },
  8: { ruta: "monitores", carpeta: "MONITORES" },
  9: { ruta: "placabase", carpeta: "PLACABASE" },
  10: { ruta: "procesadores", carpeta: "PROCESADORES" },
  11: { ruta: "tarjetagrafica", carpeta: "TARJETAGRAFICA" },
  12: { ruta: "laptops", carpeta: "LAPTOPS" },
  13: { ruta: "pcs", carpeta: "PCS" },
};

// Arma la URL pública de la imagen de un producto a partir de su categoría.
export function imagenProducto(producto) {
  if (!producto?.imagen) return "/Imagenes/INICIO/logo.png";
  if (/^(https?:|data:|\/)/.test(producto.imagen)) return producto.imagen;
  const info = CATEGORIAS_INFO[producto.idCategoria];
  const carpeta = info ? info.carpeta : "TODOSPRODUCTOS";
  return `/Imagenes/PRODUCTOS/${carpeta}/${producto.imagen}`;
}
