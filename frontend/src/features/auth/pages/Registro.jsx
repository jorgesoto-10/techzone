import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AuthLayout from "../../../shared/layouts/AuthLayout";
import { mensajeError } from "../../../shared/api/http";
export default function Registro() {
  const [form, setForm] = useState({
      nombre: "",
      apellido: "",
      dniCliente: "",
      correo: "",
      telefono: "",
      password: "",
    }),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  const { registrarCliente } = useAuth();
  const nav = useNavigate();
  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    try {
      await registrarCliente(form);
      nav("/");
    } catch (e) {
      setError(mensajeError(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <AuthLayout>
      <span className="section-label">UN NUEVO COMIENZO</span>
      <h2>Tu cuenta, tu próximo equipo.</h2>
      <p className="text-muted">
        Regístrate para guardar y consultar tus compras.
      </p>
      {error && (
        <div role="alert" className="alert alert-danger">
          {error}
        </div>
      )}
      <form onSubmit={submit}>
        <div className="row g-3">
          {[
            ["nombre", "Nombre"],
            ["apellido", "Apellido"],
            ["dniCliente", "DNI"],
            ["telefono", "Teléfono"],
            ["correo", "Correo electrónico"],
            ["password", "Contraseña"],
          ].map(([key, label]) => (
            <div
              className={
                key === "correo" || key === "password" ? "col-12" : "col-sm-6"
              }
              key={key}
            >
              <label htmlFor={key} className="form-label">
                {label}
              </label>
              <input
                id={key}
                className="form-control"
                required={key !== "telefono"}
                type={
                  key === "correo"
                    ? "email"
                    : key === "password"
                      ? "password"
                      : "text"
                }
                value={form[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                pattern={key === "dniCliente" ? "[0-9]{8}" : undefined}
                maxLength={
                  key === "dniCliente" ? 8 : key === "password" ? 72 : 100
                }
                minLength={key === "password" ? 8 : undefined}
                placeholder={key === "password" ? "Mínimo 8 caracteres" : label}
              />
            </div>
          ))}
        </div>
        <button disabled={busy} className="btn btn-primary auth-submit mt-4">
          {busy ? "Creando cuenta…" : "Crear mi cuenta"} →
        </button>
      </form>
      <p className="auth-register">
        ¿Ya tienes cuenta? <Link to="/login">Iniciar sesión</Link>
      </p>
    </AuthLayout>
  );
}
