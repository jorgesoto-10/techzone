import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { catalogService } from "../services/catalogService";
import ProductoCard from "../components/ProductoCard.jsx";

const FAQS = [
  {
    color: "#0066ff",
    icono: "icono-envio.png",
    titulo: "Envíos a Provincias del Perú",
    texto:
      "Envíos diarios a provincia vía Courier, Shalom u Olva, llegan a todo el Perú. Si tienes una agencia de tu preferencia, la indicas.",
  },
  {
    color: "#6f42c1",
    icono: "icono-delivery.png",
    titulo: "Delivery TECHZONE Lima",
    texto:
      "Puedes programar la hora que quieres recibir tu pedido. Entregamos en menos de 24h a todo Lima Metropolitana.",
  },
  {
    color: "#00b66d",
    icono: "icono-garantia.png",
    titulo: "Atención Garantías",
    texto:
      "12 Meses de garantía por falla de fábrica. Contacta con tu asesor de ventas para tramitar garantía.",
  },
  {
    color: "#ff4d4d",
    icono: "icono-tienda.png",
    titulo: "Nuestra Tienda",
    texto:
      "Contamos con un amplio showroom con productos de alta calidad. ¡Ven y conócenos!",
  },
  {
    color: "#ff9933",
    icono: "icono-horario.png",
    titulo: "Horario de Atención",
    texto:
      "Lunes a Viernes de 9:00 a 18:00 horas. Sábados de 9:00 a 14:00 horas.",
  },
  {
    color: "#00bfff",
    icono: "icono-pago.png",
    titulo: "Medios de Pago",
    texto:
      "Aceptamos pagos con tarjetas, transferencias bancarias y billeteras digitales como Yape o Plin.",
  },
];

export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoriaActiva = searchParams.get("categoria")
    ? Number(searchParams.get("categoria"))
    : null;

  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    catalogService
      .categorias()
      .then((res) => setCategorias(res.data))
      .catch(() =>
        setError(
          "No se pudieron cargar las categorías. Revisa que Spring Boot esté iniciado.",
        ),
      );
  }, []);

  useEffect(() => {
    setCargando(true);
    const params = {};
    if (categoriaActiva) params.categoria = categoriaActiva;
    if (busqueda.trim()) params.search = busqueda.trim();

    const delay = setTimeout(() => {
      catalogService
        .productos(params)
        .then((res) => {
          setProductos(res.data);
          setError("");
        })
        .catch(() =>
          setError("No se pudo conectar con el catálogo. Revisa el backend."),
        )
        .finally(() => setCargando(false));
    }, 300);

    return () => clearTimeout(delay);
  }, [categoriaActiva, busqueda]);

  function elegirCategoria(id) {
    if (id === null) setSearchParams({});
    else setSearchParams({ categoria: String(id) });
  }

  const esHomeSinFiltro = !categoriaActiva && !busqueda.trim();

  return (
    <>
      {/* Carrusel: solo en la vista principal, sin filtros activos */}
      {esHomeSinFiltro && (
        <div
          id="carouselTechzone"
          className="carousel slide mt-3"
          data-bs-ride="carousel"
        >
          <div className="carousel-inner">
            <div className="carousel-item active">
              <img
                src="/Imagenes/INICIO/imagen1.1.png"
                className="d-block w-100"
                alt="Promo 1"
              />
            </div>
            <div className="carousel-item">
              <img
                src="/Imagenes/INICIO/imagen2.png"
                className="d-block w-100"
                alt="Promo 2"
              />
            </div>
          </div>
          <button
            className="carousel-control-prev"
            type="button"
            data-bs-target="#carouselTechzone"
            data-bs-slide="prev"
          >
            <span className="carousel-control-prev-icon"></span>
          </button>
          <button
            className="carousel-control-next"
            type="button"
            data-bs-target="#carouselTechzone"
            data-bs-slide="next"
          >
            <span className="carousel-control-next-icon"></span>
          </button>
        </div>
      )}

      <section className="container my-5">
        {error && (
          <div role="alert" className="alert alert-danger">
            {error}
          </div>
        )}
        <div className="row mb-4 align-items-end">
          <div className="col-md-8">
            <h2 className="fw-bold mb-3">
              {esHomeSinFiltro ? "Nuevos Ingresos" : "Catálogo"}
            </h2>
            <div className="d-flex flex-wrap gap-2">
              <button
                className={
                  "btn btn-sm " +
                  (categoriaActiva === null
                    ? "btn-primary"
                    : "btn-outline-primary")
                }
                onClick={() => elegirCategoria(null)}
              >
                Todas
              </button>
              {categorias.map((c) => (
                <button
                  key={c.idCategoria}
                  className={
                    "btn btn-sm " +
                    (categoriaActiva === c.idCategoria
                      ? "btn-primary"
                      : "btn-outline-primary")
                  }
                  onClick={() => elegirCategoria(c.idCategoria)}
                >
                  {c.nombreCategoria}
                </button>
              ))}
            </div>
          </div>
          <div className="col-md-4 mt-3 mt-md-0">
            <input
              type="text"
              className="form-control"
              placeholder="Buscar producto..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
        </div>

        {cargando ? (
          <p className="text-muted">Cargando productos...</p>
        ) : productos.length === 0 ? (
          <p className="text-muted">No se encontraron productos.</p>
        ) : (
          <div className="row justify-content-center">
            {(esHomeSinFiltro ? productos.slice(0, 12) : productos).map((p) => (
              <ProductoCard key={p.idProducto} producto={p} />
            ))}
          </div>
        )}
      </section>

      {esHomeSinFiltro && (
        <>
          {/* PERSONALIZA TU PC */}
          <section className="personaliza text-center text-dark my-5 mx-auto">
            <div className="contenido">
              <h2 className="fw-bold">Personaliza tu PC</h2>
              <p>
                Nuestros Asesores te ayudarán a elegir los componentes para tu
                PC
              </p>
              <a
                href="https://wa.me/51948274009"
                target="_blank"
                rel="noreferrer"
                className="btn btn-light fw-semibold px-4 py-2 d-inline-flex align-items-center gap-2"
              >
                <img
                  src="/Imagenes/INICIO/whastapp-blanco.png"
                  alt="WhatsApp"
                  width="22"
                />
                Chatear
              </a>
            </div>
          </section>

          {/* COMPUTADORAS PRE-CONFIGURADAS */}
          <section className="preconfiguradas text-center text-white py-5">
            <div className="container">
              <h2 className="fw-bold mb-2">Computadoras Pre-Configuradas</h2>
              <p className="mb-5">
                Son configuraciones para cada tipo de usuario, puedes hacer
                modificaciones de los componentes exclusivamente para ti.
              </p>

              <div className="row justify-content-center">
                <div className="col-md-4 col-sm-5 mb-4">
                  <div className="card-config">
                    <img
                      src="/Imagenes/INICIO/productividad.png"
                      alt="PC Productividad"
                    />
                    <div className="card-img-overlay">
                      <h5 className="fw-bold">Productividad</h5>
                      <p>
                        Computadoras para uso estudiantil, oficina, desarrollo
                        de software.
                      </p>
                      <button
                        className="btn btn-light btn-sm mt-2"
                        onClick={() => elegirCategoria(13)}
                      >
                        Comprar
                      </button>
                    </div>
                  </div>
                </div>

                <div className="col-md-4 col-sm-5 mb-4">
                  <div className="card-config">
                    <img src="/Imagenes/INICIO/gamer.png" alt="PC Gamer" />
                    <div className="card-img-overlay">
                      <h5 className="fw-bold">Gamer</h5>
                      <p>
                        Desde jugar por diversión con tus amigos hasta streaming
                        profesional.
                      </p>
                      <button
                        className="btn btn-light btn-sm mt-2"
                        onClick={() => elegirCategoria(13)}
                      >
                        Comprar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* PREGUNTAS FRECUENTES */}
          <section className="preguntas py-5">
            <div className="container text-center">
              <h2 className="fw-bold mb-4">Preguntas Frecuentes</h2>
              <p className="text-muted mb-5">
                Si tienes más consultas, puedes escribir a un asesor, te
                ayudarán.
              </p>

              <div className="row justify-content-center g-4">
                {FAQS.map((f) => (
                  <div className="col-md-4 col-sm-6" key={f.titulo}>
                    <div className="tarjeta">
                      <div
                        className="icono"
                        style={{ backgroundColor: f.color }}
                      >
                        <img
                          src={`/Imagenes/INICIO/${f.icono}`}
                          alt={f.titulo}
                        />
                      </div>
                      <h5>{f.titulo}</h5>
                      <p>{f.texto}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </>
      )}
    </>
  );
}
