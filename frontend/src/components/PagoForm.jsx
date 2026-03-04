import { useEffect, useState } from "react";
import axios from "axios";
import Toast from "./Toast";

function PagoForm({ selectedCliente, onPagoCreado }) {

    const [toast, setToast] = useState(null);
    const [clientes, setClientes] = useState([]);
    const [clienteId, setClienteId] = useState("");
    const [monto, setMonto] = useState("");
    const [deuda, setDeuda] = useState(0);

    // 🔹 Cargar clientes al montar
    useEffect(() => {
        axios.get("https://postres-juli.onrender.com/clientes")
        .then(res => setClientes(res.data))
        .catch(err => console.error(err));
    }, []);

    useEffect(() => {
        if (selectedCliente) {
        setClienteId(selectedCliente.id);
        }
    }, [selectedCliente]);

    useEffect(() => {
        if (!clienteId) {
        setDeuda(0);
        return;
        }

        axios.get(`https://postres-juli.onrender.com/clientes/${clienteId}/deuda`)
        .then(res => setDeuda(res.data.deuda_actual))
        .catch(err => console.error(err));

    }, [clienteId]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!clienteId || !monto) {
        setToast({ message: "Completa todos los campos", type: "error" });
        setTimeout(() => setToast(null), 3000);
        return;
        }

        if (Number(monto) > deuda) {
        setToast({ message: "Error al registrar pago NO puede ser mayor a la deuda", type: "error" });
        setTimeout(() => setToast(null), 3000);
        return;
        }

        try {

        await axios.post("https://postres-juli.onrender.com/pagos", {
            cliente_id: Number(clienteId),
            monto: Number(monto)
        });

        setToast({ message: "Pago registrado correctamente 🎉", type: "success" });
        setTimeout(() => setToast(null), 3000);

        setMonto("");

        axios.get(`https://postres-juli.onrender.com/clientes/${clienteId}/deuda`)
            .then(res => setDeuda(res.data.deuda_actual));

        if (onPagoCreado) {
            onPagoCreado();
        }

        } catch (error) {
        console.error(error);
        setToast({ message: "Error al registrar pago", type: "error" });
        setTimeout(() => setToast(null), 3000);
        }
    };

    return (
    <form className="form-container" onSubmit={handleSubmit}>

        <h3>Registrar Pago</h3>

        <label>Cliente</label>
        <select
        value={clienteId}
        onChange={(e) => setClienteId(e.target.value)}
        >
        <option value="">Seleccionar cliente</option>
        {clientes.map(cliente => (
            <option key={cliente.id} value={cliente.id}>
            {cliente.nombre}
            </option>
        ))}
        </select>

        {clienteId && (
        <div style={{
            fontWeight: "bold",
            marginTop: "5px",
            color: deuda > 0 ? "#b00020" : "green"
        }}>
            Deuda actual: $ {deuda}
        </div>
        )}

        <label>Monto a pagar</label>
        <input
        type="number"
        value={monto}
        onChange={(e) => setMonto(e.target.value)}
        placeholder="Ej: 20000"
        />

        <button type="submit">
        Registrar Pago
        </button>

        {}
        {toast && <Toast message={toast.message} type={toast.type} />}

    </form>
    );
}

export default PagoForm;