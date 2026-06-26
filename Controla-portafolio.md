# Controla — Plataforma SaaS multiempresa de gestión comercial

> **Nota para el portafolio:** este documento describe el estado final del proyecto, que evolucionó de un sistema de un solo negocio ("Postres Juli") a una **plataforma SaaS multiempresa** llamada **Controla**. Reemplaza la descripción anterior del proyecto.

## Resumen

Controla es una plataforma web (SaaS) **multiempresa** para la gestión administrativa y financiera de pequeños negocios. Cada empresa administra de forma independiente sus clientes, productos, ventas, pagos, gastos, deudas y reportes, con sus propios usuarios, roles y personalización visual, manteniendo **aislamiento total de datos** entre empresas.

El proyecto nació como un sistema para un solo negocio (Postres Juli) y evolucionó a una plataforma completa con autenticación, control de acceso por roles, inventario de productos, ventas de varios productos (tipo factura) y reportes por período.

## Problema

Los pequeños negocios suelen gestionar su información con registros manuales y procesos dispersos, lo que dificulta el seguimiento de ventas, pagos pendientes, gastos e inventario, y limita el análisis financiero. Además, una solución hecha para un solo negocio no escala: no permite que varios negocios (cada uno con su equipo) usen la misma herramienta de forma segura e independiente.

## Solución

Una plataforma centralizada en la nube donde cada empresa se registra, invita a su equipo, configura su catálogo de productos y opera el día a día. Los datos de cada empresa están completamente aislados, el acceso se controla por roles, y los reportes permiten analizar cualquier mes/año.

## Funcionalidades principales

**Multiempresa (multi-tenant)**
- Cada empresa tiene sus propios datos, usuarios y configuración.
- Aislamiento total: todas las consultas se filtran por empresa; una empresa nunca ve datos de otra.
- Registro de empresa con código de invitación para que los empleados se unan.

**Autenticación y seguridad**
- Registro e inicio de sesión por nombre de usuario.
- Sesiones con JWT; contraseñas cifradas con bcrypt (nunca en texto plano).
- Reglas de contraseña (mínimo 8 caracteres con letras y números).
- Cierre de sesión automático por inactividad.

**Roles y permisos**
- **Empresario:** supervisa y administra (no vende); gestiona gastos, inventario, estadísticas y equipo.
- **Empleado:** opera el día a día (ventas, pagos, deudas, clientes).
- **Propietario:** combina ambos (vende y administra), ideal para negocios de una sola persona.
- Las restricciones se aplican también en el backend, no solo en la interfaz.

**Inventario de productos**
- Productos con código, nombre y precio.
- Control de stock **opcional por producto** (el dueño decide); los empleados pueden actualizarlo.
- Búsqueda por código o nombre.

**Ventas con varios productos (tipo factura)**
- La venta se arma eligiendo productos y cantidades; el sistema calcula subtotales y total.
- Validación de stock: si no alcanza, no permite la venta; al vender descuenta el stock y al anular lo devuelve.
- Cada venta guarda el detalle (qué productos, cuántos y a qué precio).

**Gestión financiera**
- Clientes, pagos, gastos y control de deudas (saldos por cobrar).
- Pagos a crédito o de contado (registro automático del pago en ventas de contado).

**Reportes por período**
- Selector de mes/año que actualiza todo: tarjetas de resumen (vendido, gastos, pendiente, ganancia) y estadísticas del equipo.
- Estadísticas por persona con gráficas (ventas y pagos por empleado).

**Personalización por empresa**
- Logo propio de cada empresa.
- 6 paletas de color seleccionables (incluye **modo oscuro**), aplicadas a toda la app mediante variables CSS.

**Administración y perfil**
- Panel de administración: ver/gestionar empleados (ascender, quitar), código de empresa (regenerable), eliminar cuenta.
- Perfil de usuario: editar datos, cambiar contraseña y ver estadísticas personales.

**Identidad de marca**
- Marca propia "Controla", con logo (monograma "C" con símbolo "$"), favicon, icono para pantalla de inicio (PWA) y login con diseño moderno.

## Arquitectura del sistema

**Frontend**
- React, Vite, JavaScript
- Context API (gestión de sesión y estado)
- CSS con variables (sistema de temas)
- PWA (instalable en el celular)

**Backend**
- Python, FastAPI
- SQLAlchemy (ORM)
- API REST (GET, POST, PUT, DELETE)
- Autenticación con JWT y bcrypt
- Validación con Pydantic

**Base de datos**
- PostgreSQL (Supabase)
- Tablas: empresas, usuarios, clientes, productos, ventas, venta_items, pagos, gastos

**Infraestructura y despliegue**
- Vercel (frontend), Render (backend), GitHub (código)

## Seguridad

- Cifrado de contraseñas con bcrypt.
- Autenticación basada en tokens JWT.
- Aislamiento de datos por empresa en cada consulta.
- Control de acceso por rol reforzado en el backend.

## Tecnologías utilizadas

React • Vite • JavaScript • Context API • CSS • PWA • Python • FastAPI • SQLAlchemy • PostgreSQL • Supabase • JWT • bcrypt • Git • GitHub • Vercel • Render

## Evolución del proyecto

Controla demuestra un caso real de evolución de software: pasar de una aplicación para **un solo negocio** (Postres Juli) a una **plataforma SaaS multiempresa** con autenticación, roles, inventario, ventas multiproducto, reportes por período y personalización visual — conservando el 100% de los datos reales originales durante la migración.

## Próximas mejoras

Notificaciones de pagos pendientes y stock bajo, exportación de reportes (PDF/Excel), aplicación móvil nativa y un dashboard avanzado con más gráficas.
