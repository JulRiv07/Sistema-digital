import { useEffect, useState } from "react";
import axios from "axios";
import Modal from "./Modal";
import { fmtCurrency } from "../services/format";
import "./Inventario.css";

function Inventario() {
  const [productos, setProductos] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [mensaje, setMensaje] = useState("");

  const [editId, setEditId] = useState(null);
  const [nombre, setNombre] = useState("");
  const [precio, setPrecio] = useState("");
  const [controlaStock, setControlaStock] = useState(false);
  const [stock, setStock] = useState("");

  const [modalEliminar, setModalEliminar] = useState(null);

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

  const limpiar = () => {
    setEditId(null);
    setNombre("");
    setPrecio("");
    setControlaStock(false);
    setStock("");
  };

  const guardar = async (e) => {
    e.preventDefault();
    if (!nombre || precio === "") {
      aviso("Completa nombre y precio");
      return;
    }
    const payload = {
      nombre,
      precio: Number(precio),
      controla_stock: controlaStock,
      stock: controlaStock ? Number(stock || 0) : null,
    };
    try {
      if (editId) await axios.put(`/productos/${editId}`, payload);
      else await axios.post("/productos", payload);
      limpiar();
      cargar();
      aviso(editId ? "Producto actualizado ✅" : "Producto creado ✅");
    } catch (err) {
      aviso(err.response?.data?.detail || "No se pudo guardar");
    }
  };

  const editar = (p) => {
    setEditId(p.id);
    setNombre(p.nombre);
    setPrecio(p.precio);
    setControlaStock(p.controla_stock);
    setStock(p.stock ?? "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const eliminar = async () => {
    try {
      await axios.delete(`/productos/${modalEliminar.id}`);
      setModalEliminar(null);
      cargar();
      aviso("Producto eliminado");
    } catch (err) {
      setModalEliminar(null);
      aviso(err.response?.data?.detail || "No se pudo eliminar");
    }
  };

  const filtrados = productos.filter((p) => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return true;
    return p.nombre.toLowerCase().includes(q) || p.codigo.toLowerCase().includes(q);
  });

  return (
    <div className="inv-panel">
      <h2 className="inv-title">Inventario</h2>
      {mensaje && <div className="inv-aviso">{mensaje}</div>}

      <section className="inv-card">
        <h3>{editId ? "Editar producto" : "Nuevo producto"}</h3>
        <form className="form-container" onSubmit={guardar}>
          {!editId && (
            <p className="inv-vacio">El código del producto se genera automáticamente.</p>
          )}

          <label>Nombre</label>
          <input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej: Gelatina" />

          <label>Precio</label>
          <input
            type="number"
            value={precio}
            onChange={(e) => setPrecio(e.target.value)}
            placeholder="Ej: 2000"
          />

          <label className="inv-check">
            <input
              type="checkbox"
              checked={controlaStock}
              onChange={(e) => setControlaStock(e.target.checked)}
            />
            Controlar stock de este producto
          </label>

          {controlaStock && (
            <>
              <label>Stock disponible</label>
              <input
                type="number"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                placeholder="Ej: 50"
              />
            </>
          )}

          <button type="submit">{editId ? "Guardar cambios" : "Agregar producto"}</button>
          {editId && (
            <button type="button" className="inv-cancelar" onClick={limpiar}>
              Cancelar edición
            </button>
          )}
        </form>
      </section>

      <section className="inv-card">
        <h3>Productos ({productos.length})</h3>
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
            <div className="inv-item-acciones">
              <button className="inv-btn-edit" onClick={() => editar(p)}>
                Editar
              </button>
              <button className="inv-btn-del" onClick={() => setModalEliminar(p)}>
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </section>

      <Modal
        isOpen={!!modalEliminar}
        title="Eliminar producto"
        onConfirm={eliminar}
        onCancel={() => setModalEliminar(null)}
      >
        <p>¿Eliminar "{modalEliminar?.nombre}"?</p>
      </Modal>
    </div>
  );
}

export default Inventario;
