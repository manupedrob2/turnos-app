import React from 'react';
import logo from '/logo.png'; // Ajusta ruta si es necesario
import { GOLD_HEX } from '../../constants';

const ClientHeader = ({ step, onBack }) => {
    if (step >= 3) return null; // No mostrar en paso final

    return (
        <header className="pt-8 pb-4 px-6 flex flex-col items-center relative shrink-0">
            {step === 2 && (
                <button className="absolute top-8 left-6 text-gray-400 hover:text-white flex items-center gap-1 text-sm transition-colors" onClick={onBack}>
                   <span>←</span> Volver
                </button>
            )}
            <div className={`w-20 h-20 rounded-full border-2 border-[${GOLD_HEX}] p-1 bg-[#0a0a0a] shadow-lg shadow-[${GOLD_HEX}]/10 mb-4`}>
                <img src={logo} alt="KTM" className="w-full h-full rounded-full object-cover"/>
            </div>
            {step === 2 && <h2 className={`font-cinzel text-[${GOLD_HEX}] text-lg tracking-widest`}>TUS DATOS</h2>}
        </header>
    );
};

export default ClientHeader;