import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import './App.css';
import logo from '/logo.png'; 

// CONFIGURACIÓN DEFAULT
const DEFAULT_CONFIG = {
    precio: 10000,       // PRECIO BASE (Corte + Cejas)
    precio_barba: 4000,  // PRECIO ADICIONAL (Barba)
    hora_apertura: "09:00",
    hora_cierre: "19:00", 
    intervalo: 40
};

// CONSTANTE TELEFONO
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

  // Modales
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showManualModal, setShowManualModal] = useState(false);
  const [showDayModal, setShowDayModal] = useState(false);
  const [dayOverride, setDayOverride] = useState(null);

  // Fechas
  const [selectedDateObj, setSelectedDateObj] = useState(new Date()); 
  const [viewDate, setViewDate] = useState(new Date());
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
      const d = new Date();
      const dDay = d.getDay(); 
      const diff = d.getDate() - dDay; 
      return new Date(d.setDate(diff)); 
  });

  // Datos Turno Cliente
  const [horaSeleccionada, setHoraSeleccionada] = useState(null);
  const [formData, setFormData] = useState({ 
      nombre: "", 
      telefono: "", 
      barba: false 
  });

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

  // --- LOGICA HORARIOS ---
  const generateTimeSlots = (startConf, endConf) => {
      const slots = [];
      const [startH, startM] = startConf.split(':').map(Number);
      const [endH, endM] = endConf.split(':').map(Number);
      
      let current = new Date();
      current.setHours(startH, startM, 0, 0);
      const end = new Date();
      end.setHours(endH, endM, 0, 0);

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
      if (data) {
          setGlobalConfig({
              precio: data.precio,
              precio_barba: data.precio_barba || 4000,
              hora_apertura: data.hora_apertura,
              hora_cierre: data.hora_cierre,
              intervalo: data.intervalo_minutos || 40
          });
      }
  };

  const fetchTurnos = async (date) => {
      const fechaString = date.toISOString().split('T')[0];
      
      const { data: specialDay } = await supabase.from('dias_especiales').select('*').eq('fecha', fechaString).maybeSingle();
      setDayOverride(specialDay);

      let start = globalConfig.hora_apertura;
      let end = globalConfig.hora_cierre;
      
      if (specialDay) {
          if (specialDay.es_feriado) {
              setGeneratedSlots([]);
          } else {
              start = specialDay.hora_apertura;
              end = specialDay.hora_cierre;
              setGeneratedSlots(generateTimeSlots(start, end));
          }
      } else {
          setGeneratedSlots(generateTimeSlots(start, end));
      }

      const { data, error } = await supabase
        .from('turnos')
        .select('*')
        .eq('fecha', fechaString)
        .order('hora', { ascending: true });

      if (error) console.error(error);
      else {
          setAppointments(data);
          const detalles = {};
          data.forEach(t => { detalles[t.hora] = t; });
          setTurnosDetalles(detalles);
          setTurnosOcupados(data.map(t => t.hora));
      }
  };

  useEffect(() => { fetchTurnos(selectedDateObj); }, [selectedDateObj, globalConfig]);

  // --- HANDLERS ADMIN ---
  const handleToggleBlock = async (time, isBlocked, isReserved, id) => {
      const fechaString = selectedDateObj.toISOString().split('T')[0];
      if (isReserved) {
          if (!window.confirm("¿Cancelar turno de cliente?")) return;
          await supabase.from('turnos').delete().eq('id', id);
      } else if (isBlocked) {
          await supabase.from('turnos').delete().eq('id', id);
      } else {
          await supabase.from('turnos').insert([{ fecha: fechaString, hora: time, cliente_nombre: "BLOQUEADO", cliente_telefono: "" }]);
      }
      fetchTurnos(selectedDateObj);
  };

  const handleSaveGlobalConfig = async (e) => {
      e.preventDefault();
      const newConfig = {
          precio: parseInt(e.target.precio.value), 
          precio_barba: parseInt(e.target.precio_barba.value),
          hora_apertura: e.target.apertura.value,
          hora_cierre: e.target.cierre.value
      };
      const { error } = await supabase.from('configuracion').update(newConfig).gt('id', 0); 
      if (!error) {
          setGlobalConfig({...globalConfig, ...newConfig});
          setShowConfigModal(false);
          alert("Configuración guardada correctamente");
      } else {
          alert("Error al guardar: " + error.message);
      }
  };

  const handleSaveDayOverride = async (e) => {
      e.preventDefault();
      const fechaString = selectedDateObj.toISOString().split('T')[0];
      const overrideData = {
          fecha: fechaString,
          hora_apertura: e.target.apertura.value,
          hora_cierre: e.target.cierre.value,
          es_feriado: e.target.cerrado.checked
      };
      const { error } = await supabase.from('dias_especiales').upsert(overrideData);
      if (!error) { fetchTurnos(selectedDateObj); setShowDayModal(false); }
  };

  const handleManualSubmit = async (e) => {
      e.preventDefault();
      const fechaString = selectedDateObj.toISOString().split('T')[0];
      const { error } = await supabase.from('turnos').insert([{
          fecha: fechaString, hora: e.target.hora.value, cliente_nombre: e.target.nombre.value, cliente_telefono: e.target.telefono.value
      }]);
      if (!error) { fetchTurnos(selectedDateObj); setShowManualModal(false); }
  };

  // --- HANDLERS CLIENTE ---
  const handleInputChange = (e) => {
      const { name, value, type, checked } = e.target;
      setFormData(prev => ({
          ...prev,
          [name]: type === 'checkbox' ? checked : value
      }));
  };
  
  const handleLogin = async (e) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({ email: e.target.email.value, password: e.target.password.value });
    if (error) alert("Error: " + error.message);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsAdmin(false); 
    window.location.hash = ''; 
    setAdminView('dashboard');
  };

  const handleConfirmar = async (e) => {
    e.preventDefault();
    const fechaString = selectedDateObj.toISOString().split('T')[0];
    let nombreFinal = formData.nombre;
    if (formData.barba) {
        nombreFinal += " (+ Barba)";
    }

    const { error } = await supabase.from('turnos').insert([{ 
        fecha: fechaString, 
        hora: horaSeleccionada, 
        cliente_nombre: nombreFinal, 
        cliente_telefono: formData.telefono 
    }]);

    if (error) alert("Error: " + error.message);
    else { await fetchTurnos(selectedDateObj); setStep(3); }
  };

  const handleWhatsAppClick = () => {
    let nombreMensaje = formData.nombre;
    if (formData.barba) nombreMensaje += " (Con Barba)";

    const fechaTexto = new Intl.DateTimeFormat('es-AR', { weekday: 'long', day: 'numeric', month: 'long' }).format(selectedDateObj);
    const mensaje = `Hola! Soy *${nombreMensaje}*. Turno: *${fechaTexto}* a las *${horaSeleccionada} hs*.`;
    
    window.open(`https://wa.me/${TELEFONO_BARBERO}?text=${encodeURIComponent(mensaje)}`, '_blank');
  };

  const resetApp = () => { 
      setStep(1); setHoraSeleccionada(null); 
      setFormData({ nombre: "", telefono: "", barba: false }); 
      fetchTurnos(selectedDateObj); 
  };

  // Helpers
  const getDaysInMonth = (d) => new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (d) => new Date(d.getFullYear(), d.getMonth(), 1).getDay();
  const changeMonth = (i) => { const d = new Date(viewDate); d.setMonth(d.getMonth() + i); setViewDate(d); };
  const handleDayClick = (day) => { const d = new Date(viewDate.getFullYear(), viewDate.getMonth(), day); setSelectedDateObj(d); setHoraSeleccionada(null); };
  const handleAdminDaySelect = (d) => { handleDayClick(d); setAdminView('dashboard'); const diff = d.getDate() - d.getDay(); setCurrentWeekStart(new Date(d.setDate(diff))); };
  const handlePrevWeek = () => { const d = new Date(currentWeekStart); d.setDate(d.getDate() - 7); setCurrentWeekStart(d); };
  const handleNextWeek = () => { const d = new Date(currentWeekStart); d.setDate(d.getDate() + 7); setCurrentWeekStart(d); };
  
  const isToday = (d) => d.getDate() === new Date().getDate() && d.getMonth() === new Date().getMonth();
  const isSelectedDate = (d) => d.getDate() === selectedDateObj.getDate() && d.getMonth() === selectedDateObj.getMonth();
  const weekDays = Array.from({ length: 7 }, (_, i) => { const d = new Date(currentWeekStart); d.setDate(currentWeekStart.getDate() + i); return d; });

  const renderHeader = () => (<header className="app-header"><div className="header-branding"><img src={logo} alt="KTM" className="header-logo"/></div></header>);
  
  const renderMonthCalendar = (isAdminContext = false) => {
    const daysInMonth = getDaysInMonth(viewDate);
    const firstDay = getFirstDayOfMonth(viewDate);
    const blanks = Array(firstDay).fill(null);
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    return (
      <div className="calendar-container">
        <div className="calendar-header">
          <button className="calendar-nav-btn" onClick={() => changeMonth(-1)}>&#8249;</button>
          <h3>{months[viewDate.getMonth()]} {viewDate.getFullYear()}</h3>
          <button className="calendar-nav-btn" onClick={() => changeMonth(1)}>&#8250;</button>
        </div>
        <div className="weekdays-grid">{daysOfWeek.map(d => <span key={d} className="weekday-label">{d}</span>)}</div>
        <div className="days-grid">
          {blanks.map((_, i) => <div key={`blank-${i}`} className="day-cell empty"></div>)}
          {days.map(day => {
              const currentDayDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
              const isPastDate = (() => { const t = new Date(); t.setHours(0,0,0,0); return currentDayDate < t; })();
              return <button key={day} className={`day-cell ${isToday(currentDayDate) ? 'today' : ''} ${isSelectedDate(currentDayDate) ? 'selected' : ''}`} disabled={!isAdminContext && isPastDate} onClick={() => isAdminContext ? handleAdminDaySelect(day) : handleDayClick(day)}>{day}</button>;
          })}
        </div>
      </div>
    );
  };

  // --- VISTA ADMIN ---
  if (isAdmin) {
    if (!session) {
      return (
        <div className="app-container">
           {renderHeader()}
           <main className="main-step-2">
             <div className="confirmation-layout" style={{display:'block', paddingTop:'20px'}}>
               <h2 className="section-title-gold" style={{textAlign:'center'}}>Acceso Admin</h2>
               <form className="booking-form" onSubmit={handleLogin}>
                 <div className="form-group"><label>Email</label><input type="email" name="email" required /></div>
                 <div className="form-group"><label>Contraseña</label><input type="password" name="password" required /></div>
                 <button type="submit" className="confirm-btn">INGRESAR</button>
               </form>
             </div>
           </main>
        </div>
      );
    }

    const turnosReales = Object.values(turnosDetalles).filter(t => t.cliente_nombre !== "BLOQUEADO");
    const totalTurnos = turnosReales.length;
    const ingresosEstimados = totalTurnos * globalConfig.precio;

    return (
      <div className="app-container dashboard-mode">
        <div className="admin-header-compact">
            <div style={{display:'flex', alignItems:'center', gap:'15px'}}>
                <img src={logo} alt="KTM" className="header-logo-small"/>
                <h2 className="dashboard-title-inline">DASHBOARD</h2>
            </div>
            <button className="config-icon-btn" onClick={() => setShowConfigModal(true)}>
                <span className="material-icons">settings</span>
            </button>
        </div>
        
        <main className="admin-main">
          {adminView === 'dashboard' && (
            <>
                <div className="section-label" style={{marginTop:'15px'}}>CALENDAR (SEMANA)</div>
                <div className="strip-container-wrapper">
                    <button className="strip-nav-arrow" onClick={handlePrevWeek}>&#8249;</button>
                    <div className="calendar-strip">
                        {weekDays.map((date, i) => (
                            <div key={i} className={`strip-day ${isSelectedDate(date) ? 'active' : ''}`} onClick={() => setSelectedDateObj(date)}>
                                <span className="strip-dow">{daysOfWeek[date.getDay()].charAt(0)}</span>
                                <span className="strip-num">{date.getDate()}</span>
                            </div>
                        ))}
                    </div>
                    <button className="strip-nav-arrow" onClick={handleNextWeek}>&#8250;</button>
                </div>

                <div className="stats-grid-simple">
                    <div className="stat-card gold-border">
                        <div className="stat-header">INGRESOS (BASE)</div>
                        <div className="income-amount">${ingresosEstimados.toLocaleString()}</div>
                    </div>
                    <div className="stat-card gold-border">
                        <div className="stat-header">CLIENTES HOY ({totalTurnos})</div>
                        <div className="progress-bar-bg"><div className="progress-bar-fill" style={{width: `${Math.min((totalTurnos/15)*100, 100)}%`}}></div></div>
                    </div>
                </div>

                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:'25px', marginBottom:'10px'}}>
                    <div className="section-label" style={{margin:0}}>TURNOS: {new Intl.DateTimeFormat('es-AR', { day: 'numeric', month: 'short' }).format(selectedDateObj)}</div>
                    <button className="btn-manual-add" onClick={() => setShowManualModal(true)}>+ MANUAL</button>
                </div>
                
                <div className="turnos-list-container">
                    {generatedSlots.map((time, index) => {
                        const detalle = turnosDetalles[time];
                        const isBlocked = detalle?.cliente_nombre === "BLOQUEADO";
                        const isReserved = detalle && !isBlocked;
                        const isFree = !detalle;
                        
                        let cardClass = "turno-card";
                        if (isFree) cardClass += " free";
                        if (isBlocked) cardClass += " blocked";

                        return (
                            <div key={index} className={cardClass}>
                                <div className="turno-info">
                                    <div className="t-time" style={{color: isFree ? '#34D399' : (isBlocked ? '#ef4444' : '#888')}}>{time}</div>
                                    <div className="t-name">
                                        {isReserved && detalle.cliente_nombre}
                                        {isBlocked && "DESACTIVADO"}
                                        {isFree && "Disponible"}
                                    </div>
                                    {isReserved && <a href={`https://wa.me/${detalle.cliente_telefono}`} target="_blank" style={{color:'#888', fontSize:'0.8rem', textDecoration:'none'}}>📞 {detalle.cliente_telefono}</a>}
                                </div>
                                <button className="btn-action-status" 
                                    style={{borderColor: isFree ? '#34D399' : '#ef4444', color: isFree ? '#34D399' : '#ef4444'}}
                                    onClick={() => handleToggleBlock(time, isBlocked, isReserved, detalle?.id)}>
                                    {isFree ? "Off" : (isBlocked ? "On" : "X")}
                                </button>
                            </div>
                        );
                    })}
                </div>
                <button className="secondary-btn" onClick={() => setShowDayModal(true)} style={{marginTop:'30px'}}>⚙️ Opciones del Día</button>
            </>
          )}

          {adminView === 'calendar' && (
              <div className="full-calendar-wrapper">
                  <h2 className="dashboard-title-inline" style={{marginBottom:'20px', textAlign:'center'}}>SELECCIONAR FECHA</h2>
                  {renderMonthCalendar(true)}
                  <button className="secondary-btn" onClick={() => setAdminView('dashboard')} style={{marginTop:'20px'}}>VOLVER AL DASHBOARD</button>
              </div>
          )}
        </main>

        {/* MODAL CONFIG GLOBAL */}
        {showConfigModal && (
            <div className="modal-overlay">
                <div className="modal-content">
                    <h3>Configuración de Precios</h3>
                    <form onSubmit={handleSaveGlobalConfig}>
                        <div className="form-group">
                            <label>Corte + Cejas (Base)</label>
                            <input type="number" name="precio" defaultValue={globalConfig.precio} required />
                        </div>
                        <div className="form-group">
                            <label>Corte Barba (Adicional)</label>
                            <input type="number" name="precio_barba" defaultValue={globalConfig.precio_barba} required />
                        </div>
                        
                        <h4 style={{color:'white', fontSize:'0.9rem', marginTop:'20px', borderBottom:'1px solid #333'}}>Horarios General</h4>
                        <div className="form-group row">
                            <div style={{flex:1, marginRight:10}}><label>Apertura</label><input type="time" name="apertura" defaultValue={globalConfig.hora_apertura} required /></div>
                            <div style={{flex:1}}><label>Cierre</label><input type="time" name="cierre" defaultValue={globalConfig.hora_cierre} required /></div>
                        </div>
                        <div className="modal-actions">
                            <button type="button" className="secondary-btn" onClick={() => setShowConfigModal(false)}>Cerrar</button>
                            <button type="submit" className="confirm-btn" style={{marginTop:0}}>Guardar</button>
                        </div>
                    </form>
                </div>
            </div>
        )}

        {/* MODAL EDITAR DIA */}
        {showDayModal && (
            <div className="modal-overlay">
                <div className="modal-content">
                    <h3>Día: {new Intl.DateTimeFormat('es-AR', { day: 'numeric', month: 'numeric' }).format(selectedDateObj)}</h3>
                    <form onSubmit={handleSaveDayOverride}>
                        <div className="form-group"><label style={{display:'flex', gap:'10px'}}><input type="checkbox" name="cerrado" defaultChecked={dayOverride?.es_feriado} style={{width:'auto'}} /> CERRAR TODO EL DÍA</label></div>
                        <div className="form-group row">
                            <div style={{flex:1, marginRight:10}}><label>Apertura</label><input type="time" name="apertura" defaultValue={dayOverride?.hora_apertura || globalConfig.hora_apertura} /></div>
                            <div style={{flex:1}}><label>Cierre</label><input type="time" name="cierre" defaultValue={dayOverride?.hora_cierre || globalConfig.hora_cierre} /></div>
                        </div>
                        <div className="modal-actions">
                            <button type="button" className="secondary-btn" onClick={() => setShowDayModal(false)}>Cancelar</button>
                            <button type="submit" className="confirm-btn" style={{marginTop:0}}>Aplicar</button>
                        </div>
                    </form>
                </div>
            </div>
        )}

        {/* MODAL TURNO MANUAL */}
        {showManualModal && (
            <div className="modal-overlay">
                <div className="modal-content">
                    <h3>Nuevo Turno Manual</h3>
                    <form onSubmit={handleManualSubmit}>
                        <div className="form-group"><label>Hora</label><input type="time" name="hora" required /></div>
                        <div className="form-group"><label>Cliente</label><input type="text" name="nombre" placeholder="Nombre" required /></div>
                        <div className="form-group"><label>Teléfono</label><input type="tel" name="telefono" placeholder="WhatsApp" required /></div>
                        <div className="modal-actions">
                            <button type="button" className="secondary-btn" onClick={() => setShowManualModal(false)}>Cancelar</button>
                            <button type="submit" className="confirm-btn" style={{marginTop:0}}>Crear</button>
                        </div>
                    </form>
                </div>
            </div>
        )}

        <nav className="bottom-nav">
            <div className={`nav-item ${adminView === 'dashboard' ? 'active' : ''}`} onClick={() => setAdminView('dashboard')}>
                <span className="nav-icon">dashboard</span><span>Dashboard</span>
            </div>
            <div className={`nav-item ${adminView === 'calendar' ? 'active' : ''}`} onClick={() => setAdminView('calendar')}>
                <span className="nav-icon">calendar_month</span><span>Mes Completo</span>
            </div>
             <div className="nav-item" onClick={handleLogout}>
                <span className="nav-icon">logout</span><span>Salir</span>
            </div>
        </nav>
      </div>
    );
  }

  // --- VISTA CLIENTE ---
  const totalCliente = parseInt(globalConfig.precio) + (formData.barba ? parseInt(globalConfig.precio_barba) : 0);

  return (
    <div className="app-container">
        {renderHeader()} 
        {step === 2 && <button className="back-btn" onClick={() => setStep(1)} style={{margin: '10px 20px', background: 'none', border: 'none', color: '#aaa', cursor: 'pointer'}}>← Volver</button>}
        
        {step === 1 && (
            <main className="main-step-1" style={{paddingTop: '10px'}}>
            <div className="section-title">Selecciona fecha</div>
            {renderMonthCalendar(false)}
            <div className="section-title">Selecciona un horario</div>
            
            {generatedSlots.length === 0 ? (
                <div style={{textAlign:'center', padding:'20px', color:'#888', border:'1px solid #333', borderRadius:'10px'}}>Cerrado</div>
            ) : (
                <div className="slots-grid">
                    {generatedSlots.map((time, index) => {
                    const isOccupied = turnosOcupados.includes(time);
                    const isSelected = horaSeleccionada === time;
                    return (
                        <button key={index} disabled={isOccupied} className={`slot-btn ${isOccupied ? 'occupied' : ''} ${isSelected ? 'selected' : ''}`} onClick={() => setHoraSeleccionada(time)}>{time}</button>
                    );
                    })}
                </div>
            )}
            </main>
        )}

        {step === 2 && (
             <main className="main-step-2" style={{paddingTop: 0}}>
             <div className="confirmation-layout">
                <h2 style={{color: 'var(--gold)', fontFamily: 'Cinzel, serif', marginTop: 0, marginBottom: '15px'}}>Tus Datos</h2>
               <div className="summary-card">
                 <h3>Resumen</h3>
                 <div className="summary-row"><span className="icon">📅</span><span>{new Intl.DateTimeFormat('es-AR', { weekday: 'long', day: 'numeric', month: 'long' }).format(selectedDateObj)}</span></div>
                 <div className="summary-row"><span className="icon">⏰</span><span>{horaSeleccionada} hs</span></div>
                 <div className="summary-row"><span className="icon">📍</span><span>Calle 55 553 entre 6 y 7</span></div>
                 {/* ELIMINADO EL RENGLÓN DE "CORTE + CEJAS" */}
                 {formData.barba && (
                     <div className="summary-row">
                         <span className="icon">🧔🏻‍♂️</span>
                         <span>Adicional Barba</span>
                     </div>
                 )}
                 <div className="summary-row" style={{borderTop:'1px solid #333', paddingTop:'10px', marginTop:'10px'}}>
                     <span className="icon">💰</span>
                     <strong style={{color:'var(--gold)', fontSize:'1.2rem'}}>${totalCliente}</strong>
                 </div>
               </div>
               
               <form className="booking-form" onSubmit={handleConfirmar}>
                 <div className="form-group"><label>Nombre</label><input type="text" name="nombre" value={formData.nombre} onChange={handleInputChange} required autoComplete="off" /></div>
                 <div className="form-group"><label>WhatsApp</label><input type="tel" name="telefono" value={formData.telefono} onChange={handleInputChange} required autoComplete="off" /></div>
                 <button type="submit" className="confirm-btn">Confirmar Reserva</button>
               </form>
             </div>
           </main>
        )}

       {step === 3 && (
            <main className="success-screen">
            <div className="success-icon-container"><div className="success-checkmark">✔</div></div>
            <h2>Para confirmar tu turno, avisale al barbero presionando el boton de abajo.</h2>
            <div className="success-actions">
                <button 
                    className="whatsapp-btn" 
                    onClick={() => {
                        handleWhatsAppClick(); // 1. Abre WhatsApp
                        resetApp();            // 2. Vuelve al inicio (Home)
                    }}
                    style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: 'black', fontWeight: '800'}}
                >
                    Enviar confirmacion
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.099-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z"/>
                    </svg>
                </button>
            </div>
            </main>
        )}

        <div className={`bottom-bar ${horaSeleccionada && step === 1 ? 'visible' : ''}`}>
            <div className="selection-summary"><span>{new Intl.DateTimeFormat('es-AR', { day: 'numeric', month: 'short' }).format(selectedDateObj)}</span><strong>{horaSeleccionada || '--:--'} hs</strong></div>
            <button className="continue-btn" onClick={() => setStep(2)} disabled={!horaSeleccionada}>Continuar »</button>
        </div>
    </div>
  );
}

export default App;