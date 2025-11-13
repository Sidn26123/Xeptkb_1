import { useState } from 'react';
import authService from '../services/authService';
import { showSuccess, showError } from '../utils/toastUtils';
import { useNavigate } from 'react-router-dom';

export default function ChangePassword() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validate = () => {
    if (!currentPassword) { showError('Vui lòng nhập mật khẩu hiện tại'); return false; }
    if (!newPassword) { showError('Vui lòng nhập mật khẩu mới'); return false; }
    if (newPassword.length < 6) { showError('Mật khẩu mới phải có ít nhất 6 ký tự'); return false; }
    if (newPassword !== confirmPassword) { showError('Mật khẩu mới và xác nhận không khớp'); return false; }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    // debug: notify user that request is being sent
    // and log to console for easier troubleshooting
    console.debug('ChangePassword: sending request to /auth/change-password');
    showSuccess && null;
    try {
      // use centralized service method so all API logic (interceptors, tokens) stays in one place
      await authService.changePassword(currentPassword, newPassword);
      showSuccess('Đổi mật khẩu thành công');
      // optional: redirect to home or sign-in
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
      // navigate back to profile page
      navigate('/profile');
    } catch (err) {
      console.error('change password error', err);
      const msg = err?.response?.data?.message || err?.response?.data?.error || 'Đổi mật khẩu thất bại';
      showError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="max-w-7xl mx-auto p-6">
        <div className="bg-white rounded shadow p-6">
          <h1 className="text-xl font-semibold">Đặt lại mật khẩu</h1>
          <div className="mt-4 border-t pt-4">
            <div className="bg-red-50 border border-red-100 text-red-700 p-3 rounded text-sm">Vui lòng đặt lại mật khẩu mới</div>

            <form onSubmit={handleSubmit} className="mt-6">
              <div className="grid grid-cols-1 gap-4 max-w-3xl w-full">
                <div className="flex items-center">
                  <label className="w-48 text-sm text-gray-700">Mật khẩu cũ</label>
                  <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="flex-1 min-w-0 border rounded px-3 py-2" />
                </div>

                <div className="flex items-center">
                  <label className="w-48 text-sm text-gray-700">Mật khẩu mới</label>
                  <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="flex-1 min-w-0 border rounded px-3 py-2" />
                </div>

                <div className="flex items-center">
                  <label className="w-48 text-sm text-gray-700">Nhập lại mật khẩu</label>
                  <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="flex-1 min-w-0 border rounded px-3 py-2" />
                </div>

                <div className="pt-4 border-t">
                  <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">
                    {loading ? 'Đang thay đổi...' : 'Thay đổi mật khẩu'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
