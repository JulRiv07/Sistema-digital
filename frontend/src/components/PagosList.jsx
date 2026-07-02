import { useEffect, useState } from "react";
import axios from "axios";
import "./PagosList.css";
import Modal from "./Modal";

function PagosList() {

    const hoy = new Date();

    const [pagos, setPagos] = useState([]);
    const [clientes, setClientes] = useState([]);
    const [mes, setMes] = useState(hoy.getMonth() + 1);
    const [anio, setAnio] = useState(hoy.getFullYear());
    const [filtroCliente, setFiltroCliente] = useState("");

    const [modalOpen, setModalOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [selectedPago, setSelectedPago] = useState(null);
    const [monto, setMonto] = useState("");

    const cargarPagos = () => {
        axios.get(`/pagos?mes=${mes}&anio=${anio}`)
        .then(res => setPagos(res.data))
        .catch(err => console.error(err));
    };

    useEffect(() => {
        axios.get("/clientes")
            .then(res => setClientes(res.data))
            .catch(err => console.error(err));
    }, []);

    useEffect(() => {
        cargarPagos();
    }, [mes, anio]);

    const pagosFiltrados = filtroCliente
        ? pagos.filter(p => String(p.cliente_id) === filtroCliente)
        : pagos;

    const formatearFecha = (fechaISO) => {
        const fecha = new Date(fechaISO);
        return fecha.toLocaleDateString("es-CO", {
            year: "numeric",
            month: "long",
            day: "numeric"
        });
    };

    const eliminarPago = async () => {
        await axios.delete(`/pagos/${selectedPago.id}`);
        cerrarModal();
        cargarPagos();
    };

    const actualizarPago = async () => {
        await axios.put(`/pagos/${selectedPago.id}`, {
            cliente_id: selectedPago.cliente_id,
            monto: Number(monto)
        });
        cerrarModal();
        cargarPagos();
    };

    const abrirEditar = (pago) => {
        setSelectedPago(pago);
        setMonto(pago.monto);
        setEditMode(true);
        setModalOpen(true);
    };

    const abrirEliminar = (pago) => {
        setSelectedPago(pago);
        setEditMode(false);
        setModalOpen(true);
    };

    const cerrarModal = () => {
        setModalOpen(false);
        setEditMode(false);
        setSelectedPago(null);
    };

    return (
        <div className="pagos-container">

            <div className="pagos-title">Pagos Registrados</div>

            <div className="filtros">
                <select value={mes} onChange={(e) => setMes(Number(e.target.value))}>
                {Array.from({ length: 12 }, (_, i) => (
                    <option key={i+1} value={i+1}>
                    {new Date(0, i).toLocaleString("es-CO", { month: "long" })}
                    </option>
                ))}
                </select>

                <select value={anio} onChange={(e) => setAnio(Number(e.target.value))}>
                {[2024, 2025, 2026].map(a => (
                    <option key={a} value={a}>{a}</option>
                ))}
                </select>

                <select value={filtroCliente} onChange={(e) => setFiltroCliente(e.target.value)}>
                    <option value="">Todos los clientes</option>
                    {clientes.map(c => (
                        <option key={c.id} value={String(c.id)}>{c.nombre}</option>
                    ))}
                </select>
            </div>

            {pagosFiltrados.length === 0 && (
                <div className="estado-vacio">No hay pagos registrados en este mes</div>
            )}

            <div className="pagos-grid">
            {pagosFiltrados.map((pago, index) => (
                <div key={pago.id} className="pago-card" style={{ animationDelay: `${index * 40}ms` }}>

                    <div className="pago-top">
                        <span>{pago.cliente_nombre}</span>
                        <span>$ {pago.monto}</span>
                    </div>

                    <div className="pago-fecha">
                        {formatearFecha(pago.fecha)}
                    </div>

                    <div className="acciones">
                        <button className="btn-edit" onClick={() => abrirEditar(pago)}>
                            Editar
                        </button>

                        <button className="btn-delete" onClick={() => abrirEliminar(pago)}>
                            Eliminar
                        </button>
                    </div>

                </div>
            ))}
            </div>

            <Modal
                isOpen={modalOpen}
                title={editMode ? "Editar pago" : "Eliminar pago"}
                onConfirm={editMode ? actualizarPago : eliminarPago}
                onCancel={cerrarModal}
            >
                {editMode ? (
                    <input
                        type="number"
                        value={monto}
                        onChange={(e) => setMonto(e.target.value)}
                        placeholder="Monto"
                        className="modal-input"
                    />
                ) : (
                    <p>¿Seguro que deseas eliminar este pago?</p>
                )}
            </Modal>

        </div>
    );
}

export default PagosList;