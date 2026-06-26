import { useEffect, useState } from "react";
import axios from "axios";
import { fmtCurrency } from "../services/format";
import "./Inventario.css";

function StockEditor({ producto, onSave }) {
  const [valor, setValor] = useState(producto.stock ?? 0);
  return (
    <div className="inv-stock-row">
      <input
        type="number"
        value={valor}
        onChange={(e) => setValor(e.target.value)}
      />
      <button onClick={() => onSave(producto, valor)}>Actualizar</button>
    </div>
  );
}

function ProductosView() {
  const [productos, setProductos] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [mensaje, setMensaje] = useState("");

  const cargar = () => {
    axios.get("/productos").then((r) => setProductos(r.data)).catch(() => {});
  };
  useEffect(() => {
    cargar();
  }, []);

  const aviso = (t) => {
    setMensaje(t);
    setTimeout(() => setMensaje(""), 3000);
  };

  const actualizarStock = async (p, valor) => {
    try {
      await axios.put(`/productos/${p.id}/stock`, { stock: Number(valor) });
      cargar();
      aviso("Stock actualizado ✅");
    } catch (err) {
      aviso(err.response?.data?.detail || "No se pudo actualizar");
    }
  };

  const filtrados = productos.filter((p) => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return true;
    return p.nombre.toLowerCase().includes(q) || p.codigo.toLowerCase().includes(q);
  });

  return (
    <div className="inv-panel">
      <h2 className="inv-title">Productos</h2>
      {mensaje && <div className="inv-aviso">{mensaje}</div>}

      <section className="inv-card">
        <input
          className="inv-buscar"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por nombre o código..."
        />
        {filtrados.length === 0 && <p className="inv-vacio">No hay productos.</p>}
        {filtrados.map((p) => (
          <div key={p.id} className="inv-item">
            <div className="inv-item-info">
              <span className="inv-item-nombre">{p.nombre}</span>
              <span className="inv-item-cod">Código: {p.codigo}</span>
            </div>
            <div className="inv-item-data">
              <span className="inv-item-precio">{fmtCurrency(p.precio)}</span>
              <span className="inv-item-stock">
                {p.controla_stock ? `Stock: ${p.stock ?? 0}` : "Sin control de stock"}
              </span>
            </div>
            {p.controla_stock && (
              <StockEditor producto={p} onSave={actualizarStock} />
            )}
          </div>
        ))}
      </section>
    </div>
  );
}

export default ProductosView;
