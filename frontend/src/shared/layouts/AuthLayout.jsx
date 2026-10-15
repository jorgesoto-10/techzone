import { Link } from "react-router-dom";
export default function AuthLayout({ children }) {
  return (
    <main className="auth-shell">
      <section className="auth-visual" aria-label="Techzone">
        <img
          className="auth-company-image"
          src="/Imagenes/empresa-login.png"
          alt="Equipos de cómputo Techzone"
        />
        <div className="auth-shade" />
        <Link to="/" className="auth-brand">
          TECH<span>ZONE</span>
          <small>Tecnología a tu medida</small>
        </Link>
        <div className="auth-story">
          <span className="auth-kicker">TU PRÓXIMO NIVEL</span>
          <h1>
            Todo empieza
            <br />
            con un gran equipo.
          </h1>
          <p>
            Componentes, computadoras y tecnología
            <br />
            para lo que quieres lograr.
          </p>
          <div className="auth-dots">
            <i />
            <i />
            <i />
          </div>
        </div>
      </section>
      <section className="auth-content">
        <Link className="back-store" to="/">
          ← Volver a la tienda
        </Link>
        <div className="auth-form-wrap">{children}</div>
        <small className="auth-bottom">
          TECHZONE · Tu espacio de tecnología
        </small>
      </section>
    </main>
  );
}
