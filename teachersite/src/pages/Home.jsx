import { useEffect, useState } from 'react';
import authService from '../services/authService';
import { fetchScheduleForTeacherOnDate } from '../services/scheduleService';
import { Link } from 'react-router-dom';

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
            <div className="font-medium break-words">{profile?.email_school || profile?.user?.username || '—'}</div>
          </div>

          <div className="sm:col-span-2">
            <div className="text-xs text-gray-400">Email cá nhân</div>
            <div className="font-medium break-words">{profile?.email_personal || '—'}</div>
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
            <div className="text-xs text-gray-400">Next Class Today</div>
            <div className="text-lg font-semibold text-gray-800">{hasClass ? (nextClassDisplay.course || 'Môn học') : 'Hôm nay không có lớp'}</div>
            <div className="text-sm text-gray-500 mt-1">{hasClass ? (nextClassDisplay.time || '') : 'Chúc bạn một ngày tốt lành!'}</div>
            {/* Room code moved below summary */}
            { hasClass && (
              <div className="mt-3 text-sm text-gray-600 border-t pt-3">
                <div className="text-xs text-gray-400">Phòng</div>
                <div className="text-lg font-semibold text-gray-800">{nextClassDisplay.room?.code || '—'}</div>
              </div>
            )}
          </div>
        </div>

        <div className="text-sm text-gray-600 text-right">
          <div className="mb-1"><span className="text-xs text-gray-400">Tầng</span>
            <div className="font-medium">{(nextClassDisplay.room?.floor_number === 0) ? 'Tầng trệt' : (nextClassDisplay.room?.floor_number ?? '—')}</div>
          </div>
          <div className="mb-1"><span className="text-xs text-gray-400">Tòa</span><div className="font-medium">{nextClassDisplay.room?.building?.name || '—'}</div></div>
          <div><span className="text-xs text-gray-400">Cơ sở</span><div className="font-medium">{nextClassDisplay.room?.building?.campus?.name || '—'}</div></div>
        </div>
        </div>


      { !hasClass && (
        <div className="mt-4 text-sm text-gray-500 border-t pt-4">
          <div>Không có lịch hôm nay. Bạn có thể xem lịch đầy đủ để lên kế hoạch.</div>
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
                  <div className="font-medium text-gray-800">{u.course}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{u.time || ''}</div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-sm text-gray-500 py-6">
            <div className="font-medium mb-1">Hôm nay bạn không có lớp</div>
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
  const [scheduleToday, setScheduleToday] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // (removed unused stats cards)

  // helper: try to parse start time from timeslot name like "07:30-09:00"
  const parseStartTime = (timeslotName) => {
    if (!timeslotName) return null;
    const m = timeslotName.match(/(\d{1,2}:\d{2})/);
    return m ? m[1] : null;
  };

  // compute next class from scheduleToday (attempt best-effort)
  const computeNextClass = (list) => {
    if (!list || list.length === 0) return null;
    // Try sort by timeslot.idx if present, else by parsed time
    const items = [...list];
    items.sort((a, b) => {
      const ai = a.timeslot?.idx ?? 0;
      const bi = b.timeslot?.idx ?? 0;
      if (ai !== bi) return ai - bi;
      const at = parseStartTime(a.timeslot?.name) || '00:00';
      const bt = parseStartTime(b.timeslot?.name) || '00:00';
      return at.localeCompare(bt);
    });
    const now = new Date();
    const nowStr = now.toTimeString().slice(0,5);
    for (const it of items) {
      const start = parseStartTime(it.timeslot?.name) || '00:00';
      if (start >= nowStr) return it;
    }
    // fallback: return first
    return items[0];
  };

  const nextClass = computeNextClass(scheduleToday);
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
      }
    : noClassDisplay;

  // derive display values
  const teacher = profile || { name: '—', faculty: '-', academic_title: '-' };
  const upcoming = (scheduleToday && scheduleToday.length > 0)
    ? scheduleToday.slice(0, 5).map(s => ({ id: s.id, course: s.subject?.name || s.course_class_name || s.course?.name || s.courseName || s.name || 'Môn học', time: s.timeslot?.name || s.time || '' }))
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
        // after profile loaded, fetch today's schedule for this teacher
        if (!cancelled && teacherRes && teacherRes.id) {
          try {
            const today = new Date().toISOString().slice(0,10); // YYYY-MM-DD
            const todays = await fetchScheduleForTeacherOnDate(teacherRes.id, today);
            if (!cancelled && Array.isArray(todays) && todays.length > 0) {
              setScheduleToday(todays.map(it => ({
                id: it.id,
                timeslot: { name: it.timeslot?.name, idx: it.timeslot?.idx },
                subject: { name: it.subject?.name || it.title },
                teacher: { name: it.teacher?.name },
                room: { code: it.room?.code || (it.room || {}).code, building: it.room?.building || {} },
                time: it.timeslot?.name || '',
              })));
            }
          } catch (err) {
            console.warn('Failed to fetch today schedule', err);
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

  // Optional: placeholder notifications; no backend change
  const notifications = [];

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto p-6 lg:p-8">
        {loading ? (
          <div className="p-6 bg-white rounded-lg shadow-sm text-center">Đang tải dữ liệu...</div>
        ) : (
          <>
            {/* Header row: teacher card + next class */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              <div className="lg:col-span-2">
                <TeacherInfoCard profile={profile} />
                <div className="mt-4">
                  <InfoGroups profile={profile} />
                </div>
              </div>

              <div className="lg:col-span-1 flex flex-col gap-4">
                <NextClassCard scheduleToday={scheduleToday} nextClassDisplay={nextClassDisplay} />
                <Notifications notifications={notifications} />
              </div>
            </div>

            {/* Main content grid */}
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