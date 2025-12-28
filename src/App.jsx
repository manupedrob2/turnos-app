import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import logo from '/logo.png'; 

const DEFAULT_CONFIG = {
    precio: 10000,
    precio_barba: 4000,
    hora_apertura: "09:00",
    hora_cierre: "19:00",
    intervalo: 40
};

const TELEFONO_BARBERO = "5492392557958"; 

function App() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [session, setSession] = useState(null);
  const [step, setStep] = useState(1);
  const [adminView, setAdminView] = useState('dashboard'); 

  // Datos
  const [globalConfig, setGlobalConfig] = useState(DEFAULT_CONFIG);
  const [generatedSlots, setGeneratedSlots] = useState([]); 
  const [appointments, setAppointments] = useState([]); 
  const [turnosOcupados, setTurnosOcupados] = useState([]); 
  const [turnosDetalles, setTurnosDetalles] = useState({});

  // Modales y Overrides
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showManualModal, setShowManualModal] = useState(false);
  const [showDayModal, setShowDayModal] = useState(false);
  const [dayOverride, setDayOverride] = useState(null);

  // Fechas
  const [selectedDateObj, setSelectedDateObj] = useState(new Date()); 
  const [viewDate, setViewDate] = useState(new Date());
  
  // Datos Turno
  const [horaSeleccionada, setHoraSeleccionada] = useState(null);
  const [formData, setFormData] = useState({ nombre: "", telefono: "", barba: false });

  const daysOfWeek = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá'];
  const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

  // --- INIT ---
  useEffect(() => {
    const handleHashChange = () => setIsAdmin(window.location.hash === '#admin');
    handleHashChange(); 
    window.addEventListener('hashchange', handleHashChange);
    
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => setSession(session));

    fetchGlobalConfig();

    return () => {
        window.removeEventListener('hashchange', handleHashChange);
        subscription.unsubscribe();
    }
  }, []);

  // --- LOGICA ---
  const generateTimeSlots = (startConf, endConf) => {
      const slots = [];
      const [startH, startM] = startConf.split(':').map(Number);
      const [endH, endM] = endConf.split(':').map(Number);
      let current = new Date(); current.setHours(startH, startM, 0, 0);
      const end = new Date(); end.setHours(endH, endM, 0, 0);
      while (current <= end) { 
          const h = current.getHours().toString().padStart(2, '0');
          const m = current.getMinutes().toString().padStart(2, '0');
          slots.push(`${h}:${m}`);
          current.setMinutes(current.getMinutes() + globalConfig.intervalo);
      }
      if (!slots.includes("19:20")) slots.push("19:20");
      return slots;
  };

  const fetchGlobalConfig = async () => {
      const { data } = await supabase.from('configuracion').select('*').maybeSingle();
      if (data) setGlobalConfig({ precio: data.precio, precio_barba: data.precio_barba || 4000, hora_apertura: data.hora_apertura, hora_cierre: data.hora_cierre, intervalo: data.intervalo_minutos || 40 });
  };

  const fetchTurnos = async (date) => {
      const fechaString = date.toISOString().split('T')[0];
      const { data: specialDay } = await supabase.from('dias_especiales').select('*').eq('fecha', fechaString).maybeSingle();
      setDayOverride(specialDay);
      let start = globalConfig.hora_apertura; let end = globalConfig.hora_cierre;
      if (specialDay) {
          if (specialDay.es_feriado) setGeneratedSlots([]);
          else { start = specialDay.hora_apertura; end = specialDay.hora_cierre; setGeneratedSlots(generateTimeSlots(start, end)); }
      } else { setGeneratedSlots(generateTimeSlots(start, end)); }

      const { data, error } = await supabase.from('turnos').select('*').eq('fecha', fechaString).order('hora', { ascending: true });
      if (error) console.error(error);
      else { setAppointments(data); const detalles = {}; data.forEach(t => { detalles[t.hora] = t; }); setTurnosDetalles(detalles); setTurnosOcupados(data.map(t => t.hora)); }
  };

  useEffect(() => { fetchTurnos(selectedDateObj); }, [selectedDateObj, globalConfig]);

  // --- HANDLERS ---
  const handleToggleBlock = async (time, isBlocked, isReserved, id) => {
      const fechaString = selectedDateObj.toISOString().split('T')[0];
      if (isReserved) { if (!window.confirm("¿Cancelar turno de cliente?")) return; await supabase.from('turnos').delete().eq('id', id); }
      else if (isBlocked) { await supabase.from('turnos').delete().eq('id', id); }
      else { await supabase.from('turnos').insert([{ fecha: fechaString, hora: time, cliente_nombre: "BLOQUEADO", cliente_telefono: "" }]); }
      fetchTurnos(selectedDateObj);
  };

  const handleSaveGlobalConfig = async (e) => {
      e.preventDefault();
      const newConfig = { precio: parseInt(e.target.precio.value), precio_barba: parseInt(e.target.precio_barba.value), hora_apertura: e.target.apertura.value, hora_cierre: e.target.cierre.value };
      const { error } = await supabase.from('configuracion').update(newConfig).gt('id', 0); 
      if (!error) { setGlobalConfig({...globalConfig, ...newConfig}); setShowConfigModal(false); alert("Guardado"); } else { alert("Error: " + error.message); }
  };

  const handleSaveDayOverride = async (e) => {
      e.preventDefault();
      const fechaString = selectedDateObj.toISOString().split('T')[0];
      const overrideData = { fecha: fechaString, hora_apertura: e.target.apertura.value, hora_cierre: e.target.cierre.value, es_feriado: e.target.cerrado.checked };
      const { error } = await supabase.from('dias_especiales').upsert(overrideData);
      if (!error) { fetchTurnos(selectedDateObj); setShowDayModal(false); }
  };

  const handleManualSubmit = async (e) => {
      e.preventDefault();
      const fechaString = selectedDateObj.toISOString().split('T')[0];
      const { error } = await supabase.from('turnos').insert([{ fecha: fechaString, hora: e.target.hora.value, cliente_nombre: e.target.nombre.value, cliente_telefono: e.target.telefono.value }]);
      if (!error) { fetchTurnos(selectedDateObj); setShowManualModal(false); }
  };

  const handleInputChange = (e) => { const { name, value, type, checked } = e.target; setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value })); };
  const handleLogin = async (e) => { e.preventDefault(); const { error } = await supabase.auth.signInWithPassword({ email: e.target.email.value, password: e.target.password.value }); if (error) alert("Error: " + error.message); };
  const handleLogout = async () => { await supabase.auth.signOut(); setIsAdmin(false); window.location.hash = ''; setAdminView('dashboard'); };

  const handleConfirmar = async (e) => {
    e.preventDefault();
    const fechaString = selectedDateObj.toISOString().split('T')[0];
    let nombreFinal = formData.nombre;
    if (formData.barba) nombreFinal += " (+ Barba)";
    const { error } = await supabase.from('turnos').insert([{ fecha: fechaString, hora: horaSeleccionada, cliente_nombre: nombreFinal, cliente_telefono: formData.telefono }]);
    if (error) alert("Error: " + error.message); else { await fetchTurnos(selectedDateObj); setStep(3); }
  };

  const handleWhatsAppClick = () => {
    let nombreMensaje = formData.nombre;
    if (formData.barba) nombreMensaje += " (Con Barba)";
    const fechaTexto = new Intl.DateTimeFormat('es-AR', { weekday: 'long', day: 'numeric', month: 'long' }).format(selectedDateObj);
    const mensaje = `Hola! Soy *${nombreMensaje}*. Turno: *${fechaTexto}* a las *${horaSeleccionada} hs*.`;
    window.open(`https://wa.me/${TELEFONO_BARBERO}?text=${encodeURIComponent(mensaje)}`, '_blank');
  };

  const resetApp = () => { setStep(1); setHoraSeleccionada(null); setFormData({ nombre: "", telefono: "", barba: false }); fetchTurnos(selectedDateObj); };

  // --- HELPERS ---
  const getDaysInMonth = (d) => new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (d) => new Date(d.getFullYear(), d.getMonth(), 1).getDay();
  const changeMonth = (i) => { const d = new Date(viewDate); d.setMonth(d.getMonth() + i); setViewDate(d); };
  const handleDayClick = (day) => { const d = new Date(viewDate.getFullYear(), viewDate.getMonth(), day); setSelectedDateObj(d); setHoraSeleccionada(null); };
  const handleAdminDaySelect = (day) => { const d = new Date(viewDate.getFullYear(), viewDate.getMonth(), day); setSelectedDateObj(d); };
  
  const isToday = (d) => d.getDate() === new Date().getDate() && d.getMonth() === new Date().getMonth();
  const isSelectedDate = (d) => d.getDate() === selectedDateObj.getDate() && d.getMonth() === selectedDateObj.getMonth();

  // --- RENDERERS ---
  const renderHeader = () => (
    <header className="flex justify-center p-4 lg:p-6 bg-[#0f0f0f]/95 backdrop-blur-md sticky top-0 z-10 shrink-0">
        <img src={logo} alt="KTM" className="w-16 h-16 lg:w-20 lg:h-20 rounded-full object-cover border-2 border-[#D4AF37] p-0.5 bg-[#141414] shadow-[0_0_20px_rgba(212,175,55,0.2)]"/>
    </header>
  );

  const renderMonthCalendar = (isAdminContext = false) => {
    const daysInMonth = getDaysInMonth(viewDate);
    const firstDay = getFirstDayOfMonth(viewDate);
    const blanks = Array(firstDay).fill(null);
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    
    return (
      <div className={`bg-[#1A1A1A] border border-white/10 rounded-2xl p-3 lg:p-4 shadow-lg w-full ${isAdminContext ? '' : 'mb-4'}`}>
        <div className="flex justify-between items-center mb-3">
          <button className="w-7 h-7 flex items-center justify-center rounded-full border border-white/10 text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black transition-all" onClick={() => changeMonth(-1)}>&#8249;</button>
          <h3 className="font-['Cinzel'] text-sm text-white uppercase tracking-wider">{months[viewDate.getMonth()]} {viewDate.getFullYear()}</h3>
          <button className="w-7 h-7 flex items-center justify-center rounded-full border border-white/10 text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black transition-all" onClick={() => changeMonth(1)}>&#8250;</button>
        </div>
        <div className="grid grid-cols-7 text-center mb-2">
            {daysOfWeek.map(d => <span key={d} className="text-[0.6rem] font-bold text-gray-500 uppercase">{d}</span>)}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {blanks.map((_, i) => <div key={`blank-${i}`} className="aspect-square"></div>)}
          {days.map(day => {
              const currentDayDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
              const isPastDate = (() => { const t = new Date(); t.setHours(0,0,0,0); return currentDayDate < t; })();
              const isSelectedDay = isSelectedDate(currentDayDate);
              
              let btnClass = "w-7 h-7 lg:w-8 lg:h-8 mx-auto flex items-center justify-center rounded-full text-xs transition-all duration-200 ";
              if (isSelectedDay) btnClass += "bg-[#D4AF37] text-black font-bold shadow-[0_0_10px_rgba(212,175,55,0.4)] scale-110";
              else if (isToday(currentDayDate)) btnClass += "border border-[#D4AF37] text-[#D4AF37]";
              else if (!isPastDate || isAdminContext) btnClass += "text-gray-300 hover:bg-[#252525] hover:text-white";
              else btnClass += "text-gray-700 cursor-default";

              return (
                <button key={day} className={btnClass} disabled={!isAdminContext && isPastDate} onClick={() => isAdminContext ? handleAdminDaySelect(day) : handleDayClick(day)}>{day}</button>
              );
          })}
        </div>
      </div>
    );
  };

  // --- VISTA ADMIN ---
  if (isAdmin) {
    if (!session) {
      return (
        <div className="w-full min-h-screen flex flex-col bg-[#050505] items-center justify-center p-4">
           <div className="bg-[#1A1A1A] border border-white/10 rounded-2xl p-8 shadow-2xl w-full max-w-sm">
             <div className="flex justify-center mb-6"><img src={logo} alt="KTM" className="w-20 h-20 rounded-full border-2 border-[#D4AF37]"/></div>
             <h2 className="font-['Cinzel'] text-xl text-[#D4AF37] text-center mb-6 tracking-wide">Acceso Admin</h2>
             <form onSubmit={handleLogin} className="flex flex-col gap-4">
               <div><label className="block text-gray-500 text-xs uppercase tracking-wider mb-1">Email</label><input type="email" name="email" required className="w-full bg-[#141414] border border-white/10 rounded-lg p-3 text-white outline-none focus:border-[#D4AF37] transition-all"/></div>
               <div><label className="block text-gray-500 text-xs uppercase tracking-wider mb-1">Contraseña</label><input type="password" name="password" required className="w-full bg-[#141414] border border-white/10 rounded-lg p-3 text-white outline-none focus:border-[#D4AF37] transition-all"/></div>
               <button type="submit" className="w-full bg-[#D4AF37] text-black font-bold py-3 rounded-lg mt-2 hover:bg-[#F3C645] transition-colors">INGRESAR</button>
             </form>
           </div>
        </div>
      );
    }

    const turnosReales = Object.values(turnosDetalles).filter(t => t.cliente_nombre !== "BLOQUEADO");
    const totalTurnos = turnosReales.length;
    const ingresosEstimados = totalTurnos * globalConfig.precio;

    return (
      <div className="min-h-screen bg-[#050505] text-white font-['Lato'] selection:bg-[#D4AF37] selection:text-black flex flex-col h-screen overflow-hidden">
        {/* Admin Header */}
        <div className="bg-[#141414]/95 backdrop-blur-md border-b border-white/10 px-4 py-3 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
                <img src={logo} alt="KTM" className="w-8 h-8 rounded-full border border-[#D4AF37] object-cover"/>
                <h2 className="font-['Cinzel'] text-base md:text-lg text-[#D4AF37]">DASHBOARD</h2>
            </div>
            <div className="flex gap-4">
                <button className="text-gray-400 hover:text-[#D4AF37] transition-colors" onClick={() => setShowConfigModal(true)}><span className="material-icons">settings</span></button>
                <button className="text-gray-400 hover:text-white transition-colors" onClick={handleLogout}><span className="material-icons">logout</span></button>
            </div>
        </div>
        
        {/* Main Admin Content - Split Layout & Scrollable */}
        <main className="flex-1 overflow-hidden p-4 lg:p-6 max-w-[1920px] mx-auto w-full grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6 items-start">
            
            {/* LEFT COLUMN: Fixed Sidebar (Scrollable on mobile only if needed) */}
            <div className="flex flex-col gap-4 overflow-y-auto max-h-full lg:sticky lg:top-0 lg:pr-2">
                <div>
                    <div className="font-['Cinzel'] text-[#D4AF37] text-xs tracking-widest uppercase mb-2 border-l-2 border-[#D4AF37] pl-2">Calendario</div>
                    {renderMonthCalendar(true)}
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-[#1A1A1A] border border-white/10 rounded-xl p-3 flex flex-col justify-center text-center">
                        <div className="text-gray-500 text-[0.6rem] uppercase tracking-widest mb-1">Ingresos</div>
                        <div className="text-lg font-bold text-white font-['Cinzel']">${ingresosEstimados.toLocaleString()}</div>
                    </div>
                    <div className="bg-[#1A1A1A] border border-white/10 rounded-xl p-3 flex flex-col justify-center text-center">
                        <div className="text-gray-500 text-[0.6rem] uppercase tracking-widest mb-1">Clientes</div>
                        <div className="text-lg font-bold text-white font-['Cinzel']">{totalTurnos}</div>
                    </div>
                </div>
                
                <button className="w-full bg-[#1A1A1A] border border-white/10 hover:border-[#D4AF37] text-gray-400 hover:text-[#D4AF37] py-2.5 rounded-xl transition-all text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2" onClick={() => setShowDayModal(true)}>
                    <span className="material-icons text-sm">edit_calendar</span> Opciones del Día
                </button>
            </div>

            {/* RIGHT COLUMN: Scrollable Content */}
            <div className="flex flex-col h-full overflow-hidden">
                <div className="flex justify-between items-center mb-4 bg-[#141414] p-3 rounded-xl border border-white/5 shrink-0">
                    <div>
                        <div className="text-gray-500 text-[0.65rem] uppercase tracking-wider mb-0.5">Vista del día</div>
                        <div className="font-['Cinzel'] text-lg text-white leading-none">
                            {new Intl.DateTimeFormat('es-AR', { weekday: 'long', day: 'numeric', month: 'long' }).format(selectedDateObj)}
                        </div>
                    </div>
                    <button 
                        className="bg-[#D4AF37] text-black px-4 py-2 rounded-lg text-[0.7rem] font-bold uppercase hover:bg-[#F3C645] transition-colors shadow-[0_0_15px_rgba(212,175,55,0.2)] flex items-center gap-2" 
                        onClick={() => setShowManualModal(true)}
                    >
                        <span className="material-icons text-sm">add</span> Turno Manual
                    </button>
                </div>
                
                {/* Scrollable Grid */}
                <div className="overflow-y-auto flex-1 pr-1 pb-20 lg:pb-0">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3">
                        {generatedSlots.map((time, index) => {
                            const detalle = turnosDetalles[time];
                            const isBlocked = detalle?.cliente_nombre === "BLOQUEADO";
                            const isReserved = detalle && !isBlocked;
                            const isFree = !detalle;
                            
                            const statusColor = isFree ? "text-[#10B981]" : (isBlocked ? "text-[#EF4444]" : "text-[#D4AF37]");
                            const borderColor = isFree ? "border-[#10B981]/20 hover:border-[#10B981]" : (isBlocked ? "border-[#EF4444]/20 hover:border-[#EF4444]" : "border-[#D4AF37]/20 hover:border-[#D4AF37]");
                            const bgHover = isFree ? "hover:bg-[#10B981]/5" : (isBlocked ? "hover:bg-[#EF4444]/5" : "hover:bg-[#D4AF37]/5");

                            return (
                                <div key={index} className={`bg-[#1A1A1A] border ${borderColor} ${bgHover} rounded-xl p-4 transition-all duration-200 group relative flex flex-col min-h-[120px]`}>
                                    <div className="flex justify-between items-start mb-2">
                                        <span className={`font-['Cinzel'] text-xl font-bold ${statusColor}`}>{time}</span>
                                        {isReserved && <a href={`https://wa.me/${detalle.cliente_telefono}`} target="_blank" className="text-gray-500 hover:text-white transition-colors" title="Contactar"><span className="material-icons text-sm">whatsapp</span></a>}
                                    </div>
                                    
                                    <div className="flex-1">
                                        <div className="text-sm font-medium text-white truncate">
                                            {isReserved ? detalle.cliente_nombre : (isBlocked ? "BLOQUEADO" : "Disponible")}
                                        </div>
                                        {isReserved && <div className="text-xs text-gray-500 mt-0.5 truncate">{detalle.cliente_telefono}</div>}
                                    </div>

                                    <div className="mt-3 pt-2 border-t border-white/5 flex justify-end">
                                        <button 
                                            className={`text-[0.6rem] font-bold uppercase tracking-wider py-1 px-2.5 rounded border transition-colors ${isFree ? 'text-[#10B981] border-[#10B981]/30 hover:bg-[#10B981] hover:text-black' : (isBlocked ? 'text-[#EF4444] border-[#EF4444]/30 hover:bg-[#EF4444] hover:text-white' : 'text-gray-400 border-gray-700 hover:border-white hover:text-white')}`}
                                            onClick={() => handleToggleBlock(time, isBlocked, isReserved, detalle?.id)}
                                        >
                                            {isFree ? "Bloquear" : (isBlocked ? "Desbloquear" : "Cancelar")}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </main>

        {/* MODALES CONFIG */}
        {showConfigModal && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                <div className="bg-[#101010] border border-[#D4AF37]/30 p-6 rounded-2xl w-full max-w-sm shadow-[0_0_50px_rgba(0,0,0,0.8)] animate-[fadeIn_0.2s_ease-out]">
                    <h3 className="font-['Cinzel'] text-[#D4AF37] text-center text-lg mb-6">Configuración</h3>
                    <form onSubmit={handleSaveGlobalConfig} className="flex flex-col gap-4">
                        <div><label className="text-xs text-gray-500 uppercase ml-1">Corte + Cejas</label><input type="number" name="precio" defaultValue={globalConfig.precio} className="w-full bg-[#1A1A1A] border border-white/10 rounded-lg p-3 text-white outline-none focus:border-[#D4AF37]"/></div>
                        <div><label className="text-xs text-gray-500 uppercase ml-1">Corte Barba</label><input type="number" name="precio_barba" defaultValue={globalConfig.precio_barba} className="w-full bg-[#1A1A1A] border border-white/10 rounded-lg p-3 text-white outline-none focus:border-[#D4AF37]"/></div>
                        <div className="grid grid-cols-2 gap-3">
                            <div><label className="text-xs text-gray-500 uppercase ml-1">Apertura</label><input type="time" name="apertura" defaultValue={globalConfig.hora_apertura} className="w-full bg-[#1A1A1A] border border-white/10 rounded-lg p-3 text-white"/></div>
                            <div><label className="text-xs text-gray-500 uppercase ml-1">Cierre</label><input type="time" name="cierre" defaultValue={globalConfig.hora_cierre} className="w-full bg-[#1A1A1A] border border-white/10 rounded-lg p-3 text-white"/></div>
                        </div>
                        <div className="grid grid-cols-2 gap-3 mt-2">
                            <button type="button" className="bg-transparent border border-white/10 text-gray-400 py-2.5 rounded-lg hover:text-white" onClick={() => setShowConfigModal(false)}>Cancelar</button>
                            <button type="submit" className="bg-[#D4AF37] text-black font-bold py-2.5 rounded-lg hover:bg-[#F3C645]">Guardar</button>
                        </div>
                    </form>
                </div>
            </div>
        )}

        {showDayModal && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                <div className="bg-[#101010] border border-[#D4AF37]/30 p-6 rounded-2xl w-full max-w-sm shadow-[0_0_50px_rgba(0,0,0,0.8)] animate-[fadeIn_0.2s_ease-out]">
                    <h3 className="font-['Cinzel'] text-[#D4AF37] text-center text-lg mb-6">Día: {new Intl.DateTimeFormat('es-AR', { day: 'numeric', month: 'numeric' }).format(selectedDateObj)}</h3>
                    <form onSubmit={handleSaveDayOverride} className="flex flex-col gap-4">
                        <label className="flex items-center gap-3 cursor-pointer p-3 bg-[#1A1A1A] rounded-lg border border-white/5"><input type="checkbox" name="cerrado" defaultChecked={dayOverride?.es_feriado} className="accent-[#D4AF37] w-5 h-5"/> <span className="text-sm font-bold text-gray-300">Cerrar todo el día</span></label>
                        <div className="grid grid-cols-2 gap-3">
                            <div><label className="text-xs text-gray-500 uppercase ml-1">Apertura</label><input type="time" name="apertura" defaultValue={dayOverride?.hora_apertura || globalConfig.hora_apertura} className="w-full bg-[#1A1A1A] border border-white/10 rounded-lg p-3 text-white"/></div>
                            <div><label className="text-xs text-gray-500 uppercase ml-1">Cierre</label><input type="time" name="cierre" defaultValue={dayOverride?.hora_cierre || globalConfig.hora_cierre} className="w-full bg-[#1A1A1A] border border-white/10 rounded-lg p-3 text-white"/></div>
                        </div>
                        <div className="grid grid-cols-2 gap-3 mt-2">
                            <button type="button" className="bg-transparent border border-white/10 text-gray-400 py-2.5 rounded-lg hover:text-white" onClick={() => setShowDayModal(false)}>Cancelar</button>
                            <button type="submit" className="bg-[#D4AF37] text-black font-bold py-2.5 rounded-lg hover:bg-[#F3C645]">Aplicar</button>
                        </div>
                    </form>
                </div>
            </div>
        )}

        {showManualModal && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                <div className="bg-[#101010] border border-[#D4AF37]/30 p-6 rounded-2xl w-full max-w-sm shadow-[0_0_50px_rgba(0,0,0,0.8)] animate-[fadeIn_0.2s_ease-out]">
                    <h3 className="font-['Cinzel'] text-[#D4AF37] text-center text-lg mb-6">Nuevo Turno</h3>
                    <form onSubmit={handleManualSubmit} className="flex flex-col gap-4">
                        <div><label className="text-xs text-gray-500 uppercase ml-1">Hora</label><input type="time" name="hora" required className="w-full bg-[#1A1A1A] border border-white/10 rounded-lg p-3 text-white outline-none focus:border-[#D4AF37]"/></div>
                        <div><label className="text-xs text-gray-500 uppercase ml-1">Cliente</label><input type="text" name="nombre" placeholder="Nombre" required className="w-full bg-[#1A1A1A] border border-white/10 rounded-lg p-3 text-white outline-none focus:border-[#D4AF37]"/></div>
                        <div><label className="text-xs text-gray-500 uppercase ml-1">Teléfono</label><input type="tel" name="telefono" placeholder="WhatsApp" required className="w-full bg-[#1A1A1A] border border-white/10 rounded-lg p-3 text-white outline-none focus:border-[#D4AF37]"/></div>
                        <div className="grid grid-cols-2 gap-3 mt-2">
                            <button type="button" className="bg-transparent border border-white/10 text-gray-400 py-2.5 rounded-lg hover:text-white" onClick={() => setShowManualModal(false)}>Cancelar</button>
                            <button type="submit" className="bg-[#D4AF37] text-black font-bold py-2.5 rounded-lg hover:bg-[#F3C645]">Crear</button>
                        </div>
                    </form>
                </div>
            </div>
        )}

        <nav className="fixed bottom-0 left-0 w-full h-[60px] bg-[#0F0F0F]/98 backdrop-blur-md border-t border-white/10 flex justify-around items-center z-[900] lg:hidden pb-[env(safe-area-inset-bottom)]">
            <div className={`flex flex-col items-center justify-center flex-1 h-full cursor-pointer text-[0.6rem] transition-colors ${adminView === 'dashboard' ? 'text-[#D4AF37]' : 'text-gray-500'}`} onClick={() => setAdminView('dashboard')}>
                <span className="material-icons text-xl mb-0.5">dashboard</span><span>Dashboard</span>
            </div>
             <div className="flex flex-col items-center justify-center flex-1 h-full cursor-pointer text-[0.6rem] text-gray-500" onClick={handleLogout}>
                <span className="material-icons text-xl mb-0.5">logout</span><span>Salir</span>
            </div>
        </nav>
      </div>
    );
  }

  // --- VISTA CLIENTE ---
  const totalCliente = parseInt(globalConfig.precio) + (formData.barba ? parseInt(globalConfig.precio_barba) : 0);

  return (
    <div className="w-full min-h-screen bg-[#050505] flex justify-center items-start lg:py-8 lg:items-center">
        <div className="w-full max-w-[420px] lg:max-w-[750px] bg-[#0a0a0a] min-h-screen lg:min-h-0 lg:h-auto lg:rounded-[30px] lg:border lg:border-white/10 lg:shadow-[0_0_60px_rgba(0,0,0,0.6)] flex flex-col pb-24 relative overflow-hidden transition-all duration-300">
            
            {/* Header Cliente */}
            <header className="flex justify-center p-5 bg-gradient-to-b from-[#141414] to-transparent sticky top-0 z-10 shrink-0">
                <img src={logo} alt="KTM" className="w-20 h-20 rounded-full object-cover border-2 border-[#D4AF37] p-1 bg-[#0a0a0a] shadow-[0_0_20px_rgba(212,175,55,0.2)]"/>
            </header>

            {step === 2 && <button className="absolute top-6 left-6 text-gray-400 hover:text-white text-sm font-medium z-20" onClick={() => setStep(1)}>← Volver</button>}
            
            {step === 1 && (
                <main className="px-5 pb-6 animate-[fadeIn_0.4s_ease-out] lg:grid lg:grid-cols-[280px_1fr] lg:gap-8 lg:items-start lg:px-8">
                    <div className="lg:border-r lg:border-white/10 lg:pr-6">
                        <div className="font-['Cinzel'] text-[#D4AF37] text-xs tracking-[0.2em] uppercase mb-4 pl-2 border-l-2 border-[#D4AF37]">Selecciona fecha</div>
                        {renderMonthCalendar(false)}
                    </div>
                    
                    <div>
                        <div className="font-['Cinzel'] text-[#D4AF37] text-xs tracking-[0.2em] uppercase mb-4 mt-8 lg:mt-0 pl-2 border-l-2 border-[#D4AF37]">Horarios Disponibles</div>
                        {generatedSlots.length === 0 ? (
                            <div className="text-center py-10 text-gray-500 border border-white/10 rounded-xl bg-[#141414] italic">Cerrado</div>
                        ) : (
                            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-3 gap-3">
                                {generatedSlots.map((time, index) => {
                                const isOccupied = turnosOcupados.includes(time);
                                const isSelected = horaSeleccionada === time;
                                let btnClass = "py-3 rounded-lg text-sm font-medium transition-all border border-white/5 ";
                                if (isOccupied) btnClass += "text-gray-600 line-through cursor-not-allowed";
                                else if (isSelected) btnClass += "bg-[#D4AF37] text-black border-[#D4AF37] font-bold shadow-[0_0_15px_rgba(212,175,55,0.3)] scale-[1.02]";
                                else btnClass += "bg-[#141414] text-gray-200 hover:border-[#D4AF37] hover:text-white";

                                return (
                                    <button key={index} disabled={isOccupied} className={btnClass} onClick={() => setHoraSeleccionada(time)}>{time}</button>
                                );
                                })}
                            </div>
                        )}
                    </div>
                </main>
            )}

            {step === 2 && (
                <main className="px-6 animate-[fadeIn_0.4s_ease-out] lg:px-12 flex flex-col justify-center h-full">
                    <h2 className="font-['Cinzel'] text-[#D4AF37] text-lg text-center mb-4">TUS DATOS</h2>
                    <div className="bg-[#141414] border border-white/10 p-4 rounded-xl mb-5">
                        <h3 className="text-[0.6rem] text-gray-500 uppercase tracking-widest font-bold mb-3 border-b border-white/5 pb-2">Resumen de Reserva</h3>
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center text-gray-300 text-sm"><span className="w-6 text-center mr-3 text-lg">📅</span> {new Intl.DateTimeFormat('es-AR', { weekday: 'long', day: 'numeric', month: 'long' }).format(selectedDateObj)}</div>
                            <div className="flex items-center text-gray-300 text-sm"><span className="w-6 text-center mr-3 text-lg">⏰</span> {horaSeleccionada} hs</div>
                            <div className="flex items-center text-gray-300 text-sm"><span className="w-6 text-center mr-3 text-lg">📍</span> Calle 55 553 entre 6 y 7</div>
                            {formData.barba && <div className="flex items-center text-gray-300 text-sm"><span className="w-6 text-center mr-3 text-lg">🧔🏻‍♂️</span> Adicional Barba</div>}
                        </div>
                        <div className="mt-3 pt-2 border-t border-white/10 flex justify-between items-center">
                            <span className="text-gray-400 text-xs uppercase">Total a pagar</span>
                            <span className="text-[#D4AF37] text-lg font-bold font-['Cinzel']">${totalCliente}</span>
                        </div>
                    </div>

                    <form onSubmit={handleConfirmar} className="flex flex-col gap-3">
                        <div><label className="text-xs text-gray-500 uppercase ml-1 mb-1 block">Nombre</label><input type="text" name="nombre" value={formData.nombre} onChange={handleInputChange} required className="w-full bg-[#141414] border border-white/10 rounded-lg p-3 text-white outline-none focus:border-[#D4AF37]"/></div>
                        <div><label className="text-xs text-gray-500 uppercase ml-1 mb-1 block">WhatsApp</label><input type="tel" name="telefono" value={formData.telefono} onChange={handleInputChange} required className="w-full bg-[#141414] border border-white/10 rounded-lg p-3 text-white outline-none focus:border-[#D4AF37]"/></div>
                        
                        <label className="flex items-center gap-3 p-3 bg-[#141414] border border-white/5 rounded-lg cursor-pointer hover:bg-white/5 transition-colors my-1">
                            <input type="checkbox" name="barba" checked={formData.barba} onChange={handleInputChange} className="w-5 h-5 accent-[#D4AF37]"/>
                            <span className="text-gray-300 text-sm">Agregar Barba (+${globalConfig.precio_barba})</span>
                        </label>

                        <button type="submit" className="w-full bg-[#D4AF37] text-black font-extrabold text-base py-3.5 rounded-xl mt-1 uppercase tracking-wide hover:bg-[#F3C645] transition-colors shadow-[0_5px_20px_rgba(212,175,55,0.2)]">Confirmar Reserva</button>
                    </form>
                </main>
            )}

            {step === 3 && (
                <main className="flex flex-col items-center justify-center h-full px-8 text-center animate-[fadeIn_0.4s_ease-out] flex-grow py-10">
                    <div className="w-20 h-20 rounded-full border-2 border-[#10B981] bg-[#10B981]/10 flex items-center justify-center mb-6 text-4xl text-[#10B981]">✔</div>
                    <h2 className="font-['Cinzel'] text-white text-xl mb-2">¡Reserva Confirmada!</h2>
                    <p className="text-gray-400 text-sm mb-8 leading-relaxed">Para finalizar el proceso, por favor envía la confirmación al barbero.</p>
                    <button 
                        className="w-full bg-[#25D366] text-black font-extrabold text-sm py-4 rounded-xl flex items-center justify-center gap-2 uppercase hover:bg-[#1DA851] transition-colors shadow-[0_5px_15px_rgba(37,211,102,0.2)] mb-3" 
                        onClick={() => { handleWhatsAppClick(); resetApp(); }}
                    >
                        Enviar Confirmación 
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16"><path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.099-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z"/></svg>
                    </button>
                    <button className="text-gray-500 text-xs uppercase tracking-wider hover:text-white mt-4" onClick={resetApp}>Volver al inicio</button>
                </main>
            )}

            {/* Footer flotante solo en step 1 cuando hay hora seleccionada */}
            <div className={`fixed bottom-5 left-5 right-5 lg:absolute lg:left-1/2 lg:-translate-x-1/2 lg:bottom-8 lg:w-auto lg:min-w-[400px] bg-[#141414]/95 backdrop-blur-md border border-[#D4AF37] rounded-full py-4 px-6 flex justify-between items-center gap-5 z-[100] shadow-[0_10px_30px_rgba(0,0,0,0.5)] transition-all duration-500 cubic-bezier(0.175, 0.885, 0.32, 1.275) ${horaSeleccionada && step === 1 ? 'translate-y-0 opacity-100 pointer-events-auto' : 'translate-y-[150%] opacity-0 pointer-events-none'}`}>
                <div className="flex flex-col pl-2">
                    <span className="text-[0.65rem] text-gray-400 uppercase tracking-wider">{new Intl.DateTimeFormat('es-AR', { day: 'numeric', month: 'short' }).format(selectedDateObj)}</span>
                    <strong className="text-[#D4AF37] font-bold text-lg leading-none">{horaSeleccionada || '--:--'} hs</strong>
                </div>
                <button className="bg-[#D4AF37] text-black text-xs font-extrabold uppercase py-2.5 px-6 rounded-full hover:bg-[#F3C645]" onClick={() => setStep(2)}>Continuar</button>
            </div>
        </div>
    </div>
  );
}

export default App;