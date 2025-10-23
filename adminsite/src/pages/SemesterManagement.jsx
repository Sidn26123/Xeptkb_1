import React, { useState, useEffect, useMemo } from "react";
import Button from "../components/ui/button/Button.jsx";
import Modal from "../components/ui/modal/index.jsx";
import PageMeta from "../components/common/PageMeta.jsx";
import {
  getAllSemesters,
  createSemester,
  updateSemester,
  deleteSemester,
} from "../services/semesterService.js";
import authService from "../services/authService.js";
import { formatDateDisplay, toISODate } from "../utils/dateUtils.js";
// Helpers for date formatting/parsing
const pad = (n) => n < 10 ? `0${n}` : `${n}`;




const initialForm = {
  code: "",
  name: "",
  AcademicYearsid: "",
  start: "",
  end: "",
  status: "",
};

export default function SemesterManagement() {
  const [semesters, setSemesters] = useState([]);
  const [query, setQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [editId, setEditId] = useState(null);
  const [academicYears, setAcademicYears] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchSemesters();
    fetchAcademicYears();
  }, []);

  const fetchSemesters = async () => {
    try {
      const data = await getAllSemesters();
      setSemesters(Array.isArray(data) ? data : []);
    } catch (err) {
      // log error for debugging
    console.error('Failed to fetch semesters', err);
    }
  };

  const fetchAcademicYears = async () => {
    try {
      const res = await authService.apiClient.get('/academic-years');
      const payload = res?.data?.data ?? res?.data ?? [];
      setAcademicYears(Array.isArray(payload) ? payload : []);
    } catch (err) {
      console.error('Failed to fetch academic years', err);
    }
  };

  const filteredSemesters = useMemo(() => {
    const q = (query || "").trim().toLowerCase();
    return (Array.isArray(semesters) ? semesters : []).filter((s) => {
      const matchesQuery = !q || (s.code || s.name || "").toLowerCase().includes(q);
      const matchesStatus = !filterStatus || (s.status || "") === filterStatus;
      return matchesQuery && matchesStatus;
    });
  }, [semesters, query, filterStatus]);

  const handleOpenAdd = () => {
    setForm(initialForm);
    setEditId(null);
    setErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEdit = (semester) => {
    setForm({
      code: semester.code || "",
      name: semester.name || "",
      AcademicYearsid: semester.AcademicYearsid || semester.year_id || "",
      // convert stored date into ISO format for <input type=date>
      start: toISODate(semester.start || semester.startDate || ""),
      end: toISODate(semester.end || semester.endDate || ""),
      status: semester.status || "",
    });
    setErrors({});
    setEditId(semester.id);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc muốn xóa học kỳ này?")) {
      await deleteSemester(id);
      fetchSemesters();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // client-side validation: start <= end
    setErrors({});
    if (!form.start || !form.end) {
      setErrors({ date: 'Vui lòng chọn ngày bắt đầu và ngày kết thúc.' });
      return;
    }
    const s = new Date(form.start);
    const t = new Date(form.end);
    if (s > t) {
      setErrors({ date: 'Ngày bắt đầu phải nhỏ hơn hoặc bằng ngày kết thúc.' });
      return;
    }

    const payload = {
      code: form.code,
      name: form.name,
      AcademicYearsid: Number(form.AcademicYearsid) || null,
      start: form.start,
      end: form.end,
      status: form.status,
    };
    setIsSubmitting(true);
    try {
      if (editId) {
        await updateSemester(editId, payload);
      } else {
        await createSemester(payload);
      }
      setIsModalOpen(false);
      fetchSemesters();
    } catch (err) {
      console.error('Failed to save semester', err);
      setErrors({ submit: err?.message || 'Lỗi khi lưu học kỳ' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <PageMeta title="Quản lý học kỳ" description="Trang quản lý các học kỳ trong hệ thống." />
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="bg-white rounded-2xl shadow p-6 sm:p-8 border border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Quản lý học kỳ</h1>
                <p className="mt-1 text-sm text-gray-500">Xem, thêm, sửa và xóa các học kỳ trong hệ thống.</p>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="flex items-center bg-gray-100 rounded-md px-3 py-2 w-full sm:w-80">
                  <svg className="w-5 h-5 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1116.65 16.65z"></path></svg>
                  <input
                    aria-label="Tìm học kỳ"
                    placeholder="Tìm theo mã hoặc tên học kỳ..."
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
                <Button size="md" variant="primary" className="ml-2" onClick={handleOpenAdd}>+ Thêm học kỳ</Button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 hidden sm:table">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mã / Tên</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Năm học</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bắt đầu</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kết thúc</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Hành động</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {filteredSemesters.map((s) => (
                    <tr key={s.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{s.code} — {s.name}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{(academicYears.find(a => a.id === s.AcademicYearsid)?.year_code) || s.AcademicYearsid || s.year_id}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{formatDateDisplay(s.start || s.startDate)}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{formatDateDisplay(s.end || s.endDate)}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">{s.status}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-right text-sm">
                        <Button size="sm" variant="secondary" onClick={() => handleOpenEdit(s)}>Sửa</Button>
                        <Button size="sm" variant="danger" className="ml-2" onClick={() => handleDelete(s.id)}>Xóa</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="space-y-3 sm:hidden">
                {filteredSemesters.length === 0 && (
                  <div className="text-center py-8 text-gray-400">Không có học kỳ nào.</div>
                )}
                {filteredSemesters.map((s) => (
                  <div key={s.id} className="bg-gray-50 border border-gray-100 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-sm font-semibold text-gray-800">{s.code} — {s.name}</div>
                        <div className="text-xs text-gray-500">{formatDateDisplay(s.start || s.startDate)} — {formatDateDisplay(s.end || s.endDate)}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-600">{(academicYears.find(a => a.id === s.AcademicYearsid)?.year_code) || s.AcademicYearsid || s.year_id}</div>
                      </div>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <Button size="sm" variant="secondary" onClick={() => handleOpenEdit(s)}>Sửa</Button>
                      <Button size="sm" variant="danger" onClick={() => handleDelete(s.id)}>Xóa</Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} className="max-w-lg w-full mx-auto bg-white shadow">
        <div className="p-6 sm:p-8 bg-white rounded-xl shadow border border-gray-200">
          <h2 className="text-2xl font-bold mb-4 text-center text-gray-800">{editId ? 'Sửa học kỳ' : 'Thêm học kỳ'}</h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-gray-600">Mã học kỳ</label>
                <input aria-label="Mã học kỳ" className="border p-2 rounded w-full" placeholder="Mã (code)" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} required />
              </div>
              <div>
                <label className="text-sm text-gray-600">Tên học kỳ</label>
                <input aria-label="Tên học kỳ" className="border p-2 rounded w-full" placeholder="Tên học kỳ" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-600">Năm học</label>
              <select aria-label="Năm học" className="border p-2 rounded w-full" value={form.AcademicYearsid} onChange={(e) => setForm({ ...form, AcademicYearsid: e.target.value })} required>
                <option value="">Chọn năm học</option>
                {academicYears.map((ay) => (<option key={ay.id} value={ay.id}>{ay.year_code}</option>))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-gray-600">Ngày bắt đầu</label>
                <input aria-label="Ngày bắt đầu" className="border p-2 rounded w-full" type="date" value={form.start} onChange={(e) => setForm({ ...form, start: e.target.value })} required />
              </div>
              <div>
                <label className="text-sm text-gray-600">Ngày kết thúc</label>
                <input aria-label="Ngày kết thúc" className="border p-2 rounded w-full" type="date" value={form.end} onChange={(e) => setForm({ ...form, end: e.target.value })} required />
              </div>
            </div>

            {errors.date && (<div className="text-sm text-red-500">{errors.date}</div>)}

            <div>
              <label className="text-sm text-gray-600">Trạng thái</label>
              <select aria-label="Trạng thái" className="border p-2 rounded w-full" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
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