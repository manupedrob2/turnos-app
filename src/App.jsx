import { useState, useEffect } from 'react';
import { HORARIOS_MOCK } from './data/mocks';
import { supabase } from './supabaseClient';
import './App.css';
import logo from '/logo.png'; 

// --- CONFIGURACIÓN ---
const TELEFONO_BARBERO = "5492392557958";
const PRECIO_CORTE = 12000; 

function App() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [session, setSession] = useState(null);
  const [step, setStep] = useState(1);
  const [adminView, setAdminView] = useState('dashboard'); 

  // Fechas Generales
  const [selectedDateObj, setSelectedDateObj] = useState(new Date()); 
  const [viewDate, setViewDate] = useState(new Date());

  // ESTADO: Controla el inicio de la semana visible en el Dashboard
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
      const d = new Date();
      const day = d.getDay(); 
      const diff = d.getDate() - day; 
      return new Date(d.setDate(diff)); 
  });

  // Datos Turno
  const [horaSeleccionada, setHoraSeleccionada] = useState(null);
  const [formData, setFormData] = useState({ nombre: "", telefono: "" });

  // Datos DB
  const [turnosOcupados, setTurnosOcupados] = useState([]); 
  const [turnosDetalles, setTurnosDetalles] = useState({}); 

  const daysOfWeek = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá'];
  const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

  // --- LOGICA ADMIN URL (#admin) ---
  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === '#admin') setIsAdmin(true);
      else setIsAdmin(false);
    };
    handleHashChange(); 
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // --- AUTH SUPABASE ---
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => setSession(session));
    return () => subscription.unsubscribe();
  }, []);

  // --- HELPERS FECHAS ---
  const getDaysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  
  const changeMonth = (increment) => {
    const newDate = new Date(viewDate);
    newDate.setMonth(newDate.getMonth() + increment);
    setViewDate(newDate);
  };

  const handleDayClick = (day) => {
    const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    setSelectedDateObj(newDate);
    setHoraSeleccionada(null);
  };

  // Admin select day
  const handleAdminDaySelect = (day) => {
      handleDayClick(day); 
      setAdminView('dashboard'); 
      const d = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
      const diff = d.getDate() - d.getDay();
      setCurrentWeekStart(new Date(d.setDate(diff)));
  };

  // Funciones semana
  const handlePrevWeek = () => {
      const newDate = new Date(currentWeekStart);
      newDate.setDate(newDate.getDate() - 7);
      setCurrentWeekStart(newDate);
  };

  const handleNextWeek = () => {
      const newDate = new Date(currentWeekStart);
      newDate.setDate(newDate.getDate() + 7);
      setCurrentWeekStart(newDate);
  };

  const isToday = (dateObj) => {
    const today = new Date();
    return dateObj.getDate() === today.getDate() && dateObj.getMonth() === today.getMonth() && dateObj.getFullYear() === today.getFullYear();
  };
  
  const isSelectedDate = (dateObj) => {
    return dateObj.getDate() === selectedDateObj.getDate() && dateObj.getMonth() === selectedDateObj.getMonth() && dateObj.getFullYear() === selectedDateObj.getFullYear();
  };

  const getFormattedDate = (date) => new Intl.DateTimeFormat('es-AR', { weekday: 'long', day: 'numeric', month: 'long' }).format(date);

  // Generador dias
  const weekDays = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(currentWeekStart);
      d.setDate(currentWeekStart.getDate() + i);
      return d;
  });

  // --- FETCH DATOS ---
  const fetchTurnos = async (date) => {
    try {
      const fechaString = date.toISOString().split('T')[0];
      const { data, error } = await supabase.from('turnos').select('*').eq('fecha', fechaString);
      if (error) console.error('Error:', error);
      else {
        setTurnosOcupados(data.map(t => t.hora));
        const detalles = {};
        data.forEach(t => { detalles[t.hora] = { id: t.id, nombre: t.cliente_nombre, telefono: t.cliente_telefono }; });
        setTurnosDetalles(detalles);
      }
    } catch (error) { console.error("Error conexión:", error); }
  };

  useEffect(() => { fetchTurnos(selectedDateObj); }, [selectedDateObj]);

  // --- ACCIONES ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.password.value;
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert("Error: " + error.message);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.hash = ''; 
  };

  const handleDeleteTurno = async (id) => {
      if (!window.confirm("¿Cancelar este turno?")) return;
      const { error } = await supabase.from('turnos').delete().eq('id', id);
      if (error) alert("Error: " + error.message);
      else fetchTurnos(selectedDateObj);
  };

  const handleConfirmar = async (e) => {
    e.preventDefault();
    const fechaString = selectedDateObj.toISOString().split('T')[0];
    const { error } = await supabase.from('turnos').insert([{ fecha: fechaString, hora: horaSeleccionada, cliente_nombre: formData.nombre, cliente_telefono: formData.telefono }]);
    if (error) alert("Error: " + error.message);
    else { await fetchTurnos(selectedDateObj); setStep(3); }
  };

  const handleWhatsAppClick = () => {
    const fechaTexto = getFormattedDate(selectedDateObj);
    const mensaje = `Hola! Soy *${formData.nombre}*. Turno: *${fechaTexto}* a las *${horaSeleccionada} hs*.`;
    const url = `https://wa.me/${TELEFONO_BARBERO}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');
  };

  const resetApp = () => {
    setStep(1); setHoraSeleccionada(null); setFormData({ nombre: "", telefono: "" }); fetchTurnos(selectedDateObj);
  };

  const renderHeader = () => (
    <header className="app-header">
      <div className="header-branding">
        <img src={logo} alt="KTM" className="header-logo"/>
      </div>
    </header>
  );

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
        <div className="weekdays-grid">
          {daysOfWeek.map(d => <span key={d} className="weekday-label">{d}</span>)}
        </div>
        <div className="days-grid">
          {blanks.map((_, i) => <div key={`blank-${i}`} className="day-cell empty"></div>)}
          {days.map(day => {
              const currentDayDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
              const isSelected = isSelectedDate(currentDayDate);
              const isPastDate = (() => { const t = new Date(); t.setHours(0,0,0,0); return currentDayDate < t; })();
              return (
                <button
                key={day}
                className={`day-cell ${isToday(currentDayDate) ? 'today' : ''} ${isSelected ? 'selected' : ''}`}
                disabled={!isAdminContext && isPastDate}
                onClick={() => isAdminContext ? handleAdminDaySelect(day) : handleDayClick(day)}
                >
                {day}
                </button>
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
        <div className="app-container">
           {renderHeader()}
           <main className="main-step-2">
             <div className="confirmation-layout" style={{display:'block', paddingTop:'20px'}}>
               <h2 className="section-title-gold" style={{textAlign:'center', fontSize:'1.5rem'}}>Acceso Admin</h2>
               <form className="booking-form" onSubmit={handleLogin}>
                 <div className="form-group"><label>Email</label><input type="email" name="email" required placeholder="admin@ktm.com" /></div>
                 <div className="form-group"><label>Contraseña</label><input type="password" name="password" required /></div>
                 <button type="submit" className="confirm-btn">INGRESAR</button>
                 <button type="button" className="secondary-btn" onClick={() => {setIsAdmin(false); window.location.hash='';}}>CANCELAR</button>
               </form>
             </div>
           </main>
        </div>
      );
    }

    const totalTurnos = turnosOcupados.length;
    const ingresosEstimados = totalTurnos * PRECIO_CORTE;
    const proximosTurnosList = HORARIOS_MOCK.filter(h => turnosOcupados.includes(h.hora)).slice(0, 3);

    return (
      <div className="app-container dashboard-mode">
        
        {/* HEADER COMPACTO */}
        <div className="admin-header-compact">
            <div style={{display:'flex', alignItems:'center', gap:'15px'}}>
                <img src={logo} alt="KTM" className="header-logo-small"/>
                <h2 className="dashboard-title-inline">DASHBOARD</h2>
            </div>
        </div>
        
        <main className="admin-main">
          {adminView === 'dashboard' && (
            <>
                <div className="stats-grid">
                    <div className="stat-card gold-border">
                        <div className="stat-header">PROXIMOS TURNOS ({totalTurnos})</div>
                        <div className="mini-list">
                            {proximosTurnosList.length > 0 ? proximosTurnosList.map((slot, i) => (
                                <div key={i} className="mini-item">
                                    <strong>{turnosDetalles[slot.hora]?.nombre || 'Cliente'}</strong>
                                    <span>{slot.hora} - Corte Clásico</span>
                                </div>
                            )) : <div style={{color:'#666', fontSize:'0.8rem'}}>Sin turnos próximos</div>}
                        </div>
                    </div>
                    <div className="right-col-stats">
                        <div className="stat-card gold-border">
                            <div className="stat-header">CLIENTES HOY ({totalTurnos})</div>
                            <div className="progress-bar-bg"><div className="progress-bar-fill" style={{width: `${(totalTurnos/15)*100}%`}}></div></div>
                        </div>
                        <div className="stat-card gold-border">
                            <div className="stat-header">INGRESOS HOY</div>
                            <div className="income-amount">${ingresosEstimados.toLocaleString()}</div>
                        </div>
                    </div>
                </div>

                <div className="section-label">CALENDAR (SEMANA)</div>
                <div className="strip-container-wrapper">
                    <button className="strip-nav-arrow" onClick={handlePrevWeek}>&#8249;</button>
                    <div className="calendar-strip">
                        {weekDays.map((date, i) => {
                            const isSel = isSelectedDate(date);
                            return (
                                <div key={i} className={`strip-day ${isSel ? 'active' : ''}`} onClick={() => { setSelectedDateObj(date); }}>
                                    <span className="strip-dow">{daysOfWeek[date.getDay()].charAt(0)}</span>
                                    <span className="strip-num">{date.getDate()}</span>
                                </div>
                            )
                        })}
                    </div>
                    <button className="strip-nav-arrow" onClick={handleNextWeek}>&#8250;</button>
                </div>

                <div className="section-label">TURNOS: {getFormattedDate(selectedDateObj)}</div>
                <div className="turnos-list-container">
                    {HORARIOS_MOCK.map((slot, index) => {
                        const isOccupied = turnosOcupados.includes(slot.hora);
                        if (!isOccupied) return null; 
                        const detalle = turnosDetalles[slot.hora];
                        return (
                            <div key={index} className="turno-card">
                                <div className="turno-icon">👤</div>
                                <div className="turno-info">
                                    <div className="t-name">{detalle?.nombre || 'Reservado'}</div>
                                    <div className="t-time">{slot.hora} - Corte Clásico</div>
                                </div>
                                <button className="btn-confirmar" onClick={() => handleDeleteTurno(detalle?.id)}>X</button>
                            </div>
                        )
                    })}
                    {turnosOcupados.length === 0 && <p style={{color:'#666', textAlign:'center', fontSize:'0.9rem', marginTop:'20px'}}>No hay turnos para este día.</p>}
                </div>
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
  return (
    <div className="app-container">
        {renderHeader()} 
        {step === 2 && <button className="back-btn" onClick={() => setStep(1)} style={{margin: '10px 20px', background: 'none', border: 'none', color: '#aaa', cursor: 'pointer'}}>← Volver</button>}
        {step === 1 && (
            <main className="main-step-1" style={{paddingTop: '10px'}}>
            <div className="section-title">Selecciona fecha</div>
            {renderMonthCalendar(false)}
            <div className="section-title">Horarios {getFormattedDate(selectedDateObj)}</div>
            <div className="slots-grid">
                {HORARIOS_MOCK.map((slot, index) => {
                const isOccupied = turnosOcupados.includes(slot.hora);
                const isSelected = horaSeleccionada === slot.hora;
                return (
                    <button key={index} disabled={isOccupied} className={`slot-btn ${isOccupied ? 'occupied' : ''} ${isSelected ? 'selected' : ''}`} onClick={() => setHoraSeleccionada(slot.hora)}>{slot.hora}</button>
                );
                })}
            </div>
            </main>
        )}
        {step === 2 && (
             <main className="main-step-2" style={{paddingTop: 0}}>
             <div className="confirmation-layout">
                <h2 style={{color: 'var(--gold)', fontFamily: 'Cinzel, serif', marginTop: 0, marginBottom: '15px'}}>Tus Datos</h2>
               <div className="summary-card">
                 <h3>Resumen</h3>
                 <div className="summary-row"><span className="icon">📅</span><span>{getFormattedDate(selectedDateObj)}</span></div>
                 <div className="summary-row"><span className="icon">⏰</span><span>{horaSeleccionada} hs</span></div>
                 <div className="summary-row"><span className="icon">✂️</span><span>Corte Clásico</span></div>
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
            <h2>¡Reserva Confirmada!</h2>
            <p className="success-message">Te esperamos el <strong>{getFormattedDate(selectedDateObj)}</strong> a las <strong>{horaSeleccionada} hs</strong>.</p>
            <div className="success-actions">
                <button className="whatsapp-btn" onClick={handleWhatsAppClick}>Avisar al barbero 💬</button>
                <button className="secondary-btn" onClick={resetApp}>Volver al inicio</button>
            </div>
            </main>
        )}
        <div className={`bottom-bar ${horaSeleccionada && step === 1 ? 'visible' : ''}`}>
            <div className="selection-summary"><span>{getFormattedDate(selectedDateObj)}</span><strong>{horaSeleccionada || '--:--'} hs</strong></div>
            <button className="continue-btn" onClick={() => setStep(2)} disabled={!horaSeleccionada}>Continuar »</button>
        </div>
    </div>
  );
}

export default App;