import { useState } from "react";
import axios from "axios";
import Toast from "./Toast";
import "./ClienteForm.css";

function ClienteForm({ onClienteCreado }) {

    const [nombre, setNombre] = useState("");
    const [telefono, setTelefono] = useState("");
    const [toast, setToast] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!nombre) {
        setToast({ message: "El nombre es obligatorio", type: "error" });
        setTimeout(() => setToast(null), 3000);
        return;
        }

        try {
        await axios.post("https://postres-juli.onrender.com/clientes", {
            nombre,
            telefono
        });

        setToast({ message: "Cliente creado correctamente 🎉", type: "success" });
        setTimeout(() => setToast(null), 3000);

        setNombre("");
        setTelefono("");

        if (onClienteCreado) {
            onClienteCreado();
        }

        } catch (error) {
        setToast({ message: "Error al crear cliente", type: "error" });
        setTimeout(() => setToast(null), 3000);
        }
    };

    return (
        <div className="cliente-form-container">

            <div className="cliente-form-title">
            Crear Cliente
            </div>

            <form className="form-container" onSubmit={handleSubmit}>

            <label>Nombre</label>
            <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej: Tienda Batallón"
            />

            <label>Teléfono</label>
            <input
                type="text"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                placeholder="Opcional"
            />

            <button type="submit">
                Guardar Cliente
            </button>

            {toast && <Toast message={toast.message} type={toast.type} />}

            </form>

        </div>
        );
}

export default ClienteForm;