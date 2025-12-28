import React from 'react';
import Calendar from '../../shared/Calendar'; // Ajusta la ruta a tu Calendario
import { GOLD_HEX } from '../../constants';

const AdminSidebar = ({ 
    viewDate, 
    selectedDate, 
    onDateSelect, 
    onChangeMonth, 
    ingresos, 
    turnos,
    onOpenDayModal 
}) => {
    return (
        <aside className="flex flex-col gap-6">
            
            {/* TÍTULO DASHBOARD (Movido aquí) */}
            <div className="pl-1">
                <h2 className={`font-cinzel text-3xl text-[${GOLD_HEX}] tracking-wider mb-1`}>DASHBOARD</h2>
                <p className="text-gray-500 text-xs uppercase tracking-[0.2em]">Gestión de Turnos</p>
            </div>

            {/* Calendario */}
            <div className="bg-[#121212] border border-white/5 p-4 rounded-xl shadow-lg">
                <Calendar 
                    viewDate={viewDate}
                    selectedDate={selectedDate}
                    onDateSelect={onDateSelect}
                    onChangeMonth={onChangeMonth}
                    isAdmin={true} 
                />
            </div>

            {/* Tarjetas de Métricas Rápidas */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#121212] border border-white/5 p-4 rounded-xl flex flex-col items-center justify-center text-center">
                    <span className="text-gray-500 text-[0.6rem] uppercase tracking-widest mb-1">Ingresos Est.</span>
                    <span className="text-white font-bold text-lg font-cinzel">
                        ${new Intl.NumberFormat('es-AR').format(ingresos)}
                    </span>
                </div>
                <div className="bg-[#121212] border border-white/5 p-4 rounded-xl flex flex-col items-center justify-center text-center">
                    <span className="text-gray-500 text-[0.6rem] uppercase tracking-widest mb-1">Turnos</span>
                    <span className="text-white font-bold text-lg font-cinzel">{turnos}</span>
                </div>
            </div>

            {/* Botón Opciones del Día */}
            <button 
                onClick={onOpenDayModal}
                className="w-full py-4 rounded-xl border border-white/10 bg-[#1A1A1A] text-gray-300 text-xs font-bold uppercase tracking-wider hover:bg-[#252525] hover:border-white/20 transition-all flex items-center justify-center gap-2"
            >
                <span className="material-icons text-sm">tune</span>
                Opciones del día
            </button>
        </aside>
    );
};

export default AdminSidebar;