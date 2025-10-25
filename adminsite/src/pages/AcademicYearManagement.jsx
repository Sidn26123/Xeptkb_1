import React, { useState, useEffect, useMemo } from "react";
import Button from "../components/ui/button/Button.jsx";
import Modal from "../components/ui/modal/index.jsx";
import PageMeta from "../components/common/PageMeta.jsx";
import {
  getAllAcademicYears,
  createAcademicYear,
  updateAcademicYear,
  deleteAcademicYear,
} from "../services/academicYearService.js";
import { formatDateDisplay, toISODate } from "../utils/dateUtils.js";
import {showError, showSuccess} from "../utils/ToastUtils.js";
// Helpers for date formatting/parsing (same style as SemesterManagement)
const pad = (n) => (n < 10 ? `0${n}` : `${n}`);





const initialForm = {
  year_code: "",
  start_date: "",
  end_date: "",
  status: "",
};

export default function AcademicYearManagement() {
  const [years, setYears] = useState([]);
  const [query, setQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [editId, setEditId] = useState(null);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchYears();
  }, []);

  const fetchYears = async () => {
    try {
      const data = await getAllAcademicYears();
      setYears(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch academic years", err);
    }
  };

  const filteredYears = useMemo(() => {
    const q = (query || "").trim().toLowerCase();
    return (Array.isArray(years) ? years : []).filter((y) => {
      const matchesQuery = !q || (y.year_code || "").toLowerCase().includes(q);
      const matchesStatus = !filterStatus || (y.status || "") === filterStatus;
      return matchesQuery && matchesStatus;
    });
  }, [years, query, filterStatus]);

  function StatusBadge({ status }) {
    const map = {
      active: { text: 'Đang diễn ra', className: 'bg-green-100 text-green-800' },
      finished: { text: 'Đã kết thúc', className: 'bg-gray-100 text-gray-800' },
      upcoming: { text: 'Sắp diễn ra', className: 'bg-yellow-100 text-yellow-800' },
    };
    const s = map[status] || { text: status || 'Không xác định', className: 'bg-gray-100 text-gray-800' };
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${s.className}`}>{s.text}</span>
    );
  }

  const handleOpenAdd = () => {
    setForm(initialForm);
    setEditId(null);
    setErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEdit = (ay) => {
    setForm({
      year_code: ay.year_code || "",
      start_date: toISODate(ay.start_date || ""),
      end_date: toISODate(ay.end_date || ""),
      status: ay.status || "",
    });
    setErrors({});
    setEditId(ay.id);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc muốn xóa năm học này?")) {
      await deleteAcademicYear(id);
      fetchYears();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    if (!form.year_code) {
      setErrors({ form: 'Vui lòng nhập mã năm học.' });
      return;
    }
    if (!form.start_date || !form.end_date) {
      setErrors({ date: 'Vui lòng chọn ngày bắt đầu và ngày kết thúc.' });
      return;
    }
    const s = new Date(form.start_date);
    const t = new Date(form.end_date);
    if (s > t) {
      setErrors({ date: 'Ngày bắt đầu phải nhỏ hơn hoặc bằng ngày kết thúc.' });
      return;
    }

    const payload = {
      year_code: form.year_code,
      start_date: form.start_date,
      end_date: form.end_date,
      status: form.status,
    };

    setIsSubmitting(true);
    try {
      if (editId) {
        await updateAcademicYear(editId, payload);
        showSuccess('Cập nhật năm học thành công');
      } else {
        await createAcademicYear(payload);
        showSuccess('Thêm năm học thành công');
      }
      setIsModalOpen(false);
      fetchYears();
    } catch (err) {
      console.error('Failed to save academic year', err);
      showError('Lỗi khi lưu năm học');
      setErrors({ submit: err?.message || 'Lỗi khi lưu năm học' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <PageMeta title="Quản lý năm học" description="Trang quản lý các năm học trong hệ thống." />
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="bg-white rounded-2xl shadow p-6 sm:p-8 border border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Quản lý năm học</h1>
                <p className="mt-1 text-sm text-gray-500">Xem, thêm, sửa và xóa các năm học trong hệ thống.</p>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="flex items-center bg-gray-100 rounded-md px-3 py-2 w-full sm:w-80">
                  <svg className="w-5 h-5 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1116.65 16.65z"></path></svg>
                  <input
                    aria-label="Tìm mã năm học"
                    placeholder="Tìm theo mã năm học..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="bg-transparent outline-none text-sm w-full"
                  />
                </div>
                <select aria-label="Lọc trạng thái" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="border rounded-md px-3 py-2 text-sm">
                  <option value="">Tất cả trạng thái</option>
                  <option value="active">Đang diễn ra</option>
                  <option value="finished">Đã kết thúc</option>
                  <option value="upcoming">Sắp diễn ra</option>
                </select>
                <Button size="md" variant="primary" className="ml-2" onClick={handleOpenAdd}>+ Thêm năm học</Button>
              </div>
            </div>

            {/* Table for larger screens */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 hidden sm:table">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mã năm học</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày bắt đầu</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày kết thúc</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Hành động</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {filteredYears.map((y) => (
                    <tr key={y.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{y.year_code}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{formatDateDisplay(y.start_date)}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{formatDateDisplay(y.end_date)}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <StatusBadge status={y.status} />
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-right text-sm">
                        <Button size="sm" variant="secondary" onClick={() => handleOpenEdit(y)}>Sửa</Button>
                        <Button size="sm" variant="danger" className="ml-2" onClick={() => handleDelete(y.id)}>Xóa</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Card list for small screens */}
              <div className="space-y-3 sm:hidden">
                {filteredYears.length === 0 && (
                  <div className="text-center py-8 text-gray-400">Không có năm học nào.</div>
                )}
                {filteredYears.map((y) => (
                  <div key={y.id} className="bg-gray-50 border border-gray-100 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-sm font-semibold text-gray-800">{y.year_code}</div>
                        <div className="text-xs text-gray-500">{formatDateDisplay(y.start_date)} — {formatDateDisplay(y.end_date)}</div>
                      </div>
                      <div className="text-right">
                        <StatusBadge status={y.status} />
                      </div>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <Button size="sm" variant="secondary" onClick={() => handleOpenEdit(y)}>Sửa</Button>
                      <Button size="sm" variant="danger" onClick={() => handleDelete(y.id)}>Xóa</Button>
                    </div>
                  </div>
                ))}
                {filteredYears.length === 0 && (
                  <div className="text-center text-gray-500">Bạn có thể thêm năm học bằng nút 'Thêm năm học'.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} className="max-w-lg w-full mx-auto bg-white shadow">
        <div className="p-6 sm:p-8 bg-white rounded-xl shadow border border-gray-200">
          <h2 className="text-2xl font-bold mb-4 text-center text-gray-800">{editId ? 'Sửa năm học' : 'Thêm năm học'}</h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <label className="text-sm text-gray-600">Mã năm học <span className="text-red-500">*</span></label>
            <input
              name="year_code"
              aria-label="Mã năm học"
              className="border p-2 rounded"
              placeholder="Ví dụ: 2025-2026"
              value={form.year_code}
              onChange={(e) => setForm({ ...form, year_code: e.target.value })}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-gray-600">Ngày bắt đầu <span className="text-red-500">*</span></label>
                <input
                  name="start_date"
                  aria-label="Ngày bắt đầu"
                  className="border p-2 rounded w-full"
                  type="date"
                  value={form.start_date}
                  onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="text-sm text-gray-600">Ngày kết thúc <span className="text-red-500">*</span></label>
                <input
                  name="end_date"
                  aria-label="Ngày kết thúc"
                  className="border p-2 rounded w-full"
                  type="date"
                  value={form.end_date}
                  onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                  required
                />
              </div>
            </div>

            {errors.date && (<div className="text-sm text-red-500">{errors.date}</div>)}

            <div>
              <label className="text-sm text-gray-600">Trạng thái <span className="text-red-500">*</span></label>
              <select
                name="status"
                aria-label="Trạng thái"
                className="border p-2 rounded w-full"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                required
              >
                <option value="">Chọn trạng thái</option>
                <option value="active">Đang diễn ra</option>
                <option value="finished">Đã kết thúc</option>
                <option value="upcoming">Sắp diễn ra</option>
              </select>
            </div>

            <div className="flex justify-end gap-3 mt-2">
              <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Hủy</Button>
              <Button type="submit" variant="primary" disabled={isSubmitting}>{isSubmitting ? 'Đang lưu...' : (editId ? 'Cập nhật' : 'Thêm mới')}</Button>
            </div>

            {errors.submit && (<div className="mt-2 text-sm text-red-500 text-center">{errors.submit}</div>)}
          </form>
        </div>
      </Modal>
    </>
  );
}
