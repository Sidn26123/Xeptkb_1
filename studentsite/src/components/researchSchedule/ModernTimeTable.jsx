import React, { useState, useEffect } from 'react';
import { format, addDays, startOfWeek, isSameDay } from 'date-fns';
import { vi } from 'date-fns/locale';
import './ModernTimeTable.blue.css';

const WEEKDAYS = [
  { id: 1, label: 'Thứ 2', short: 'T2' },
  { id: 2, label: 'Thứ 3', short: 'T3' },
  { id: 3, label: 'Thứ 4', short: 'T4' },
  { id: 4, label: 'Thứ 5', short: 'T5' },
  { id: 5, label: 'Thứ 6', short: 'T6' },
  { id: 6, label: 'Thứ 7', short: 'T7' },
  { id: 7, label: 'Chủ Nhật', short: 'CN' },
];

export default function ModernTimeTable({ events = [], onEventClick, semesters = [], selectedSemester = null, onSelectSemester = () => {}, externalTimeSlots = null, externalLoadingTimeSlots = null }) {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [timeSlots, setTimeSlots] = useState(externalTimeSlots || []);
  const [loadingTimeSlots, setLoadingTimeSlots] = useState(externalLoadingTimeSlots != null ? externalLoadingTimeSlots : true);

  // Map externalTimeSlots when provided by parent
  useEffect(() => {
    if (externalTimeSlots == null) return;
    const mapped = (externalTimeSlots || []).map(slot => ({
      ...slot,
      label: slot.name || slot.label || `Tiết ${slot.idx || slot.id}`,
      start: slot.start || (slot.start_hour !== undefined ? `${String(slot.start_hour).padStart(2, '0')}:${String(slot.start_min||0).padStart(2, '0')}` : null),
      end: slot.end || (slot.end_hour !== undefined ? `${String(slot.end_hour).padStart(2, '0')}:${String(slot.end_min||0).padStart(2, '0')}` : null),
    }));
    setTimeSlots(mapped);
    if (externalLoadingTimeSlots != null) setLoadingTimeSlots(externalLoadingTimeSlots);
    else setLoadingTimeSlots(false);
  }, [externalTimeSlots, externalLoadingTimeSlots]);

  // Update current week when semester changes
  useEffect(() => {
    if (selectedSemester) {
      const semesterStart = new Date(selectedSemester.start);
      const semesterEnd = new Date(selectedSemester.end);

      // Check if currentWeek is within semester range
      if (currentWeek < semesterStart || currentWeek > semesterEnd) {
        setCurrentWeek(semesterStart);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSemester]);

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekEnd = addDays(weekStart, 6);
  
  // Calculate week number within semester
  const getWeekNumberInSemester = () => {
    if (!selectedSemester) return 1;
    const semesterStart = new Date(selectedSemester.start);
    const semesterWeekStart = startOfWeek(semesterStart, { weekStartsOn: 1 });
    const diffDays = Math.floor((weekStart - semesterWeekStart) / (1000 * 60 * 60 * 24));
    return Math.floor(diffDays / 7) + 1;
  };

  // Generate list of all weeks in semester
  const getSemesterWeeks = () => {
    if (!selectedSemester) return [];
    
    const semesterStart = new Date(selectedSemester.start);
    const semesterEnd = new Date(selectedSemester.end);
    const firstWeekStart = startOfWeek(semesterStart, { weekStartsOn: 1 });
    
    const weeks = [];
    let currentWeekStart = firstWeekStart;
    let weekNum = 1;
    
    while (currentWeekStart <= semesterEnd) {
      const currentWeekEnd = addDays(currentWeekStart, 6);
      weeks.push({
        number: weekNum,
        start: currentWeekStart,
        end: currentWeekEnd,
        label: `Tuần ${weekNum} [từ ngày ${format(currentWeekStart, 'dd/MM/yyyy')} đến ngày ${format(currentWeekEnd, 'dd/MM/yyyy')}]`
      });
      currentWeekStart = addDays(currentWeekStart, 7);
      weekNum++;
    }
    
    return weeks;
  };

  const weekNumber = getWeekNumberInSemester();
  const semesterWeeks = getSemesterWeeks();

  // Check if navigation is within semester bounds
  const canGoPrevWeek = () => {
    if (!selectedSemester) return true;
    const prevWeek = addDays(currentWeek, -7);
    const semesterStart = new Date(selectedSemester.start);
    return prevWeek >= semesterStart;
  };

  const canGoNextWeek = () => {
    if (!selectedSemester) return true;
    const nextWeek = addDays(currentWeek, 7);
    const semesterEnd = new Date(selectedSemester.end);
    return nextWeek <= semesterEnd;
  };

  const weekDays = WEEKDAYS.map((day, index) => ({
    ...day,
    date: addDays(weekStart, index),
  }));

  const getEventsForCell = (dayIndex, slotId) => {
    const targetDate = addDays(weekStart, dayIndex);
    return events.filter(event => {
      if (!event || !event.start) return false;
      const eventStart = event.start instanceof Date ? event.start : new Date(event.start);
      if (!isSameDay(eventStart, targetDate)) return false;

      // Prefer explicit time_slot_idx from backend
      if (event.time_slot_idx !== undefined && event.time_slot_idx !== null) {
        return Number(event.time_slot_idx) === Number(slotId);
      }

      // Fallback: infer slot from start time using base 07:00 and 60 minutes/period
      const minutes = eventStart.getHours() * 60 + eventStart.getMinutes();
      const base = 7 * 60; // 07:00
      if (minutes < base) return false;
      const inferredSlot = Math.floor((minutes - base) / 60) + 1;
      return inferredSlot === slotId;
    });
  };

  const handlePrevWeek = () => {
    if (canGoPrevWeek()) {
      setCurrentWeek(addDays(currentWeek, -7));
    }
  };

  const handleNextWeek = () => {
    if (canGoNextWeek()) {
      setCurrentWeek(addDays(currentWeek, 7));
    }
  };

  const handleEventClick = (event) => {
    onEventClick && onEventClick(event);
  };

  const isToday = (date) => isSameDay(date, new Date());

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modern-timetable">
      {/* Top Blue Header Bar */}
      <div className="timetable-top-bar">
        <div className="top-bar-left">
          <h1 className="top-bar-title">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Thời Khóa Biểu
          </h1>
        </div>
      </div>

      {/* Filters Row */}
      <div className="timetable-filters">
        <div className="filter-group">
          <label className="filter-label">Học kỳ</label>
          <select
              className="filter-select"
              value={selectedSemester?.id || ''}
              onChange={(e) => {
                const selectedId = e.target.value;
                const found = semesters.find(s => String(s.id) === String(selectedId));
                onSelectSemester(found || null);
              }}
            >
              {semesters.length > 0 ? (
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

        <div className="filter-group">
          <label className="filter-label">Tuần học</label>
          <select 
            className="filter-select" 
            value={weekNumber} 
            onChange={(e) => {
              const selectedWeekNum = parseInt(e.target.value);
              const selectedWeek = semesterWeeks.find(w => w.number === selectedWeekNum);
              if (selectedWeek) {
                setCurrentWeek(selectedWeek.start);
              }
            }}
          >
            {semesterWeeks.length > 0 ? (
              semesterWeeks.map(week => (
                <option key={week.number} value={week.number}>
                  {week.label}
                </option>
              ))
            ) : (
              <option value={weekNumber}>
                Tuần {weekNumber} [từ ngày {format(weekStart, 'dd/MM/yyyy', { locale: vi })} đến ngày {format(weekEnd, 'dd/MM/yyyy', { locale: vi })}]
              </option>
            )}
          </select>
        </div>

        <button className="print-button" onClick={handlePrint}>
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          In
        </button>
      </div>

      {/* Week Navigation */}
      <div className="week-navigation">
        <button 
          className="week-nav-btn" 
          onClick={handlePrevWeek} 
          disabled={!canGoPrevWeek()}
          title="Tuần trước"
        >
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <span className="week-info">
          Tuần {weekNumber}: {format(weekStart, 'dd/MM', { locale: vi })} - {format(weekEnd, 'dd/MM/yyyy', { locale: vi })}
        </span>
        <button 
          className="week-nav-btn" 
          onClick={handleNextWeek} 
          disabled={!canGoNextWeek()}
          title="Tuần sau"
        >
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Timetable Grid */}
      <div className="timetable-table-container">
        {loadingTimeSlots ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <svg className="mx-auto h-8 w-8 animate-spin text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <p className="mt-2 text-gray-600 dark:text-gray-400">Đang tải thời khóa biểu...</p>
            </div>
          </div>
        ) : (
          <table className="timetable-table border-collapse border border-blue-200" style={{ tableLayout: 'fixed', width: '100%' }}>
            <thead>
              <tr>
                <th className="border border-blue-200" style={{ width: '80px' }}>Tiết</th>
                {weekDays.map((day) => (
                  <th key={day.id} className="border border-blue-200" style={{ width: `${100 / weekDays.length}%`, minWidth: '80px' }}>
                    {day.label}
                  </th>
                ))}
                <th className="border border-blue-200" style={{ width: '80px' }}>Giờ bắt đầu</th>
              </tr>
            </thead>
            <tbody>
              {(() => {
                const occupiedSlots = {};
                for (let d = 0; d < weekDays.length; d++) occupiedSlots[d] = new Set();

                return timeSlots.map((slot, slotIdx) => (
                  <tr key={slot.id}>
                    <td className="time-slot-cell border border-blue-200">{slot.label}</td>
                    {weekDays.map((day, dayIndex) => {
                      if (occupiedSlots[dayIndex].has(slot.id)) return null;

                      const cellEvents = getEventsForCell(dayIndex, slot.id) || [];
                      const isTodayCol = isToday(day.date);

                      if (cellEvents.length === 1) {
                        const ev = cellEvents[0];
                        const periods = ev.num_of_period ?? ev.number_of_period ?? 1;
                        const span = Math.max(1, Number(periods) || 1);

                        for (let k = 1; k < span; k++) {
                          const nextSlot = timeSlots[slotIdx + k];
                          if (nextSlot) occupiedSlots[dayIndex].add(nextSlot.id);
                        }

                        return (
                          <td
                            key={day.id}
                            rowSpan={span}
                            className={`schedule-table-cell border border-blue-200 align-top ${isTodayCol ? 'today-col' : ''}`}
                          >
                            <div
                              key={ev.id}
                              className={`cell-event ${ev.subject || 'event-default'}`}
                              onClick={() => handleEventClick(ev)}
                            >
                              <div className="event-title">{ev.title}</div>
                              <div className="event-details">
                                <span>{ev.teacher}</span>
                                <span>{ev.room}</span>
                              </div>
                            </div>
                          </td>
                        );
                      }

                      return (
                        <td
                          key={day.id}
                          className={`schedule-table-cell border border-blue-200 ${isTodayCol ? 'today-col' : ''}`}
                        >
                          {cellEvents.map((event) => (
                            <div
                              key={event.id}
                              className={`cell-event ${event.subject || 'event-default'}`}
                              onClick={() => handleEventClick(event)}
                            >
                              <div className="event-title">{event.title}</div>
                              <div className="event-details">
                                <span>{event.teacher}</span>
                                <span>{event.room}</span>
                              </div>
                            </div>
                          ))}
                        </td>
                      );
                    })}
                    <td className="time-start-cell border border-blue-200">{slot.start}</td>
                  </tr>
                ));
              })()}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
