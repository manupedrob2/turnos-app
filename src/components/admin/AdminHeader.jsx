import React from 'react';
import { GOLD_HEX } from '../../constants'; // Asegúrate que la ruta sea correcta
import logo from '/logo.png'; // Asegúrate que la ruta sea correcta

const AdminHeader = ({ onOpenConfig, onLogout }) => {
    return (
        // 1. El fondo ocupa todo el ancho
        <header className="bg-[#121212] border-b border-white/5 sticky top-0 z-50 backdrop-blur-md bg-opacity-90">
            
            {/* 2. El CONTENIDO respeta el mismo ancho que tu main (1600px) y se centra */}
            <div className="max-w-[1600px] mx-auto px-4 lg:px-6 h-[72px] flex justify-between items-center">
                
                {/* Izquierda: Logo y Marca */}
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full border border-[${GOLD_HEX}]/30 p-0.5`}>
                        <img src={logo} alt="Logo" className="w-full h-full object-cover rounded-full opacity-80" />
                    </div>
                    <div>
                        <h1 className={`font-cinzel text-[${GOLD_HEX}] text-lg tracking-widest leading-none`}>KTM</h1>
                        <span className="text-[0.6rem] text-gray-500 tracking-[0.3em] uppercase block">Barbershop</span>
                    </div>
                </div>

                {/* Derecha: Acciones */}
                <div className="flex items-center gap-4">
                    {/* <button 
                        onClick={onOpenConfig}
                        className="text-gray-400 hover:text-white transition-colors"
                        title="Configuración"
                    >
                        <span className="material-icons">settings</span>
                    </button> */}
                    <button 
                        onClick={onLogout}
                        className="text-gray-400 hover:text-red-400 transition-colors flex items-center gap-1"
                        title="Cerrar Sesión"
                    >
                        <span className="material-icons">logout</span>
                    </button>
                </div>
            </div>
        </header>
    );
};

export default AdminHeader;