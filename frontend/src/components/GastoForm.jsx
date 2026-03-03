import { useState } from "react";
import axios from "axios";

function GastoForm({ onGastoCreado }) {

    const [descripcion, setDescripcion] = useState("");
    const [monto, setMonto] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!descripcion || !monto) {
        alert("Completa todos los campos");
        return;
        }

        try {
        await axios.post("http://localhost:8000/gastos", {
            descripcion: descripcion,
            monto: Number(monto)
        });

        alert("Gasto registrado correctamente");

        setDescripcion("");
        setMonto("");

        if (onGastoCreado) {
            onGastoCreado();
        }

        } catch (error) {
        console.error(error);
        alert("Error al registrar gasto");
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

        </form>
    );
}

export default GastoForm;