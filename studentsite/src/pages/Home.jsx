import { useEffect, useState } from 'react';
import authService from '../services/authService';
import { fetchScheduleForUserOnDate, fetchScheduleForClassOnDate } from '../services/scheduleService';
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
          const weekSchedule = await fetchScheduleForUserOnDate(student?.id, 'student');
          if (!cancelled && Array.isArray(weekSchedule) && weekSchedule.length > 0) {
            const mapped = weekSchedule.map(it => {
              const slot = (it.raw && (it.raw.timeSlot || it.raw.schedule?.timeSlot)) || null;
              const formatTwo = (n) => (n === undefined || n === null) ? '00' : String(n).padStart(2, '0');
              const timeRange = slot ? `${formatTwo(slot.start_hour)}:${formatTwo(slot.start_min)} - ${formatTwo(slot.end_hour)}:${formatTwo(slot.end_min)}` : (it.timeslot?.name || '');
              const room = it.room || (it.raw && it.raw.room) || null;
              const teacherObj = it.teacher || (it.raw && it.raw.teacher) || null;
              return {
                id: it.id,
                course: it.subject?.name || it.title || it.course || 'Môn học',
                timeslot: { name: it.timeslot?.name, idx: it.timeslot?.idx },
                time: timeRange,
                date: it.date,
                subject: { name: it.subject?.name || it.title },
                teacher: { name: teacherObj?.name, teacher_identifier: teacherObj?.teacher_identifier },
                class: it.class || null,
                room: room ? { code: room.code, name: room.name, floor_number: room.floor_number, building: room.building || {} } : null,
                raw: it.raw,
              };
            });
            setScheduleToday(mapped);
            console.debug('Studentsite Raw weekSchedule:', weekSchedule);
            console.debug('Studentsite Mapped schedule for UI:', mapped);
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
