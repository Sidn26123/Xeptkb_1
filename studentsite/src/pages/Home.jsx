import { useEffect, useState } from 'react';
import authService from '../services/authService';
import { fetchScheduleForUserOnDate, fetchScheduleForClassOnDate, getAllTimeSlots } from '../services/scheduleService';
import { Link } from 'react-router-dom';
import { getNowInVN } from '../utils/timeUtils';
// NavBar is rendered globally by AppLayout

// Inline heroicon-like SVGs
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

function StudentInfoCard({ profile }) {
  const initials = (profile?.name || '—').split(' ').map(s => s[0]).slice(0,2).join('').toUpperCase();
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 flex gap-6 items-center border-l-4 border-blue-200">
      <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center text-2xl font-semibold text-blue-600">{initials}</div>
      <div className="flex-1">
        <div className="text-lg font-semibold text-gray-800">{profile?.name || '—'}</div>
        <div className="text-sm text-gray-500 mt-1">Mã SV: <span className="font-medium text-gray-700">{profile?.student_identifier || '—'}</span></div>
        <div className="text-sm text-gray-500 mt-1">Chương trình: <span className="font-medium text-gray-700">{profile?.program || profile?.major || '—'}</span></div>
      </div>
    </div>
  );
}

function InfoGroups({ profile }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="bg-white rounded-lg shadow-sm p-5 border-l-4 border-sky-100">
        <div className="text-sm font-medium text-gray-700 mb-3">Thông tin sinh viên</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-600">
          <div>
            <div className="text-xs text-gray-400">Mã SV</div>
            <div className="font-medium">{profile?.student_identifier || '—'}</div>
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
        <div className="text-sm font-medium text-gray-700 mb-3">Liên hệ & Khóa</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-600">
          <div>
            <div className="text-xs text-gray-400">Số điện thoại</div>
            <div className="font-medium">{profile?.phone || '—'}</div>
          </div>
          <div>
            <div className="text-xs text-gray-400">Khoa / Ngành</div>
            <div className="font-medium">{profile?.faculty?.name || profile?.program || '—'}</div>
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
  console.error('NextClassCard render', { scheduleToday, nextClassDisplay });
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
            { hasClass && nextClassDisplay.course && (
              <div className="text-sm text-gray-500 mt-0.5">Môn: <span className="text-base font-semibold text-gray-800">{nextClassDisplay.course}</span></div>
            )}
            <div className="text-sm text-gray-500 mt-1">
              {hasClass ? (
                (nextClassDisplay.startTime && nextClassDisplay.endTime)
                  ? `${nextClassDisplay.startTime} - ${nextClassDisplay.endTime}`
                  : (nextClassDisplay.time || '')
              ) : 'Chúc bạn một tuần tốt lành!'}
            </div>
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
                  <div className="text-xs text-gray-500 mt-0.5">
                    {u.date ? new Date(u.date).toLocaleDateString('vi-VN', { day: '2-digit', month: 'short' }) : ''}
                    { (u.startTime && u.endTime)
                      ? ` · ${u.startTime} - ${u.endTime}`
                      : ((u.time || u.timeslot?.name) ? ` · ${u.time || u.timeslot?.name}` : '')
                    }
                  </div>
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

export default function Home() {
  // header dropdown state moved into NavBar component

  // UI state
  const [profile, setProfile] = useState(null);
  const [scheduleToday, setScheduleToday] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // helper: compute instance start in minutes (prefer numeric timeslot fields)
  const getInstanceStartMinutes = (inst) => {
    if (!inst) return 0;
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
    const timeStr = inst.time || inst.timeslot?.name || '';
    const m = (timeStr || '').match(/(\d{1,2}):(\d{2})/);
    if (m) return Number(m[1]) * 60 + Number(m[2]);
    return 0;
  };

  // compute next class from schedule (use VN time and numeric times)
  const computeNextClass = (list) => {
    if (!list || list.length === 0) return null;
    const items = [...list];
    items.sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      const am = getInstanceStartMinutes(a);
      const bm = getInstanceStartMinutes(b);
      return am - bm;
    });
    const now = getNowInVN();
    const [nh, nm] = (now.timeStr || '00:00').split(':').map(s => Number(s));
    const nowMinutes = (Number.isNaN(nh) ? 0 : nh) * 60 + (Number.isNaN(nm) ? 0 : nm);
    for (const it of items) {
      if (!it || !it.date) continue;
      if (it.date > now.dateStr) return it;
      if (it.date === now.dateStr) {
        const instM = getInstanceStartMinutes(it);
        if (instM >= nowMinutes) return it;
      }
    }
    return items[0];
  };

  const nextClass = computeNextClass(scheduleToday);
  const noClassDisplay = {
    course: 'Hôm nay không có lớp',
    time: '',
    room: { name: '', code: '', floor_number: null, building: { name: '', campus: { name: '' } } },
    teacher: { name: profile?.name || '—', teacher_identifier: profile?.student_identifier || '—' },
  };

  const nextClassDisplay = nextClass
    ? {
        course: nextClass.subject?.name || nextClass.course || nextClass.title || 'Môn học',
        time: nextClass.time || nextClass.timeslot?.name || '',
        startTime: nextClass.startTime || null,
        endTime: nextClass.endTime || null,
        room: nextClass.room || noClassDisplay.room,
        teacher: nextClass.teacher || noClassDisplay.teacher,
      }
    : noClassDisplay;

  const upcoming = (scheduleToday && scheduleToday.length > 0)
    ? scheduleToday.slice(0, 5).map(s => ({ ...s }))
    : [];

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    const fetchData = async () => {
      try {
        // call the studentsite-specific profile endpoint
        const res = await authService.apiClient.get('/studentsite/profile');
        const student = res?.data?.data || null;
        if (!cancelled) setProfile(student);

        // after we have the profile, fetch the shrinking-week schedule for this student
        try {
          const classId = student?.course_class?.id || student?.class?.id || student?.class_id || student?.course_class_id;
          const weekSchedule = await fetchScheduleForUserOnDate(student?.id, 'student', null, null, classId);
          if (!cancelled && Array.isArray(weekSchedule) && weekSchedule.length > 0) {
            // fetch time slots and normalize week schedule
            let rawTimeSlots = [];
            try {
              rawTimeSlots = await getAllTimeSlots();
            } catch { rawTimeSlots = []; }

            // helper functions scoped inside effect to avoid hook dependency issues
            const normalizeTimeSlots = (rawTimeSlots = []) => {
              return (rawTimeSlots || []).map(slot => ({
                ...slot,
                start: slot.start || (slot.start_hour !== undefined ? `${String(slot.start_hour).padStart(2, '0')}:${String(slot.start_min || 0).padStart(2, '0')}` : null),
                end: slot.end || (slot.end_hour !== undefined ? `${String(slot.end_hour).padStart(2, '0')}:${String(slot.end_min || 0).padStart(2, '0')}` : null),
              }));
            };

            const normalizeInstance = (it, timeSlots = []) => {
              const scheduleObj = it.schedule || {};
              const scheduleTimeSlot = scheduleObj.timeSlot || it.timeSlot || null;
              const timeSlotId = scheduleTimeSlot?.id || it.time_slot_id || null;
              const numOfPeriod = scheduleObj?.num_of_period ?? it.num_of_period ?? 1;

              let startTime = null;
              let endTime = null;

              // Prefer normalized timeSlots (fetched globally) to compute exact start/end
              if (timeSlotId && timeSlots.length > 0) {
                const startSlot = timeSlots.find(ts => ts.id === timeSlotId);
                const endSlotId = Number(timeSlotId) + Number(numOfPeriod) - 1;
                const endSlot = timeSlots.find(ts => ts.id === endSlotId);
                if (startSlot && startSlot.start) startTime = startSlot.start;
                if (endSlot && endSlot.end) endTime = endSlot.end;
              }

              // Fallback to numeric fields on schedule.timeSlot
              if ((!startTime || !endTime) && scheduleTimeSlot) {
                if (!startTime && scheduleTimeSlot.start_hour !== undefined) {
                  startTime = `${String(scheduleTimeSlot.start_hour).padStart(2, '0')}:${String(scheduleTimeSlot.start_min || 0).padStart(2, '0')}`;
                }
                if (!endTime && scheduleTimeSlot.end_hour !== undefined) {
                  endTime = `${String(scheduleTimeSlot.end_hour).padStart(2, '0')}:${String(scheduleTimeSlot.end_min || 0).padStart(2, '0')}`;
                }
              }

              // Fallback to explicit datetimes on instance
              if ((!startTime || !endTime) && (it.start_datetime || it.end_datetime)) {
                try {
                  if (!startTime && it.start_datetime) {
                    const s = new Date(it.start_datetime);
                    startTime = s.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
                  }
                  if (!endTime && it.end_datetime) {
                    const e = new Date(it.end_datetime);
                    endTime = e.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
                  }
                } catch {
                  // ignore
                }
              }

              // Last fallback: raw time string
              const rawTimeStr = it.time || scheduleTimeSlot?.name || it.timeslot?.name || '';
              if ((!startTime || !endTime) && rawTimeStr && rawTimeStr.includes('-')) {
                const parts = rawTimeStr.split('-').map(s => s.trim());
                if (!startTime) startTime = parts[0];
                if (!endTime && parts[1]) endTime = parts[1];
              }

              const timeRange = startTime && endTime ? `${startTime} - ${endTime}` : (startTime || rawTimeStr || '');

              // Class and subject live under schedule.courseClass
              const courseClass = scheduleObj.courseClass || null;
              const className = courseClass?.class?.name || courseClass?.name || it.class?.name || null;
              const subjectName = courseClass?.subject?.name || it.subject?.name || null;

              const room = it.room || scheduleObj.room || null;
              const teacherObj = it.teacher || scheduleObj.teacher || null;

              return {
                id: it.id,
                course: subjectName || courseClass?.name || 'Môn học',
                className,
                timeslot: { id: timeSlotId, name: scheduleTimeSlot?.name || it.timeslot?.name, idx: scheduleTimeSlot?.idx ?? it.timeslot?.idx },
                time: timeRange,
                startTime,
                endTime,
                date: it.date,
                subject: { name: subjectName },
                teacher: { name: teacherObj?.name, teacher_identifier: teacherObj?.teacher_identifier },
                class: courseClass ? { id: courseClass?.class?.id ?? courseClass?.id, name: className } : null,
                room: room ? { code: room.code || null, name: room.name || null, floor_number: room.floor_number ?? null, building: room.building || {} } : null,
                raw: it,
              };
            };

            const normalizeWeekSchedule = (weekSchedule = [], rawTimeSlots = []) => {
              const timeSlots = normalizeTimeSlots(rawTimeSlots);
              return (weekSchedule || []).map(it => normalizeInstance(it, timeSlots));
            };

            const mapped = normalizeWeekSchedule(weekSchedule, rawTimeSlots);
            setScheduleToday(mapped);
          } else {
            // fallback: if user not present or API returned empty, try class-based daily fetch as before
            const classId = student?.course_class?.id || student?.class?.id || student?.class_id || student?.course_class_id;
            if (classId) {
              const yyyy = new Date().toISOString().slice(0,10);
              const rows = await fetchScheduleForClassOnDate(classId, yyyy);
              if (!cancelled && Array.isArray(rows)) setScheduleToday(rows.map(r => ({ ...r, raw: r })));
            }
          }
        } catch (err) {
          console.error('Failed to fetch schedule for student', err);
        }
      } catch (err) {
        console.error('Failed to fetch profile', err);
        if (!cancelled) setError('Không thể tải thông tin sinh viên');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchData();

    // no mock data: use API-only. scheduleToday will be set from API response (or remain []).
    return () => { cancelled = true; };
  }, []);

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
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              <div className="lg:col-span-2">
                <StudentInfoCard profile={profile} />
                <div className="mt-4">
                  <InfoGroups profile={profile} />
                </div>
              </div>

              <div className="lg:col-span-1 flex flex-col gap-4">
                <NextClassCard scheduleToday={scheduleToday} nextClassDisplay={nextClassDisplay} />
                <Notifications notifications={notifications} />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <UpcomingClasses upcoming={upcoming} scheduleToday={scheduleToday} />
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
