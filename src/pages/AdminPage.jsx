import React from 'react';
import AdminHeader from '../components/admin/AdminHeader';
import AdminSidebar from '../components/admin/AdminSidebar';
import AdminAppointmentList from '../components/admin/AdminAppointmentList';
import AdminMobileNav from '../components/admin/AdminMobileNav';
import ConfigModal from '../modals/ConfigModal';
import DayOverrideModal from '../modals/DayOverrideModal';
import ManualAppointmentModal from '../modals/ManualAppointmentModal';

const AdminDashboard = ({ 
    // ... (props iguales)
    session, adminView, setAdminView, viewDate, selectedDate, generatedSlots, 
    turnosDetalles, turnosOcupados, ingresosEstimados, totalTurnos, 
    globalConfig, dayOverride, showConfigModal, setShowConfigModal, 
    showManualModal, setShowManualModal, showDayModal, setShowDayModal, 
    onLogout, handleDateSelect, handleChangeMonth, handleToggleBlock, 
    handleSaveGlobalConfig, handleSaveDayOverride, handleManualSubmit, 
    onUpdateAppointment 
}) => {

    return (
        <div className="min-h-screen bg-[#050505] text-white font-lato selection:bg-[#D4AF37] selection:text-black pb-20 lg:pb-0 min-w-[320px]">
            
            {/* Header (Ahora el contenido interno está alineado) */}
            <AdminHeader 
                onOpenConfig={() => setShowConfigModal(true)} 
                onLogout={onLogout} 
            />
            
            {/* Contenido Principal */}
            {/* CLAVE: max-w-[1600px] mx-auto px-4 lg:px-6 (Igual que el Header) */}
            <main className="max-w-[1600px] mx-auto px-4 lg:px-6 py-8 grid grid-cols-1 lg:grid-cols-[350px_1fr] gap-8 items-start">
                
                {/* Columna Izquierda (Sidebar con Título Dashboard) */}
                <AdminSidebar 
                    viewDate={viewDate}
                    selectedDate={selectedDate}
                    onDateSelect={handleDateSelect}
                    onChangeMonth={handleChangeMonth}
                    ingresos={ingresosEstimados}
                    turnos={totalTurnos}
                    onOpenDayModal={() => setShowDayModal(true)}
                />

                {/* Columna Derecha (Lista de Turnos) */}
                <AdminAppointmentList 
                    date={selectedDate}
                    onManualClick={() => setShowManualModal(true)}
                    slots={generatedSlots}
                    appointmentsData={turnosDetalles}
                    onBlockAction={handleToggleBlock}
                    onUpdateAppointment={onUpdateAppointment}
                />
            </main>

            {/* ... (Modales y MobileNav siguen igual) ... */}
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

            <AdminMobileNav 
                activeView={adminView} 
                onViewChange={setAdminView} 
                onLogout={onLogout} 
            />
        </div>
    );
};

export default AdminDashboard;