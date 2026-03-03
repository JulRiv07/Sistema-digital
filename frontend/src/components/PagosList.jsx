import { useEffect, useState } from "react";
import axios from "axios";
import "./PagosList.css";
import Modal from "./Modal";

function PagosList() {

    const [pagos, setPagos] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [selectedPago, setSelectedPago] = useState(null);

    const [monto, setMonto] = useState("");

    const cargarPagos = () => {
        axios.get("http://localhost:8000/pagos")
        .then(res => setPagos(res.data))
        .catch(err => console.error(err));
    };

    useEffect(() => {
        cargarPagos();
    }, []);

    const eliminarPago = async () => {
        await axios.delete(`http://localhost:8000/pagos/${selectedPago.id}`);
        cerrarModal();
        cargarPagos();
    };

    const actualizarPago = async () => {
        await axios.put(`http://localhost:8000/pagos/${selectedPago.id}`, {
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

        {pagos.map(pago => (
            <div key={pago.id} className="pago-card">

            <div className="pago-top">
                <span>{pago.cliente_nombre}</span>
                <span>$ {pago.monto}</span>
            </div>

            <div style={{ marginTop: "8px" }}>
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
            <>
                <input
                type="number"
                value={monto}
                onChange={(e) => setMonto(e.target.value)}
                placeholder="Monto"
                />
            </>
            ) : (
            <p>
                ¿Seguro que deseas eliminar este pago?
            </p>
            )}
        </Modal>

        </div>
    );
}

export default PagosList;