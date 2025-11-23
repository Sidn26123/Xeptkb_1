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
  <div className="month-view card p-4 rounded-xl shadow-sm bg-white">
    {/* Top Blue Header Bar (copied from ModernTimeTable) */}
    <div className="timetable-top-bar">
      <div className="top-bar-left">
        <h1 className="top-bar-title">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Thời Khóa Biểu
        </h1>
      </div>
      <div className="top-bar-right" />
    </div>

    {/* HEADER - centered navigation like ModernTimeTable */}
    <div className="flex items-center justify-center mb-4 px-2">
      <div className="flex items-center gap-3">
        <button
          onClick={goPrev}
          className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 transition"
        >
          ‹
        </button>

        <h3 className="text-[18px] font-semibold tracking-wide mx-2">
          {format(current, 'MMMM yyyy')}
        </h3>

        <button
          onClick={goNext}
          className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 transition"
        >
          ›
        </button>
      </div>
    </div>

    {/* Semester selector (like week view) */}
    <div className="timetable-filters mb-4">
      <div className="filter-group">
        <label className="filter-label">Học kỳ</label>
        <select
          className="filter-select"
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

    {/* DAY LABELS */}
    <div className="grid grid-cols-7 mb-1">
      {['CN','T2','T3','T4','T5','T6','T7'].map(d => (
        <div
          key={d}
          className="text-xs font-semibold text-gray-500 text-center py-1"
        >
          {d}
        </div>
      ))}
    </div>

    {/* DAYS GRID */}
    <div className="grid grid-cols-7 gap-1">
      {monthGrid.map((week, wi) => (
        <React.Fragment key={wi}>
          {week.map((day) => {
            const iso = format(day, 'yyyy-MM-dd');
            const dayEvents = eventsByDate[iso] || [];
            const isToday = isSameDay(day, new Date());
            const muted = !isSameMonth(day, current);

            return (
              <div
                key={iso}
                className={`
                  p-2 rounded-xl min-h-[90px] border bg-white 
                  hover:shadow-sm hover:bg-gray-50 transition cursor-pointer

                  ${muted ? 'text-gray-300 bg-gray-50 border-gray-100' : ''}
                  ${isToday ? 'today-cell-month' : ''}
                `}
              >
                  {/* DAY NUMBER */}
                <div className="flex items-center justify-between mb-1">
                  <div className={`
                    text-sm font-medium
                    ${muted ? 'text-gray-300' : 'text-gray-700'}
                  `}>
                    {format(day, 'd')}
                  </div>
                </div>

                {/* EVENTS */}
                <div className="flex flex-col gap-1">
                  {dayEvents.map((ev, idx) => {
                    const rawSubject = ev.subject || ev.subject_name || ev.code || 'default';
                    const subjectSafe = String(rawSubject).toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-_]/g, '') || 'default';
                    const subjectClass = `event-${subjectSafe}`;
                    const key = ev.id || `${iso}-${idx}`;
                    return (
                      <div
                        key={key}
                        onClick={() => onEventClick(ev)}
                        className={`text-xs px-2 py-1 rounded-full font-medium truncate cursor-pointer cell-event ${subjectClass}`}
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
