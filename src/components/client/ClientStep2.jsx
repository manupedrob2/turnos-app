import React from 'react';
import { GOLD_HEX } from '../../constants';
import { DEFAULT_CONFIG } from '../../constants';

const ClientStep2 = ({ selectedDate, horaSeleccionada, formData, globalConfig, onInputChange, onSubmit, isSubmitting }) => {
    // Calculamos totales aquí para limpiar la vista
    const precio = DEFAULT_CONFIG.precio;

    return (
        <main className="flex-1 px-6 pb-8 animate-[fadeIn_0.5s_ease-out] flex flex-col items-center lg:block lg:max-w-lg lg:mx-auto lg:w-full">
            <div className="bg-[#121212] border border-white/10 p-5 rounded-xl mb-6 shadow-xl relative overflow-hidden w-full">
                <div className={`absolute top-0 right-0 w-32 h-32 bg-[${GOLD_HEX}]/5 blur-3xl rounded-full -mr-16 -mt-16`}></div>
                <h3 className="text-[0.6rem] text-gray-400 uppercase tracking-[0.2em] font-bold mb-4 pb-2 border-b border-white/5">Resumen de Reserva</h3>
                
                <div className="flex flex-col gap-3 relative z-10">
                    <div className="flex items-center text-gray-200 text-sm">
                        <span className={`text-[${GOLD_HEX}] text-lg mr-3 material-icons`}>calendar_today</span>
                        <span className="capitalize">{new Intl.DateTimeFormat('es-AR', { weekday: 'long', day: 'numeric', month: 'long' }).format(selectedDate)}</span>
                    </div>
                    <div className="flex items-center text-gray-200 text-sm">
                        <span className={`text-[${GOLD_HEX}] text-lg mr-3 material-icons`}>access_time</span>
                        <span>{horaSeleccionada} hs</span>
                    </div>
                    <div className="flex items-center text-gray-200 text-sm">
                        <span className={`text-[${GOLD_HEX}] text-lg mr-3 material-icons`}>location_on</span>
                        <span>Calle 55 553 entre 6 y 7</span>
                    </div>
                    {formData.barba && (
                        <div className="flex items-center text-gray-200 text-sm">
                            <span className={`text-[${GOLD_HEX}] text-lg mr-3 material-icons`}>content_cut</span>
                            <span>Adicional Barba</span>
                        </div>
                    )}
                </div>

                <div className="mt-6 pt-3 border-t border-white/10 flex justify-between items-end relative z-10">
                    <span className="text-gray-400 text-xs uppercase tracking-wider pb-1">Total a pagar</span>
                    <span className={`text-[${GOLD_HEX}] text-2xl font-bold font-cinzel`}>${precio}</span>
                </div>
            </div>

            <form onSubmit={onSubmit} className="flex flex-col gap-4 w-full">
                <div className="relative group">
                    <input type="text" name="nombre" placeholder="NOMBRE COMPLETO" value={formData.nombre} onChange={onInputChange} required className={`w-full bg-transparent border-b border-white/20 py-3 text-white outline-none focus:border-[${GOLD_HEX}] transition-all placeholder:text-gray-600 text-sm tracking-wider peer`}/>
                    <div className={`absolute bottom-0 left-0 h-[1px] w-0 bg-[${GOLD_HEX}] transition-all duration-300 group-focus-within:w-full`}></div>
                </div>
                <div className="relative group">
                    <input type="tel" name="telefono" placeholder="WHATSAPP (Ej: 2392557958)" value={formData.telefono} onChange={onInputChange} required className={`w-full bg-transparent border-b border-white/20 py-3 text-white outline-none focus:border-[${GOLD_HEX}] transition-all placeholder:text-gray-600 text-sm tracking-wider peer`}/>
                    <div className={`absolute bottom-0 left-0 h-[1px] w-0 bg-[${GOLD_HEX}] transition-all duration-300 group-focus-within:w-full`}></div>
                </div>

                {/* BOTÓN ACTUALIZADO CON ESTADO DE CARGA */}
                <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className={`w-full font-extrabold text-sm py-4 rounded-md mt-2 uppercase tracking-[0.15em] transition-all shadow-lg
                    ${isSubmitting 
                        ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed shadow-none' // Estilo Cargando
                        : `bg-[${GOLD_HEX}] text-black hover:bg-[#C9A227] shadow-[${GOLD_HEX}]/20` // Estilo Normal
                    }`}
                >
                    {isSubmitting ? 'Procesando...' : 'Confirmar Reserva'}
                </button>
            </form>
        </main>
    );
};

export default ClientStep2;