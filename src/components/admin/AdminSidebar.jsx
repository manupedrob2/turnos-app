import React from 'react';
import Calendar from '../../shared/Calendar'; // Reutilizamos el componente Calendar que ya creamos

const AdminSidebar = ({ 
    viewDate, 
    selectedDate, 
    onDateSelect, 
    onChangeMonth, 
    ingresos, 
    turnos, 
    onOpenDayModal 
}) => {
    const GOLD = "#D4AF37";

    return (
        <div className="flex flex-col gap-4">
            {/* Calendario en modo Admin */}
            <Calendar 
                viewDate={viewDate}
                selectedDate={selectedDate}
                onDateSelect={onDateSelect}
                onChangeMonth={onChangeMonth}
                isAdmin={true}
            />

            {/* Tarjetas de Estadísticas */}
            <div className="grid grid-cols-2 gap-2">
                <div className="bg-[#1A1A1A] border border-white/10 rounded-xl p-3 flex flex-col justify-center text-center">
                    <div className="text-gray-500 text-[0.6rem] uppercase tracking-widest mb-1">Ingresos Est.</div>
                    <div className="text-lg font-bold text-white font-cinzel">${ingresos.toLocaleString()}</div>
                </div>
                <div className="bg-[#1A1A1A] border border-white/10 rounded-xl p-3 flex flex-col justify-center text-center">
                    <div className="text-gray-500 text-[0.6rem] uppercase tracking-widest mb-1">Turnos</div>
                    <div className="text-lg font-bold text-white font-cinzel">{turnos}</div>
                </div>
            </div>
            
            {/* Botón de Opciones del Día */}
            <button 
                className={`w-full bg-[#1A1A1A] border border-white/10 hover:border-[${GOLD}] text-gray-400 hover:text-[${GOLD}] py-3 rounded-xl transition-all text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2`} 
                onClick={onOpenDayModal}
            >
                <span className="material-icons text-sm">edit_calendar</span> Opciones del Día
            </button>
        </div>
    );
};

export default AdminSidebar;