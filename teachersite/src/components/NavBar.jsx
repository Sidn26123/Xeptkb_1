import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import UnavailableTimesModal from './researchSchedule/UnavailableTimesModal';

export default function NavBar({ teacher = { name: '—' }, onLogout = () => {} }) {
  const [showAccount, setShowAccount] = useState(false);
  const [showScheduleMenu, setShowScheduleMenu] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const scheduleRef = useRef(null);
  const accountRef = useRef(null);

  const closeMenu = () => setShowAccount(false);

  // Close dropdowns when clicking outside or pressing Escape
  useEffect(() => {
    function handleDocClick(e) {
      // If clicking a button that toggles menus (has aria-haspopup), don't close
      if (e.target && typeof e.target.closest === 'function' && e.target.closest('[aria-haspopup="true"]')) return;

      if (scheduleRef.current && scheduleRef.current.contains(e.target)) return;
      if (accountRef.current && accountRef.current.contains(e.target)) return;
      setShowScheduleMenu(false);
      setShowAccount(false);
    }

    function handleKey(e) {
      if (e.key === 'Escape') {
        setShowScheduleMenu(false);
        setShowAccount(false);
        setModalOpen(false);
      }
    }

    document.addEventListener('pointerdown', handleDocClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('pointerdown', handleDocClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [scheduleRef, accountRef]);

  return (
    <header className="bg-white shadow fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-3">
            <Link to="/teacher-home" className="inline-flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50" title="Trang chủ">
              {/* Home button */}
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path d="M10 2L2 8v8a1 1 0 001 1h5v-6h4v6h5a1 1 0 001-1V8l-8-6z" /></svg>
              Home
            </Link>
          </div>

          <div className="flex items-center gap-4">
            {/* Grouped dropdown: Thời khóa biểu */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowScheduleMenu(prev => {
                    const next = !prev;
                    if (next) setShowAccount(false);
                    return next;
                  });
                }}
                className="inline-flex items-center px-3 py-2 border rounded-md bg-white text-sm hover:bg-gray-50"
                aria-haspopup="true"
                aria-expanded={showScheduleMenu}
                title="Thời khóa biểu"
              >
                Thời khóa biểu
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </button>
              {showScheduleMenu && (
                <div ref={scheduleRef} className="origin-top-left absolute left-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-20">
                  <div className="py-1">
                    <Link to="/schedule" onClick={() => setShowScheduleMenu(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Xem thời khóa biểu</Link>
                  </div>
                  <div className="py-1">
                    <button onClick={() => { setShowScheduleMenu(false); setModalOpen(true); }} className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Cung cấp thời gian bận</button>
                  </div>
                </div>
              )}

              <UnavailableTimesModal open={modalOpen} onClose={() => setModalOpen(false)} />

            {/* Account dropdown */}
            </div>
            <div className="relative">
              <button onClick={() => { setShowAccount(prev => { const next = !prev; if (next) setShowScheduleMenu(false); return next; }); }} className="inline-flex items-center px-3 py-2 border rounded-md bg-white text-sm hover:bg-gray-50" aria-haspopup="true" aria-expanded={showAccount} title="Tài khoản">
                <span className="truncate max-w-xs">{teacher.name}</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </button>
              {showAccount && (
                <div ref={accountRef} className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-20">
                  <div className="py-1">
                    <Link to="/profile" onClick={closeMenu} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Thông tin cá nhân</Link>
                    <Link to="/change-password" onClick={closeMenu} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Thay đổi mật khẩu</Link>
                    <button onClick={() => { closeMenu(); onLogout(); }} className="w-full text-left block px-4 py-2 text-sm text-red-600 hover:bg-gray-100">Logout</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
