import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const DEFAULT_CONFIG = {
    precio: 10000,
    precio_barba: 4000,
    hora_apertura: "09:00",
    hora_cierre: "19:00",
    intervalo: 40
};

// --- FUNCIÓN CLAVE PARA ARREGLAR LA ZONA HORARIA ---
// Evita que toISOString() cambie de día por la diferencia horaria (UTC vs GMT-3)
const getLocalDateString = (date) => {
    if (!date) return null;
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Meses van de 0-11
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export const useBarberShop = () => {
    // --- ESTADOS DE DATOS ---
    const [globalConfig, setGlobalConfig] = useState(DEFAULT_CONFIG);
    const [generatedSlots, setGeneratedSlots] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [turnosOcupados, setTurnosOcupados] = useState([]);
    const [turnosDetalles, setTurnosDetalles] = useState({});
    const [dayOverride, setDayOverride] = useState(null);

    // --- ESTADOS DE UI / FECHA ---
    const [selectedDateObj, setSelectedDateObj] = useState(new Date());
    const [viewDate, setViewDate] = useState(new Date());
    const [horaSeleccionada, setHoraSeleccionada] = useState(null);
    
    // --- INICIALIZACIÓN ---
    useEffect(() => {
        fetchGlobalConfig();
    }, []);

    useEffect(() => {
        fetchTurnos(selectedDateObj);
    }, [selectedDateObj, globalConfig]);

    // --- FUNCIONES AUXILIARES ---
    const generateTimeSlots = (startConf, endConf, intervalo) => {
        const slots = [];
        const [startH, startM] = startConf.split(':').map(Number);
        const [endH, endM] = endConf.split(':').map(Number);
        let current = new Date(); current.setHours(startH, startM, 0, 0);
        const end = new Date(); end.setHours(endH, endM, 0, 0);
        
        while (current <= end) { 
            const h = current.getHours().toString().padStart(2, '0');
            const m = current.getMinutes().toString().padStart(2, '0');
            slots.push(`${h}:${m}`);
            current.setMinutes(current.getMinutes() + intervalo);
        }
     /*   
        // Lógica para el último turno colgado
        const lastSlotStr = slots[slots.length-1];
        if(lastSlotStr) {
           const [lastH, lastM] = lastSlotStr.split(':').map(Number);
           let lastTime = new Date(); lastTime.setHours(lastH, lastM + intervalo, 0,0);
           if(lastTime <= end) {
              const h = lastTime.getHours().toString().padStart(2, '0');
              const m = lastTime.getMinutes().toString().padStart(2, '0');
              const nextSlot = `${h}:${m}`;
               if (!slots.includes(nextSlot)) slots.push(nextSlot);
           }
        }*/
        return slots;
    };

    // --- FUNCIONES DE BASE DE DATOS ---
    const fetchGlobalConfig = async () => {
        const { data } = await supabase.from('configuracion').select('*').maybeSingle();
        if (data) setGlobalConfig({ 
            precio: data.precio, 
            precio_barba: data.precio_barba || 4000, 
            hora_apertura: data.hora_apertura, 
            hora_cierre: data.hora_cierre, 
            intervalo: data.intervalo_minutos || 40 
        });
    };

    const fetchTurnos = async (date) => {
        const fechaString = getLocalDateString(date);

        const { data: specialDay } = await supabase.from('dias_especiales').select('*').eq('fecha', fechaString).maybeSingle();
        setDayOverride(specialDay);
        
        let baseSlots = [];
        let start = globalConfig.hora_apertura; 
        let end = globalConfig.hora_cierre;
        
        if (specialDay) {
            if (specialDay.es_feriado) baseSlots = [];
            else { 
                start = specialDay.hora_apertura; 
                end = specialDay.hora_cierre; 
                baseSlots = generateTimeSlots(start, end, globalConfig.intervalo); 
            }
        } else { 
            baseSlots = generateTimeSlots(start, end, globalConfig.intervalo); 
        }

        const { data, error } = await supabase.from('turnos').select('*').eq('fecha', fechaString).order('hora', { ascending: true });
        
        if (error) console.error(error);
        else { 
            setAppointments(data); 
            const detalles = {}; 
            const occupiedTimes = data.map(t => t.hora);
            data.forEach(t => { detalles[t.hora] = t; }); 
            
            const mergedSlots = [...new Set([...baseSlots, ...occupiedTimes])];
            mergedSlots.sort();

            setGeneratedSlots(mergedSlots); 
            setTurnosDetalles(detalles); 
            setTurnosOcupados(occupiedTimes); 
        }
    };

    // --- ACCIONES ---
    const updateAppointment = async (id, newData) => {
        if (!id) return;
        
        const { error } = await supabase
            .from('turnos')
            .update(newData)
            .eq('id', id);

        if (!error) {
            await fetchTurnos(selectedDateObj);
            return true;
        } else {
            alert("Error al actualizar: " + error.message);
            return false;
        }
    };

    const handleToggleBlock = async (time, isBlocked, isReserved, id) => {
        const fechaString = getLocalDateString(selectedDateObj);

        // Si pasamos un ID, borramos directo (sirve para bloqueo o turno)
        if (id) {
             const { error } = await supabase.from('turnos').delete().eq('id', id);
             if (error) console.error("Error borrando:", error);
        } else {
            // Si NO hay ID, es un bloqueo nuevo en un slot vacío
            await supabase.from('turnos').insert([{ 
                fecha: fechaString, 
                hora: time, 
                cliente_nombre: "BLOQUEADO", 
                cliente_telefono: "" 
            }]); 
        }
        
        // Recargar datos suavemente
        fetchTurnos(selectedDateObj);
    };

    const handleSaveGlobalConfig = async (newConfig) => {
        const { error } = await supabase.from('configuracion').update(newConfig).gt('id', 0); 
        if (!error) { 
            setGlobalConfig({...globalConfig, ...newConfig}); 
            alert("Guardado"); 
            return true;
        } else { 
            alert("Error: " + error.message); 
            return false;
        }
    };

    const handleSaveDayOverride = async (overrideData) => {
        const { error } = await supabase.from('dias_especiales').upsert(overrideData);
        if (!error) { 
            fetchTurnos(selectedDateObj); 
            return true;
        }
        return false;
    };

    const createAppointment = async (apptData) => {
        // CORRECCIÓN 3: Usar getLocalDateString
        const fechaString = getLocalDateString(selectedDateObj);

        const { error } = await supabase.from('turnos').insert([{ 
            fecha: fechaString, 
            ...apptData 
        }]);
        
        if (!error) {
            await fetchTurnos(selectedDateObj);
            return true;
        } else {
            alert("Error: " + error.message);
            return false;
        }
    };

    // --- MANEJO DE FECHAS ---
    const changeMonth = (i) => { 
        const d = new Date(viewDate); 
        d.setMonth(d.getMonth() + i); 
        setViewDate(d); 
    };
    
    const handleDateSelect = (date) => { 
        setSelectedDateObj(date); 
        setHoraSeleccionada(null); 
    };

    return {
        // Datos
        globalConfig,
        generatedSlots,
        turnosDetalles,
        turnosOcupados,
        dayOverride,
        selectedDateObj,
        viewDate,
        horaSeleccionada,
        setHoraSeleccionada, 

        // Acciones
        handleToggleBlock,
        handleSaveGlobalConfig,
        handleSaveDayOverride,
        createAppointment,
        changeMonth,
        handleDateSelect,
        updateAppointment
    };
};