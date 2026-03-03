import { useEffect, useState } from "react";
import axios from "axios";
import Modal from "./Modal";
import "./VentasList.css";

function VentasList() {

    const hoy = new Date();

    const [ventas, setVentas] = useState([]);
    const [clientes, setClientes] = useState([]);

    const [mes, setMes] = useState(hoy.getMonth() + 1);
    const [año, setAño] = useState(hoy.getFullYear());

    const [modalOpen, setModalOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [selectedVenta, setSelectedVenta] = useState(null);

    const [descripcion, setDescripcion] = useState("");
    const [total, setTotal] = useState("");
    const [tipoPago, setTipoPago] = useState("contado");
    const [clienteId, setClienteId] = useState("");

    const cargarVentas = () => {
        axios.get(`http://localhost:8000/ventas?mes=${mes}&año=${año}`)
        .then(res => setVentas(res.data))
        .catch(err => console.error(err));
    };

    const cargarClientes = () => {
        axios.get("http://localhost:8000/clientes")
        .then(res => setClientes(res.data))
        .catch(err => console.error(err));
    };

    useEffect(() => {
        cargarVentas();
        cargarClientes();
    }, [mes, año]);

    const formatearFecha = (fechaISO) => {
        const fecha = new Date(fechaISO);
        return fecha.toLocaleDateString("es-CO", {
        year: "numeric",
        month: "long",
        day: "numeric"
        });
    };

    const abrirEditar = (venta) => {
        setSelectedVenta(venta);
        setDescripcion(venta.descripcion);
        setTotal(venta.total);
        setTipoPago(venta.tipo_pago);
        setClienteId(venta.cliente_id);
        setEditMode(true);
        setModalOpen(true);
    };

    const abrirEliminar = (venta) => {
        setSelectedVenta(venta);
        setEditMode(false);
        setModalOpen(true);
    };

    const actualizarVenta = async () => {
        try {
            console.log("Datos enviados al backend:");
            console.log({
            descripcion,
            total,
            tipo_pago: tipoPago,
            cliente_id: clienteId
            });

            await axios.put(
            `http://localhost:8000/ventas/${selectedVenta.id}`,
            {
                descripcion: descripcion.trim(),
                total: parseFloat(total),
                tipo_pago: tipoPago,
                cliente_id: Number(clienteId)
            }
            );

            cerrarModal();
            cargarVentas();

        } catch (error) {
            console.log("ERROR BACKEND:");
            console.log(error.response?.data);
        }
    };

    const eliminarVenta = async () => {
        await axios.delete(
        `http://localhost:8000/ventas/${selectedVenta.id}`
        );

        cerrarModal();
        cargarVentas();
    };

    const cerrarModal = () => {
        setModalOpen(false);
        setEditMode(false);
        setSelectedVenta(null);
    };

    return (
        <div className="ventas-container">

        <div className="ventas-title">
            Ventas Registradas
        </div>

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

        {ventas.length === 0 && (
            <div>No hay ventas en este mes</div>
        )}

        {ventas.map(venta => (
            <div key={venta.id} className="venta-card">

            <div className="venta-top">
                <span className="venta-cliente">
                    {venta.cliente_nombre}
                </span>
                
                

                <span className="venta-total">
                $ {venta.total}
                </span>
            </div>

            <div className="venta-descripcion">
                {venta.descripcion}
            </div>

            <div className="venta-extra">
                <span>{venta.tipo_pago}</span>
                <span>{formatearFecha(venta.fecha)}</span>
            </div>

            <div className="venta-buttons">
                <button
                className="btn-edit"
                onClick={() => abrirEditar(venta)}
                >
                Editar
                </button>

                <button
                className="btn-delete"
                onClick={() => abrirEliminar(venta)}
                >
                Eliminar
                </button>
            </div>

            </div>
        ))}

        <Modal
            isOpen={modalOpen}
            title={editMode ? "Editar venta" : "Eliminar venta"}
            onConfirm={editMode ? actualizarVenta : eliminarVenta}
            onCancel={cerrarModal}
        >
            {editMode ? (
            <div className="modal-form">
                <input
                type="text"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Descripción"
                />

                <input
                type="number"
                value={total}
                onChange={(e) => setTotal(e.target.value)}
                placeholder="Total"
                />

                <select
                value={tipoPago}
                onChange={(e) => setTipoPago(e.target.value)}
                >
                <option value="contado">Contado</option>
                <option value="credito">Crédito</option>
                </select>

                <select
                    value={String(clienteId)}
                    onChange={(e) => setClienteId(e.target.value)}
                >
                {clientes.map(c => (
                    <option key={c.id} value={c.id}>
                    {c.nombre}
                    </option>
                ))}
                </select>
            </div>
            ) : (
            <p>¿Seguro que deseas eliminar esta venta?</p>
            )}
        </Modal>

        </div>
    );
}

export default VentasList;