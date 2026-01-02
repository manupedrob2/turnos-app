import React from 'react';
import Calendar from '../../shared/Calendar'; 
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

    // --- FUNCIÓN HELPER PARA VALIDAR SI LA HORA YA PASÓ ---
    const isTimePassed = (timeSlot) => {
        // 1. Obtenemos fecha actual
        const now = new Date();
        
        // 2. Creamos la fecha del turno seleccionado
        // IMPORTANTE: selectedDate suele venir seteada a las 00:00 o la hora actual, 
        // pero necesitamos asegurarnos que comparamos año/mes/día correctamente.
        const slotDate = new Date(selectedDate);
        
        // Obtenemos hora y minutos del string "09:00"
        const [hours, minutes] = timeSlot.split(':').map(Number);
        slotDate.setHours(hours, minutes, 0, 0);

        // 3. Validamos: 
        // Si el día seleccionado es DISTINTO a hoy (es futuro), nunca está pasado -> false.
        // Si el día es HOY, comparamos la hora.
        // Nota: Una forma simple es comparar timestamps si estamos seguros que selectedDate es correcta.
        // Pero para ir a lo seguro:
        
        const isToday = now.getDate() === slotDate.getDate() &&
                        now.getMonth() === slotDate.getMonth() &&
                        now.getFullYear() === slotDate.getFullYear();

        if (!isToday) {
            // Si la fecha seleccionada es anterior a hoy (ayer), TODO está pasado.
            // Si es futuro, NADA está pasado.
            // Asumimos que el calendario bloquea días pasados, así que si no es hoy, es futuro.
            return slotDate < new Date().setHours(0,0,0,0); 
        }

        // Si es HOY, comparamos la hora exacta
        return slotDate < now;
    };

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
                            // 1. Validaciones
                            const isOccupied = turnosOcupados.includes(time);
                            const isPassed = isTimePassed(time); // <--- NUEVA VALIDACIÓN
                            const isSelected = horaSeleccionada === time;
                            
                            // 2. Estado Deshabilitado (Ocupado o Pasado)
                            const isDisabled = isOccupied || isPassed;

                            // 3. Clases dinámicas
                            let btnClass = "py-3 rounded-sm text-sm font-medium transition-all duration-200 border ";

                            if (isDisabled) {
                                // Estilo para deshabilitado (gris oscuro, tachado, sin cursor)
                                btnClass += "border-transparent bg-[#1A1A1A] text-neutral-600 line-through cursor-not-allowed opacity-60";
                            } else if (isSelected) {
                                // Estilo seleccionado (Dorado)
                                btnClass += `border-[${GOLD_HEX}] bg-[${GOLD_HEX}] text-black font-bold shadow-md shadow-[${GOLD_HEX}]/20`;
                            } else {
                                // Estilo disponible (Gris claro hover blanco)
                                btnClass += "border-transparent bg-[#252525] text-gray-300 hover:bg-[#333] hover:text-white";
                            }

                            return (
                                <button 
                                    key={index} 
                                    disabled={isDisabled} 
                                    className={btnClass} 
                                    onClick={() => onSlotSelect(time)}
                                >
                                    {time}
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>
        </main>
    );
};

export default ClientStep1;