import { useState, useEffect } from 'react';
import { HORARIOS_MOCK } from './data/mocks';
import { supabase } from './supabaseClient';
import './App.css';
import logo from '/logo.png'; // <--- ASEGURATE DE QUE ESTA IMAGEN ESTÉ EN LA CARPETA SRC

// --- CONFIGURACIÓN ---
const TELEFONO_BARBERO = "5492392557958"; 

function App() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [session, setSession] = useState(null);
  const [step, setStep] = useState(1);
  
  const [selectedDateObj, setSelectedDateObj] = useState(new Date()); 
  const [viewDate, setViewDate] = useState(new Date());

  const [horaSeleccionada, setHoraSeleccionada] = useState(null);
  const [formData, setFormData] = useState({ nombre: "", telefono: "" });

  // --- ESTADOS PARA DATOS ---
  const [turnosOcupados, setTurnosOcupados] = useState([]); 
  const [turnosDetalles, setTurnosDetalles] = useState({}); 

  const daysOfWeek = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá'];
  const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

  // --- AUTH ---
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);

  // --- CALENDARIO HELPERS ---
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

  const isToday = (day) => {
    const today = new Date();
    return day === today.getDate() && viewDate.getMonth() === today.getMonth() && viewDate.getFullYear() === today.getFullYear();
  };

  const isSelected = (day) => {
    return day === selectedDateObj.getDate() && viewDate.getMonth() === selectedDateObj.getMonth() && viewDate.getFullYear() === selectedDateObj.getFullYear();
  };

  const isPast = (day) => {
    const today = new Date();
    today.setHours(0,0,0,0);
    const checkDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    return checkDate < today;
  };

  const getFormattedDate = (date) => {
    return new Intl.DateTimeFormat('es-AR', { weekday: 'long', day: 'numeric', month: 'long' }).format(date);
  };

  // --- FETCH DE DATOS ---
  const fetchTurnos = async (date) => {
    try {
      const fechaString = date.toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('turnos')
        .select('*')
        .eq('fecha', fechaString);

      if (error) {
        console.error('Error cargando turnos:', error);
      } else {
        setTurnosOcupados(data.map(t => t.hora));
        const detalles = {};
        data.forEach(t => {
            detalles[t.hora] = { 
                id: t.id,
                nombre: t.cliente_nombre, 
                telefono: t.cliente_telefono 
            };
        });
        setTurnosDetalles(detalles);
      }
    } catch (error) {
      console.error("Error de conexión:", error);
    }
  };

  useEffect(() => {
    fetchTurnos(selectedDateObj);
  }, [selectedDateObj]);

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
    setIsAdmin(false);
  };

  const handleDeleteTurno = async (id) => {
      if (!window.confirm("¿Seguro que quieres liberar este turno?")) return;
      const { error } = await supabase.from('turnos').delete().eq('id', id);
      if (error) alert("Error al borrar: " + error.message);
      else fetchTurnos(selectedDateObj);
  };

  const handleConfirmar = async (e) => {
    e.preventDefault();
    const fechaString = selectedDateObj.toISOString().split('T')[0];
    const { error } = await supabase
      .from('turnos')
      .insert([{ 
          fecha: fechaString, 
          hora: horaSeleccionada, 
          cliente_nombre: formData.nombre, 
          cliente_telefono: formData.telefono 
        }]);

    if (error) alert("Error al reservar: " + error.message);
    else {
      await fetchTurnos(selectedDateObj); 
      setStep(3);
    }
  };

  const handleWhatsAppClick = () => {
    const fechaTexto = getFormattedDate(selectedDateObj);
    const mensaje = `Hola! Soy *${formData.nombre}*. Acabo de reservar un turno para el *${fechaTexto}* a las *${horaSeleccionada} hs*.`;
    const url = `https://wa.me/${TELEFONO_BARBERO}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');
  };

  const resetApp = () => {
    setStep(1);
    setHoraSeleccionada(null);
    setFormData({ nombre: "", telefono: "" });
    fetchTurnos(selectedDateObj);
  };

  // ================= RENDERIZADO =================

  // FUNCIÓN RENDER HEADER SIMPLIFICADA
  const renderHeader = () => (
    <header className="app-header">
      <div className="header-branding">
        <img 
            src={logo} 
            alt="KTM Barber Shop" 
            className="header-logo border-radius"
            // Agregamos un onClick secreto para acceder al admin (opcional)
            onClick={() => setIsAdmin(!isAdmin)}
            style={{ cursor: 'pointer' }}
        />
      </div>
    </header>
  );

  const renderCalendar = () => {
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
          {days.map(day => (
            <button
              key={day}
              className={`day-cell ${isToday(day) ? 'today' : ''} ${isSelected(day) ? 'selected' : ''}`}
              disabled={isPast(day)}
              onClick={() => handleDayClick(day)}
            >
              {day}
            </button>
          ))}
        </div>
      </div>
    );
  };

  // --- VISTA ADMIN ---
  if (isAdmin) {
    if (!session) {
      return (
        <div className="app-container">
           {/* Header simplificado solo con logo */}
           <header className="app-header">
              <div className="header-branding">
                 <img src={logo} alt="KTM" className="header-logo"/>
              </div>
           </header>

           <main className="main-step-2">
             <div className="confirmation-layout" style={{display:'block'}}>
               <h2 style={{textAlign: 'center', color: 'var(--gold)', fontFamily: 'Cinzel, serif', marginBottom: '20px'}}>Acceso Admin</h2>
               <form className="booking-form" onSubmit={handleLogin}>
                 <div className="form-group">
                   <label>Email</label>
                   <input type="email" name="email" required placeholder="admin@ktm.com" />
                 </div>
                 <div className="form-group">
                   <label>Contraseña</label>
                   <input type="password" name="password" required />
                 </div>
                 <button type="submit" className="confirm-btn">Ingresar</button>
                 <button type="button" className="secondary-btn" onClick={() => setIsAdmin(false)} style={{marginTop: '10px'}}>Cancelar</button>
               </form>
             </div>
           </main>
        </div>
      );
    }

    return (
      <div className="app-container desktop-expand">
        {renderHeader()} {/* Usamos el header simple */}
        <main className="admin-main">
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
            <h2 style={{color: 'var(--gold)', fontFamily: 'Cinzel, serif', margin: 0}}>Panel Admin</h2>
            <button className="logout-btn" onClick={handleLogout} style={{border: '1px solid #ef4444', padding: '5px 10px', borderRadius: '4px', background: 'transparent', color: '#ef4444', fontWeight: 'bold', cursor: 'pointer'}}>SALIR</button>
          </div>
          <div className="admin-dashboard">
            <div className="admin-sidebar">
              {renderCalendar()}
            </div>
            <div className="admin-content">
              <div className="section-title" style={{marginTop: 0}}>
                Agenda: {getFormattedDate(selectedDateObj)}
              </div>
              <div className="admin-grid">
                {HORARIOS_MOCK.map((slot, index) => {
                   const isOccupied = turnosOcupados.includes(slot.hora);
                   const detalle = isOccupied ? turnosDetalles[slot.hora] : null;

                   return (
                    <div key={index} className={`admin-card ${!isOccupied ? 'free' : 'occupied'}`}>
                      <div className="time-badge">{slot.hora}</div>
                      <div className="client-info">
                        {!isOccupied ? (
                          <span style={{color: '#aaa', fontSize: '0.85rem'}}>Disponible</span>
                        ) : (
                          <>
                            <span className="client-name">{detalle?.nombre || 'Reservado'}</span>
                            <a href={`https://wa.me/${detalle?.telefono}`} target="_blank" rel="noreferrer" className="client-tel" style={{textDecoration:'none', color:'#A1A1AA'}}>
                                📞 {detalle?.telefono || '-'}
                            </a>
                          </>
                        )}
                      </div>
                      <div style={{display:'flex', gap:'10px', alignItems:'center'}}>
                        {isOccupied && (
                            <button 
                                onClick={() => handleDeleteTurno(detalle.id)}
                                style={{background:'#ef4444', color:'white', border:'none', borderRadius:'4px', padding:'5px 10px', cursor:'pointer', fontSize:'0.7rem', fontWeight:'bold'}}
                            >
                                X
                            </button>
                        )}
                        <div className={`status-label ${!isOccupied ? 'free' : 'occupied'}`}>
                            {!isOccupied ? 'LIBRE' : 'OK'}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // --- VISTA CLIENTE: PASO 1 ---
  if (step === 1) {
    return (
      <div className="app-container">
        {renderHeader()} {/* Usamos el header simple */}
        {step === 2 && <button className="back-btn" onClick={() => setStep(1)} style={{margin: '10px 20px', background: 'none', border: 'none', color: '#aaa', cursor: 'pointer'}}>← Volver</button>}
        <main className="main-step-1" style={{paddingTop: '10px'}}>
          <div className="section-title">Selecciona fecha</div>
          {renderCalendar()}
          <div className="section-title">Horarios {getFormattedDate(selectedDateObj)}</div>
          <div className="slots-grid">
            {HORARIOS_MOCK.map((slot, index) => {
              const isOccupied = turnosOcupados.includes(slot.hora);
              const isSelected = horaSeleccionada === slot.hora;
              return (
                <button
                  key={index}
                  disabled={isOccupied}
                  className={`slot-btn ${isOccupied ? 'occupied' : ''} ${isSelected ? 'selected' : ''}`}
                  onClick={() => setHoraSeleccionada(slot.hora)}
                >
                  {slot.hora}
                </button>
              );
            })}
          </div>
        </main>
        <div className={`bottom-bar ${horaSeleccionada ? 'visible' : ''}`}>
            <div className="selection-summary">
                <span>{getFormattedDate(selectedDateObj)}</span>
                <strong>{horaSeleccionada || '--:--'} hs</strong>
            </div>
            <button className="continue-btn" onClick={() => setStep(2)} disabled={!horaSeleccionada}>Continuar »</button>
        </div>
      </div>
    );
  }

  // --- VISTA CLIENTE: PASO 2 ---
  if (step === 2) {
    return (
      <div className="app-container desktop-expand">
        {renderHeader()} {/* Usamos el header simple */}
        <div style={{padding: '0 20px'}}>
            <button className="back-btn" onClick={() => setStep(1)} style={{background: 'none', border: 'none', color: '#aaa', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '10px'}}>
                ← Volver
            </button>
            <h2 style={{color: 'var(--gold)', fontFamily: 'Cinzel, serif', marginTop: 0, marginBottom: '15px'}}>Tus Datos</h2>
        </div>
        <main className="main-step-2" style={{paddingTop: 0}}>
          <div className="confirmation-layout">
            <div className="summary-card">
              <h3>Resumen</h3>
              <div className="summary-row"><span className="icon">📅</span><span>{getFormattedDate(selectedDateObj)}</span></div>
              <div className="summary-row"><span className="icon">⏰</span><span>{horaSeleccionada} hs</span></div>
              <div className="summary-row"><span className="icon">✂️</span><span>Corte Clásico (40m)</span></div>
            </div>
            <form className="booking-form" onSubmit={handleConfirmar}>
              <div className="form-group">
                <label>Nombre</label>
                <input type="text" name="nombre" value={formData.nombre} onChange={handleInputChange} required autoComplete="off" />
              </div>
              <div className="form-group">
                <label>WhatsApp</label>
                <input type="tel" name="telefono" value={formData.telefono} onChange={handleInputChange} required autoComplete="off" />
              </div>
              <button type="submit" className="confirm-btn">Confirmar Reserva</button>
            </form>
          </div>
        </main>
      </div>
    );
  }

  // --- VISTA CLIENTE: PASO 3 ---
  if (step === 3) {
    return (
      <div className="app-container">
        <main className="success-screen">
          <div className="success-icon-container">
            <div className="success-checkmark">✔</div>
          </div>
          <h2>¡Reserva Confirmada!</h2>
          <p className="success-message">
            Te esperamos el <strong>{getFormattedDate(selectedDateObj)}</strong> a las <strong>{horaSeleccionada} hs</strong>.
          </p>
          <div className="success-actions">
            <button className="whatsapp-btn" onClick={handleWhatsAppClick}>
              Avisar al barbero 💬
            </button>
            <button className="secondary-btn" onClick={resetApp}>
              Volver al inicio
            </button>
          </div>
        </main>
      </div>
    );
  }

  return null;
}

export default App;