import React from 'react';
import logo from '/logo.png'; // Ajusta la ruta si es necesario

const AdminHeader = ({ onOpenConfig, onLogout }) => {
    const GOLD = "#D4AF37";

    return (
        <div className="sticky top-0 z-50 bg-[#141414]/95 backdrop-blur-md border-b border-white/10 px-6 py-4 flex items-center justify-between">
            <div>
                <div className={`font-cinzel text-sm text-[${GOLD}] tracking-widest leading-none`}>KTM</div>
                <div className="text-[0.6rem] text-gray-400 uppercase tracking-wider leading-none mt-0.5">BARBERSHOP</div>
                <h2 className={`font-cinzel text-xl text-[${GOLD}] tracking-widest mt-2`}>DASHBOARD</h2>
            </div>
            <div className="flex gap-4 items-start">
                <button 
                    className={`text-gray-400 hover:text-[${GOLD}] transition-colors`} 
                    onClick={onOpenConfig}
                >
                    <span className="material-icons">settings</span>
                </button>
                <button 
                    className="text-gray-400 hover:text-white transition-colors" 
                    onClick={onLogout}
                >
                    <span className="material-icons">logout</span>
                </button>
            </div>
        </div>
    );
};

export default AdminHeader;