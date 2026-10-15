import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../../shared/api/http.js";

export default function Clientes() {
  const [clientes, setClientes] = useState([]);

  useEffect(() => {
    api.get("/admin/clientes").then((res) => setClientes(res.data));
  }, []);

  return (
    <div>
      <h3 className="mb-3">Clientes</h3>

      <div className="card shadow-sm">
        <table className="table mb-0 align-middle">
          <thead>
            <tr>
              <th>DNI</th>
              <th>Nombre</th>
              <th>Correo</th>
              <th>Teléfono</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {clientes.map((c) => (
              <tr key={c.dniCliente}>
                <td>{c.dniCliente}</td>
                <td>
                  {c.nombre} {c.apellido}
                </td>
                <td>{c.correo}</td>
                <td>{c.telefono || "No registrado"}</td>
                <td className="text-end">
                  <Link
                    to={`/admin/clientes/${c.dniCliente}`}
                    className="btn btn-sm btn-info"
                  >
                    Ver
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
