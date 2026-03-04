import { useEffect, useState } from "react";
import "./DeudaPanel.css";
import axios from "axios";

function DeudasPanel({ setSelectedCliente, setActiveSection }) {

    const [deudas, setDeudas] = useState([]);

    useEffect(() => {
        axios.get("https://postres-juli.onrender.com/deudas")
        .then(res => setDeudas(res.data))
        .catch(err => console.error(err));
    }, []);

    const handlePagar = (cliente) => {
        setSelectedCliente(cliente);
        setActiveSection("pago");
    };

    if (deudas.length === 0) {
        return <h3>No hay clientes con deuda :) </h3>;
    }

    return (
        <div className="form-container">
        <h3>Clientes con deuda</h3>

        {deudas.map(cliente => (
            <div
            key={cliente.id}
            className="deuda-card"
            >
            <div>
                <strong>{cliente.nombre}</strong>
                <p>Debe: $ {cliente.deuda}</p>
            </div>

            <button
                onClick={() => handlePagar(cliente)}
            >
                Registrar pago
            </button>
            </div>
        ))}
        </div>
    );
}

export default DeudasPanel;