import React, { useEffect, useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

import Button from "../components/ui/button/Button.jsx";
import Modal from "../components/ui/modal/index.jsx";
import ContinuousCalendar from "../components/holiday/ContinuousCalendar.jsx";
import PageMeta from "../components/common/PageMeta.jsx";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  getAllSemesters,
  createSemester,
  updateSemester,
  deleteSemester,
} from "../services/semesterService.js";
import authService from "../services/authService.js";
import { formatDateDisplay, toISODate } from "../utils/dateUtils.js";

const initialForm = {
  code: "",
  term: "HK1",
  name: "",
  AcademicYearsid: "",
  start: "",
  end: "",
  status: "",
};

  // 🧩 Schema Yup Validation
  const semesterSchema = yup.object({
    code: yup
        .string()
        .trim()
        .required("Mã học kỳ không được để trống")
        .min(2, "Mã học kỳ phải có ít nhất 2 ký tự")
        .max(50, "Mã học kỳ không được vượt quá 50 ký tự"),
    name: yup
        .string()
        .trim()
        .required("Tên học kỳ không được để trống")
        .min(3, "Tên học kỳ phải có ít nhất 3 ký tự")
        .max(255, "Tên học kỳ không được vượt quá 255 ký tự"),
    AcademicYearsid: yup
        .string()
        .required("Vui lòng chọn năm học"),
    start: yup
        .date()
        .required("Vui lòng chọn ngày bắt đầu"),
    end: yup
        .date()
        .required("Vui lòng chọn ngày kết thúc")
        .min(yup.ref("start"), "Ngày kết thúc phải sau ngày bắt đầu"),
    status: yup
        .string()
        .required("Vui lòng chọn trạng thái"),
  });

  // Schema cho Loại đào tạo
  const trainingTypeSchema = yup.object({
    name: yup
        .string()
        .trim()
        .required('Tên không được để trống')
        .min(3, 'Tên phải có ít nhất 3 ký tự')
        .max(255, 'Tên không được vượt quá 255 ký tự'),
    code: yup
        .string()
        .trim()
        .required('Mã không được để trống')
        .matches(/^[A-Za-z0-9_-]+$/, 'Mã chỉ được chứa chữ, số, gạch dưới hoặc gạch ngang'),
    description: yup.string().trim().optional(),
  });

export default function SemesterManagement() {
  const [semesters, setSemesters] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  // form / modal / filter state (missing previously)
  const [form, setForm] = useState(initialForm);
  const [editId, setEditId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  
  
  useEffect(() => {
    fetchSemesters();
    fetchAcademicYears();
  }, []);

  const fetchSemesters = async () => {
    try {
      const data = await getAllSemesters();
      setSemesters(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch semesters", err);
    }
  };

  const fetchAcademicYears = async () => {
    try {
      const res = await authService.apiClient.get("/academic-years");
      const payload = res?.data?.data ?? res?.data ?? [];
      setAcademicYears(Array.isArray(payload) ? payload : []);
    } catch (err) {
      console.error("Failed to fetch academic years", err);
    }
  };

  // ✅ Map lỗi backend vào form
  const handleBackendErrors = (err) => {
    const errors = err?.response?.data?.errors;
    if (Array.isArray(errors)) {
      errors.forEach((error) => {
        if (error.field) {
          formInstance.setError(error.field, {
            type: "server",
            message: error.message,
          });
        }
      });
    } else {
      const message = err?.response?.data?.message || err.message;
      formInstance.setError("root.serverError", {
        type: "server",
        message: message,
      });
    }
  };

  // // ✅ Handlers
  // const handleOpenAdd = () => {
  //   setEditSemester(null);
  //   formInstance.reset({
  //     code: "",
  //     name: "",
  //     AcademicYearsid: "",
  //     start: "",
  //     end: "",
  //     status: "",
  //   });
  //   formInstance.clearErrors();
  //   setIsModalOpen(true);
  // };

  // const handleOpenEdit = (semester) => {
  //   setEditSemester(semester);
  //   formInstance.reset({
  //     code: semester.code || "",
  //     name: semester.name || "",
  //     AcademicYearsid: semester.AcademicYearsid || semester.year_id || "",
  //     start: toISODate(semester.start || semester.startDate || ""),
  //     end: toISODate(semester.end || semester.endDate || ""),
  //     status: semester.status || "",
  //   });
  //   formInstance.clearErrors();
  //   setIsModalOpen(true);
  // };

  // const handleDelete = async (id) => {
  //   if (!window.confirm("Bạn có chắc muốn xóa học kỳ này?")) return;
  //   try {
  //     await deleteSemester(id);
  //     fetchSemesters();
  //   } catch (err) {
  //     alert(err?.response?.data?.message || "Lỗi khi xóa học kỳ");
  //   }
  // };

  // const handleSubmit = async (data) => {
  //   try {
  //     if (editSemester) {
  //       await updateSemester(editSemester.id, data);
  //     } else {
  //       await createSemester(data);
  //     }
  //     setIsModalOpen(false);
  //     fetchSemesters();
  //   } catch (err) {
  //     console.error("Failed to save semester:", err);
  //     handleBackendErrors(err);
  //   }
  // };

  const filteredSemesters = useMemo(() => {
    const q = (query || "").trim().toLowerCase();
    return (Array.isArray(semesters) ? semesters : []).filter((s) => {
      const matchesQuery = !q || (s.code + s.name).toLowerCase().includes(q);
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
    // try to parse term from existing code
    // new format: TERM startYear-endYear  (e.g. "HK1 2024-2025" or "Hè 2024-2025")
    // old format fallback: HK1-2024
    let term = "HK1";
    const code = (semester.code || "").trim();
    const newMatch = code.match(/^(HK1|HK2|Hè)\s+(\d{4})-(\d{4})$/);
    if (newMatch) {
      term = newMatch[1];
    } else {
      const oldMatch = code.match(/^(HK[1-3])-(\d{4})$/);
      if (oldMatch) term = oldMatch[1];
    }
    setForm({
      code: semester.code || "",
      term,
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

  // generate standardized code: TERM-YYYY where YYYY is the start year of the academic year
  // generate standardized code: TERM STARTYEAR-ENDYEAR where STARTYEAR and ENDYEAR come from the academic year
  const generateSemesterCode = (term, academicYearId) => {
    if (!term || !academicYearId) return "";
    const ay = academicYears.find(a => String(a.id) === String(academicYearId));
    if (!ay) return "";
    const startYear = ay.start_date ? new Date(toISODate(ay.start_date)).getFullYear() : (new Date().getFullYear());
    const endYear = ay.end_date ? new Date(toISODate(ay.end_date)).getFullYear() : (startYear + 1);
    return `${term} ${startYear}-${endYear}`;
  };

  // keep form.code in sync when user changes term or academic year
  useEffect(() => {
    const generated = generateSemesterCode(form.term || 'HK1', form.AcademicYearsid);
    if (generated && generated !== form.code) {
      setForm(prev => ({ ...prev, code: generated }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.term, form.AcademicYearsid, academicYears]);

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
    
    if (!form.AcademicYearsid) {
      setErrors({ form: 'Vui lòng chọn năm học.' });
      return;
    }
    
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

    // Validate với năm học
    const selectedAcademicYear = academicYears.find(ay => ay.id === parseInt(form.AcademicYearsid));
    if (selectedAcademicYear) {
      const yearStart = new Date(toISODate(selectedAcademicYear.start_date));
      const yearEnd = new Date(toISODate(selectedAcademicYear.end_date));
      
      if (s < yearStart) {
        setErrors({ date: `Ngày bắt đầu của học kỳ không được trước ngày bắt đầu năm học (${formatDateDisplay(selectedAcademicYear.start_date)}).` });
        return;
      }
      
      if (t > yearEnd) {
        setErrors({ date: `Ngày kết thúc của học kỳ không được sau ngày kết thúc năm học (${formatDateDisplay(selectedAcademicYear.end_date)}).` });
        return;
      }
      
      if (s > yearEnd) {
        setErrors({ date: `Ngày bắt đầu của học kỳ không được sau ngày kết thúc năm học (${formatDateDisplay(selectedAcademicYear.end_date)}).` });
        return;
      }
      
      if (t < yearStart) {
        setErrors({ date: `Ngày kết thúc của học kỳ không được trước ngày bắt đầu năm học (${formatDateDisplay(selectedAcademicYear.start_date)}).` });
        return;
      }
    }

    // validate generated code matches pattern HK[1-3]-YYYY
    const codePattern = /^(HK1|HK2|Hè)\s+\d{4}-\d{4}$/;
    if (!codePattern.test(form.code || '')) {
      setErrors({ form: 'Mã học kỳ không hợp lệ. Định dạng hợp lệ: HK1 2024-2025 hoặc Hè 2024-2025' });
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
                  <div className="flex items-center gap-3">
                    <Button
                        size="sm"
                        className="!px-6 !py-2 font-semibold bg-blue-600 hover:bg-blue-700"
                    >
                      Import Excel
                    </Button>

                    <Button size="md" variant="primary"
                            className="!px-6 !py-2 font-semibold bg-green-600 hover:bg-green-700"
                            onClick={handleOpenAdd}>
                      Thêm học kỳ
                    </Button>
                  </div>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
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
                      <tr key={s.id}>
                        <td className="px-4 py-3 text-sm">{s.code} — {s.name}</td>
                        <td className="px-4 py-3 text-sm">{(academicYears.find(a => a.id === s.AcademicYearsid)?.year_code) || s.AcademicYearsid}</td>
                        <td className="px-4 py-3 text-sm">{formatDateDisplay(s.start)}</td>
                        <td className="px-4 py-3 text-sm">{formatDateDisplay(s.end)}</td>
                        <td className="px-4 py-3 text-sm">{s.status}</td>
                        <td className="px-4 py-3 text-right text-sm">
                          <Button size="sm" variant="secondary" onClick={() => handleOpenEdit(s)}>Sửa</Button>
                          <Button size="sm" variant="danger" className="ml-2" onClick={() => handleDelete(s.id)}>Xóa</Button>
                        </td>
                      </tr>
                  ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      {/* Modal thêm / sửa học kỳ */}
      <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setEditId(null); setErrors({}); }} className="max-w-lg w-full mx-auto bg-white/98 shadow-2xl">
        <div className="p-6 bg-gradient-to-br from-white via-gray-50 to-gray-100 rounded-xl">
          <h2 className="text-2xl font-bold mb-4 text-center text-indigo-700">{editId ? 'Sửa học kỳ' : 'Thêm học kỳ'}</h2>
          <form className="space-y-4" onSubmit={handleSubmit}>
            {errors.form && <div className="text-red-600 text-sm">{errors.form}</div>}
            {errors.date && <div className="text-red-600 text-sm">{errors.date}</div>}
            {errors.submit && <div className="text-red-600 text-sm">{errors.submit}</div>}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mã học kỳ (chuẩn)</label>
              <div className="flex gap-2">
                <select value={form.term || 'HK1'} onChange={(e) => setForm({ ...form, term: e.target.value })} className="border rounded-md px-3 py-2">
                  <option value="HK1">HK1</option>
                  <option value="HK2">HK2</option>
                  <option value="Hè">Hè</option>
                </select>
                <input type="text" value={form.code || ''} readOnly className="w-full border rounded-md px-3 py-2 bg-gray-50" placeholder="Mã sẽ được sinh tự động" />
              </div>
              <p className="text-xs text-gray-500 mt-1">Mã sẽ được sinh tự động theo định dạng <span className="font-medium">HK1 2024-2025</span> hoặc <span className="font-medium">Hè 2024-2025</span>, dựa trên năm học đã chọn.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tên học kỳ</label>
              <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full border rounded-md px-3 py-2" placeholder="Tên học kỳ" />
            </div>

                            <div>
                  <label className="text-sm text-gray-600 block">Năm học <span className="text-red-500">*</span></label>
                  <select 
                    aria-label="Năm học" 
                    className="border p-2 rounded w-full" 
                    value={form.AcademicYearsid} 
                    onChange={(e) => setForm({ ...form, AcademicYearsid: e.target.value })} 
                    required
                  >
                    <option value="">Chọn năm học</option>
                    {academicYears.map((ay) => (<option key={ay.id} value={ay.id}>{ay.year_code}</option>))}
                  </select>
                  {!form.AcademicYearsid && (
                    <p className="mt-1 text-xs text-orange-500">
                      <svg className="inline w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      Vui lòng chọn năm học trước khi chọn ngày
                    </p>
                  )}
                  {form.AcademicYearsid && academicYears.find(ay => ay.id === parseInt(form.AcademicYearsid)) && (
                    <p className="mt-1 text-xs text-blue-600">
                      <svg className="inline w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      Năm học: {formatDateDisplay(academicYears.find(ay => ay.id === parseInt(form.AcademicYearsid))?.start_date)} - {formatDateDisplay(academicYears.find(ay => ay.id === parseInt(form.AcademicYearsid))?.end_date)}
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-sm text-gray-600 block mb-1">Ngày bắt đầu <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <input
                      aria-label="Ngày bắt đầu"
                      className={`border p-2.5 rounded-lg w-full pr-10 ${
                        !form.AcademicYearsid 
                          ? 'bg-gray-100 cursor-not-allowed border-gray-200 text-gray-400' 
                          : 'border-gray-300 cursor-pointer'
                      }`}
                      type="text"
                      value={formatDateDisplay(form.start)}
                      required
                      readOnly
                      disabled={!form.AcademicYearsid}
                      onClick={() => form.AcademicYearsid && setShowStartPicker(!showStartPicker)}
                      placeholder={form.AcademicYearsid ? "Chọn ngày bắt đầu" : "Chọn năm học trước"}
                    />
                    <button
                      type="button"
                      className={`absolute right-3 top-1/2 -translate-y-1/2 ${
                        !form.AcademicYearsid 
                          ? 'text-gray-300 cursor-not-allowed' 
                          : 'text-blue-500 hover:text-blue-600'
                      }`}
                      onClick={() => form.AcademicYearsid && setShowStartPicker(!showStartPicker)}
                      tabIndex={-1}
                      disabled={!form.AcademicYearsid}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </button>
                    {showStartPicker && form.AcademicYearsid && (
                      <div className="absolute z-50 mt-1 bg-white shadow-xl rounded-lg border border-gray-200">
                        <DatePicker
                          selected={form.start ? new Date(toISODate(form.start)) : null}
                          onChange={date => {
                            if (date) {
                              const iso = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
                              setForm({ ...form, start: iso });
                            }
                            setShowStartPicker(false);
                          }}
                          minDate={
                            form.AcademicYearsid 
                              ? new Date(toISODate(academicYears.find(ay => ay.id === parseInt(form.AcademicYearsid))?.start_date || ''))
                              : null
                          }
                          maxDate={
                            form.AcademicYearsid 
                              ? new Date(toISODate(academicYears.find(ay => ay.id === parseInt(form.AcademicYearsid))?.end_date || ''))
                              : null
                          }
                          dateFormat="dd/MM/yyyy"
                          inline
                          onClickOutside={() => setShowStartPicker(false)}
                          className="custom-datepicker"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-sm text-gray-600 block mb-1">Ngày kết thúc <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <input
                      aria-label="Ngày kết thúc"
                      className={`border p-2.5 rounded-lg w-full pr-10 ${
                        !form.AcademicYearsid 
                          ? 'bg-gray-100 cursor-not-allowed border-gray-200 text-gray-400' 
                          : 'border-gray-300 cursor-pointer'
                      }`}
                      type="text"
                      value={formatDateDisplay(form.end)}
                      required
                      readOnly
                      disabled={!form.AcademicYearsid}
                      onClick={() => form.AcademicYearsid && setShowEndPicker(!showEndPicker)}
                      placeholder={form.AcademicYearsid ? "Chọn ngày kết thúc" : "Chọn năm học trước"}
                    />
                    <button
                      type="button"
                      className={`absolute right-3 top-1/2 -translate-y-1/2 ${
                        !form.AcademicYearsid 
                          ? 'text-gray-300 cursor-not-allowed' 
                          : 'text-blue-500 hover:text-blue-600'
                      }`}
                      onClick={() => form.AcademicYearsid && setShowEndPicker(!showEndPicker)}
                      tabIndex={-1}
                      disabled={!form.AcademicYearsid}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </button>
                    {showEndPicker && form.AcademicYearsid && (
                      <div className="absolute z-50 mt-1 bg-white shadow-xl rounded-lg border border-gray-200">
                        <DatePicker
                          selected={form.end ? new Date(toISODate(form.end)) : null}
                          onChange={date => {
                            if (date) {
                              const iso = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
                              setForm({ ...form, end: iso });
                            }
                            setShowEndPicker(false);
                          }}
                          minDate={
                            form.start 
                              ? new Date(toISODate(form.start))
                              : form.AcademicYearsid 
                                ? new Date(toISODate(academicYears.find(ay => ay.id === parseInt(form.AcademicYearsid))?.start_date || ''))
                                : null
                          }
                          maxDate={
                            form.AcademicYearsid 
                              ? new Date(toISODate(academicYears.find(ay => ay.id === parseInt(form.AcademicYearsid))?.end_date || ''))
                              : null
                          }
                          dateFormat="dd/MM/yyyy"
                          inline
                          onClickOutside={() => setShowEndPicker(false)}
                          className="custom-datepicker"
                        />
                      </div>
                    )}
                  </div>
                </div>
                
                {errors.date && (<div className="text-sm text-red-500">{errors.date}</div>)}

                {form.start && form.end && (
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-blue-800 mb-1">Khoảng thời gian đã chọn</p>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-gray-700">{formatDateDisplay(form.start)}</span>
                          <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                          </svg>
                          <span className="text-gray-700">{formatDateDisplay(form.end)}</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-blue-600 mt-2">
                      Tổng số ngày: {Math.ceil((new Date(form.end) - new Date(form.start)) / (1000 * 60 * 60 * 24)) + 1} ngày
                    </p>
                  </div>
                )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full border rounded-md px-3 py-2">
                <option value="">-- Chọn trạng thái --</option>
                <option value="active">Đang diễn ra</option>
                <option value="finished">Đã kết thúc</option>
                <option value="upcoming">Sắp diễn ra</option>
              </select>
            </div>

            <div className="flex justify-end gap-3 mt-4">
              <Button type="submit" size="md" variant="primary" className="px-5 py-2" disabled={isSubmitting}>
                {isSubmitting ? 'Đang lưu...' : 'Lưu'}
              </Button>
              <Button size="md" variant="outline" className="px-5 py-2" onClick={() => { setIsModalOpen(false); setEditId(null); setErrors({}); }}>
                Hủy
              </Button>
            </div>
          </form>
        </div>
      </Modal>

    </>
  );
}

