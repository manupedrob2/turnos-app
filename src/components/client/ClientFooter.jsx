import React from 'react';
import { GOLD_HEX } from '../../constants';

const ClientFooter = ({ step, horaSeleccionada, onContinue }) => {
    if (step !== 1) return null;

    return (
        <div className={`fixed bottom-0 left-0 w-full p-6 bg-gradient-to-t from-[#050505] via-[#050505]/90 to-transparent pointer-events-none transition-all duration-500 z-50 ${horaSeleccionada ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
             <div className="max-w-[450px] mx-auto pointer-events-auto">
                <button
                    className={`w-full bg-transparent border-2 border-[${GOLD_HEX}] text-[${GOLD_HEX}] text-sm font-extrabold uppercase py-4 rounded-full hover:bg-[${GOLD_HEX}] hover:text-black transition-all tracking-[0.2em] shadow-lg shadow-black/50 flex items-center justify-between px-8`}
                    onClick={onContinue}
                    disabled={!horaSeleccionada}
                >
                    <span>{horaSeleccionada} hs</span>
                    <span>CONTINUAR &rarr;</span>
                </button>
             </div>
        </div>
    );
};

export default ClientFooter;