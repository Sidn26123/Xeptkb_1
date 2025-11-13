import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import authService from "../services/authService";

export default function SignIn() {
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const payload = { username, password };
      const res = await authService.login(payload);
      const data = res && res.data ? res.data : null;
      if (data && data.accessToken) {
        // extract role from response or token
        const role = data.role || data?.user?.role || null;
        // only allow student role to sign in to studentsite
        if (!role || String(role).toLowerCase() !== 'student') {
          setError('Bạn không có quyền truy cập');
          return;
        }
        authService.saveTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken }, !!isChecked);
        // persist role
        authService.saveRole(role, !!isChecked);
        const from = location.state?.from?.pathname || '/student-home';
        navigate(from, { replace: true });
        return;
      }
      setError('Đăng nhập thất bại');
    } catch (err) {
      setError(err?.response?.data?.message || 'Lỗi khi đăng nhập');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md p-8 bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">Sign In</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Enter your email and password to sign in!</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email <span className="text-red-500">*</span></label>
              <input value={username} onChange={(e)=>setUsername(e.target.value)} className="mt-1 block w-full rounded-md border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-2" placeholder="info@gmail.com" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password <span className="text-red-500">*</span></label>
              <div className="relative">
                <input value={password} onChange={(e)=>setPassword(e.target.value)} type={showPassword ? "text" : "password"} className="mt-1 block w-full rounded-md border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-2" placeholder="Enter your password" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-2 top-2 text-sm text-gray-500">{showPassword ? 'Hide' : 'Show'}</button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <input type="checkbox" checked={isChecked} onChange={(e)=>setIsChecked(e.target.checked)} />
                <span className="text-sm text-gray-700">Keep me logged in</span>
              </div>
            </div>

            <div>
              <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-2 rounded-md">{loading ? 'Signing in...' : 'Sign in'}</button>
            </div>
          </div>
        </form>
        {error && <div className="mt-4 text-sm text-red-600">{error}</div>}
    </div>
    </div>
  );
}
