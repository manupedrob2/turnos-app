import React from 'react';
import AdminHeader from '../components/admin/AdminHeader';
import AdminSidebar from '../components/admin/AdminSidebar';
import AdminAppointmentList from '../components/admin/AdminAppointmentList';
import AdminMobileNav from '../components/admin/AdminMobileNav';
import ConfigModal from '../modals/ConfigModal';
import DayOverrideModal from '../modals/DayOverrideModal';
import ManualAppointmentModal from '../modals/ManualAppointmentModal';

const AdminDashboard = ({ 
    // Props de estado y datos
    session,
    adminView,
    setAdminView,
    viewDate,
    selectedDate,
    generatedSlots,
    turnosDetalles,
    turnosOcupados, // Si lo usas para stats
    ingresosEstimados,
    totalTurnos,
    globalConfig,
    dayOverride,
    
    // Props de Modales (Visibilidad)
    showConfigModal,
    setShowConfigModal,
    showManualModal,
    setShowManualModal,
    showDayModal,
    setShowDayModal,

    // Handlers (Funciones)
    onLogout,
    handleDateSelect,
    handleChangeMonth,
    handleToggleBlock,
    handleSaveGlobalConfig,
    handleSaveDayOverride,
    handleManualSubmit,
    onUpdateAppointment // <--- NUEVA PROP RECIBIDA
}) => {

    return (
        <div className="min-h-screen bg-[#050505] text-white font-lato selection:bg-[#D4AF37] selection:text-black pb-20 lg:pb-0 min-w-[320px]">
            
            {/* Header */}
            <AdminHeader 
                onOpenConfig={() => setShowConfigModal(true)} 
                onLogout={onLogout} 
            />
            
            {/* Contenido Principal */}
            <main className="p-4 lg:p-6 max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-[350px_1fr] gap-6 items-start">
                
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
                    onManualClick={() => setShowManualModal(true)}
                    slots={generatedSlots}
                    appointmentsData={turnosDetalles}
                    onBlockAction={handleToggleBlock}
                    onUpdateAppointment={onUpdateAppointment} // <--- PASAR A LA LISTA
                />
            </main>

            {/* --- Modales --- */}
            <ConfigModal 
                isOpen={showConfigModal} 
                onClose={() => setShowConfigModal(false)}
                onSave={handleSaveGlobalConfig}
                config={globalConfig}
            />

            <DayOverrideModal 
                isOpen={showDayModal}
                onClose={() => setShowDayModal(false)}
                onSave={handleSaveDayOverride}
                date={selectedDate}
                dayOverrideData={dayOverride}
                globalConfig={globalConfig}
            />

            <ManualAppointmentModal 
                isOpen={showManualModal} 
                onClose={() => setShowManualModal(false)} 
                onSubmit={handleManualSubmit} 
            />

            {/* --- Navegación Móvil --- */}
            <AdminMobileNav 
                activeView={adminView} 
                onViewChange={setAdminView} 
                onLogout={onLogout} 
            />
        </div>
    );
};

export default AdminDashboard;