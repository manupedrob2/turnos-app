import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { useBarberShop } from './hooks/useBarberShop';
import { TELEFONO_BARBERO } from './constants';

// Importamos las Páginas
import LoginPage from './pages/LoginPage';
import AdminPage from './pages/AdminPage';
import ClientPage from './pages/ClientPage';

function App() {
  // --- 1. LÓGICA DE NEGOCIO ---
  const {
    globalConfig, generatedSlots, turnosDetalles, turnosOcupados, dayOverride,
    selectedDateObj, viewDate, horaSeleccionada, setHoraSeleccionada,
    handleToggleBlock, handleSaveGlobalConfig, handleSaveDayOverride, 
    createAppointment, changeMonth, handleDateSelect,
    updateAppointment
  } = useBarberShop();

  // --- 2. ESTADOS DE UI ---
  const [isAdmin, setIsAdmin] = useState(false);
  const [session, setSession] = useState(null);
  const [step, setStep] = useState(1);
  const [adminView, setAdminView] = useState('dashboard'); 
  const [formData, setFormData] = useState({ nombre: "", telefono: "", barba: false });

  // Nuevo estado para evitar doble clic
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modales
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showManualModal, setShowManualModal] = useState(false);
  const [showDayModal, setShowDayModal] = useState(false);

  // --- 3. EFECTOS ---
  useEffect(() => {
    const handleHashChange = () => setIsAdmin(window.location.hash === '#admin');
    handleHashChange(); 
    window.addEventListener('hashchange', handleHashChange);
    
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => setSession(session));

    return () => {
        window.removeEventListener('hashchange', handleHashChange);
        subscription.unsubscribe();
    }
  }, []);

  // --- 4. HANDLERS ---
  const handleLogin = async (e) => { 
      e.preventDefault(); 
      const { error } = await supabase.auth.signInWithPassword({ 
          email: e.target.email.value, 
          password: e.target.password.value 
      }); 
      if (error) alert("Error: " + error.message); 
  };
  
  const handleLogout = async () => { 
      await supabase.auth.signOut(); 
      setIsAdmin(false); 
      window.location.hash = ''; 
      setAdminView('dashboard'); 
  };

  const onSaveConfig = async (e) => {
      e.preventDefault();
      const newConfig = { 
          precio: parseInt(e.target.precio.value), 
          precio_barba: parseInt(e.target.precio_barba.value), 
          hora_apertura: e.target.apertura.value, 
          hora_cierre: e.target.cierre.value 
      };
      const success = await handleSaveGlobalConfig(newConfig);
      if(success) setShowConfigModal(false);
  };

  const onSaveDayOverride = async (e) => {
      e.preventDefault();
      const overrideData = { 
          fecha: selectedDateObj.toISOString().split('T')[0], 
          hora_apertura: e.target.apertura.value, 
          hora_cierre: e.target.cierre.value, 
          es_feriado: e.target.cerrado.checked 
      };
      const success = await handleSaveDayOverride(overrideData);
      if(success) setShowDayModal(false);
  };

  const onManualSubmit = async (e) => {
      e.preventDefault();
      const success = await createAppointment({
          hora: e.target.hora.value, 
          cliente_nombre: e.target.nombre.value, 
          cliente_telefono: e.target.telefono.value 
      });
      if(success) setShowManualModal(false);
  };

  const handleInputChange = (e) => { 
      const { name, value, type, checked } = e.target; 
      setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value })); 
  };

  // --- LÓGICA DE ENVÍO PROTEGIDO (ESCENARIO 8) ---
  const onClientSubmit = async (e) => {
    e.preventDefault();
    
    // 1. Si ya se está enviando, frenamos clics extra
    if (isSubmitting) return;

    // 2. Activamos el bloqueo
    setIsSubmitting(true);

    let nombreFinal = formData.nombre;
    if (formData.barba) nombreFinal += " (+ Barba)";
    
    // createAppointment maneja los errores internamente con alerts
    const success = await createAppointment({
        hora: horaSeleccionada, 
        cliente_nombre: nombreFinal, 
        cliente_telefono: formData.telefono
    });

    // 3. Liberamos el bloqueo (haya éxito o error)
    setIsSubmitting(false);

    if (success) setStep(3);
  };

  const handleWhatsAppClick = () => {
    let nombreMensaje = formData.nombre;
    if (formData.barba) nombreMensaje += " (Con Barba)";
    const fechaTexto = new Intl.DateTimeFormat('es-AR', { weekday: 'long', day: 'numeric', month: 'long' }).format(selectedDateObj);
    const mensaje = `Hola! Soy *${nombreMensaje}*. Turno: *${fechaTexto}* a las *${horaSeleccionada} hs*.`;
    window.open(`https://wa.me/${TELEFONO_BARBERO}?text=${encodeURIComponent(mensaje)}`, '_blank');
  };

  const resetApp = () => { 
      setStep(1); 
      setHoraSeleccionada(null); 
      setFormData({ nombre: "", telefono: "", barba: false }); 
  };

  // --- 5. RENDER ---
  if (isAdmin) {
    if (!session) return <LoginPage onLogin={handleLogin} />;

    const turnosReales = Object.values(turnosDetalles).filter(t => t.cliente_nombre !== "BLOQUEADO");
    const totalTurnos = turnosReales.length;
    const ingresosEstimados = totalTurnos * globalConfig.precio;

    return (
      <AdminPage
        session={session}
        adminView={adminView}
        setAdminView={setAdminView}
        viewDate={viewDate}
        selectedDate={selectedDateObj}
        generatedSlots={generatedSlots}
        turnosDetalles={turnosDetalles}
        ingresosEstimados={ingresosEstimados}
        totalTurnos={totalTurnos}
        globalConfig={globalConfig}
        dayOverride={dayOverride}
        
        showConfigModal={showConfigModal}
        setShowConfigModal={setShowConfigModal}
        showManualModal={showManualModal}
        setShowManualModal={setShowManualModal}
        showDayModal={showDayModal}
        setShowDayModal={setShowDayModal}

        onLogout={handleLogout}
        handleDateSelect={handleDateSelect}
        handleChangeMonth={changeMonth}
        handleToggleBlock={handleToggleBlock}
        handleSaveGlobalConfig={onSaveConfig}
        handleSaveDayOverride={onSaveDayOverride}
        handleManualSubmit={onManualSubmit}
        onUpdateAppointment={updateAppointment}
      />
    );
  }

  return (
    <ClientPage
        step={step}
        setStep={setStep}
        viewDate={viewDate}
        selectedDate={selectedDateObj}
        generatedSlots={generatedSlots}
        turnosOcupados={turnosOcupados}
        horaSeleccionada={horaSeleccionada}
        setHoraSeleccionada={setHoraSeleccionada}
        formData={formData}
        globalConfig={globalConfig}
        
        // Pasamos el estado de carga
        isSubmitting={isSubmitting} 
        
        handleDateSelect={handleDateSelect}
        handleChangeMonth={changeMonth}
        handleInputChange={handleInputChange}
        handleConfirmar={onClientSubmit}
        handleWhatsAppClick={handleWhatsAppClick}
        resetApp={resetApp}
    />
  );
}

export default App;