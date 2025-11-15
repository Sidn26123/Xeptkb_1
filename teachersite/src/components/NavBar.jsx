import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function NavBar({ teacher = { name: '—' }, onLogout = () => {} }) {
  const [showAccount, setShowAccount] = useState(false);

  const closeMenu = () => setShowAccount(false);

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
            {/* Timetable button (navigates to schedule page) */}
            <div>
              <Link to="/schedule" className="inline-flex items-center px-3 py-2 border rounded-md bg-white text-sm hover:bg-gray-50" title="Thời khóa biểu">
                Thời khóa biểu
              </Link>
            </div>

            {/* Account dropdown */}
            <div className="relative">
              <button onClick={() => { setShowAccount(!showAccount); }} className="inline-flex items-center px-3 py-2 border rounded-md bg-white text-sm hover:bg-gray-50" aria-haspopup="true" aria-expanded={showAccount} title="Tài khoản">
                <span className="truncate max-w-xs">{teacher.name}</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </button>
              {showAccount && (
                <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
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
