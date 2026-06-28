import { useEffect, useState } from "react";
import axios from "axios";
import "./GastoList.css";
import Modal from "./Modal";
import { fmtCurrency } from "../services/format";

function GastosList() {

    const hoy = new Date();

    const [gastos, setGastos] = useState([]);
    const [mes, setMes] = useState(hoy.getMonth() + 1);
    const [año, setAño] = useState(hoy.getFullYear());

    const [modalOpen, setModalOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [selectedGasto, setSelectedGasto] = useState(null);

    const [descripcion, setDescripcion] = useState("");
    const [monto, setMonto] = useState("");

    const cargarGastos = () => {
        axios.get(`/gastos?mes=${mes}&año=${año}`)
        .then(res => setGastos(res.data))
        .catch(err => console.error(err));
    };

    useEffect(() => {
        cargarGastos();
    }, [mes, año]);

    const eliminarGasto = async () => {
        await axios.delete(`/gastos/${selectedGasto.id}`);
        cerrarModal();
        cargarGastos();
    };

    const actualizarGasto = async () => {
        await axios.put(`/gastos/${selectedGasto.id}`, {
        descripcion,
        monto: Number(monto)
        });
        cerrarModal();
        cargarGastos();
    };

    const abrirEditar = (gasto) => {
        setSelectedGasto(gasto);
        setDescripcion(gasto.descripcion);
        setMonto(gasto.monto);
        setEditMode(true);
        setModalOpen(true);
    };

    const abrirEliminar = (gasto) => {
        setSelectedGasto(gasto);
        setEditMode(false);
        setModalOpen(true);
    };

    const cerrarModal = () => {
        setModalOpen(false);
        setEditMode(false);
        setSelectedGasto(null);
    };

    const formatearFecha = (fechaISO) =>
        new Date(fechaISO).toLocaleDateString("es-CO");

    return (
        <div className="gastos-container">

        <div className="gastos-title">Gastos Registrados</div>

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

        {gastos.length === 0 && (
            <div>No hay gastos registrados en este mes</div>
        )}

        <div className="gastos-grid">
        {gastos.map(gasto => (
            <div key={gasto.id} className="gasto-card">

            <div className="gasto-top">
                <span>{gasto.descripcion}</span>
                <span className="gasto-monto">{fmtCurrency(gasto.monto)}</span>
            </div>

            <div className="gasto-fecha">
                {formatearFecha(gasto.fecha)}
            </div>

            <div className="acciones">
                <button className="btn-edit" onClick={() => abrirEditar(gasto)}>
                Editar
                </button>

                <button className="btn-delete" onClick={() => abrirEliminar(gasto)}>
                Eliminar
                </button>
            </div>

            </div>
        ))}
        </div>

        <Modal
            isOpen={modalOpen}
            title={editMode ? "Editar gasto" : "Eliminar gasto"}
            onConfirm={editMode ? actualizarGasto : eliminarGasto}
            onCancel={cerrarModal}
        >
            {editMode ? (
            <>
                <input
                type="text"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Descripción"
                />
                <br /><br />
                <input
                type="number"
                value={monto}
                onChange={(e) => setMonto(e.target.value)}
                placeholder="Monto"
                />
            </>
            ) : (
            <p>
                ¿Seguro que deseas eliminar "{selectedGasto?.descripcion}"?
            </p>
            )}
        </Modal>

        </div>
    );
}

export default GastosList;