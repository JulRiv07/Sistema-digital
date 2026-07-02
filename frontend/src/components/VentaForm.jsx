import { useEffect, useState } from "react";
import axios from "axios";
import Toast from "./Toast";
import { fmtCurrency } from "../services/format";
import "./VentaForm.css";

function VentaForm() {
  const [clientes, setClientes] = useState([]);
  const [productos, setProductos] = useState([]);
  const [clienteId, setClienteId] = useState("");
  const [tipoPago, setTipoPago] = useState("contado");
  const [lineas, setLineas] = useState([]); // { producto, cantidad }
  const [busqueda, setBusqueda] = useState("");
  const [toast, setToast] = useState(null);

  useEffect(() => {
    axios.get("/clientes").then((r) => setClientes(r.data)).catch(() => {});
    axios.get("/productos").then((r) => setProductos(r.data)).catch(() => {});
  }, []);

  const aviso = (m, t = "error") => {
    setToast({ message: m, type: t });
    setTimeout(() => setToast(null), 3000);
  };

  const agregarProducto = (prod) => {
    setLineas((prev) => {
      const existe = prev.find((l) => l.producto.id === prod.id);
      if (existe) {
        return prev.map((l) =>
          l.producto.id === prod.id ? { ...l, cantidad: l.cantidad + 1 } : l
        );
      }
      return [...prev, { producto: prod, cantidad: 1 }];
    });
    setBusqueda("");
  };

  const cambiarCantidad = (id, cant) => {
    // Permite dejar el campo vacío mientras se escribe; se normaliza al salir
    setLineas((prev) =>
      prev.map((l) =>
        l.producto.id === id
          ? { ...l, cantidad: cant === "" ? "" : Math.max(1, Number(cant) || 1) }
          : l
      )
    );
  };

  const normalizarCantidad = (id) => {
    setLineas((prev) =>
      prev.map((l) =>
        l.producto.id === id && (l.cantidad === "" || Number(l.cantidad) < 1)
          ? { ...l, cantidad: 1 }
          : l
      )
    );
  };

  const quitarLinea = (id) =>
    setLineas((prev) => prev.filter((l) => l.producto.id !== id));

  const total = lineas.reduce(
    (s, l) => s + l.producto.precio * (Number(l.cantidad) || 0),
    0
  );

  const coincidencias = busqueda.trim()
    ? productos
        .filter((p) => {
          const q = busqueda.toLowerCase();
          return (
            p.nombre.toLowerCase().includes(q) || p.codigo.toLowerCase().includes(q)
          );
        })
        .slice(0, 6)
    : [];

  const registrar = async (e) => {
    e.preventDefault();
    if (!clienteId) {
      aviso("Selecciona un cliente");
      return;
    }
    if (lineas.length === 0) {
      aviso("Agrega al menos un producto");
      return;
    }
    try {
      await axios.post("/ventas", {
        cliente_id: Number(clienteId),
        tipo_pago: tipoPago,
        items: lineas.map((l) => ({
          producto_id: l.producto.id,
          cantidad: Math.max(1, Number(l.cantidad) || 1),
        })),
      });
      aviso("Venta registrada correctamente 🎉", "success");
      setLineas([]);
      setClienteId("");
      setTipoPago("contado");
    } catch (err) {
      aviso(err.response?.data?.detail || "Error al registrar la venta");
    }
  };

  return (
    <form className="form-container" onSubmit={registrar}>
      <h3>Registrar venta</h3>

      <label>Cliente</label>
      <select value={clienteId} onChange={(e) => setClienteId(e.target.value)}>
        <option value="">Seleccionar cliente</option>
        {clientes.map((c) => (
          <option key={c.id} value={c.id}>
            {c.nombre}
          </option>
        ))}
      </select>

      <label>Tipo de pago</label>
      <select value={tipoPago} onChange={(e) => setTipoPago(e.target.value)}>
        <option value="contado">Contado</option>
        <option value="credito">Crédito</option>
      </select>

      <label>Buscar producto (código o nombre)</label>
      <input
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        placeholder="Ej: P001 o Gelatina"
      />

      {coincidencias.length > 0 && (
        <div className="venta-buscador">
          {coincidencias.map((p) => (
            <button
              type="button"
              key={p.id}
              className="venta-opcion"
              onClick={() => agregarProducto(p)}
            >
              <span>
                {p.nombre} <small>({p.codigo})</small>
                {p.controla_stock ? <small> · stock: {p.stock ?? 0}</small> : null}
              </span>
              <span>{fmtCurrency(p.precio)}</span>
            </button>
          ))}
        </div>
      )}

      {lineas.length > 0 && (
        <div className="venta-items">
          {lineas.map((l) => (
            <div key={l.producto.id} className="venta-item-linea">
              <span className="venta-item-nom">{l.producto.nombre}</span>
              <input
                className="venta-item-cant"
                type="number"
                min="1"
                value={l.cantidad}
                onChange={(e) => cambiarCantidad(l.producto.id, e.target.value)}
                onBlur={() => normalizarCantidad(l.producto.id)}
              />
              <span className="venta-item-sub">
                {fmtCurrency(l.producto.precio * l.cantidad)}
              </span>
              <button
                type="button"
                className="venta-item-quitar"
                onClick={() => quitarLinea(l.producto.id)}
                aria-label="Quitar"
              >
                ✕
              </button>
            </div>
          ))}
          <div className="venta-total-linea">Total: {fmtCurrency(total)}</div>
        </div>
      )}

      <button type="submit">Registrar venta</button>

      {toast && <Toast message={toast.message} type={toast.type} />}
    </form>
  );
}

export default VentaForm;
