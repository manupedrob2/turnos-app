import React from 'react';

const Calendar = ({ 
    viewDate, 
    selectedDate, 
    onDateSelect, 
    onChangeMonth, 
    isAdmin = false 
}) => {
    
    const daysOfWeek = ['DO', 'LU', 'MA', 'MI', 'JU', 'VI', 'SÁ'];
    const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    const GOLD = "#D4AF37";

    // Helpers internos del calendario
    const getDaysInMonth = (d) => new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
    const getFirstDayOfMonth = (d) => new Date(d.getFullYear(), d.getMonth(), 1).getDay();
    
    // Comparadores de fecha
    const isToday = (d) => {
        const today = new Date();
        return d.getDate() === today.getDate() && 
               d.getMonth() === today.getMonth() && 
               d.getFullYear() === today.getFullYear();
    };

    const isSelectedDate = (d) => {
        return d.getDate() === selectedDate.getDate() && 
               d.getMonth() === selectedDate.getMonth() && 
               d.getFullYear() === selectedDate.getFullYear();
    };

    const daysInMonth = getDaysInMonth(viewDate);
    const firstDay = getFirstDayOfMonth(viewDate);
    const blanks = Array(firstDay).fill(null);
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    
    // Clases dinámicas
    const containerClass = isAdmin 
        ? "bg-[#1A1A1A] border border-white/10 rounded-xl p-4 shadow-lg w-full"
        : "mb-6 px-2";
    
    const headerClass = isAdmin
        ? "flex justify-between items-center mb-4"
        : "flex justify-between items-center mb-5 px-1";

    const titleClass = isAdmin
        ? "font-cinzel text-md text-white uppercase tracking-wider"
        : "font-cinzel text-lg text-white uppercase tracking-widest";

    const btnNavClass = isAdmin
        ? "w-8 h-8 flex items-center justify-center rounded-full border border-white/10 text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black transition-all"
        : "text-gray-400 hover:text-white text-xl p-2";

    return (
      <div className={containerClass}>
        <div className={headerClass}>
          <button className={btnNavClass} onClick={() => onChangeMonth(-1)}>&#8249;</button>
          <h3 className={titleClass}>{months[viewDate.getMonth()]} {viewDate.getFullYear()}</h3>
          <button className={btnNavClass} onClick={() => onChangeMonth(1)}>&#8250;</button>
        </div>
        <div className="grid grid-cols-7 text-center mb-3">
            {daysOfWeek.map(d => <span key={d} className="text-[0.65rem] text-gray-500 uppercase tracking-widest">{d}</span>)}
        </div>
        <div className="grid grid-cols-7 gap-1 lg:gap-2">
          {blanks.map((_, i) => <div key={`blank-${i}`} className="aspect-square"></div>)}
          {days.map(day => {
              const currentDayDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
              const t = new Date(); t.setHours(0,0,0,0);
              const isPastDate = currentDayDate < t;
              const isSelected = isSelectedDate(currentDayDate);
              
              let btnClass = "w-8 h-8 lg:w-9 lg:h-9 mx-auto flex items-center justify-center rounded-full text-xs transition-all duration-200 ";
              
              if (isSelected) {
                  btnClass += `bg-[#D4AF37] text-black font-bold shadow-[0_0_10px_rgba(212,175,55,0.4)] scale-110`;
              } else if (isToday(currentDayDate) && !isSelected) {
                  btnClass += `border border-[#D4AF37] text-[#D4AF37]`;
              } else if (!isPastDate || isAdmin) {
                  btnClass += "text-gray-400 hover:text-white hover:bg-white/10";
              } else {
                  btnClass += "text-gray-700 cursor-default";
              }

              return (
                <button 
                    key={day} 
                    className={btnClass} 
                    disabled={!isAdmin && isPastDate} 
                    onClick={() => onDateSelect(currentDayDate)} // Usamos la prop de callback
                >
                    {day}
                </button>
              );
          })}
        </div>
      </div>
    );
};

export default Calendar;