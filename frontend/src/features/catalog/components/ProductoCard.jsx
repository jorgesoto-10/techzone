import { useCarrito } from "../../cart/context/CarritoContext.jsx";
import { imagenProducto } from "../../../shared/utils/imagenes.js";

export default function ProductoCard({ producto }) {
  const { agregar } = useCarrito();
  const sinStock = producto.stock <= 0;

  return (
    <div className="col-6 col-md-4 col-lg-3 mb-4">
      <div className="card h-100 shadow-sm product-card">
        <img
          src={imagenProducto(producto)}
          className="card-img-top"
          alt={producto.nombreProducto}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "/Imagenes/INICIO/logo.png";
          }}
        />
        <div className="card-body d-flex flex-column">
          <h6 className="card-title">{producto.nombreProducto}</h6>
          <p className="text-muted small mb-1">
            {producto.nombreMarca} · {producto.nombreCategoria}
          </p>
          <p className="fw-bold text-primary mb-2">
            S/. {producto.precio.toFixed(2)}
          </p>
          <p className="small mb-2">
            {sinStock ? (
              <span className="text-danger">Sin stock</span>
            ) : (
              <span className="text-success">Stock: {producto.stock}</span>
            )}
          </p>
          <button
            className="btn btn-primary mt-auto btn-sm"
            disabled={sinStock}
            onClick={() => agregar(producto)}
          >
            Agregar al carrito
          </button>
        </div>
      </div>
    </div>
  );
}
