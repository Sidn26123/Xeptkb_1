import React from 'react';
import { startOfWeek, addDays, setHours, setMinutes, format } from 'date-fns';
import { vi as viLocale } from 'date-fns/locale';
import ModernTimeTable from './ModernTimeTable';
import SemesterSchedule from './SemesterSchedule';
import ScheduleDetailModal from './ScheduleDetailModal';
import { getAllSemesters } from '../../services/semesterService';
import { getAllRooms } from '../../services/roomService';

export default function RoomSchedule({ events: initialEvents = null, fetchEventsByRoom = null }) {
  const [query, setQuery] = React.useState('');
  const [mode, setMode] = React.useState('week');
  const [events, setEvents] = React.useState(initialEvents || []);
  const [modal, setModal] = React.useState({ open: false, detail: null });
  const [semesters, setSemesters] = React.useState([]);
  const [selectedSemester, setSelectedSemester] = React.useState(null);
  const [rooms, setRooms] = React.useState([]);
  const [showSuggestions, setShowSuggestions] = React.useState(false);
  const [selectedRoomId, setSelectedRoomId] = React.useState(null);
  const [hasSearched, setHasSearched] = React.useState(false);

  // If no initialEvents provided, use sample data (similar to StudentSchedule)
  React.useEffect(() => {
    if (initialEvents) return; // parent provided data
    const today = new Date();
    const monday = startOfWeek(today, { weekStartsOn: 1 });

    const sampleEvents = [
      {
        id: 1,
        title: 'Toán cao cấp 1',
        start: setMinutes(setHours(addDays(monday, 0), 7), 0),
        end: setMinutes(setHours(addDays(monday, 0), 9), 30),
        teacher: 'TS. Nguyễn Văn A',
        room: 'P101 - Nhà A1',
        type: 'lecture',
        subject: 'INT1332',
      },
      {
        id: 2,
        title: 'Lập trình C',
        start: setMinutes(setHours(addDays(monday, 0), 9), 30),
        end: setMinutes(setHours(addDays(monday, 0), 12), 0),
        teacher: 'ThS. Trần Thị B',
        room: 'P203 - Nhà A2',
        type: 'lecture',
        subject: 'INT1331',
      },
      {
        id: 3,
        title: 'Thực hành Lập trình C',
        start: setMinutes(setHours(addDays(monday, 2), 13), 30),
        end: setMinutes(setHours(addDays(monday, 2), 16), 0),
        teacher: 'ThS. Trần Thị B',
        room: 'Lab2 - Nhà A3',
        type: 'lab',
        subject: 'INT1331',
      },
    ];

    setEvents(sampleEvents);
  }, [initialEvents]);

  // fetch rooms for autocomplete suggestions
  React.useEffect(() => {
    let mounted = true;
    async function fetchRooms() {
      try {
        const data = await getAllRooms();
        if (!mounted) return;
        setRooms(data || []);
      } catch (err) {
        console.error('Error fetching rooms in RoomSchedule:', err);
      }
    }
    fetchRooms();
    return () => { mounted = false; };
  }, []);

  // Fetch semesters once so multiple views can reuse the list
  React.useEffect(() => {
    let mounted = true;
    async function fetchSemesters() {
      try {
        const data = await getAllSemesters();
        if (!mounted) return;
        setSemesters(data || []);
        if (data && data.length > 0) setSelectedSemester(data[0]);
      } catch (err) {
        console.error('Error fetching semesters in RoomSchedule:', err);
      }
    }
    fetchSemesters();
    return () => { mounted = false; };
  }, []);

  const handleEventClick = (event) => {
    setModal({
      open: true,
      detail: {
        subject: event.title,
        teacher: event.teacher,
        room: event.room,
        time: `${format(event.start, 'HH:mm')} - ${format(event.end, 'HH:mm')}`,
        date: format(event.start, 'EEEE, dd/MM/yyyy', { locale: viLocale }),
        type: event.type === 'lecture' ? 'Lý thuyết' : event.type === 'lab' ? 'Thực hành' : 'Thi',
        code: event.subject,
      }
    });
  };

  const handleSearch = async () => {
    // If parent provided fetcher, use it
    if (fetchEventsByRoom) {
      try {
        const res = await fetchEventsByRoom(query);
        setEvents(res || []);
        setHasSearched(true);
        return;
      } catch (err) {
        console.error('fetchEventsByRoom error:', err);
      }
    }

    // Try to match selectedRoomId or typed query to a room
    let roomObj = null;
    if (selectedRoomId) roomObj = (rooms || []).find(r => String(r.id) === String(selectedRoomId));
    else if (query && query.trim().length > 0) {
      const q = query.trim().toLowerCase();
      roomObj = (rooms || []).find(r => ((r.name || '').toLowerCase().includes(q)) || ((r.code || '').toLowerCase().includes(q)) || String(r.id) === q);
      if (roomObj) setSelectedRoomId(roomObj.id);
    }

    if (!roomObj) {
      // fallback: filter existing events by text
      if (!query) return;
      const q = query.toLowerCase();
      setEvents((prev) => prev.filter(e => (e.room || '').toLowerCase().includes(q) || (e.title || '').toLowerCase().includes(q)));
      setHasSearched(true);
      return;
    }

    // Filter events by room name/code/id and mark searched
    const qName = (roomObj.name || '').toLowerCase();
    const qCode = (roomObj.code || '').toLowerCase();
    const filtered = (initialEvents || events || []).filter(e => (
      (qCode && e.room && e.room.toLowerCase().includes(qCode)) ||
      (qName && e.room && e.room.toLowerCase().includes(qName)) ||
      (String(e.room || '').toLowerCase().includes(String(roomObj.id).toLowerCase()))
    ));
    setEvents(filtered);
    setSelectedRoomId(roomObj.id);
    setHasSearched(true);
  };

  const handleSelectRoom = (r) => {
    setQuery((r.name || r.id) + (r.code ? ` (${r.code})` : ''));
    setSelectedRoomId(r.id);
    setShowSuggestions(false);
    // build filtered events immediately and show timetable
    const qName = (r.name || '').toLowerCase();
    const qCode = (r.code || '').toLowerCase();
    const filtered = (initialEvents || events || []).filter(e => (
      (qCode && e.room && e.room.toLowerCase().includes(qCode)) ||
      (qName && e.room && e.room.toLowerCase().includes(qName)) ||
      (String(e.room || '').toLowerCase().includes(String(r.id).toLowerCase()))
    ));
    setEvents(filtered);
    setHasSearched(true);
  };

  const handleClear = () => {
    setQuery('');
    setSelectedRoomId(null);
    setEvents(initialEvents || []);
    setHasSearched(false);
  };

  const selectedRoomObj = (rooms || []).find(r => String(r.id) === String(selectedRoomId));
  const displayLabel = selectedRoomObj ? (selectedRoomObj.name || selectedRoomObj.code || selectedRoomObj.id) : query;

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setShowSuggestions(true); setSelectedRoomId(''); }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleSearch(); } }}
            placeholder="Tìm phòng (mã hoặc tên)..."
            className="input input-bordered w-full"
          />
          {showSuggestions && query && Array.isArray(rooms) && rooms.filter(r => {
            const q = query.trim().toLowerCase();
            return (r.name || '').toLowerCase().includes(q) || (r.code || '').toLowerCase().includes(q) || String(r.id).toLowerCase().includes(q);
          }).slice(0, 8).map(r => r).length > 0 && (
            <ul className="absolute z-50 left-0 right-0 bg-white dark:bg-gray-800 border rounded mt-1 max-h-56 overflow-auto shadow">
                {Array.isArray(rooms) && rooms.filter(r => {
                const q = query.trim().toLowerCase();
                return (r.name || '').toLowerCase().includes(q) || (r.code || '').toLowerCase().includes(q) || String(r.id).toLowerCase().includes(q);
              }).slice(0, 8).map(r => (
                <li key={r.id} className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer" onMouseDown={() => { handleSelectRoom(r); }}>
                  <div className="font-medium">{r.name || `#${r.id}`}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{r.code || ''}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
        <select value={mode} onChange={(e) => setMode(e.target.value)} className="select select-bordered w-40">
          <option value="week">Tuần</option>
          <option value="semester">Học kỳ</option>
        </select>
          <button onClick={handleClear} type="button" className="btn btn-outline">Clear</button>
        </div>
      </div>

      {hasSearched ? (
        selectedRoomId ? (
          mode === 'week' ? (
            <ModernTimeTable
              events={events}
              viewMode={mode}
              onEventClick={handleEventClick}
              semesters={semesters}
              selectedSemester={selectedSemester}
              onSelectSemester={setSelectedSemester}
            />
          ) : mode === 'semester' ? (
            <SemesterSchedule
              events={events}
              semesters={semesters}
              selectedSemester={selectedSemester}
              onSelectSemester={setSelectedSemester}
            />
          ) : null
        ) : (
          events.length === 0 ? (
            <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
              <p className="text-sm text-gray-600 dark:text-gray-300">Không tìm thấy lịch cho "{displayLabel}".</p>
            </div>
          ) : (
            mode === 'week' ? (
              <ModernTimeTable
                events={events}
                viewMode={mode}
                onEventClick={handleEventClick}
                semesters={semesters}
                selectedSemester={selectedSemester}
                onSelectSemester={setSelectedSemester}
              />
            ) : mode === 'semester' ? (
              <SemesterSchedule
                events={events}
                semesters={semesters}
                selectedSemester={selectedSemester}
                onSelectSemester={setSelectedSemester}
              />
            ) : null
          )
        )
      )  : null}

      <ScheduleDetailModal open={modal.open} onClose={() => setModal({ open: false, detail: null })} detail={modal.detail} />
    </div>
  );
}
 
