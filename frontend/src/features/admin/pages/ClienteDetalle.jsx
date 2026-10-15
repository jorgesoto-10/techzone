import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../../../shared/api/http.js";

export default function ClienteDetalle() {
  const { dni } = useParams();
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get(`/admin/clientes/${dni}`).then((res) => setData(res.data));
  }, [dni]);

  if (!data) return <p className="text-muted">Cargando...</p>;

  const { cliente, compras, totalGastado } = data;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3>Detalle de Cliente</h3>
        <Link to="/admin/clientes" className="btn btn-secondary">
          ← Volver a Clientes
        </Link>
      </div>

      <div className="row mb-4">
        <div className="col-md-6 mb-3">
          <div className="card shadow-sm h-100 border-info">
            <div className="card-header bg-info text-white">
              Datos del Cliente
            </div>
            <div className="card-body">
              <p>
                <strong>Nombre:</strong> {cliente.nombre} {cliente.apellido}
              </p>
              <p>
                <strong>DNI:</strong> {cliente.dniCliente}
              </p>
              <p>
                <strong>Correo:</strong> {cliente.correo}
              </p>
              <p className="mb-0">
                <strong>Teléfono:</strong> {cliente.telefono || "No registrado"}
              </p>
            </div>
          </div>
        </div>
        <div className="col-md-6 mb-3">
          <div className="card shadow-sm h-100 border-primary">
            <div className="card-header bg-primary text-white">
              Resumen de Compras
            </div>
            <div className="card-body">
              <p>
                <strong>Total de compras:</strong> {compras.length}
              </p>
              <p className="mb-0">
                <strong>Total gastado:</strong> S/. {totalGastado.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="card shadow-sm">
        <div className="card-header bg-dark text-white">
          Historial de Compras
        </div>
        <div className="card-body p-0">
          <table className="table mb-0 align-middle">
            <thead>
              <tr>
                <th>ID Venta</th>
                <th>Fecha</th>
                <th>Total</th>
                <th>Estado</th>
                <th>Envío</th>
              </tr>
            </thead>
            <tbody>
              {compras.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center text-muted py-4">
                    Este cliente todavía no tiene compras registradas.
                  </td>
                </tr>
              ) : (
                compras.map((v) => (
                  <tr key={v.idVenta}>
                    <td>#{v.idVenta}</td>
                    <td>{new Date(v.fechaVenta).toLocaleString("es-PE")}</td>
                    <td>S/. {v.total.toFixed(2)}</td>
                    <td className="text-capitalize">{v.estado}</td>
                    <td>{v.envio}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
