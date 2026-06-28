import { useEffect, useState } from "react";
import axios from "axios";
import Toast from "./Toast";
import { fmtCurrency } from "../services/format";

function PagoForm({ selectedCliente, onPagoCreado }) {

    const [toast, setToast] = useState(null);
    const [clientes, setClientes] = useState([]);
    const [clienteId, setClienteId] = useState("");
    const [monto, setMonto] = useState("");
    const [deuda, setDeuda] = useState(0);
    const [ventasCredito, setVentasCredito] = useState([]);
    const [ventaId, setVentaId] = useState("");

    useEffect(() => {
        axios.get("/clientes")
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
            setVentasCredito([]);
            setVentaId("");
            setMonto("");
            return;
        }

        axios.get(`/clientes/${clienteId}/deuda`)
            .then(res => setDeuda(res.data.deuda_actual))
            .catch(err => console.error(err));

        axios.get(`/clientes/${clienteId}/ventas-credito`)
            .then(res => setVentasCredito(res.data))
            .catch(err => console.error(err));

        setVentaId("");
        setMonto("");
    }, [clienteId]);

    const seleccionarVenta = (id) => {
        setVentaId(id);
        const venta = ventasCredito.find(v => v.id === Number(id));
        if (venta) setMonto(venta.total);
    };

    const formatearFecha = (fechaISO) => {
        return new Date(fechaISO).toLocaleDateString("es-CO", {
            day: "numeric", month: "short", year: "numeric"
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!clienteId || !monto) {
            setToast({ message: "Completa todos los campos", type: "error" });
            setTimeout(() => setToast(null), 3000);
            return;
        }

        if (Number(monto) > deuda) {
            setToast({ message: "El monto no puede ser mayor a la deuda", type: "error" });
            setTimeout(() => setToast(null), 3000);
            return;
        }

        try {
            await axios.post("/pagos", {
                cliente_id: Number(clienteId),
                monto: Number(monto),
                venta_id: ventaId ? Number(ventaId) : null,
            });

            setToast({ message: "Pago registrado correctamente", type: "success" });
            setTimeout(() => setToast(null), 3000);

            setMonto("");
            setVentaId("");

            const [deudaRes, ventasRes] = await Promise.all([
                axios.get(`/clientes/${clienteId}/deuda`),
                axios.get(`/clientes/${clienteId}/ventas-credito`),
            ]);
            setDeuda(deudaRes.data.deuda_actual);
            setVentasCredito(ventasRes.data);

            if (onPagoCreado) onPagoCreado();

        } catch (error) {
            const msg = error.response?.data?.detail || "Error al registrar pago";
            setToast({ message: msg, type: "error" });
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
            {clientes.map(c => (
                <option key={c.id} value={c.id}>{c.nombre}</option>
            ))}
        </select>

        {clienteId && (
            <div style={{
                fontWeight: "bold",
                marginTop: "4px",
                color: deuda > 0 ? "#b00020" : "#059669"
            }}>
                Deuda actual: {fmtCurrency(deuda)}
            </div>
        )}

        {ventasCredito.length > 0 && (
            <>
                <label>Venta a saldar</label>
                <select
                    value={ventaId}
                    onChange={(e) => seleccionarVenta(e.target.value)}
                >
                    <option value="">Seleccionar venta (opcional)</option>
                    {ventasCredito.map(v => (
                        <option key={v.id} value={v.id}>
                            {formatearFecha(v.fecha)} — {v.descripcion} — {fmtCurrency(v.total)}
                        </option>
                    ))}
                </select>
            </>
        )}

        {clienteId && ventasCredito.length === 0 && deuda === 0 && (
            <div style={{ color: "#059669", fontWeight: 600, fontSize: 14 }}>
                Este cliente no tiene ventas a crédito pendientes.
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

        {toast && <Toast message={toast.message} type={toast.type} />}

    </form>
    );
}

export default PagoForm;
