import React from 'react';

const AdminMobileNav = ({ activeView, onViewChange, onLogout }) => {
    const GOLD = "#D4AF37";

    return (
        <nav className="lg:hidden fixed bottom-0 left-0 w-full bg-[#121212]/95 backdrop-blur-md border-t border-white/10 py-2 flex justify-around z-50 transition-all duration-300 pb-[env(safe-area-inset-bottom)]">
            {/* Botón Dashboard */}
            <div 
                className={`flex flex-col items-center p-2 transition-colors ${activeView === 'dashboard' ? `text-[${GOLD}]` : 'text-gray-500'}`} 
                onClick={() => onViewChange('dashboard')}
            >
                <span className="material-icons">dashboard</span>
                <span className="text-[0.6rem] uppercase mt-1 tracking-wider">Dashboard</span>
            </div>

            {/* Botón Salir */}
            <div 
                className="flex flex-col items-center p-2 text-gray-500 hover:text-white transition-colors" 
                onClick={onLogout}
            >
                <span className="material-icons">logout</span>
                <span className="text-[0.6rem] uppercase mt-1 tracking-wider">Salir</span>
            </div>
        </nav>
    );
};

export default AdminMobileNav;