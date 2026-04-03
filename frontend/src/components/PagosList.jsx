import { useEffect, useState } from "react";
import axios from "axios";
import "./PagosList.css";
import Modal from "./Modal";

function PagosList() {

    const hoy = new Date();

    const [pagos, setPagos] = useState([]);
    const [mes, setMes] = useState(hoy.getMonth() + 1);
    const [año, setAño] = useState(hoy.getFullYear());

    const [modalOpen, setModalOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [selectedPago, setSelectedPago] = useState(null);
    const [monto, setMonto] = useState("");

    const cargarPagos = () => {
        axios.get(`https://postres-juli.onrender.com/pagos?mes=${mes}&año=${año}`)
        .then(res => setPagos(res.data))
        .catch(err => console.error(err));
    };

    useEffect(() => {
        cargarPagos();
    }, [mes, año]);

    const formatearFecha = (fechaISO) => {
        const fecha = new Date(fechaISO);
        return fecha.toLocaleDateString("es-CO", {
            year: "numeric",
            month: "long",
            day: "numeric"
        });
    };

    const eliminarPago = async () => {
        await axios.delete(`https://postres-juli.onrender.com/pagos/${selectedPago.id}`);
        cerrarModal();
        cargarPagos();
    };

    const actualizarPago = async () => {
        await axios.put(`https://postres-juli.onrender.com/pagos/${selectedPago.id}`, {
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
                <select value={mes} onChange={(e) => setMes(e.target.value)}>
                {Array.from({ length: 12 }, (_, i) => (
                    <option key={i+1} value={i+1}>
                    {new Date(0, i).toLocaleString("es-CO", { month: "long" })}
                    </option>
                ))}
                </select>

                <select value={año} onChange={(e) => setAño(e.target.value)}>
                {[2024, 2025, 2026].map(a => (
                    <option key={a} value={a}>{a}</option>
                ))}
                </select>
            </div>

            {pagos.length === 0 && (
                <div>No hay pagos registrados en este mes</div>
            )}

            {pagos.map(pago => (
                <div key={pago.id} className="pago-card">

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