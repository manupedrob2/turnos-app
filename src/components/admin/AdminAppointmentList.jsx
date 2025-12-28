import React from 'react';
import AdminAppointmentCard from './AdminAppointmentCard';
import { GOLD_HEX } from '../../constants'; 

const AdminAppointmentList = ({ 
    date, 
    onManualClick, 
    slots = [], 
    appointmentsData = {}, 
    onBlockAction,
    onUpdateAppointment
}) => {
    
    const formattedDate = new Intl.DateTimeFormat('es-AR', { 
        weekday: 'long', 
        day: 'numeric',
        month: 'long'
    }).format(date);

    return (
        <div className="flex flex-col gap-5 w-full">
            {/* --- CABECERA DE LA LISTA --- */}
            <div className="bg-[#121212] border border-white/5 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-center gap-4 sticky top-[72px] z-30 shadow-md backdrop-blur-sm bg-opacity-90">
                <div className="flex items-center gap-3">
                    <div className={`w-1 h-8 bg-[${GOLD_HEX}] rounded-full`}></div>
                    <div>
                        <p className="text-gray-400 text-xs uppercase tracking-widest leading-none mb-1">Vista del día</p>
                        <h2 className="font-cinzel text-xl text-white capitalize leading-none">{formattedDate}</h2>
                    </div>
                </div>
                
                <button 
                    className={`w-full sm:w-auto bg-[${GOLD_HEX}] text-black px-6 py-3 rounded-lg text-xs font-bold uppercase hover:bg-[#C9A227] transition-all shadow-[0_0_15px_rgba(212,175,55,0.2)] flex items-center justify-center gap-2`} 
                    onClick={onManualClick}
                >
                    <span className="material-icons text-sm font-bold">add</span>
                    <span>Nuevo Turno</span>
                </button>
            </div>
            
            {/* --- GRILLA DE TURNOS (ORDEN VERTICAL) --- */}
            {slots.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-[#1A1A1A] border border-white/5 rounded-xl border-dashed">
                    <span className="material-icons text-gray-600 text-4xl mb-2">event_busy</span>
                    <p className="text-gray-500 font-cinzel">No hay horarios disponibles</p>
                    <p className="text-gray-600 text-xs mt-1">El local podría estar cerrado este día.</p>
                </div>
            ) : (
                /* Usamos 'columns-' en lugar de 'grid' para flujo vertical */
                <div className="columns-1 md:columns-2 xl:columns-3 gap-3 pb-20 lg:pb-0">
                    {slots.map((time) => (
                        /* break-inside-avoid evita que la tarjeta se corte. mb-3 da el espacio vertical */
                        <div key={time} className="break-inside-avoid mb-3">
                            <AdminAppointmentCard 
                                time={time} 
                                appointmentData={appointmentsData[time]} 
                                onAction={onBlockAction} 
                                onUpdateAppointment={onUpdateAppointment} // <--- PASAR A LA TARJETA
                            />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AdminAppointmentList;