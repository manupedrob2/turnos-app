import React from 'react';

const ConfigModal = ({ isOpen, onClose, onSave, config }) => {
    // Si no está abierto, no renderizamos nada
    if (!isOpen) return null;

    const GOLD = "#D4AF37";

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-[fadeIn_0.2s_ease-out]">
            <div className={`bg-[#101010] border border-[${GOLD}]/30 p-6 rounded-2xl w-full max-w-sm shadow-[0_0_50px_rgba(0,0,0,0.8)]`}>
                <h3 className={`font-cinzel text-[${GOLD}] text-center text-lg mb-6`}>Configuración</h3>
                
                <form onSubmit={onSave} className="flex flex-col gap-4">
                    {/* Precios */}
                    <div>
                        <label className="text-xs text-gray-500 uppercase ml-1">Corte Base</label>
                        <input 
                            type="number" 
                            name="precio" 
                            defaultValue={config.precio} 
                            className={`w-full bg-[#1A1A1A] border border-white/10 rounded-lg p-3 text-white outline-none focus:border-[${GOLD}] transition-colors`}
                        />
                    </div>
                    <div>
                        <label className="text-xs text-gray-500 uppercase ml-1">Adicional Barba</label>
                        <input 
                            type="number" 
                            name="precio_barba" 
                            defaultValue={config.precio_barba} 
                            className={`w-full bg-[#1A1A1A] border border-white/10 rounded-lg p-3 text-white outline-none focus:border-[${GOLD}] transition-colors`}
                        />
                    </div>

                    {/* Horarios */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs text-gray-500 uppercase ml-1">Apertura</label>
                            <input 
                                type="time" 
                                name="apertura" 
                                defaultValue={config.hora_apertura} 
                                className="w-full bg-[#1A1A1A] border border-white/10 rounded-lg p-3 text-white transition-colors"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-gray-500 uppercase ml-1">Cierre</label>
                            <input 
                                type="time" 
                                name="cierre" 
                                defaultValue={config.hora_cierre} 
                                className="w-full bg-[#1A1A1A] border border-white/10 rounded-lg p-3 text-white transition-colors"
                            />
                        </div>
                    </div>

                    {/* Botones */}
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
                            Guardar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ConfigModal;