import React from 'react';

const DayOverrideModal = ({ 
    isOpen, 
    onClose, 
    onSave, 
    date, 
    dayOverrideData, 
    globalConfig 
}) => {
    // Si no está abierto, retornamos null
    if (!isOpen) return null;

    const GOLD = "#D4AF37";

    // Formatear fecha para el título
    const formattedDate = new Intl.DateTimeFormat('es-AR', { 
        day: 'numeric', 
        month: 'numeric' 
    }).format(date);

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-[fadeIn_0.2s_ease-out]">
            <div className={`bg-[#101010] border border-[${GOLD}]/30 p-6 rounded-2xl w-full max-w-sm shadow-[0_0_50px_rgba(0,0,0,0.8)]`}>
                <h3 className={`font-cinzel text-[${GOLD}] text-center text-lg mb-6`}>
                    Día: {formattedDate}
                </h3>
                
                <form onSubmit={onSave} className="flex flex-col gap-4">
                    <label className="flex items-center gap-3 cursor-pointer p-4 bg-[#1A1A1A] rounded-lg border border-white/5 transition-colors hover:border-white/10">
                        <input 
                            type="checkbox" 
                            name="cerrado" 
                            defaultChecked={dayOverrideData?.es_feriado} 
                            className={`accent-[${GOLD}] w-5 h-5`}
                        /> 
                        <span className="text-sm font-bold text-gray-300">Cerrar este día</span>
                    </label>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs text-gray-500 uppercase ml-1">Apertura</label>
                            <input 
                                type="time" 
                                name="apertura" 
                                defaultValue={dayOverrideData?.hora_apertura || globalConfig.hora_apertura} 
                                className="w-full bg-[#1A1A1A] border border-white/10 rounded-lg p-3 text-white transition-colors"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-gray-500 uppercase ml-1">Cierre</label>
                            <input 
                                type="time" 
                                name="cierre" 
                                defaultValue={dayOverrideData?.hora_cierre || globalConfig.hora_cierre} 
                                className="w-full bg-[#1A1A1A] border border-white/10 rounded-lg p-3 text-white transition-colors"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-4">
                        <button 
                            type="button" 
                            className="bg-transparent border border-white/10 text-gray-400 py-3 rounded-lg hover:text-white transition-colors" 
                            onClick={onClose}
                        >
                            Cancelar
                        </button>
                        <button 
                            type="submit" 
                            className={`bg-[${GOLD}] text-black font-bold py-3 rounded-lg hover:bg-[#C9A227] transition-colors`}
                        >
                            Aplicar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default DayOverrideModal;