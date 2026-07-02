import { useState } from "react";
import axios from "axios";
import Toast from "./Toast";

function GastoForm({ onGastoCreado }) {

    const [descripcion, setDescripcion] = useState("");
    const [monto, setMonto] = useState("");
    const [toast, setToast] = useState(null);

    const aviso = (m, t = "error") => {
        setToast({ message: m, type: t });
        setTimeout(() => setToast(null), 3000);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!descripcion || !monto) {
        aviso("Completa todos los campos");
        return;
        }

        try {
        await axios.post("/gastos", {
            descripcion: descripcion,
            monto: Number(monto)
        });

        aviso("Gasto registrado correctamente 🎉", "success");

        setDescripcion("");
        setMonto("");

        if (onGastoCreado) {
            onGastoCreado();
        }

        } catch (error) {
        console.error(error);
        aviso(error.response?.data?.detail || "Error al registrar gasto");
        }
    };

    return (
        <form className="form-container" onSubmit={handleSubmit}>

        <label>Descripción del gasto</label>
        <input
            type="text"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            placeholder="Ej: Compra de ingredientes"
        />

        <label>Monto</label>
        <input
            type="number"
            value={monto}
            onChange={(e) => setMonto(e.target.value)}
            placeholder="Ej: 30000"
        />

        <button type="submit">Registrar Gasto</button>

        {toast && <Toast message={toast.message} type={toast.type} />}

        </form>
    );
}

export default GastoForm;
