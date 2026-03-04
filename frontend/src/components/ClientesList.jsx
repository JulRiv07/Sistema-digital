import { useEffect, useState } from "react";
import "./ClientesList.css";
import axios from "axios";
import Modal from "./Modal";

function ClientesList() {

    const [clientes, setClientes] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedCliente, setSelectedCliente] = useState(null);

    const cargarClientes = () => {
        axios.get("https://postres-juli.onrender.com/clientes")
        .then(res => setClientes(res.data))
        .catch(err => console.error(err));
    };

    useEffect(() => {
        cargarClientes();
    }, []);

    const abrirEliminar = (cliente) => {
        setSelectedCliente(cliente);
        setModalOpen(true);
    };

    const eliminarCliente = async () => {

        try {

            await axios.delete(
                `https://postres-juli.onrender.com/clientes/${selectedCliente.id}`
            );

            cerrarModal();
            cargarClientes();

        } catch (error) {

            console.error(error);

            alert("No se puede eliminar el cliente porque tiene ventas o pagos");

        }

    };

    const cerrarModal = () => {
        setModalOpen(false);
        setSelectedCliente(null);
    };

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

                    <div className="cliente-info">
                        <div className="cliente-nombre">
                            {cliente.nombre}
                        </div>

                        <div className="cliente-telefono">
                            {cliente.telefono || "Sin teléfono"}
                        </div>
                    </div>

                    <button
                        className="btn-delete"
                        onClick={() => abrirEliminar(cliente)}
                    >
                        Eliminar
                    </button>

                </div>
            ))}

            <Modal
                isOpen={modalOpen}
                title="Eliminar cliente"
                onConfirm={eliminarCliente}
                onCancel={cerrarModal}
            >
                <p>
                    ¿Seguro que deseas eliminar a "{selectedCliente?.nombre}"?
                </p>
            </Modal>

        </div>
    );
}

export default ClientesList;