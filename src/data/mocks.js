// src/data/mocks.js

// Generador de fechas (igual que antes)
export const getProximosDias = () => {
  const dias = [];
  const hoy = new Date();
  for (let i = 0; i < 14; i++) {
    const fecha = new Date(hoy);
    fecha.setDate(hoy.getDate() + i);
    dias.push({
      id: i,
      fechaObj: fecha,
      label: new Intl.DateTimeFormat('es-AR', { weekday: 'short', day: 'numeric' }).format(fecha),
      valor: fecha.toISOString().split('T')[0] 
    });
  }
  return dias;
};

// Mocks enriquecidos para ADMIN
export const HORARIOS_MOCK = [
  { hora: "09:00", disponible: false, cliente: { nombre: "Carlos Gomez", tel: "11 5555-4444" } },
  { hora: "09:40", disponible: true, cliente: null },
  { hora: "10:20", disponible: false, cliente: { nombre: "Matias Lopez", tel: "11 9999-8888" } },
  { hora: "11:00", disponible: true, cliente: null },
  { hora: "11:40", disponible: true, cliente: null },
  { hora: "14:00", disponible: false, cliente: { nombre: "Juan Perez", tel: "11 2222-1111" } },
  { hora: "14:40", disponible: true, cliente: null },
  { hora: "15:20", disponible: true, cliente: null },
  { hora: "16:00", disponible: true, cliente: null },
  { hora: "16:40", disponible: true, cliente: null },
];