import React from "react";
import { startOfWeek, addDays, setHours, setMinutes, format } from 'date-fns';
import { vi as viLocale } from 'date-fns/locale';
import ScheduleFilter from "./ScheduleFilter";
import ModernTimeTable from "./ModernTimeTable";
import ScheduleDetailModal from "./ScheduleDetailModal";

export default function StudentSchedule() {
  const [filter, setFilter] = React.useState({});
  const [events, setEvents] = React.useState([]);
  const [modal, setModal] = React.useState({ open: false, detail: null });

  // For now, no real API call. Use mock events (Date objects) when filter changes.
  React.useEffect(() => {
    if (!filter.query && !filter.mode) return;
    const today = new Date();
    // week starts Monday
    const monday = startOfWeek(today, { weekStartsOn: 1 });

    const sampleEvents = [
      {
        id: 1,
        title: 'Toán cao cấp 1',
        start: setMinutes(setHours(addDays(monday, 0), 7), 0), // Monday 07:00
        end: setMinutes(setHours(addDays(monday, 0), 9), 30), // Monday 09:30
        teacher: 'TS. Nguyễn Văn A',
        room: 'P101 - Nhà A1',
        type: 'lecture',
        subject: 'INT1332',
      },
      {
        id: 2,
        title: 'Lập trình C',
        start: setMinutes(setHours(addDays(monday, 0), 9), 30), // Monday 09:30
        end: setMinutes(setHours(addDays(monday, 0), 12), 0), // Monday 12:00
        teacher: 'ThS. Trần Thị B',
        room: 'P203 - Nhà A2',
        type: 'lecture',
        subject: 'INT1331',
      },
      {
        id: 3,
        title: 'Thực hành Lập trình C',
        start: setMinutes(setHours(addDays(monday, 2), 13), 30), // Wednesday 13:30
        end: setMinutes(setHours(addDays(monday, 2), 16), 0), // Wednesday 16:00
        teacher: 'ThS. Trần Thị B',
        room: 'Lab2 - Nhà A3',
        type: 'lab',
        subject: 'INT1331',
      },
      {
        id: 4,
        title: 'Vật lý đại cương',
        start: setMinutes(setHours(addDays(monday, 1), 7), 0), // Tuesday 07:00
        end: setMinutes(setHours(addDays(monday, 1), 9), 30), // Tuesday 09:30
        teacher: 'PGS.TS Lê Văn C',
        room: 'P105 - Nhà A1',
        type: 'lecture',
        subject: 'PHY1343',
      },
      {
        id: 5,
        title: 'Tiếng Anh 1',
        start: setMinutes(setHours(addDays(monday, 3), 9), 30), // Thursday 09:30
        end: setMinutes(setHours(addDays(monday, 3), 12), 0), // Thursday 12:00
        teacher: 'ThS. Phạm Thị D',
        room: 'P304 - Nhà B1',
        type: 'lecture',
        subject: 'ENG1001',
      },
      {
        id: 6,
        title: 'Cấu trúc dữ liệu',
        start: setMinutes(setHours(addDays(monday, 4), 13), 30), // Friday 13:30
        end: setMinutes(setHours(addDays(monday, 4), 16), 0), // Friday 16:00
        teacher: 'TS. Hoàng Văn E',
        room: 'P201 - Nhà A2',
        type: 'lecture',
        subject: 'INT2204',
      },
    ];

    setEvents(sampleEvents);
  }, [filter]);

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

  return (
    <div className="space-y-4">
      <ScheduleFilter onChange={(v) => setFilter(v)} />
      <ModernTimeTable
        events={events}
        viewMode={filter.mode || "week"}
        onEventClick={handleEventClick}
      />
      <ScheduleDetailModal 
        open={modal.open} 
        onClose={() => setModal({ open: false, detail: null })} 
        detail={modal.detail} 
      />
    </div>
  );
}
