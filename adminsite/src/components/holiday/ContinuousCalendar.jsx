import React, { useEffect, useMemo, useRef, useState } from "react";

// ContinuousCalendar component

function ContinuousCalendar({ onClick, events = [], selectedStartIso = '', selectedEndIso = '', compact = false, onAddRuleHoliday, onAddManualHoliday }) {
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  // top-level today removed (used inside generateCalendar)
  const dayRefs = useRef([]);
  const [year, setYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(0);
  // Đã thay thế dropdown, không cần monthOptions nữa

  // scrollToDay removed (not used)

  // Đã thay thế dropdown, không cần handleMonthChange nữa

  // const handleTodayClick = () => {
  //   setYear(today.getFullYear());
  //   setSelectedMonth(today.getMonth());
  //   scrollToDay(today.getMonth(), today.getDate());
  // };

  const handleDayClick = React.useCallback((day, month, year) => {
    if (!onClick) { return; }
    if (month < 0) {
      onClick(day, 11, year - 1);
    } else {
      onClick(day, month, year);
    }
  }, [onClick]);

  // Tính toán giới hạn tháng dựa trên selectedStartIso và selectedEndIso
  const getMonthLimits = useMemo(() => {
    if (!selectedStartIso || !selectedEndIso) {
      return { minYear: null, minMonth: null, maxYear: null, maxMonth: null };
    }
    
    const startDate = new Date(selectedStartIso);
    const endDate = new Date(selectedEndIso);
    
    return {
      minYear: startDate.getFullYear(),
      minMonth: startDate.getMonth(),
      maxYear: endDate.getFullYear(),
      maxMonth: endDate.getMonth(),
    };
  }, [selectedStartIso, selectedEndIso]);

  // Kiểm tra xem có thể chuyển sang tháng trước không
  const canGoPrevMonth = useMemo(() => {
    if (!getMonthLimits.minYear || getMonthLimits.minMonth === null) return true;
    
    if (year < getMonthLimits.minYear) return false;
    if (year === getMonthLimits.minYear && selectedMonth <= getMonthLimits.minMonth) return false;
    
    return true;
  }, [year, selectedMonth, getMonthLimits]);

  // Kiểm tra xem có thể chuyển sang tháng sau không
  const canGoNextMonth = useMemo(() => {
    if (!getMonthLimits.maxYear || getMonthLimits.maxMonth === null) return true;
    
    if (year > getMonthLimits.maxYear) return false;
    if (year === getMonthLimits.maxYear && selectedMonth >= getMonthLimits.maxMonth) return false;
    
    return true;
  }, [year, selectedMonth, getMonthLimits]);

  // Precompute a map dateStr -> events[] for fast lookup and multi-event support
  const eventsMap = useMemo(() => {
    const map = Object.create(null);
    if (!events || events.length === 0) return map;
    const normalize = (d) => {
      if (!d) return null;
      if (typeof d === 'string' && d.length === 10) return d;
      const dt = new Date(d);
      if (isNaN(dt.getTime())) return null;
      return dt.toISOString().slice(0,10);
    };

    for (const ev of events) {
      const from = normalize(ev.dateFrom || ev.date);
      const to = normalize(ev.dateEnd || ev.dateFrom || ev.date);
      if (!from) continue;
      const start = new Date(from + 'T00:00:00');
      const end = to ? new Date(to + 'T00:00:00') : start;
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const key = d.toISOString().slice(0,10);
        if (!map[key]) map[key] = [];
        map[key].push(ev);
      }
    }
    return map;
  }, [events]);

  const generateCalendar = useMemo(() => {
    const today = new Date();
    const daysInMonth = new Date(year, selectedMonth + 1, 0).getDate();
    const firstDayOfWeek = new Date(year, selectedMonth, 1).getDay();

    // Parse semester range
    const semesterStart = selectedStartIso ? new Date(selectedStartIso + 'T00:00:00') : null;
    const semesterEnd = selectedEndIso ? new Date(selectedEndIso + 'T00:00:00') : null;

    // Tạo mảng các ngày trong tháng
    const days = [];
    // Ngày cuối tháng trước
    const prevMonth = selectedMonth === 0 ? 11 : selectedMonth - 1;
    const prevYear = selectedMonth === 0 ? year - 1 : year;
    const prevMonthDays = new Date(prevYear, prevMonth + 1, 0).getDate();
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push({ day: prevMonthDays - firstDayOfWeek + 1 + i, month: prevMonth, year: prevYear, isOther: true });
    }
    // Ngày trong tháng hiện tại
    for (let day = 1; day <= daysInMonth; day++) {
      days.push({ day, month: selectedMonth, year, isOther: false });
    }
    // Ngày đầu tháng sau
    const nextMonth = selectedMonth === 11 ? 0 : selectedMonth + 1;
    const nextYear = selectedMonth === 11 ? year + 1 : year;
    while (days.length % 7 !== 0) {
      const nextDay = days.length - (firstDayOfWeek + daysInMonth) + 1;
      days.push({ day: nextDay, month: nextMonth, year: nextYear, isOther: true });
    }

    // Chia thành các tuần
    const weeks = [];
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7));
    }

  // eventsMap is used to lookup events per date

    const cellSize = compact ? "size-12 sm:size-14 lg:size-16 2xl:size-20" : "size-16 sm:size-20 lg:size-24 2xl:size-28";
    const daySpanSize = compact
      ? "absolute left-0.5 top-0.5 flex size-3 items-center justify-center rounded-full text-[10px] sm:size-4 sm:text-xs lg:left-1 lg:top-1 lg:size-5 lg:text-sm"
      : "absolute left-1 top-1 flex size-4 items-center justify-center rounded-full text-xs sm:size-5 sm:text-sm lg:left-2 lg:top-2 lg:size-6 lg:text-base";

    return weeks.map((week, weekIdx) => (
      <div className="flex w-full gap-2 sm:gap-3 lg:gap-4 mb-2 sm:mb-3 lg:mb-4" key={`week-${weekIdx}`}>
        {week.map((cell, dayIdx) => {
          const isToday = cell.year === today.getFullYear() && cell.month === today.getMonth() && cell.day === today.getDate();
          const dateStr = `${cell.year}-${String(cell.month + 1).padStart(2, "0")}-${String(cell.day).padStart(2, "0")}`;
          const cellDate = new Date(cell.year, cell.month, cell.day);
          
          // Kiểm tra xem ngày có nằm trong học kỳ không
          const isOutsideSemester = semesterStart && semesterEnd && (cellDate < semesterStart || cellDate > semesterEnd);
          
          // Nếu ngoài học kỳ, ẩn hoàn toàn
          if (isOutsideSemester) {
            return (
              <div
                key={dayIdx}
                className={`relative aspect-square w-full grow ${cellSize}`}
              >
                {/* Ô trống, không hiển thị gì */}
              </div>
            );
          }

                // range selection highlight (continuous across months)
                const inSelectedRange = selectedStartIso && selectedEndIso && dateStr >= selectedStartIso && dateStr <= selectedEndIso;
                // Get events for this date (precomputed map)
                const dayEvents = eventsMap[dateStr] || [];
                const hasEvent = dayEvents.length > 0;

          const idx = weekIdx * 7 + dayIdx;

          // helper để tính class cho ô ngày (tối ưu, dễ bảo trì)
          const getDayClass = () => {
            const base = `relative z-10 group aspect-square w-full grow rounded-xl border font-medium transition-all ${cellSize} sm:rounded-2xl sm:border-2 lg:rounded-3xl transform-gpu transition-transform duration-150`;
            // Lift + color deepen hover (style 2) + light red border on hover
            const hoverLift = 'hover:-translate-y-0.5 hover:shadow-sm hover:border-red-200';
            
            // Ngày của tháng khác (prev/next month) - làm mờ đi
            if (cell.isOther) {
              return `${base} ${hoverLift} bg-gray-50/50 text-gray-300 hover:bg-gray-100/50 opacity-60`;
            }
            
            // Range takes precedence (chỉ áp dụng cho ngày trong tháng hiện tại)
            if (inSelectedRange) {
              return `${base} ${hoverLift} bg-gradient-range text-cyan-900 border-cyan-300 hover:bg-cyan-200`;
            }
            
            if (isToday) return `${base} ${hoverLift} bg-blue-500 text-white hover:bg-blue-600`;
            if (hasEvent) return `${base} ${hoverLift} bg-red-50 border-red-200 hover:bg-red-100`;
            return `${base} ${hoverLift} bg-white text-slate-800 hover:bg-gray-100`;
          };

          return (
            <div
              key={dayIdx}
              ref={(el) => {
                dayRefs.current[idx] = el;
                if (el) {
                  el.setAttribute('data-month', cell.month);
                  el.setAttribute('data-day', cell.day);
                }
              }}
              onClick={() => handleDayClick(cell.day, cell.month, cell.year)}
              className={getDayClass()}
            >
              <span className={`${daySpanSize}`}>
                {cell.day}
              </span>
              {/* Event pills (up to 2) */}
              {dayEvents.length > 0 && (
                <div className="absolute left-1 right-1 bottom-1 flex gap-1 flex-wrap">
                  {dayEvents.slice(0,2).map((ev, i) => (
                    <span
                      key={i}
                      title={`${ev.title}${ev.dateFrom ? ` (${ev.dateFrom}${ev.dateEnd ? ' → ' + ev.dateEnd : ''})` : ''}`}
                      aria-label={`Ngày nghỉ: ${ev.title}${ev.dateFrom ? `, từ ${ev.dateFrom}${ev.dateEnd ? ' đến ' + ev.dateEnd : ''}` : ''}. Nguồn: ${ev.source === 'template' ? 'Template' : 'Thủ công'}`}
                      className={`text-xs px-1.5 py-0.5 rounded max-w-[180px] truncate shadow ${ev.source === 'template' ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-blue-100 text-blue-800 border border-blue-200'}`}
                    >
                      {ev.title.length > 18 ? ev.title.slice(0,18) + '…' : ev.title}
                    </span>
                  ))}
                  {dayEvents.length > 2 && (
                    <span 
                      className="text-xs px-1.5 py-0.5 rounded bg-gray-100 text-gray-700 border border-gray-300"
                      title={`Còn ${dayEvents.length - 2} ngày nghỉ khác`}
                      aria-label={`Còn ${dayEvents.length - 2} ngày nghỉ khác trong ngày này`}
                    >
                      +{dayEvents.length - 2}
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    ));
  }, [year, selectedMonth, eventsMap, selectedStartIso, selectedEndIso, handleDayClick, compact]);

  useEffect(() => {
    const calendarContainer = document.querySelector('.calendar-container');
    const observer = new window.IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const month = parseInt(entry.target.getAttribute('data-month'), 10);
            setSelectedMonth(month);
          }
        });
      },
      {
        root: calendarContainer,
        rootMargin: '-75% 0px -25% 0px',
        threshold: 0,
      },
    );
    dayRefs.current.forEach((ref) => {
      if (ref && ref.getAttribute('data-day') === '15') {
        observer.observe(ref);
      }
    });
    return () => {
      observer.disconnect();
    };
  }, []);

  // Tự động đặt tháng về tháng bắt đầu học kỳ khi có selectedStartIso
  useEffect(() => {
    if (selectedStartIso) {
      const startDate = new Date(selectedStartIso);
      setYear(startDate.getFullYear());
      setSelectedMonth(startDate.getMonth());
    }
  }, [selectedStartIso]);

  return (
    <div className="no-scrollbar calendar-container max-h-full overflow-y-scroll rounded-t-2xl bg-white pb-10 text-slate-800 shadow-xl border-2 border-gray-200">
      <div className="sticky -top-px z-50 w-full rounded-t-2xl bg-white px-5 pt-7 sm:px-8 sm:pt-8">
        <div className="mb-4 flex w-full flex-wrap items-center gap-3">
          {/* Action buttons - Left side */}
          {(onAddRuleHoliday || onAddManualHoliday) && (
            <div className="flex items-center gap-2">
              {onAddRuleHoliday && (
                <button
                  onClick={onAddRuleHoliday}
                  className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-green-600 hover:bg-green-700 text-white text-xs sm:text-sm font-medium rounded-lg transition-colors"
                  title="Thêm ngày nghỉ từ template"
                >
                  <span className="text-base">📋</span>
                  <span className="hidden sm:inline">Thêm ngày nghỉ cố định</span>
                  <span className="sm:hidden">Cố định</span>
                </button>
              )}
              {onAddManualHoliday && (
                <button
                  onClick={onAddManualHoliday}
                  className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-medium rounded-lg transition-colors"
                  title="Thêm ngày nghỉ thủ công"
                >
                  <span className="text-base">✍️</span>
                  <span className="hidden sm:inline">Thêm ngày nghỉ thủ công</span>
                  <span className="sm:hidden">Thủ công</span>
                </button>
              )}
            </div>
          )}
          
          {/* Legend - Center */}
          <div className="flex items-center gap-4 text-xs sm:text-sm">
            <div className="flex items-center gap-2">
              <span className="inline-block w-3 h-3 rounded bg-green-100 border border-green-300"></span>
              <span className="text-gray-700">Template</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block w-3 h-3 rounded bg-blue-100 border border-blue-300"></span>
              <span className="text-gray-700">Thủ công</span>
            </div>
          </div>

          {/* Month navigation - Right side */}
          <div className="flex w-fit items-center gap-4 ml-auto">
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (!canGoPrevMonth) return;
                  if (selectedMonth === 0) {
                    setSelectedMonth(11);
                    setYear(year - 1);
                  } else {
                    setSelectedMonth(selectedMonth - 1);
                  }
                }}
                disabled={!canGoPrevMonth}
                className={`rounded-full border p-1 transition-colors sm:p-2 ${
                  canGoPrevMonth 
                    ? 'border-slate-300 hover:bg-slate-100 cursor-pointer' 
                    : 'border-gray-200 bg-gray-100 cursor-not-allowed opacity-50'
                }`}
                title={!canGoPrevMonth ? 'Đã đến tháng đầu tiên của học kỳ' : 'Tháng trước'}
              >
                <svg className={`size-5 ${canGoPrevMonth ? 'text-slate-800' : 'text-gray-400'}`} aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m15 19-7-7 7-7"/>
                </svg>
              </button>
              <h1 className="min-w-16 text-center text-lg font-semibold sm:min-w-20 sm:text-xl">
                {monthNames[selectedMonth]} {year}
              </h1>
              <button
                onClick={() => {
                  if (!canGoNextMonth) return;
                  if (selectedMonth === 11) {
                    setSelectedMonth(0);
                    setYear(year + 1);
                  } else {
                    setSelectedMonth(selectedMonth + 1);
                  }
                }}
                disabled={!canGoNextMonth}
                className={`rounded-full border p-1 transition-colors sm:p-2 ${
                  canGoNextMonth 
                    ? 'border-slate-300 hover:bg-slate-100 cursor-pointer' 
                    : 'border-gray-200 bg-gray-100 cursor-not-allowed opacity-50'
                }`}
                title={!canGoNextMonth ? 'Đã đến tháng cuối cùng của học kỳ' : 'Tháng sau'}
              >
                <svg className={`size-5 ${canGoNextMonth ? 'text-slate-800' : 'text-gray-400'}`} aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m9 5 7 7-7 7"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
        <div className="grid w-full grid-cols-7 justify-between text-slate-500">
          {daysOfWeek.map((day, index) => (
            <div key={index} className="w-full border-b border-slate-200 py-2 text-center font-semibold">
              {day}
            </div>
          ))}
        </div>
      </div>
      <div className="w-full px-5 pt-4 sm:px-8 sm:pt-6">
        {generateCalendar}
      </div>
    </div>
  );
}

export default ContinuousCalendar;


