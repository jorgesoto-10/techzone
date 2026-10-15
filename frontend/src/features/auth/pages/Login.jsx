import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AuthLayout from "../../../shared/layouts/AuthLayout";
import { mensajeError } from "../../../shared/api/http";
export default function Login() {
  const [correo, setCorreo] = useState(""),
    [password, setPassword] = useState(""),
    [visible, setVisible] = useState(false),
    [error, setError] = useState(""),
    [cargando, setCargando] = useState(false);
  const { loginCliente } = useAuth();
  const navigate = useNavigate();
  async function submit(e) {
    e.preventDefault();
    setError("");
    setCargando(true);
    try {
      const u = await loginCliente(correo, password);
      navigate(u.rol === "ADMIN" ? "/admin" : "/");
    } catch (e) {
      setError(mensajeError(e));
    } finally {
      setCargando(false);
    }
  }
  return (
    <AuthLayout>
      <span className="section-label">BIENVENIDO A TECHZONE</span>
      <h2>Qué bueno verte de nuevo.</h2>
      <p className="text-muted mb-4">Ingresa a tu cuenta para continuar.</p>
      {error && (
        <div role="alert" className="alert alert-danger">
          {error}
        </div>
      )}
      <form onSubmit={submit}>
        <label htmlFor="correo" className="form-label">
          Correo electrónico
        </label>
        <input
          id="correo"
          type="email"
          autoComplete="username"
          className="form-control mb-4"
          placeholder="nombre@correo.com"
          value={correo}
          onChange={(e) => setCorreo(e.target.value)}
          required
        />
        <label htmlFor="password" className="form-label">
          Contraseña
        </label>
        <div className="password-field mb-4">
          <input
            id="password"
            autoComplete="current-password"
            type={visible ? "text" : "password"}
            className="form-control"
            placeholder="Tu contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="button"
            onClick={() => setVisible(!visible)}
            aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
          >
            {visible ? "Ocultar" : "Ver"}
          </button>
        </div>
        <button className="btn btn-primary auth-submit" disabled={cargando}>
          {cargando ? "Ingresando…" : "Ingresar a mi cuenta"} <span>→</span>
        </button>
      </form>
      <p className="auth-register">
        ¿Aún no tienes cuenta? <Link to="/registro">Crear cuenta</Link>
      </p>
      <p className="small text-muted">
        Clientes y administradores ingresan desde este formulario.
      </p>
    </AuthLayout>
  );
}
