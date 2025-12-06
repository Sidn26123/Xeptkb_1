import React, { useState, useMemo, useEffect } from 'react';
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, addMonths, subMonths, isSameMonth, isSameDay, format } from 'date-fns';

export default function MonthView({ events = [], onEventClick = () => {}, initialDate = new Date(), semesters = [], selectedSemester = null, onSelectSemester = () => {}, currentMonth, onMonthChange }) {
  const [internalCurrent, setInternalCurrent] = useState(startOfMonth(new Date(initialDate)));

  // Use controlled currentMonth if provided, else internal
  const current = currentMonth !== undefined ? currentMonth : internalCurrent;
  const setCurrent = onMonthChange || setInternalCurrent;

  // Keep current month in sync when parent changes `initialDate` (e.g., semester or week selection) - only if not controlled
  useEffect(() => {
    if (currentMonth === undefined) {
      try {
        setInternalCurrent(startOfMonth(new Date(initialDate)));
      } catch {
        setInternalCurrent(startOfMonth(new Date()));
      }
    }
  }, [initialDate, currentMonth]);

  // Semester bounds (month-granularity)
  const semesterMonthStart = selectedSemester ? startOfMonth(new Date(selectedSemester.start)) : null;
  const semesterMonthEnd = selectedSemester ? startOfMonth(new Date(selectedSemester.end)) : null;

  const canGoPrev = () => {
    if (!selectedSemester) return true;
    const prev = startOfMonth(subMonths(current, 1));
    return prev >= semesterMonthStart;
  };

  const canGoNext = () => {
    if (!selectedSemester) return true;
    const next = startOfMonth(addMonths(current, 1));
    return next <= semesterMonthEnd;
  };

  const monthGrid = useMemo(() => {
    const monthStart = startOfMonth(current);
    const monthEnd = endOfMonth(current);
    const gridStart = startOfWeek(monthStart, { weekStartsOn: 0 });
    const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
    const allDays = eachDayOfInterval({ start: gridStart, end: gridEnd });
    const weeks = [];
    for (let i = 0; i < allDays.length; i += 7) {
      weeks.push(allDays.slice(i, i + 7));
    }
    return weeks;
  }, [current]);

  const eventsByDate = useMemo(() => {
    const map = {};
    (events || []).forEach(ev => {
      if (!ev || !ev.start) return;
      const d = ev.start instanceof Date ? ev.start : new Date(ev.start);
      const key = format(d, 'yyyy-MM-dd');
      map[key] = map[key] || [];
      map[key].push(ev);
    });

    // sort events in each day by time_slot_id (ascending). Fallback to time_slot_idx, then start time, then title
    Object.keys(map).forEach(key => {
      map[key].sort((a, b) => {
        const aSlot = (a.time_slot_id ?? a.time_slot_idx ?? (a.time_slot && a.time_slot.id) ?? null);
        const bSlot = (b.time_slot_id ?? b.time_slot_idx ?? (b.time_slot && b.time_slot.id) ?? null);

        const aHas = aSlot !== null && aSlot !== undefined;
        const bHas = bSlot !== null && bSlot !== undefined;

        if (aHas || bHas) {
          if (!aHas && bHas) return 1; // b has slot => b before a
          if (aHas && !bHas) return -1;
          if (aHas && bHas) {
            const na = Number(aSlot);
            const nb = Number(bSlot);
            if (!Number.isNaN(na) && !Number.isNaN(nb) && na !== nb) return na - nb;
          }
        }

        // fallback to start time
        const aStart = a.start ? (a.start instanceof Date ? a.start : new Date(a.start)) : new Date(0);
        const bStart = b.start ? (b.start instanceof Date ? b.start : new Date(b.start)) : new Date(0);
        const diff = aStart - bStart;
        if (diff !== 0) return diff;

        // final fallback: title
        return String(a.title || '').localeCompare(String(b.title || ''));
      });
    });

    return map;
  }, [events]);

  const goPrev = () => { 
    if (canGoPrev()) {
      const newDate = subMonths(current, 1);
      setCurrent(newDate);
    }
  };
  const goNext = () => { 
    if (canGoNext()) {
      const newDate = addMonths(current, 1);
      setCurrent(newDate);
    }
  };

 return (
  <div className="month-view card p-5 rounded-xl shadow-md bg-white">
    {/* Top Header with blue gradient */}
    <div className="w-full rounded-lg overflow-hidden mb-4" style={{ background: 'linear-gradient(90deg,#4A90E2 0%,#5BA3F5 100%)' }}>
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/10 rounded-md">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <div className="text-white text-sm font-bold uppercase">Thời Khóa Biểu</div>
            <div className="text-white/80 text-xs">Lịch tháng</div>
          </div>
        </div>
      </div>
    </div>

    {/* Semester selector: gentle filter row */}
    <div className="mb-4 bg-[#f8f9fa] border-b" style={{ borderColor: '#dee2e6' }}>
      <div className="flex items-center gap-3 px-3 py-3">
        <label className="text-sm text-[#495057]">Học kỳ</label>
        <select
          className="px-3 py-2 rounded-md border border-gray-300 bg-white text-sm text-[#495057] hover:border-[#4A90E2] focus:outline-none focus:ring-2 focus:ring-[#4A90E2]"
          value={selectedSemester?.id || ''}
          onChange={(e) => {
            const selectedId = e.target.value;
            const found = (semesters || []).find(s => String(s.id) === String(selectedId));
            onSelectSemester(found || null);
          }}
        >
          {Array.isArray(semesters) && semesters.length > 0 ? (
            semesters.map(s => (
              <option key={s.id} value={s.id}>
                Học kỳ {s.name} - Năm học {s.year}
              </option>
            ))
          ) : (
            <option>Đang tải...</option>
          )}
        </select>
      </div>
    </div>

    {/* Week Navigation (only shown in week view) */}
    <div className="week-navigation flex items-center gap-3 justify-center my-2">
      <button
        onClick={goPrev}
        disabled={!canGoPrev()}
        title="Tuần trước"
        className="week-nav-btn w-9 h-9 flex items-center justify-center rounded-md bg-white/20 hover:bg-white/30 text-white transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>
      <span className="week-info text-white text-sm font-medium">{format(current, "MMMM yyyy")}</span>
      <button
        onClick={goNext}
        disabled={!canGoNext()}
        title="Tuần sau"
        className="week-nav-btn w-9 h-9 flex items-center justify-center rounded-md bg-white/20 hover:bg-white/30 text-white transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </button>
    </div>

    {/* DAYS GRID */}
    <div className="grid grid-cols-7 gap-3">
      {monthGrid.map((week, wi) => (
        <React.Fragment key={wi}>
          {week.map((day) => {
            const iso = format(day, 'yyyy-MM-dd');
            const dayEvents = eventsByDate[iso] || [];
            const isToday = isSameDay(day, new Date());
            const muted = !isSameMonth(day, current);

            const baseCellClass = `p-3 rounded-lg min-h-[110px] border border-[#dee2e6] transition-colors duration-200 cursor-pointer`;
            const mutedClass = muted ? 'bg-[#f8f9fa] text-gray-400' : 'bg-white text-[#333]';
            const todayClass = isToday ? 'bg-[#fffbf0] border-yellow-200 ring-1 ring-yellow-100' : '';

            return (
              <div
                key={iso}
                className={`${baseCellClass} ${mutedClass} hover:bg-[#f0f7ff] ${todayClass}`}
              >
                {/* DATE NUMBER */}
                <div className="mb-2">
                  <div className={`text-sm ${isToday ? 'font-bold text-[#333]' : 'font-medium text-[#495057]'}`}>
                    {format(day, 'd')}
                  </div>
                </div>

                {/* EVENTS */}
                <div className="flex flex-col gap-2">
                  {dayEvents.map((ev, idx) => {
                    const key = ev.id || `${iso}-${idx}`;
                    return (
                      <div
                        key={key}
                        onClick={() => onEventClick(ev)}
                        className="text-sm px-2 py-1 rounded-md border-l-4 border-[#28a745] text-[#333] shadow-sm truncate cursor-pointer transform transition-transform duration-150 hover:-translate-y-0.5"
                        style={{ background: 'linear-gradient(180deg,#eefcf1 0%,#e1f7e8 100%)' }}
                        title={ev.title}
                      >
                        {ev.title}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </React.Fragment>
      ))}
    </div>
  </div>
 );

}
