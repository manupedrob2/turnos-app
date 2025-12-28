# 💈 BarberShop Management System

Una aplicación web moderna y responsiva para la gestión integral de turnos de barbería. Diseñada para facilitar la reserva de citas por parte de los clientes y ofrecer un panel de administración potente para el barbero.

![Estado del Proyecto](https://img.shields.io/badge/Estado-En_Desarrollo-yellow?style=flat-square)
![Licencia](https://img.shields.io/badge/Licencia-MIT-blue?style=flat-square)

## 📸 Capturas de Pantalla

| Vista Cliente (Reserva) | Panel de Administración |
|:-----------------------:|:-----------------------:|
| ![Vista Cliente](/vistaCliente.png) | ![Panel Admin](/vistaAdmin.png) |
*(Asegúrate de subir capturas reales a una carpeta 'screenshots' y actualizar estas rutas)*

## ✨ Características Principales

### 👨‍💻 Panel de Administración (Admin Dashboard)
* **Gestión Visual de Turnos:** Vista diaria con tarjetas intuitivas para cada horario.
* **Control Total:** Bloquear horarios, reservar manualmente y cancelar turnos.
* **Edición Rápida:** Modifica hora, nombre y teléfono directamente desde la tarjeta del turno.
* **Configuración Global:** Ajusta precios, duración del servicio (intervalos), y horarios de apertura/cierre.
* **Días Especiales:** Configura días feriados o con horarios reducidos/extendidos sin afectar la configuración general.
* **Métricas Rápidas:** Visualización de ingresos estimados y cantidad de turnos del día.

### 📱 Vista del Cliente (Booking)
* **Interfaz Guiada:** Proceso de reserva paso a paso (Fecha -> Hora -> Datos).
* **Disponibilidad en Tiempo Real:** Solo muestra horarios disponibles según la configuración y bloqueos del admin.
* **Integración con WhatsApp:** Al confirmar, redirige automáticamente a WhatsApp con el mensaje del turno pre-armado.
* **Servicios Adicionales:** Opción para agregar servicios extra (ej. Barba) actualizando el precio dinámicamente.

## 🛠️ Tecnologías Utilizadas

* **Frontend:** [React](https://reactjs.org/) + [Vite](https://vitejs.dev/)
* **Estilos:** [Tailwind CSS](https://tailwindcss.com/)
* **Base de Datos & Auth:** [Supabase](https://supabase.com/)
* **Iconos:** Material Icons