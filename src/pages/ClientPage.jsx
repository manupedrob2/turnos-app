import React from 'react';
import ClientHeader from '../components/client/ClientHeader';
import ClientStep1 from '../components/client/ClientStep1';
import ClientStep2 from '../components/client/ClientStep2';
import ClientStep3 from '../components/client/ClientStep3';
import ClientFooter from '../components/client/ClientFooter';

const ClientLayout = (props) => {
    // Extraemos las props necesarias para el control de pasos
    const { step, setStep, ...otherProps } = props;

    return (
        <div className="w-full min-h-screen bg-[#050505] flex justify-center overflow-hidden relative min-w-[320px]">
            {/* Fondo con gradiente */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-[#1a1a1a] via-[#050505] to-[#050505] opacity-80"></div>

            <div className="w-full max-w-[450px] lg:max-w-[900px] relative z-10 flex flex-col min-h-screen transition-all duration-300">
                
                {/* Cabecera: paso y botón volver */}
                <ClientHeader step={step} onBack={() => setStep(1)} />

                {/* PASO 1: Selección de Fecha y Hora */}
                {step === 1 && (
                    <ClientStep1 
                        {...otherProps} 
                        onDateSelect={props.handleDateSelect} 
                        onChangeMonth={props.handleChangeMonth}
                        onSlotSelect={props.setHoraSeleccionada}
                    />
                )}

                {/* PASO 2: Formulario de Datos */}
                {step === 2 && (
                    <ClientStep2 
                        selectedDate={props.selectedDate}
                        horaSeleccionada={props.horaSeleccionada}
                        formData={props.formData}
                        globalConfig={props.globalConfig}
                        onInputChange={props.handleInputChange}
                        onSubmit={props.handleConfirmar}
                        
                        // CLAVE: Pasamos el estado de carga al componente del formulario
                        isSubmitting={props.isSubmitting} 
                    />
                )}

                {/* PASO 3: Confirmación Final */}
                {step === 3 && (
                    <ClientStep3 
                        onWhatsAppClick={props.handleWhatsAppClick} 
                        onReset={props.resetApp} 
                    />
                )}

                {/* Footer: Botón continuar (solo pasos 1 y 2) */}
                <ClientFooter 
                    step={step} 
                    horaSeleccionada={props.horaSeleccionada} 
                    onContinue={() => setStep(2)} 
                />
            </div>
        </div>
    );
};

export default ClientLayout;