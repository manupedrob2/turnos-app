import React from 'react';

const ManualAppointmentModal = ({ isOpen, onClose, onSubmit }) => {
    // Si no está abierto, no renderizamos nada
    if (!isOpen) return null;

    const GOLD = "#D4AF37";

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-[fadeIn_0.2s_ease-out]">
            <div className={`bg-[#101010] border border-[${GOLD}]/30 p-6 rounded-2xl w-full max-w-sm shadow-[0_0_50px_rgba(0,0,0,0.8)]`}>
                <h3 className={`font-cinzel text-[${GOLD}] text-center text-lg mb-6`}>Nuevo Turno Manual</h3>
                
                <form onSubmit={onSubmit} className="flex flex-col gap-4">
                    <div>
                        <label className="text-xs text-gray-500 uppercase ml-1">Hora</label>
                        <input 
                            type="time" 
                            name="hora" 
                            required 
                            className={`w-full bg-[#1A1A1A] border border-white/10 rounded-lg p-3 text-white outline-none focus:border-[${GOLD}] transition-colors`}
                        />
                    </div>
                    <div>
                        <label className="text-xs text-gray-500 uppercase ml-1">Cliente</label>
                        <input 
                            type="text" 
                            name="nombre" 
                            placeholder="Nombre" 
                            required 
                            className={`w-full bg-[#1A1A1A] border border-white/10 rounded-lg p-3 text-white outline-none focus:border-[${GOLD}] transition-colors`}
                        />
                    </div>
                    <div>
                        <label className="text-xs text-gray-500 uppercase ml-1">Teléfono</label>
                        <input 
                            type="tel" 
                            name="telefono" 
                            placeholder="WhatsApp (Opcional)" 
                            className={`w-full bg-[#1A1A1A] border border-white/10 rounded-lg p-3 text-white outline-none focus:border-[${GOLD}] transition-colors`}
                        />
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
                            Crear
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ManualAppointmentModal;