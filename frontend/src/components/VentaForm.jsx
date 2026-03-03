import { useEffect, useState } from "react";
import axios from "axios";


function VentaForm({ onVentaCreada }) {

    const [clientes, setClientes] = useState([]);
    const [clienteId, setClienteId] = useState("");
    const [tipoPago, setTipoPago] = useState("contado");
    const [descripcion, setDescripcion] = useState("");
    const [total, setTotal] = useState("");

    // Cargar clientes al abrir formulario
    useEffect(() => {
        axios.get("http://127.0.0.1:8000/clientes")
        .then(res => setClientes(res.data))
        .catch(err => console.error("Error cargando clientes", err));
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!clienteId || !descripcion || !total) {
        alert("Completa todos los campos");
        return;
        }

        try {
        await axios.post("http://127.0.0.1:8000/ventas", {
            cliente_id: Number(clienteId),
            tipo_pago: tipoPago,
            descripcion: descripcion,
            total: Number(total)
        });

        alert("Venta registrada correctamente");

        // limpiar campos
        setDescripcion("");
        setTotal("");
        setClienteId("");

        // actualizar resumen
        if (onVentaCreada) {
            onVentaCreada();
        }

        } catch (error) {
        console.error("Error creando venta", error);
        alert("Error al registrar venta");
        }
    };

    return (
        <form className="form-container" onSubmit={handleSubmit}>

        <label>Cliente</label>
        <select value={clienteId} onChange={(e) => setClienteId(e.target.value)}>
            <option value="">Seleccionar cliente</option>
            {clientes.map(cliente => (
            <option key={cliente.id} value={cliente.id}>
                {cliente.nombre}
            </option>
            ))}
        </select>

        <label>Tipo de pago</label>
        <select value={tipoPago} onChange={(e) => setTipoPago(e.target.value)}>
            <option value="contado">Contado</option>
            <option value="credito">Crédito</option>
        </select>

        <label>Descripción</label>
        <input
            type="text"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            placeholder="Ej: 30 gelatinas"
        />

        <label>Total</label>
        <input
            type="number"
            value={total}
            onChange={(e) => setTotal(e.target.value)}
            placeholder="Ej: 50000"
        />

        <button type="submit">Guardar Venta</button>

        </form>
    );
}

export default VentaForm;