import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import authService from '../services/authService';
import { showSuccess, showError } from '../utils/toastUtils';

// NavBar is rendered globally by AppLayout

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editAddress, setEditAddress] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await authService.apiClient.get('/studentsite/profile');
        if (!cancelled) setProfile(res?.data?.data || null);
      } catch (err) {
        console.error('Failed to load profile', err);
        if (!cancelled) setError('Không thể tải thông tin cá nhân');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchProfile();
    return () => { cancelled = true; };
  }, []);

  // sync editable fields when profile loads
  useEffect(() => {
    if (profile) {
      setEditAddress(profile.address || '');
      setEditEmail(profile.email_personal || '');
    }
  }, [profile]);

  const validateEmail = (e) => {
    if (!e) return true; // allow empty
    // simple email regex
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
  };

  const handleSave = async () => {
    if (!validateEmail(editEmail)) {
      showError('Email không hợp lệ');
      return;
    }
    setSaving(true);
    try {
      // attempt to update via studentsite profile endpoint
      const payload = { address: editAddress, email_personal: editEmail };
      const res = await authService.apiClient.put('/studentsite/profile', payload);
      const updated = res?.data?.data || { ...profile, ...payload };
      setProfile(updated);
      showSuccess('Cập nhật thông tin thành công');
    } catch (err) {
      console.error('Failed to update profile', err);
      showError('Cập nhật thất bại');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditAddress(profile?.address || '');
    setEditEmail(profile?.email_personal || '');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="max-w-7xl mx-auto p-6">
        {loading ? (
          <div className="bg-white rounded shadow p-6">Đang tải...</div>
        ) : (
          <div className="bg-white rounded shadow p-6">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-semibold">Thông tin cá nhân</h1>
              <div>
                <Link to="/change-password" className="px-3 py-2 bg-white border rounded text-sm text-blue-600 hover:bg-gray-50">Đổi mật khẩu</Link>
              </div>
            </div>
            {error && <div className="mt-3 text-sm text-red-600">{error}</div>}

            <div className="mt-4 border border-blue-200 rounded-lg p-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x sm:divide-blue-100">
                {/* Column 1 */}
                <div className="py-4 px-4">
                  <div className="text-xs text-gray-500">Mã SV</div>
                  <div className="font-medium">{profile?.student_identifier || '—'}</div>

                  <div className="text-xs text-gray-500 mt-3">Tên sinh viên</div>
                  <div className="font-medium">{profile?.name || '—'}</div>

                  <div className="text-xs text-gray-500 mt-3">Ngày sinh</div>
                  <div className="font-medium">{profile?.date_of_birth ? new Date(profile.date_of_birth).toLocaleDateString() : '—'}</div>

                  <div className="text-xs text-gray-500 mt-3">Giới tính</div>
                  <div className="font-medium">{profile?.gender || '—'}</div>

                  <div className="text-xs text-gray-500 mt-3">Trạng thái</div>
                  <div className="font-medium">{profile?.status || '—'}</div>
                </div>

                {/* Column 2 */}
                <div className="py-4 px-4">
                  <div className="text-xs text-gray-500">Số điện thoại</div>
                  <div className="font-medium">{profile?.phone || '—'}</div>

                  <div className="text-xs text-gray-500 mt-3">Số CMND/CCCD</div>
                  <div className="font-medium">{profile?.identity_number || profile?.id_number || '—'}</div>

                  <div className="text-xs text-gray-500 mt-3">Dân tộc</div>
                  <div className="font-medium">{profile?.ethnicity || profile?.dan_toc || '—'}</div>

                  <div className="text-xs text-gray-500 mt-3">Tôn giáo</div>
                  <div className="font-medium">{profile?.religion || profile?.ton_giao || '—'}</div>

                  <div className="text-xs text-gray-500 mt-3">Nơi sinh</div>
                  <div className="font-medium">{profile?.place_of_birth || profile?.birth_place || profile?.noi_sinh || '—'}</div>
                </div>

                {/* Column 3 */}
                <div className="py-4 px-4">
                  <div className="text-xs text-gray-500">Quốc tịch</div>
                  <div className="font-medium">{profile?.nationality || 'Việt Nam'}</div>

                  <div className="text-xs text-gray-500 mt-3">Email trường</div>
                  <div className="font-medium wrap-break-word">
                    {profile?.email_school ? (
                      <a className="text-blue-600 hover:underline" href={`mailto:${profile.email_school}`}>{profile.email_school}</a>
                    ) : profile?.user?.username ? (
                      <span className="text-gray-700">{profile.user.username}</span>
                    ) : (
                      '—'
                    )}
                  </div>

                  <div className="text-xs text-gray-500 mt-3">Email cá nhân</div>
                  <div className="font-medium wrap-break-word">
                    {profile?.email_personal ? (
                      <a className="text-blue-600 hover:underline" href={`mailto:${profile.email_personal}`}>{profile.email_personal}</a>
                    ) : (
                      '—'
                    )}
                  </div>

                  <div className="text-xs text-gray-500 mt-3">Địa chỉ</div>
                  <div className="font-medium">{profile?.address || '—'}</div>
                </div>
              </div>

              {/* Academic / class info row */}
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-gray-700">
                <div>
                  <div className="text-xs text-gray-500">Lớp</div>
                  <div className="font-medium">{profile?.class?.name || '—'}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Khoa</div>
                  <div className="font-medium">{profile?.class?.faculty?.name || profile?.faculty?.name || '—'}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Chương trình</div>
                  <div className="font-medium">{profile?.program || '—'}</div>
                </div>
              </div>
              
              {/* Editable permanent address and personal email */}
              <div className="mt-6 border-t pt-4">
                <h3 className="text-sm font-medium text-gray-700">Cập nhật thông tin liên hệ</h3>
                <div className="mt-3 grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500">Địa chỉ thường trú</label>
                    <textarea value={editAddress} onChange={(e) => setEditAddress(e.target.value)} rows={3} className="mt-1 w-full border rounded px-3 py-2 text-sm" />
                  </div>

                  <div>
                    <label className="block text-xs text-gray-500">Email cá nhân</label>
                    <input type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} className="mt-1 w-full border rounded px-3 py-2 text-sm" />
                  </div>

                  <div className="flex gap-3">
                    <button onClick={handleSave} disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50">{saving ? 'Đang lưu...' : 'Lưu thay đổi'}</button>
                    <button onClick={handleCancel} disabled={saving} className="px-4 py-2 border rounded text-sm">Hủy</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
