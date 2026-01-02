import React from 'react';
import AdminAppointmentCard from './AdminAppointmentCard';

const AdminAppointmentList = ({ 
    date, 
    slots, 
    appointmentsData, 
    onBlockAction, 
    onUpdateAppointment,
    onManualClick 
}) => {
    
    // Formatear la fecha para mostrarla linda en el encabezado
    const formattedDate = new Intl.DateTimeFormat('es-AR', { 
        weekday: 'long', 
        day: 'numeric', 
        month: 'long' 
    }).format(date);

    return (
        <div className="flex flex-col gap-3 pb-24 lg:pb-0">
            {/* Header de la lista */}
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-white font-cinzel text-xl capitalize">
                    {formattedDate}
                </h3>
                <span className="text-xs text-gray-500 uppercase tracking-widest">
                    {slots.length} Turnos
                </span>
            </div>

            {/* Lista de Tarjetas */}
            <div className="flex flex-col gap-3">
                {slots.length === 0 ? (
                    <div className="text-center py-10 border border-white/5 rounded-xl bg-[#121212] text-gray-500">
                        <p className="text-sm">No hay horarios generados para este día.</p>
                    </div>
                ) : (
                    slots.map((time) => {
                        // Buscamos si hay turno en esta hora
                        const appt = appointmentsData[time];
                        
                        return (
                            <AdminAppointmentCard 
                                key={time}
                                time={time}
                                appointmentData={appt}
                                onAction={onBlockAction}
                                onUpdateAppointment={onUpdateAppointment}
                                // Pasamos la función para abrir el modal manual
                                onQuickBook={onManualClick} 
                            />
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default AdminAppointmentList;