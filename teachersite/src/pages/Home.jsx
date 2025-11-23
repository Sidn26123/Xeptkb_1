import { useEffect, useState } from 'react';
import authService from '../services/authService';
import { fetchScheduleForUserOnDate } from '../services/scheduleService';
import { Link } from 'react-router-dom';
import { getNowInVN } from '../utils/timeUtils';

// --- Small presentational icons (Heroicon-style SVGs inline) ---
const IconClock = (props) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconPhone = (props) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.09 4.18 2 2 0 0 1 4 2h3a2 2 0 0 1 2 1.72c.12.97.37 1.91.73 2.79a2 2 0 0 1-.45 2.11L8.91 9.91a16 16 0 0 0 6 6l.3-.3a2 2 0 0 1 2.11-.45c.88.36 1.82.61 2.79.73A2 2 0 0 1 22 16.92z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const IconBell = (props) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M15 17h5l-1.4-1.4A2 2 0 0 1 18 14.2V11a6 6 0 1 0-12 0v3.2c0 .53-.21 1.05-.58 1.42L4 17h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const IconCalendar = (props) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M16 3v4M8 3v4M3 11h18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// --- Presentational components ---

function TeacherInfoCard({ profile }) {
  const initials = (profile?.name || '—').split(' ').map(s => s[0]).slice(0,2).join('').toUpperCase();
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 flex gap-6 items-center border-l-4 border-blue-200">
      <div className="flex items-center gap-4">
        <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center text-2xl font-semibold text-blue-600">
          {initials}
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="col-span-2">
          <div className="text-lg font-semibold text-gray-800">{profile?.name || '—'}</div>
          <div className="text-sm text-gray-500 mt-1">
            {profile?.academic_title ? `${profile.academic_title} · ` : ''}{profile?.faculty?.name || profile?.faculty_name || ''}
          </div>
        </div>

        <div className="col-span-1 self-center text-right">
          <div className="text-xs text-gray-400">Mã giảng viên</div>
          <div className="text-sm font-medium text-gray-700">{profile?.teacher_identifier || '—'}</div>
        </div>
      </div>
    </div>
  );
}

function InfoGroups({ profile }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="bg-white rounded-lg shadow-sm p-5 border-l-4 border-sky-100">
        <div className="text-sm font-medium text-gray-700 mb-3">Thông tin giảng viên</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-600">
          <div>
            <div className="text-xs text-gray-400">Mã GV</div>
            <div className="font-medium">{profile?.teacher_identifier || '—'}</div>
          </div>
          <div>
            <div className="text-xs text-gray-400">Ngày sinh</div>
            <div className="font-medium">{profile?.date_of_birth ? new Date(profile.date_of_birth).toLocaleDateString() : '—'}</div>
          </div>

          <div>
            <div className="text-xs text-gray-400">Tên</div>
            <div className="font-medium">{profile?.name || '—'}</div>
          </div>
          <div>
            <div className="text-xs text-gray-400">Giới tính</div>
            <div className="font-medium">{profile?.gender || '—'}</div>
          </div>

          <div>
            <div className="text-xs text-gray-400">Trạng thái</div>
            <div className="font-medium">{profile?.status || '—'}</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-5 border-l-4 border-sky-100">
        <div className="text-sm font-medium text-gray-700 mb-3">Liên hệ & Đơn vị</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-600">
          <div>
            <div className="text-xs text-gray-400">Số điện thoại</div>
            <div className="font-medium">{profile?.phone || '—'}</div>
          </div>
          <div>
            <div className="text-xs text-gray-400">Khoa / Đơn vị</div>
            <div className="font-medium">{profile?.faculty?.name || profile?.faculty_name || '—'}</div>
          </div>

                <div className="sm:col-span-2">
            <div className="text-xs text-gray-400">Email trường</div>
            <div className="font-medium wrap-break-word">{profile?.email_school || profile?.user?.username || '—'}</div>
          </div>

          <div className="sm:col-span-2">
            <div className="text-xs text-gray-400">Email cá nhân</div>
            <div className="font-medium wrap-break-word">{profile?.email_personal || '—'}</div>
          </div>

          <div className="sm:col-span-2">
            <div className="text-xs text-gray-400">Địa chỉ</div>
            <div className="font-medium">{profile?.address || '—'}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function NextClassCard({ scheduleToday, nextClassDisplay }) {
  const hasClass = Array.isArray(scheduleToday) && scheduleToday.length > 0;
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-indigo-200">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-50 rounded-md text-blue-600">
            <IconClock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-gray-400">Buổi tiếp theo</div>
            <div className="text-lg font-semibold text-gray-800">{hasClass ? (nextClassDisplay.className || nextClassDisplay.course || 'Môn học') : 'Tuần này không có lớp'}</div>
            { hasClass && nextClassDisplay.course && (
              <div className="text-sm text-gray-500 mt-0.5">Môn: <span className="text-base font-semibold text-gray-800">{nextClassDisplay.course}</span></div>
            )}
            <div className="text-sm text-gray-500 mt-1">{hasClass ? (nextClassDisplay.time || '') : 'Chúc bạn một tuần tốt lành!'}</div>
            { hasClass && nextClassDisplay.date && (
              <div className="text-sm text-gray-500 mt-1">{new Date(nextClassDisplay.date).toLocaleDateString('vi-VN', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
            )}
            {/* Room code moved below summary */}
            { hasClass && nextClassDisplay.teacher?.name &&  (
              <div className="mt-3 text-sm text-gray-600 border-t pt-3">
                <div className="text-xs text-gray-400">Giảng viên</div>
                <div className="text-lg font-semibold text-gray-800">{nextClassDisplay.teacher.name}</div>
                {nextClassDisplay.teacher.teacher_identifier && (
                  <div className="text-xs text-gray-500 mt-1">Mã GV: <span className="font-medium text-gray-700">{nextClassDisplay.teacher.teacher_identifier}</span></div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="text-sm text-gray-600 text-right">
          {/* Room code moved below summary */}
          { hasClass && (
            <>
              <div className="mt-3 text-sm text-gray-600 border-t pt-3">
                <div className="text-xs text-gray-400">Phòng</div>
                <div className="text-lg font-semibold text-gray-800">{nextClassDisplay.room?.code || '—'}</div>
              </div>

              <div className="mb-1 mt-3"><span className="text-xs text-gray-400">Tầng</span>
                <div className="font-medium">{
                  nextClassDisplay.room?.floor_number === 0 ? 'Tầng trệt' :
                  nextClassDisplay.room?.floor_number ? `Tầng ${nextClassDisplay.room.floor_number}` : '—'
                }</div>
              </div>

              <div className="mb-1"><span className="text-xs text-gray-400">Tòa</span>
                <div className="font-medium">{
                  // Prefer building.name, fall back to extracting from room.name
                  nextClassDisplay.room?.building?.name ||
                  (nextClassDisplay.room?.name ? nextClassDisplay.room.name.split(' - ')[0]?.replace('Phòng ', '') : '—')
                }</div>
              </div>
            </>
          )}
        </div>
        </div>


      { !hasClass && (
        <div className="mt-4 text-sm text-gray-500 border-t pt-4">
          <div>Không có lịch tuần này. Bạn có thể xem lịch đầy đủ để lên kế hoạch.</div>
          <div className="mt-3">
            <Link to="/schedule" className="inline-flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded text-sm">
              <IconCalendar className="w-4 h-4" /> Xem thời khóa biểu
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

function UpcomingClasses({ upcoming, scheduleToday }) {
  const hasClass = Array.isArray(scheduleToday) && scheduleToday.length > 0;
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-sky-100">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-800">Upcoming classes</h3>
        <div className="text-sm text-gray-500">This week</div>
      </div>

      <div className="mt-4 space-y-3">
        { hasClass ? (
          upcoming.map(u => (
            <div key={u.id} className="flex items-center justify-between p-3 border rounded hover:shadow-sm transition">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-50 rounded text-gray-600">
                  <IconClock className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-medium text-gray-800">{u.className || u.subject?.name || u.course || 'Môn học'}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{u.date} · {u.time || u.timeslot?.name || ''}</div>
                  <div className="text-xs text-gray-500 mt-1">{u.teacher?.name || ''} {u.teacher?.teacher_identifier ? `· ${u.teacher.teacher_identifier}` : ''}</div>
                  <div className="text-xs text-gray-500">Phòng: {u.room?.code || '—'} · {u.room?.floor_number === 0 ? 'Tầng trệt' : (u.room?.floor_number ? `Tầng ${u.room.floor_number}` : '—')} · {u.room?.building?.name || (u.room?.name ? u.room.name.split(' - ')[0]?.replace('Phòng ', '') : '—')}</div>
                </div>
              </div>
              <div className="text-base font-semibold text-gray-800 text-right ml-4">
                {u.subject?.name || u.course || ''}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-sm text-gray-500 py-6">
            <div className="font-medium mb-1">Tuần này bạn không có lớp</div>
            <div>Xem lịch đầy đủ để kiểm tra các lớp trong tuần.</div>
          </div>
        )}
      </div>
    </div>
  );
}

function QuickActions() {
  const btnClass = "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium shadow-sm hover:shadow-md transition";
  return (
    <div className="bg-white rounded-lg shadow-sm p-5 border-l-4 border-emerald-100">
      <h3 className="text-sm font-medium text-gray-800 mb-3">Quick actions</h3>
      <div className="grid grid-cols-2 gap-3">
        <Link to="/schedule" className={`${btnClass} bg-blue-600 text-white`}>
          <IconCalendar className="w-5 h-5" />
          <span>Xem thời khóa biểu</span>
        </Link>

        <Link to="/profile" className={`${btnClass} bg-white border text-gray-700`}>
          <svg className="w-5 h-5 text-gray-600" viewBox="0 0 24 24" fill="none"><path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10zm0 2c-5 0-9 2.5-9 5.5V22h18v-2.5C21 16.5 17 14 12 14z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          <span>Thông tin cá nhân</span>
        </Link>

        <Link to="/change-password" className={`${btnClass} bg-white border text-gray-700`}>
          <svg className="w-5 h-5 text-gray-600" viewBox="0 0 24 24" fill="none"><path d="M12 2v6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/><rect x="3" y="8" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          <span>Đổi mật khẩu</span>
        </Link>

        <Link to="/contact" className={`${btnClass} bg-white border text-gray-700`}>
          <IconPhone className="w-5 h-5" />
          <span>Liên hệ hỗ trợ</span>
        </Link>
      </div>
    </div>
  );
}

function Notifications({ notifications = [] }) {
  const hasNoti = Array.isArray(notifications) && notifications.length > 0;
  return (
    <div className="bg-white rounded-lg shadow-sm p-5 border-l-4 border-yellow-100">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-yellow-50 rounded text-yellow-600"><IconBell className="w-5 h-5"/></div>
          <div className="text-sm font-medium text-gray-800">Notifications</div>
        </div>
      </div>

      <div className="mt-4">
        { hasNoti ? (
          notifications.map((n, idx) => (
            <div key={idx} className="p-3 border rounded mb-2 text-sm text-gray-700">{n.title || n.message}</div>
          ))
        ) : (
          <div className="text-sm text-gray-500">Bạn chưa có thông báo mới.</div>
        )}
      </div>
    </div>
  );
}

// --- Main page component (keeps all original logic) ---
export default function Home() {
  // header dropdown state moved into NavBar component

  // UI state
  const [profile, setProfile] = useState(null);
  const [scheduleWeek, setScheduleWeek] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // (removed unused stats cards)

  // (time parsing handled by getInstanceStartMinutes)

  // helper: get current date/time in VN timezone (delegated to utils)
  // use getNowInVN() from ../utils/timeUtils

  // helper: get instance start time in minutes since midnight
  const getInstanceStartMinutes = (inst) => {
    if (!inst) return 0;
    // Prefer numeric fields from raw.timeSlot or raw.schedule.timeSlot
    const raw = inst.raw || {};
    const slot = raw.timeSlot || (raw.schedule && raw.schedule.timeSlot) || inst.timeslot || null;
    const coalesce = (o, keys) => {
      for (const k of keys) {
        if (o && o[k] !== undefined && o[k] !== null) return o[k];
      }
      return null;
    };
    const startHour = coalesce(slot, ['start_hour', 'startHour', 'start_h', 'start']) ;
    const startMin = coalesce(slot, ['start_min', 'startMin', 'start_m', 'startMinute']) ;
    if (startHour !== null && startMin !== null && !isNaN(startHour) && !isNaN(startMin)) {
      return Number(startHour) * 60 + Number(startMin);
    }

    // fallback: parse from timeslot name or inst.time string like "07:30-09:00"
    const timeStr = inst.time || inst.timeslot?.name || '';
    const m = (timeStr || '').match(/(\d{1,2}):(\d{2})/);
    if (m) return Number(m[1]) * 60 + Number(m[2]);
    return 0;
  };
  
  // Use the first instance after current ICT time as the "next class" display
  const getNextClassFromSchedule = (schedule) => {
    if (!Array.isArray(schedule) || schedule.length === 0) return null;
    const now = getNowInVN();
    // sort schedule by date and numeric start time (minutes)
    const sorted = [...schedule].sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      const am = getInstanceStartMinutes(a);
      const bm = getInstanceStartMinutes(b);
      return am - bm;
    });

    // compute now in minutes and find first instance that is at/after now
    for (const inst of sorted) {
      if (!inst || !inst.date) continue;
      if (inst.date > now.dateStr) return inst;
      if (inst.date === now.dateStr) {
        const instMinutes = getInstanceStartMinutes(inst);
        const [h, m] = (now.timeStr || '00:00').split(':').map(s => Number(s));
        const nowMinutes = (Number.isNaN(h) ? 0 : h) * 60 + (Number.isNaN(m) ? 0 : m);
        if (instMinutes >= nowMinutes) return inst;
      }
    }
    // fallback: return first item (could be previous week) or null
    return sorted[0] || null;
  };

  const nextClass = getNextClassFromSchedule(scheduleWeek);
  const noClassDisplay = {
    course: 'Hôm nay không có lớp',
    time: '',
    room: { name: '', code: '', floor_number: null, building: { name: '', campus: { name: '' } } },
    teacher: { name: profile?.name || '—', teacher_identifier: profile?.teacher_identifier || '—' },
  };

  const nextClassDisplay = nextClass
    ? {
        course: nextClass.subject?.name || nextClass.course || nextClass.title || 'Môn học',
        time: nextClass.time || nextClass.timeslot?.name || '',
        room: nextClass.room || noClassDisplay.room,
        teacher: nextClass.teacher || noClassDisplay.teacher,
        className: nextClass.className || (nextClass.class && nextClass.class.name) || '',
        class: nextClass.class || null,
      }
    : noClassDisplay;

  // derive display values
  // upcoming: show items from now (ICT) forward, sorted and limited
  const upcoming = (scheduleWeek && scheduleWeek.length > 0)
    ? (() => {
        const now = getNowInVN();
        const [nh, nm] = (now.timeStr || '00:00').split(':').map(s => Number(s));
        const nowMinutes = (Number.isNaN(nh) ? 0 : nh) * 60 + (Number.isNaN(nm) ? 0 : nm);
        const filtered = scheduleWeek.filter(inst => {
          if (!inst || !inst.date) return false;
          if (inst.date > now.dateStr) return true;
          if (inst.date === now.dateStr) {
            const instMinutes = getInstanceStartMinutes(inst);
            return instMinutes >= nowMinutes;
          }
          return false;
        });
        return filtered
          .sort((a, b) => {
            if (a.date !== b.date) return a.date.localeCompare(b.date);
            const am = getInstanceStartMinutes(a);
            const bm = getInstanceStartMinutes(b);
            return am - bm;
          })
          .slice(0, 5)
          .map(s => ({ ...s }));
      })()
    : [];

  // For now we mock the backend responses locally. The mocked objects
  // mirror the DB shapes (students, schedules, timeslots, subjects, teachers, rooms).
  useEffect(() => {
    // Fetch profile from backend and fall back to mock for schedule display
    let cancelled = false;
    setLoading(true);
    setError(null);

    const fetchData = async () => {
      try {
        const res = await authService.getProfile();
        const teacherRes = res?.data || res || null;
        if (!cancelled) setProfile(teacherRes);
        // after profile loaded, fetch this week's schedule for this teacher
        if (!cancelled && teacherRes && teacherRes.id) {
          try {
            const weekSchedule = await fetchScheduleForUserOnDate(teacherRes.id, 'teacher');
            if (!cancelled && Array.isArray(weekSchedule) && weekSchedule.length > 0) {
              const mapped = weekSchedule.map(it => {
                // prefer instance-level timeSlot, fallback to schedule.timeSlot
                const slot = (it.raw && (it.raw.timeSlot || it.raw.schedule?.timeSlot)) || null;
                const formatTwo = (n) => (n === undefined || n === null) ? '00' : String(n).padStart(2, '0');
                const timeRange = slot ? `${formatTwo(slot.start_hour)}:${formatTwo(slot.start_min)} - ${formatTwo(slot.end_hour)}:${formatTwo(slot.end_min)}` : (it.timeslot?.name || '');

                // prefer courseClass name from schedule, then subject/title
                const courseName = it.subject?.name || it.title || it.course || 'Môn học';

                // room may be instance-level override (it.room) and include building/campus
                const room = it.room || (it.raw && it.raw.room) || null;

                const teacherObj = it.teacher || (it.raw && it.raw.teacher) || null;

                // className: prefer top-level className, then nested class.name, then schedule.courseClass.name
                const className = it.className
                  || (it.class && it.class.name)
                  || (it.raw && it.raw.schedule && it.raw.schedule.courseClass && (it.raw.schedule.courseClass.class?.name || it.raw.schedule.courseClass.name))
                  || '';

                return {
                  id: it.id,
                  course: courseName,
                  className,
                  timeslot: { name: it.timeslot?.name, idx: it.timeslot?.idx },
                  time: timeRange,
                  date: it.date,
                  subject: { name: it.subject?.name || it.title },
                  teacher: { name: teacherObj?.name, teacher_identifier: teacherObj?.teacher_identifier },
                  class: it.class || (it.raw && it.raw.schedule && it.raw.schedule.courseClass && it.raw.schedule.courseClass.class) || null,
                  room: room ? { code: room.code, name: room.name, floor_number: room.floor_number, building: room.building || {} } : null,
                  raw: it.raw,
                };
              });
              // set and debug
              setScheduleWeek(mapped);
              console.debug('Raw weekSchedule from API:', weekSchedule);
              console.debug('Mapped scheduleWeek for UI:', mapped);
            }
          } catch (err) {
            console.warn('Failed to fetch week schedule', err);
          }
        }
      } catch (err) {
        console.error('Failed to fetch profile', err);
        if (!cancelled) setError('Không thể tải thông tin giảng viên');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchData();
    return () => { cancelled = true; };
  }, []);

  // Debug: log the selected next class when scheduleWeek changes
  useEffect(() => {
    if (scheduleWeek && scheduleWeek.length > 0) {
      console.debug('Selected nextClass (scheduleWeek[0]):', scheduleWeek[0]);
    }
  }, [scheduleWeek]);

  // Optional: placeholder notifications; no backend change
  const notifications = [];

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto p-6 lg:p-8">
        {loading ? (
          <div className="p-6 bg-white rounded-lg shadow-sm text-center">Đang tải dữ liệu...</div>
        ) : (
          <>
            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 rounded">{error}</div>
            )}
            {/* Header row: teacher card + next class */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              <div className="lg:col-span-2">
                <TeacherInfoCard profile={profile} />
                <div className="mt-4">
                  <InfoGroups profile={profile} />
                </div>
              </div>

              <div className="lg:col-span-1 flex flex-col gap-4">
                <NextClassCard scheduleToday={scheduleWeek} nextClassDisplay={nextClassDisplay} />
                <Notifications notifications={notifications} />
              </div>
            </div>

            {/* Main content grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <UpcomingClasses upcoming={upcoming} scheduleToday={scheduleWeek} />
              </div>

              <aside className="space-y-6">
                <QuickActions />
                <div className="bg-white rounded-lg shadow-sm p-5">
                  <h3 className="text-sm font-medium text-gray-800 mb-2">Hints</h3>
                  <div className="text-sm text-gray-500">Các nút nhanh giúp bạn truy cập nhanh đến lịch, thông tin cá nhân và cài đặt.</div>
                </div>
              </aside>
            </div>
          </>
        )}
      </main>
    </div>
  );
}