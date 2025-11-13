import { useEffect, useState } from 'react';
import authService from '../services/authService';
import { Link } from 'react-router-dom';
// NavBar is rendered globally by AppLayout

export default function Home() {
  // header dropdown state moved into NavBar component

  // UI state
  const [profile, setProfile] = useState(null);
  const [scheduleToday, setScheduleToday] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // (removed unused stats cards) 

  // logout is handled by the global NavBar

  // helper: try to parse start time from timeslot name like "07:30-09:00"
  const parseStartTime = (timeslotName) => {
    if (!timeslotName) return null;
    const m = timeslotName.match(/(\d{1,2}:\d{2})/);
    return m ? m[1] : null;
  };

  // helper: initials for avatar fallback
  // (avatar/initials removed — not needed)

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
  const nextClassDisplay = nextClass || {
    course: '—',
    time: '—',
    room: { name: '—', code: '—', floor_number: null, building: { name: '—', campus: { name: '—' } } },
    teacher: { name: '—', teacher_identifier: '—' },
  };

  // derive display values
  const student = profile || { name: '—', program: '-', year: '-' };
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
  // call the studentsite-specific profile endpoint
  const res = await authService.apiClient.get('/studentsite/profile');
        const student = res?.data?.data || null;
        if (!cancelled) setProfile(student);
      } catch (err) {
        console.error('Failed to fetch profile', err);
        if (!cancelled) setError('Không thể tải thông tin sinh viên');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchData();

    // keep the small schedule mock so UI still shows upcoming classes
    const ts1 = { id: 1, name: '07:30-09:00', idx: 1 };
    const ts2 = { id: 2, name: '09:15-10:45', idx: 2 };
    const ts3 = { id: 3, name: '11:00-12:30', idx: 3 };
    const subj1 = { id: 1, name: 'Lập trình Cơ bản' };
    const subj2 = { id: 2, name: 'Cơ sở dữ liệu' };
    const teacher1 = { id: 1, name: 'Nguyễn Văn A', teacher_identifier: 'GV001' };
    const room101 = { id: 101, code: '1A01', name: 'Phòng TSCH-A - Tầng trệt - 01', floor_number: 0, building: { name: 'Tòa A1', campus: { name: 'Trụ sở chính' } } };
    const mockSchedules = [
      { id: 1001, timeslot: ts1, subject: subj1, teacher: teacher1, room: room101 },
      { id: 1002, timeslot: ts2, subject: subj2, teacher: teacher1, room: room101 },
      { id: 1003, timeslot: ts3, subject: subj1, teacher: teacher1, room: room101 },
    ];
    setScheduleToday(mockSchedules);

    return () => { cancelled = true; };
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {loading ? (
          <div className="p-6 bg-white rounded shadow text-center">Đang tải dữ liệu...</div>
        ) : (
          <>
            <div className="bg-white border border-blue-300 rounded-lg shadow p-4 mb-6">
              <h3 className="text-lg font-medium text-blue-700 flex items-center gap-2">
                <span>Thông tin sinh viên</span>
              </h3>

              {/* three-column compact layout like the provided sample (no avatar) */}
              <div className="mt-4 text-sm text-gray-700">
                <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x sm:divide-blue-100">
                  <div className="py-3 px-4">
                    <div className="text-xs text-gray-500">Mã SV:</div>
                    <div className="font-medium">{profile?.student_identifier || '—'}</div>

                    <div className="text-xs text-gray-500 mt-3">Tên sinh viên:</div>
                    <div className="font-medium">{profile?.name || '—'}</div>

                    <div className="text-xs text-gray-500 mt-3">Ngày sinh:</div>
                    <div className="font-medium">{profile?.date_of_birth ? new Date(profile.date_of_birth).toLocaleDateString() : '—'}</div>

                    <div className="text-xs text-gray-500 mt-3">Giới tính:</div>
                    <div className="font-medium">{profile?.gender || '—'}</div>

                    <div className="text-xs text-gray-500 mt-3">Trạng thái:</div>
                    <div className="font-medium">{profile?.status || '—'}</div>
                  </div>

                  <div className="py-3 px-4">
                    <div className="text-xs text-gray-500">Số điện thoại:</div>
                    <div className="font-medium">{profile?.phone || '—'}</div>

                    <div className="text-xs text-gray-500 mt-3">Số CMND/CCCD:</div>
                    <div className="font-medium">{profile?.identity_number || profile?.id_number || '—'}</div>

                    <div className="text-xs text-gray-500 mt-3">Dân tộc:</div>
                    <div className="font-medium">{profile?.ethnicity || profile?.dan_toc || '—'}</div>

                    <div className="text-xs text-gray-500 mt-3">Tôn giáo:</div>
                    <div className="font-medium">{profile?.religion || profile?.ton_giao || '—'}</div>

                    <div className="text-xs text-gray-500 mt-3">Nơi sinh:</div>
                    <div className="font-medium">{profile?.place_of_birth || profile?.birth_place || profile?.noi_sinh || '—'}</div>
                  </div>

                  <div className="py-3 px-4">
                    <div className="text-xs text-gray-500">Quốc tịch:</div>
                    <div className="font-medium">{profile?.nationality || 'Việt Nam'}</div>

                    <div className="text-xs text-gray-500 mt-3">Email trường:</div>
                    <div className="font-medium wrap-break-word">
                      {profile?.email_school ? (
                        <a className="text-blue-600 hover:underline" href={`mailto:${profile.email_school}`}>{profile.email_school}</a>
                      ) : profile?.user?.username ? (
                        <span className="text-gray-700">{profile.user.username}</span>
                      ) : (
                        '—'
                      )}
                    </div>

                    <div className="text-xs text-gray-500 mt-3">Email cá nhân:</div>
                    <div className="font-medium wrap-break-word">
                      {profile?.email_personal ? (
                        <a className="text-blue-600 hover:underline" href={`mailto:${profile.email_personal}`}>{profile.email_personal}</a>
                      ) : (
                        '—'
                      )}
                    </div>

                    <div className="text-xs text-gray-500 mt-3">Địa chỉ:</div>
                    <div className="font-medium">{profile?.address || '—'}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {error && <div className="col-span-full p-3 bg-red-50 text-red-700 rounded">{error}</div>}

              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h1 className="text-2xl font-semibold">Xin chào, {student.name}</h1>
                      <p className="text-sm text-gray-500">Chương trình: {student.program} · {student.year}</p>
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2 bg-white p-4 rounded shadow">
                      <div className="text-sm text-gray-500">Next class</div>
                      <div className="mt-2 font-medium">{nextClassDisplay.course}</div>
                      <div className="text-sm text-gray-500 mt-1">{nextClassDisplay.time}</div>
                    </div>

                    <div className="p-4 bg-gray-50 rounded">
                      <div className="text-sm text-gray-500">Phòng học</div>
                      <div className="mt-2 font-medium">{nextClassDisplay.room?.code || '—'}</div>
                      <div className="text-sm text-gray-500">{nextClassDisplay.room?.name || '—'}</div>
                    </div>

                    <div className="p-4 bg-gray-50 rounded">
                      <div className="text-sm text-gray-500">Tòa & Tầng</div>
                      <div className="mt-2 font-medium">{nextClassDisplay.room?.building?.name || '—'}</div>
                      <div className="text-sm text-gray-500">Tầng: {nextClassDisplay.room?.floor_number === 0 ? 'tầng chệt' : (nextClassDisplay.room?.floor_number ?? '—')}</div>
                    </div>

                    <div className="p-4 bg-gray-50 rounded">
                      <div className="text-sm text-gray-500">Cơ sở</div>
                      <div className="mt-2 font-medium">{nextClassDisplay.room?.building?.campus?.name || '—'}</div>
                    </div>

                    <div className="p-4 bg-gray-50 rounded">
                      <div className="text-sm text-gray-500">Giảng viên</div>
                      <div className="mt-2 font-medium">{nextClassDisplay.teacher?.name || '—'}</div>
                      <div className="text-sm text-gray-500">Mã: {nextClassDisplay.teacher?.teacher_identifier || '—'}</div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-lg font-medium">Upcoming classes</h2>
                  <ul className="mt-4 space-y-2">
                    {upcoming.map(u => (
                      <li key={u.id} className="p-3 border rounded flex justify-between items-center">
                        <div>
                          <div className="font-medium">{u.course}</div>
                        </div>
                        <div className="text-sm text-gray-500">{u.time}</div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <aside className="space-y-6">
                <div className="bg-white rounded-lg shadow p-4">
                  <h3 className="font-medium">Thông báo</h3>
                  <div className="mt-3 text-sm text-gray-500">Hiện bạn chưa có thông báo mới.</div>
                </div>

                <div className="bg-white rounded-lg shadow p-4">
                  <h3 className="font-medium">Quick actions</h3>
                  <div className="mt-3 flex flex-col gap-2">
                    <Link to="/schedule" className="px-3 py-2 bg-blue-600 text-white rounded text-sm text-center">Xem thời khóa biểu</Link>
                    <Link to="/profile" className="px-3 py-2 border rounded text-sm text-center">Xem thông tin cá nhân</Link>
                    <Link to="/change-password" className="px-3 py-2 border rounded text-sm text-center">Thay đổi mật khẩu</Link>
                  </div>
                </div>
              </aside>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
