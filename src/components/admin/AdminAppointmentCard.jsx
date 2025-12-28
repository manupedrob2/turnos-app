import React, { useState } from 'react';
import { GOLD_HEX } from '../../constants';

const AdminAppointmentCard = ({ time, appointmentData, onAction, onUpdateAppointment }) => {
    
    // Estado para el modo edición
    const [isEditing, setIsEditing] = useState(false);
    
    // Estado para los datos que estamos editando
    const [editData, setEditData] = useState({
        hora: time,
        cliente_nombre: appointmentData?.cliente_nombre || '',
        cliente_telefono: appointmentData?.cliente_telefono || ''
    });

    const isBlocked = appointmentData?.cliente_nombre === "BLOQUEADO";
    const isReserved = appointmentData && !isBlocked;
    const isFree = !appointmentData;

    // Estilos dinámicos
    const cardBg = isBlocked ? 'bg-[#2a0a0a]' : 'bg-[#1A1A1A]';
    // Borde dorado si edita, rojo si bloqueado, gris si libre
    const borderColor = isEditing ? `border-[${GOLD_HEX}]` : (isBlocked ? 'border-red-900/30' : (isFree ? 'border-white/5' : `border-[${GOLD_HEX}]/30`));
    const opacity = isBlocked && !isEditing ? 'opacity-90' : 'opacity-100';

    // Iniciar edición al hacer clic en el lápiz
    const handleEditClick = () => {
        setEditData({
            hora: time,
            cliente_nombre: appointmentData?.cliente_nombre || '',
            cliente_telefono: appointmentData?.cliente_telefono || ''
        });
        setIsEditing(true);
    };

    const handleCancel = () => {
        setIsEditing(false);
    };

    const handleSave = () => {
        if (appointmentData?.id && onUpdateAppointment) {
            onUpdateAppointment(appointmentData.id, editData);
        }
        setIsEditing(false);
    };

    return (
        <div className={`${cardBg} border ${borderColor} ${opacity} rounded-xl p-3 transition-all duration-200 hover:border-white/20 group`}>
            
            <div className="grid grid-cols-[65px_1fr_auto] gap-3 items-center">
                
                {/* --- COL 1: HORA --- */}
                <div className="flex flex-col items-center justify-center border-r border-white/10 pr-3 h-full">
                    {isEditing ? (
                        <input 
                            type="time" 
                            value={editData.hora}
                            onChange={(e) => setEditData({...editData, hora: e.target.value})}
                            className={`bg-[#000] text-[${GOLD_HEX}] font-bold text-xs w-full p-1 rounded border border-[${GOLD_HEX}]/50 outline-none text-center h-8`}
                        />
                    ) : (
                        <>
                            <span className={`font-cinzel text-lg font-bold text-[${GOLD_HEX}] leading-none`}>
                                {time}
                            </span>
                            <span className="text-[0.55rem] text-gray-500 uppercase mt-1">Horario</span>
                        </>
                    )}
                </div>

                {/* --- COL 2: INFORMACIÓN --- */}
                <div className="flex flex-col justify-center min-w-0 overflow-hidden h-full">
                    
                    {isEditing ? (
                        // MODO EDICIÓN: Inputs para Nombre y Teléfono
                        <div className="flex flex-col gap-2">
                            <input 
                                type="text" 
                                value={editData.cliente_nombre}
                                onChange={(e) => setEditData({...editData, cliente_nombre: e.target.value})}
                                placeholder="Nombre Cliente"
                                className="bg-[#0a0a0a] text-white text-xs p-1.5 rounded border border-white/20 outline-none focus:border-[#D4AF37] w-full"
                            />
                            <input 
                                type="tel" 
                                value={editData.cliente_telefono}
                                onChange={(e) => setEditData({...editData, cliente_telefono: e.target.value})}
                                placeholder="Teléfono"
                                className="bg-[#0a0a0a] text-gray-300 text-xs p-1.5 rounded border border-white/20 outline-none focus:border-[#D4AF37] w-full"
                            />
                        </div>
                    ) : (
                        // MODO LECTURA
                        <>
                            {isFree && (
                                <span className="text-[#10B981] font-bold text-xs uppercase tracking-wider flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]"></span> Disponible
                                </span>
                            )}
                            
                            {isBlocked && (
                                <span className="text-[#EF4444] font-bold text-xs uppercase tracking-wider flex items-center gap-1">
                                    <span className="material-icons text-xs">lock</span> Bloqueado
                                </span>
                            )}

                            {isReserved && (
                                <>
                                    <span className="text-white font-bold text-sm truncate w-full block" title={appointmentData.cliente_nombre}>
                                        {appointmentData.cliente_nombre}
                                    </span>
                                    <div className="flex items-center gap-1 text-gray-400 text-xs mt-0.5">
                                        <span className="material-icons text-[10px]">phone</span>
                                        <span className="truncate">{appointmentData.cliente_telefono}</span>
                                    </div>
                                </>
                            )}
                        </>
                    )}
                </div>

                {/* --- COL 3: BOTONES DE ACCIÓN --- */}
                <div className="flex justify-end pl-1 gap-1.5">
                    
                    {isEditing ? (
                        // BOTONES MODO EDICIÓN (Guardar y Cancelar)
                        <>
                            <button 
                                onClick={handleSave}
                                className="w-9 h-9 flex items-center justify-center rounded-lg bg-[#25D366]/20 text-[#25D366] border border-[#25D366]/30 hover:bg-[#25D366] hover:text-black transition-all"
                                title="Guardar Cambios"
                            >
                                <span className="material-icons text-sm">check</span>
                            </button>
                            <button 
                                onClick={handleCancel}
                                className="w-9 h-9 flex items-center justify-center rounded-lg bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white transition-all"
                                title="Cancelar"
                            >
                                <span className="material-icons text-sm">close</span>
                            </button>
                        </>
                    ) : (
                        // BOTONES MODO NORMAL
                        <>
                            {isFree && (
                                <button 
                                    onClick={() => onAction(time, isBlocked, isReserved, appointmentData?.id)}
                                    className="w-9 h-9 flex items-center justify-center rounded-lg bg-[#111] border border-white/10 text-gray-400 hover:text-white hover:bg-[#222] transition-colors"
                                >
                                    <span className="material-icons text-sm">lock</span>
                                </button>
                            )}

                            {isReserved && (
                                <div className="flex gap-1.5">
                                    {/* 1. BOTÓN EDITAR (LÁPIZ) - Igual tamaño que los demás */}
                                    <button 
                                        onClick={handleEditClick}
                                        className={`w-9 h-9 flex items-center justify-center rounded-lg bg-[#111] border border-white/10 text-gray-400 hover:text-[${GOLD_HEX}] hover:border-[${GOLD_HEX}] transition-colors`}
                                        title="Editar Turno"
                                    >
                                        <span className="material-icons text-sm">edit</span>
                                    </button>

                                    {/* 2. BOTÓN WHATSAPP */}
                                    <a 
                                        href={`https://wa.me/${appointmentData.cliente_telefono}`} 
                                        target="_blank" 
                                        rel="noreferrer"
                                        className="w-9 h-9 flex items-center justify-center rounded-lg bg-[#25D366] text-white hover:bg-[#1DA851] transition-all shadow-lg shadow-[#25D366]/20"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                            <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.099-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z"/>
                                        </svg>
                                    </a>

                                    {/* 3. BOTÓN CANCELAR/BORRAR */}
                                    <button 
                                        onClick={() => onAction(time, isBlocked, isReserved, appointmentData?.id)}
                                        className="w-9 h-9 flex items-center justify-center rounded-lg bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white transition-colors"
                                    >
                                        <span className="material-icons text-sm">close</span>
                                    </button>
                                </div>
                            )}

                            {isBlocked && (
                                <button 
                                    onClick={() => onAction(time, isBlocked, isReserved, appointmentData?.id)}
                                    className="w-9 h-9 flex items-center justify-center rounded-lg bg-[#111] border border-white/10 text-gray-400 hover:text-[#10B981] hover:border-[#10B981]/30 transition-colors"
                                >
                                    <span className="material-icons text-sm">lock_open</span>
                                </button>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminAppointmentCard;