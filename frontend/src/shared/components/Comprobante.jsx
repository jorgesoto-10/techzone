import { useEffect, useState } from "react";
import api, { mensajeError } from "../api/http";

export default function Comprobante({
  id,
  admin = false,
  version = "",
}) {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let activo = true;
    let objectUrl;

    setUrl("");
    setError("");

    api
      .get(
        `${admin ? "/admin" : ""}/ventas/${id}/comprobante`,
        { responseType: "blob" },
      )
      .then(({ data }) => {
        if (activo) {
          objectUrl = URL.createObjectURL(data);
          setUrl(objectUrl);
        }
      })
      .catch((e) => {
        if (activo) {
          setError(mensajeError(e));
        }
      });

    return () => {
      activo = false;

      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [id, admin, version]);

  if (error) {
    return (
      <p role="alert" className="text-danger">
        {error}
      </p>
    );
  }

  if (!url) {
    return <p>Cargando comprobante…</p>;
  }

  return (
    <a href={url} target="_blank" rel="noreferrer">
      <img
        src={url}
        alt="Comprobante enviado por el cliente"
        style={{
          maxWidth: "100%",
          maxHeight: 320,
          objectFit: "contain",
        }}
      />
    </a>
  );
}