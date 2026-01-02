import React, { useState, useEffect } from 'react';
import { GOLD_HEX } from '../constants';

const ManualAppointmentModal = ({ isOpen, onClose, onSubmit, initialTime }) => {
    
    // Estado del formulario
    const [formData, setFormData] = useState({
        hora: '',
        nombre: '',
        telefono: ''
    });

    // EFECTO: Cuando se abre el modal o cambia initialTime, actualizamos el form
    useEffect(() => {
        if (isOpen) {
            setFormData({
                hora: initialTime || '', // Si viene hora, la ponemos. Si no, vacío.
                nombre: '',
                telefono: ''
            });
        }
    }, [isOpen, initialTime]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({ target: {
            hora: { value: formData.hora },
            nombre: { value: formData.nombre },
            telefono: { value: formData.telefono }
        }});
        // No cerramos aquí, lo hace el padre tras el submit exitoso
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
            <div className="bg-[#121212] border border-white/10 w-full max-w-md rounded-xl p-6 shadow-2xl relative">
                
                <h3 className={`font-cinzel text-xl text-[${GOLD_HEX}] mb-6 text-center tracking-widest`}>
                    Nuevo Turno Manual
                </h3>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    
                    {/* INPUT HORA */}
                    <div>
                        <label className="text-gray-500 text-xs uppercase tracking-wider mb-1 block">Horario</label>
                        <input 
                            type="time" 
                            name="hora"
                            required
                            value={formData.hora}
                            onChange={(e) => setFormData({...formData, hora: e.target.value})}
                            className={`w-full bg-[#0a0a0a] border border-white/10 rounded-lg p-3 text-white focus:border-[${GOLD_HEX}] outline-none transition-colors`}
                        />
                    </div>

                    {/* INPUT NOMBRE */}
                    <div>
                        <label className="text-gray-500 text-xs uppercase tracking-wider mb-1 block">Nombre Cliente</label>
                        <input 
                            type="text" 
                            name="nombre"
                            required
                            placeholder="Ej: Juan Perez"
                            value={formData.nombre}
                            onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                            className={`w-full bg-[#0a0a0a] border border-white/10 rounded-lg p-3 text-white focus:border-[${GOLD_HEX}] outline-none transition-colors`}
                        />
                    </div>

                    {/* INPUT TELÉFONO */}
                    <div>
                        <label className="text-gray-500 text-xs uppercase tracking-wider mb-1 block">Teléfono (Opcional)</label>
                        <input 
                            type="tel" 
                            name="telefono"
                            placeholder="Ej: 11 1234 5678"
                            value={formData.telefono}
                            onChange={(e) => setFormData({...formData, telefono: e.target.value})}
                            className={`w-full bg-[#0a0a0a] border border-white/10 rounded-lg p-3 text-white focus:border-[${GOLD_HEX}] outline-none transition-colors`}
                        />
                    </div>

                    {/* BOTONES */}
                    <div className="flex gap-3 mt-4">
                        <button 
                            type="button" 
                            onClick={onClose}
                            className="flex-1 py-3 rounded-lg border border-white/10 text-gray-400 hover:bg-white/5 transition-colors font-bold text-sm uppercase"
                        >
                            Cancelar
                        </button>
                        <button 
                            type="submit"
                            className={`flex-1 py-3 rounded-lg bg-[${GOLD_HEX}] text-black font-bold text-sm uppercase hover:bg-[#b5952f] transition-colors shadow-lg shadow-[${GOLD_HEX}]/20`}
                        >
                            Confirmar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ManualAppointmentModal;