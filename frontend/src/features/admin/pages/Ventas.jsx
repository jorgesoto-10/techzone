import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../../shared/api/http.js";

export default function Ventas() {
  const [ventas, setVentas] = useState([]);

  useEffect(() => {
    api.get("/admin/ventas").then((res) => setVentas(res.data));
  }, []);

  return (
    <div>
      <h3 className="mb-3">Ventas</h3>

      <div className="card shadow-sm">
        <table className="table mb-0 align-middle">
          <thead>
            <tr>
              <th>#</th>
              <th>Cliente</th>
              <th>Fecha</th>
              <th>Total</th>
              <th>Estado</th>
              <th>Envío</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {ventas.map((v) => (
              <tr key={v.idVenta}>
                <td>#{v.idVenta}</td>
                <td>{v.nombreCliente}</td>
                <td>{new Date(v.fechaVenta).toLocaleString("es-PE")}</td>
                <td>S/. {v.total.toFixed(2)}</td>
                <td className="text-capitalize">{v.estado}</td>
                <td>{v.envio}</td>
                <td className="text-end">
                  <Link
                    to={`/admin/ventas/${v.idVenta}`}
                    className="btn btn-sm btn-info"
                  >
                    Ver detalle
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
