export default function Footer() {
  return (
    <footer className="footer bg-dark text-white pt-5 pb-3">
      <div className="container">
        <div className="row">
          <div className="col-md-3 mb-4 text-center text-md-start">
            <div className="social-icons mb-3">
              <a href="#" target="_blank" rel="noreferrer">
                <img src="/Imagenes/INICIO/facebook.png" alt="Facebook" />
              </a>
              <a href="#" target="_blank" rel="noreferrer">
                <img src="/Imagenes/INICIO/instagram.png" alt="Instagram" />
              </a>
              <a href="#" target="_blank" rel="noreferrer">
                <img src="/Imagenes/INICIO/whatsapp.png" alt="WhatsApp" />
              </a>
              <a href="#" target="_blank" rel="noreferrer">
                <img src="/Imagenes/INICIO/youtube.png" alt="YouTube" />
              </a>
              <a href="#" target="_blank" rel="noreferrer">
                <img src="/Imagenes/INICIO/twitch.png" alt="Twitch" />
              </a>
              <a href="#" target="_blank" rel="noreferrer">
                <img src="/Imagenes/INICIO/tiktok.png" alt="TikTok" />
              </a>
            </div>
          </div>

          <div className="col-md-3 mb-4">
            <h6 className="fw-bold text-uppercase">Envíos y Garantías</h6>
            <ul className="list-unstyled">
              <li>
                <a href="#" className="text-white text-decoration-none">
                  Envíos Lima o Provincia
                </a>
              </li>
              <li>
                <a href="#" className="text-white text-decoration-none">
                  Términos y Garantía
                </a>
              </li>
            </ul>
            <img
              src="/Imagenes/INICIO/libro-reclamaciones.png"
              alt="Libro de Reclamaciones"
              width="120"
            />
          </div>

          <div className="col-md-3 mb-4">
            <h6 className="fw-bold text-uppercase">Nosotros</h6>
            <ul className="list-unstyled">
              <li>
                <a href="#" className="text-white text-decoration-none">
                  Quiénes Somos
                </a>
              </li>
              <li>
                <a href="#" className="text-white text-decoration-none">
                  Nuestra Tienda
                </a>
              </li>
              <li>
                <a href="#" className="text-white text-decoration-none">
                  Formulario de Contacto
                </a>
              </li>
            </ul>
          </div>

          <div className="col-md-3 mb-4">
            <h6 className="fw-bold text-uppercase">Contactos</h6>
            <p className="mb-1">
              Nro: <strong>974 578 820</strong>
            </p>
            <p>Para ventas o publicidad, escríbenos:</p>
            <p className="mb-0">
              <strong>contacto@techzone.pe</strong>
            </p>
          </div>
        </div>

        <hr className="border-secondary" />

        <div className="text-center small">
          © Copyright 2025 <strong>TECHZONE</strong>. Todos los derechos
          reservados.
        </div>
      </div>
    </footer>
  );
}
