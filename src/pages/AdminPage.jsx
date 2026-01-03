import React, { useState } from 'react'; // Agregamos useState
import AdminHeader from '../components/admin/AdminHeader';
import AdminSidebar from '../components/admin/AdminSidebar';
import AdminAppointmentList from '../components/admin/AdminAppointmentList';
import AdminMobileNav from '../components/admin/AdminMobileNav';
import ConfigModal from '../modals/ConfigModal';
import DayOverrideModal from '../modals/DayOverrideModal';
import ManualAppointmentModal from '../modals/ManualAppointmentModal';

const AdminDashboard = ({ 
    session, adminView, setAdminView, viewDate, selectedDate, generatedSlots, 
    turnosDetalles, turnosOcupados, 
    ingresosEstimados, 
    totalTurnos, 
    globalConfig, dayOverride, showConfigModal, setShowConfigModal, 
    showManualModal, setShowManualModal, showDayModal, setShowDayModal, 
    onLogout, handleDateSelect, handleChangeMonth, handleToggleBlock, 
    handleSaveGlobalConfig, handleSaveDayOverride, handleManualSubmit, 
    onUpdateAppointment 
}) => {

    // 1. NUEVO ESTADO: Para guardar la hora del turno donde hicimos click en "+"
    const [initialTime, setInitialTime] = useState('');

    // 2. NUEVO HANDLER: Abre el modal y setea la hora pre-seleccionada
    const handleOpenManualModal = (time = '') => {
        setInitialTime(time);
        setShowManualModal(true);
    };

    

    return (
        <div className="min-h-screen bg-[#050505] text-white font-lato selection:bg-[#D4AF37] selection:text-black pb-20 lg:pb-0 min-w-[320px]">
            
            {/* Header */}
            <AdminHeader 
                onOpenConfig={() => setShowConfigModal(true)} 
                onLogout={onLogout} 
            />
            
            {/* Contenido Principal */}
            <main className="max-w-[1600px] mx-auto px-4 lg:px-6 py-8 grid grid-cols-1 lg:grid-cols-[350px_1fr] gap-8 items-start">
                
                {/* Columna Izquierda */}
                <AdminSidebar 
                    viewDate={viewDate}
                    selectedDate={selectedDate}
                    onDateSelect={handleDateSelect}
                    onChangeMonth={handleChangeMonth}
                    ingresos={ingresosEstimados} 
                    turnos={totalTurnos}
                    onOpenDayModal={() => setShowDayModal(true)}
                />

                {/* Columna Derecha */}
                <AdminAppointmentList 
                    date={selectedDate}
                    // CAMBIO: Ahora pasamos nuestra función que acepta la hora
                    onManualClick={handleOpenManualModal} 
                    slots={generatedSlots}
                    appointmentsData={turnosDetalles}
                    onBlockAction={handleToggleBlock}
                    onUpdateAppointment={onUpdateAppointment}
                />
            </main>
{/* 
            
            <ConfigModal 
                isOpen={showConfigModal} 
                onClose={() => setShowConfigModal(false)}
                onSave={handleSaveGlobalConfig}
                config={globalConfig}
            /> */}

            <DayOverrideModal 
                isOpen={showDayModal}
                onClose={() => setShowDayModal(false)}
                onSave={handleSaveDayOverride}
                date={selectedDate}
                dayOverrideData={dayOverride}
                globalConfig={globalConfig}
            />

            {/* MODIFICADO: Pasamos la hora inicial y limpiamos al cerrar */}
            <ManualAppointmentModal 
                isOpen={showManualModal} 
                onClose={() => {
                    setShowManualModal(false);
                    setInitialTime(''); // Limpiamos la hora al cerrar
                }}
                onSubmit={handleManualSubmit}
                initialTime={initialTime} 
            />

            <AdminMobileNav 
                activeView={adminView} 
                onViewChange={setAdminView} 
                onLogout={onLogout} 
            />
        </div>
    );
};

export default AdminDashboard;