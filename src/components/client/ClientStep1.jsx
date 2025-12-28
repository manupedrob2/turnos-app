import React from 'react';
import Calendar from '../../shared/Calendar'; // Importa tu calendario reutilizable
import { GOLD_HEX } from '../../constants';

const ClientStep1 = ({ 
    viewDate, 
    selectedDate, 
    generatedSlots, 
    turnosOcupados, 
    horaSeleccionada, 
    onDateSelect, 
    onChangeMonth, 
    onSlotSelect 
}) => {
    return (
        <main className="flex-1 px-6 pb-24 animate-[fadeIn_0.5s_ease-out] lg:grid lg:grid-cols-2 lg:gap-12 lg:px-12 lg:items-start lg:mt-4">
            <div className="lg:border-r lg:border-white/10 lg:pr-12">
                <div className={`font-cinzel text-[${GOLD_HEX}] text-xs tracking-[0.25em] uppercase mb-4 pl-2 border-l-2 border-[${GOLD_HEX}]`}>Selecciona fecha</div>
                <Calendar 
                    viewDate={viewDate}
                    selectedDate={selectedDate}
                    onDateSelect={onDateSelect}
                    onChangeMonth={onChangeMonth}
                    isAdmin={false}
                />
            </div>

            <div>
                <div className={`font-cinzel text-[${GOLD_HEX}] text-xs tracking-[0.25em] uppercase mb-6 mt-8 lg:mt-0 pl-2 border-l-2 border-[${GOLD_HEX}]`}>Horarios Disponibles</div>

                {generatedSlots.length === 0 ? (
                    <div className="text-center py-12 text-gray-500 border border-white/10 rounded-lg bg-[#121212] italic">No hay horarios disponibles.</div>
                ) : (
                    <div className="grid grid-cols-3 gap-3">
                        {generatedSlots.map((time, index) => {
                            const isOccupied = turnosOcupados.includes(time);
                            const isSelected = horaSeleccionada === time;
                            let btnClass = "py-3 rounded-sm text-sm font-medium transition-all duration-200 border ";

                            if (isOccupied) btnClass += "border-transparent bg-[#1A1A1A] text-gray-600 line-through cursor-not-allowed";
                            else if (isSelected) btnClass += `border-[${GOLD_HEX}] bg-[${GOLD_HEX}] text-black font-bold shadow-md shadow-[${GOLD_HEX}]/20`;
                            else btnClass += "border-transparent bg-[#252525] text-gray-300 hover:bg-[#333] hover:text-white";

                            return (
                                <button key={index} disabled={isOccupied} className={btnClass} onClick={() => onSlotSelect(time)}>{time}</button>
                            );
                        })}
                    </div>
                )}
            </div>
        </main>
    );
};

export default ClientStep1;