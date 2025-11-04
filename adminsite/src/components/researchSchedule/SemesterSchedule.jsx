import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { vi as viLocale } from 'date-fns/locale';

export default function SemesterSchedule({ events = [], semesters = [], selectedSemester = null, onSelectSemester = () => {} }) {
  const [currentWeek, setCurrentWeek] = useState(new Date());

  // Update current week when semester changes
  useEffect(() => {
    if (selectedSemester) {
      const semesterStart = new Date(selectedSemester.start);
      const semesterEnd = new Date(selectedSemester.end);

      // If currentWeek is outside semester range, set to semester start
      if (currentWeek < semesterStart || currentWeek > semesterEnd) {
        setCurrentWeek(semesterStart);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSemester]);
  
  const handlePrint = () => window.print();
  // Group events by subject code to create one row per course
  const grouped = new Map();
  events.forEach((ev) => {
    const key = ev.subject || ev.title;
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key).push(ev);
  });

  const rows = Array.from(grouped.entries()).map(([key, evs]) => {
    const first = evs[0];
    // semester range: min start, max end across events
    const starts = evs.map(e => e.start.getTime());
    const ends = evs.map(e => e.end.getTime());
    const minStart = new Date(Math.min(...starts));
    const maxEnd = new Date(Math.max(...ends));

    // compute a representative day/time from the first occurrence
    const day = format(first.start, 'EEEE', { locale: viLocale });
    const startTime = format(first.start, 'HH:mm');
    const durationMinutes = (first.end.getTime() - first.start.getTime()) / (60 * 1000);
    // approximate number of 45-minute periods
    const periods = Math.max(1, Math.ceil(durationMinutes / 45));

    return {
      code: key,
      title: first.title,
      group: first.group || '02',
      credits: first.credits || 6,
      classList: evs.map(e => e.subject || e.title).join(', '),
      day,
      startTime,
      periods,
      room: first.room || '',
      teacher: first.teacher || '',
      semesterRange: `${format(minStart, 'dd/MM/yy')} đến ${format(maxEnd, 'dd/MM/yy')}`,
      rawEvents: evs,
    };
  });

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
                  const found = semesters.find(s => s.id === e.target.value);
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
  
          <button className="print-button" onClick={handlePrint}>
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            In
          </button>
        </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse border border-blue-200">
          <thead>
            <tr className="bg-blue-500 text-white text-sm">
              <th className="p-3 border border-blue-200">Mã MH</th>
              <th className="p-3 border border-blue-200">Tên môn học</th>
              <th className="p-3 border border-blue-200">Nhóm tơ</th>
              <th className="p-3 border border-blue-200">Số tín chỉ</th>
              <th className="p-3 border border-blue-200">Lớp</th>
              <th className="p-3 border border-blue-200">Thứ</th>
              <th className="p-3 border border-blue-200">Tiết bắt đầu</th>
              <th className="p-3 border border-blue-200">Số tiết</th>
              <th className="p-3 border border-blue-200">Phòng</th>
              <th className="p-3 border border-blue-200">Giảng viên</th>
              <th className="p-3 border border-blue-200">Thời gian học</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td className="p-4 text-center" colSpan={11}>Không có dữ liệu</td>
              </tr>
            )}
            {rows.map((r, idx) => (
              <tr key={r.code + idx} className="text-sm hover:bg-gray-50">
                <td className="p-3 border border-blue-200 align-top">{r.code}</td>
                <td className="p-3 border border-blue-200 align-top">{r.title}</td>
                <td className="p-3 border border-blue-200 align-top">{r.group}</td>
                <td className="p-3 border border-blue-200 align-top text-center">{r.credits}</td>
                <td className="p-3 border border-blue-200 align-top">{r.classList}</td>
                <td className="p-3 border border-blue-200 align-top">{r.day}</td>
                <td className="p-3 border border-blue-200 align-top text-center">{r.startTime}</td>
                <td className="p-3 border border-blue-200 align-top text-center">{r.periods}</td>
                <td className="p-3 border border-blue-200 align-top">{r.room}</td>
                <td className="p-3 border border-blue-200 align-top">{r.teacher}</td>
                <td className="p-3 border border-blue-200 align-top">{r.semesterRange}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
