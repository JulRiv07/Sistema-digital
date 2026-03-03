import { useEffect, useState } from "react";
import axios from "axios";
import "./VentasList.css";

function VentasList() {

    const hoy = new Date();

    const [ventas, setVentas] = useState([]);
    const [mes, setMes] = useState(hoy.getMonth() + 1);
    const [año, setAño] = useState(hoy.getFullYear());

    const cargarVentas = () => {
        axios.get(`http://localhost:8000/ventas?mes=${mes}&año=${año}`)
        .then(res => setVentas(res.data))
        .catch(err => console.error(err));
    };

    useEffect(() => {
        cargarVentas();
    }, [mes, año]);

    const formatearFecha = (fechaISO) => {
        const fecha = new Date(fechaISO);
        return fecha.toLocaleDateString("es-CO", {
        year: "numeric",
        month: "long",
        day: "numeric"
        });
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
                {new Date(0, i).toLocaleString('es-CO', { month: 'long' })}
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
            <div>No hay ventas registradas en este mes</div>
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

            </div>
        ))}

        </div>
    );
}

export default VentasList;