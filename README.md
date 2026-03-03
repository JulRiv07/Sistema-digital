# 🍰 Sistema de Gestión - Postres Juli

Sistema web completo para la gestión de ventas, pagos, gastos y control de deudas para emprendimientos pequeños.

Proyecto desarrollado con:

- ⚡ FastAPI (Backend)
- 🐍 Python + SQLAlchemy
- 🗄 SQLite
- ⚛ React (Frontend)
- 🎨 CSS personalizado responsive

---

## 🚀 Funcionalidades

### 👥 Clientes
- Crear clientes
- Editar clientes
- Eliminar clientes
- Consultar estado financiero individual

### 🛒 Ventas
- Registrar ventas
- Seleccionar cliente
- Tipo de pago (contado / crédito)
- Auto-registro de pago si es contado
- Editar ventas
- Eliminar ventas
- Filtro por mes y año

### 💵 Pagos
- Registrar pagos manuales
- Visualizar deuda actual antes de pagar
- Editar pagos
- Eliminar pagos
- Filtro por mes y año

### 🧾 Gastos
- Registrar gastos
- Editar gastos
- Eliminar gastos
- Filtro por mes y año

### 📊 Resumen General
- Ventas del mes actual
- Gastos del mes actual
- Pendiente total
- Ganancia mensual

### 📉 Deudas
- Listado automático de clientes con deuda pendiente
- Cálculo dinámico (ventas - pagos)

---

## 🧠 Arquitectura

### Backend
- FastAPI
- SQLAlchemy ORM
- Endpoints RESTful (GET, POST, PUT, DELETE)
- CORS habilitado
- Validación con Pydantic

### Frontend
- React con hooks
- Axios para comunicación API
- Componentes reutilizables
- Modal dinámico reutilizable
- Diseño responsive
- Filtros dinámicos por mes y año

---

## 🛠 Instalación

### 1️⃣ Clonar repositorio

```bash
git clone https://github.com/tuusuario/postres-juli.git
cd postres-juli
```

