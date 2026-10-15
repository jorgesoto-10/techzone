import { createContext, useContext, useEffect, useState } from "react";

const CarritoContext = createContext(null);

function leerCarritoGuardado() {
  const guardado = localStorage.getItem("tz_carrito");
  try {
    return guardado ? JSON.parse(guardado) : [];
  } catch {
    return [];
  }
}

export function CarritoProvider({ children }) {
  const [items, setItems] = useState(leerCarritoGuardado);

  useEffect(() => {
    localStorage.setItem("tz_carrito", JSON.stringify(items));
  }, [items]);

  function agregar(producto) {
    if (producto.stock < 1 || producto.activo === false) return;
    setItems((prev) => {
      const existente = prev.find((i) => i.idProducto === producto.idProducto);
      if (existente) {
        return prev.map((i) =>
          i.idProducto === producto.idProducto
            ? { ...i, cantidad: Math.min(i.stock, i.cantidad + 1) }
            : i,
        );
      }
      return [...prev, { ...producto, cantidad: 1 }];
    });
  }

  function quitar(idProducto) {
    setItems((prev) => prev.filter((i) => i.idProducto !== idProducto));
  }

  function actualizarCantidad(idProducto, cantidad) {
    if (!Number.isInteger(cantidad) || cantidad < 1) return;
    setItems((prev) =>
      prev.map((i) =>
        i.idProducto === idProducto
          ? { ...i, cantidad: Math.min(i.stock, cantidad) }
          : i,
      ),
    );
  }

  function vaciar() {
    setItems([]);
  }

  const total = items.reduce((acc, i) => acc + i.precio * i.cantidad, 0);
  const cantidadTotal = items.reduce((acc, i) => acc + i.cantidad, 0);

  return (
    <CarritoContext.Provider
      value={{
        items,
        agregar,
        quitar,
        actualizarCantidad,
        vaciar,
        total,
        cantidadTotal,
      }}
    >
      {children}
    </CarritoContext.Provider>
  );
}

export function useCarrito() {
  return useContext(CarritoContext);
}
