import React from 'react';
import logo from '/logo.png'; // Ajusta la ruta si tu logo está en otra carpeta

const LoginForm = ({ onLogin }) => {
    const GOLD = "#D4AF37";

    return (
        <div className="w-full min-h-screen flex flex-col bg-[#050505] items-center justify-center p-4 relative overflow-hidden min-w-[320px]">
            {/* Efecto de fondo */}
            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[${GOLD}]/10 blur-[120px] rounded-full pointer-events-none`}></div>

            <div className="relative z-10 w-full max-w-sm flex flex-col items-center">
                <div className={`mb-10 p-1 rounded-full bg-gradient-to-b from-[${GOLD}] to-[#8C7024] shadow-[0_0_40px_rgba(212,175,55,0.4)]`}>
                    <div className="bg-[#0a0a0a] rounded-full p-1">
                        <img src={logo} alt="KTM" className={`w-24 h-24 rounded-full border-2 border-[${GOLD}] object-cover`}/>
                    </div>
                </div>

                <h2 className={`font-cinzel text-2xl text-[${GOLD}] text-center mb-10 tracking-[0.2em]`}>ACCESO ADMIN</h2>

                <form onSubmit={onLogin} className="flex flex-col gap-6 w-full">
                    <div>
                        <label className={`block text-[${GOLD}] text-xs uppercase tracking-wider mb-2 ml-2 font-bold`}>Email</label>
                        <input type="email" name="email" required className={`w-full bg-[#0a0a0a] border-2 border-[${GOLD}] rounded-xl p-4 text-[${GOLD}] outline-none font-medium shadow-[0_4px_15px_rgba(212,175,55,0.15)] transition-all placeholder:text-[${GOLD}]/50 focus:shadow-[0_4px_25px_rgba(212,175,55,0.3)]`}/>
                    </div>
                    <div>
                        <label className={`block text-[${GOLD}] text-xs uppercase tracking-wider mb-2 ml-2 font-bold`}>Contraseña</label>
                        <input type="password" name="password" required className={`w-full bg-[#0a0a0a] border-2 border-[${GOLD}] rounded-xl p-4 text-[${GOLD}] outline-none font-medium shadow-[0_4px_15px_rgba(212,175,55,0.15)] transition-all placeholder:text-[${GOLD}]/50 focus:shadow-[0_4px_25px_rgba(212,175,55,0.3)]`}/>
                    </div>
                    <button type="submit" className={`w-full bg-gradient-to-b from-[#D4AF37] to-[#A8862D] text-black font-extrabold text-lg py-4 rounded-xl mt-6 hover:from-[#E2C15B] hover:to-[#BFA34A] transition-all shadow-[0_5px_20px_rgba(212,175,55,0.4)] uppercase tracking-widest relative overflow-hidden`}>
                        INGRESAR
                    </button>
                </form>
            </div>
        </div>
    );
};

export default LoginForm;