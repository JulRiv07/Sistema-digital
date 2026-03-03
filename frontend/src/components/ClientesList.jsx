import { useEffect, useState } from "react";
import "./ClientesList.css"
import axios from "axios";

function ClientesList() {

    const [clientes, setClientes] = useState([]);

    useEffect(() => {
        axios.get("http://localhost:8000/clientes")
        .then(res => setClientes(res.data))
        .catch(err => console.error(err));
    }, []);

    if (clientes.length === 0) {
        return <h4>No hay clientes registrados</h4>;
    }

    return (
        <div className="clientes-container">
            <div className="clientes-title">
            Clientes registrados
            </div>

            {clientes.map(cliente => (
            <div key={cliente.id} className="cliente-card">
                <div className="cliente-nombre">
                {cliente.nombre}
                </div>

                <div className="cliente-telefono">
                {cliente.telefono || "Sin teléfono"}
                </div>
            </div>
            ))}
        </div>
    );
}

export default ClientesList;