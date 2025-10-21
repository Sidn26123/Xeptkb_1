import { useState, useEffect } from "react";
import PageMeta from "../components/common/PageMeta.jsx";
import Button from "../components/ui/button/Button.jsx";
import Modal from "../components/ui/modal/index.jsx";
import { getAllFaculties } from '../services/facultyService.js';
import { getAllTeachers, createTeacher, updateTeacher, deleteTeacher } from '../services/teacherService.js';

export default function TeacherManagement() {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editTeacher, setEditTeacher] = useState(null);
  const [faculties, setFaculties] = useState([]);
  const [form, setForm] = useState({ name: '', teacher_identifier: '', faculty_id: '' });
  const [teachers, setTeachers] = useState([]);
  

  // clear form when opening add
  const openAdd = () => { setForm({ name: '', teacher_identifier: '', faculty_id: '' }); setIsAddOpen(true); };
  const closeAdd = () => { setIsAddOpen(false); };

  const handleEditOpen = (teacher) => {
    setEditTeacher(teacher);
    // populate form with teacher values
    setForm({ name: teacher.name || '', teacher_identifier: teacher.teacher_identifier || '', faculty_id: teacher.faculty_id || '' });
    setIsEditOpen(true);
  };
  const handleEditClose = () => {
    setEditTeacher(null);
    setIsEditOpen(false);
  };

  useEffect(() => { fetchFaculties(); }, []);

  useEffect(() => { fetchTeachers(); }, []);

  const fetchTeachers = async () => {
    try {
      const data = await getAllTeachers();
      setTeachers(Array.isArray(data) ? data : []);
    } catch (err) { console.error('Failed to load teachers', err); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa giáo viên này?')) return;
    try {
      await deleteTeacher(id);
      fetchTeachers();
    } catch (err) { console.error(err); }
  };

  const fetchFaculties = async () => {
    try {
      const data = await getAllFaculties();
      setFaculties(Array.isArray(data) ? data : []);
    } catch (err) { console.error('Failed to load faculties', err); }
  };

  return (
    <>
      <PageMeta title="Quản lý giáo viên" description="Trang quản lý danh sách giáo viên trong hệ thống." />
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="flex justify-end items-center p-4">
          <Button size="md" variant="primary" className="!px-6 !py-2 font-semibold bg-purple-600 hover:bg-purple-700" onClick={openAdd}>
            Thêm giáo viên
          </Button>
        </div>
        <div className="max-w-full overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">STT</th>
                <th className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Tên giáo viên</th>
                <th className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Mã giáo viên</th>
                <th className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Khoa</th>
                <th className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {teachers.map((teacher, idx) => (
                <tr key={teacher.id}>
                  <td className="px-5 py-4 sm:px-6 text-start">{idx + 1}</td>
                  <td className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">{teacher.name}</td>
                  <td className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">{teacher.teacher_identifier}</td>
                  <td className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">{(faculties.find(f => String(f.id) === String(teacher.faculty_id)) || {}).name || teacher.faculty_id}</td>
                  <td className="px-4 py-3 text-center">
                    <Button
                      size="sm"
                      variant="outline"
                      className="mr-2 font-semibold bg-yellow-400 hover:bg-yellow-500 text-white"
                      onClick={() => handleEditOpen(teacher)}
                    >
                      Sửa
                    </Button>
                    <Button size="sm" variant="primary" className="bg-red-600 hover:bg-red-700 font-semibold" onClick={() => handleDelete(teacher.id)}>
                      Xóa
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Thêm giáo viên */}
  <Modal isOpen={isAddOpen} onClose={closeAdd} className="max-w-lg w-full mx-auto bg-white/98 shadow-2xl">
        <div className="p-8 bg-gradient-to-br from-white via-gray-50 to-gray-100 rounded-xl shadow-lg">
          <h2 className="text-2xl font-bold mb-6 text-center text-purple-700">Thêm giáo viên</h2>
          <form className="space-y-5" onSubmit={async (e) => { e.preventDefault(); try { await createTeacher(form); closeAdd(); fetchTeachers(); } catch (err) { console.error(err); } }}>
            <div>
              <label className="block mb-2 text-sm font-semibold text-gray-700">Tên giáo viên</label>
              <input className="w-full border border-purple-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400 transition" type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nhập tên giáo viên" required />
            </div>
            <div>
              <label className="block mb-2 text-sm font-semibold text-gray-700">Mã giáo viên</label>
              <input className="w-full border border-purple-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400 transition" type="text" value={form.teacher_identifier} onChange={(e) => setForm({ ...form, teacher_identifier: e.target.value })} placeholder="Nhập mã giáo viên" required />
            </div>
            <div>
              <label className="block mb-2 text-sm font-semibold text-gray-700">Khoa</label>
              <select className="w-full border border-purple-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400 transition" value={form.faculty_id} onChange={(e) => setForm({ ...form, faculty_id: e.target.value })} required>
                <option value="">-- Chọn khoa --</option>
                {faculties.map(f => (<option key={f.id} value={f.id}>{f.name || f.id}</option>))}
              </select>
            </div>
            <div className="flex justify-end mt-6 gap-3">
              <Button size="md" variant="primary" className="bg-purple-600 hover:bg-purple-700 font-semibold px-6 py-2 rounded-lg shadow">
                Lưu
              </Button>
              <Button size="md" variant="outline" className="font-semibold px-6 py-2 rounded-lg shadow" onClick={closeAdd}>
                Hủy
              </Button>
            </div>
          </form>
        </div>
      </Modal>

      {/* Modal Sửa giáo viên */}
      <Modal isOpen={isEditOpen} onClose={handleEditClose} className="max-w-lg w-full mx-auto bg-white/98 shadow-2xl">
        <div className="p-8 bg-gradient-to-br from-white via-gray-50 to-gray-100 rounded-xl shadow-lg">
          <h2 className="text-2xl font-bold mb-6 text-center text-yellow-700">Sửa thông tin giáo viên</h2>
          <form className="space-y-5" onSubmit={async (e) => { e.preventDefault(); try { await updateTeacher(editTeacher.id, form); setIsEditOpen(false); fetchTeachers(); } catch (err) { console.error(err); } }}>
            <div>
              <label className="block mb-2 text-sm font-semibold text-gray-700">Tên giáo viên</label>
              <input className="w-full border border-yellow-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition" type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div>
              <label className="block mb-2 text-sm font-semibold text-gray-700">Mã giáo viên</label>
              <input className="w-full border border-yellow-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition" type="text" value={form.teacher_identifier} onChange={(e) => setForm({ ...form, teacher_identifier: e.target.value })} required />
            </div>
            <div>
              <label className="block mb-2 text-sm font-semibold text-gray-700">Khoa</label>
              <select className="w-full border border-yellow-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition" value={form.faculty_id || ''} onChange={(e) => setForm({ ...form, faculty_id: e.target.value })} required>
                <option value="">-- Chọn khoa --</option>
                {faculties.map(f => (<option key={f.id} value={f.id}>{f.name || f.id}</option>))}
              </select>
            </div>
            <div className="flex justify-end mt-6 gap-3">
              <Button size="md" variant="primary" className="bg-yellow-500 hover:bg-yellow-600 font-semibold px-6 py-2 rounded-lg shadow">
                Lưu
              </Button>
              <Button size="md" variant="outline" className="font-semibold px-6 py-2 rounded-lg shadow" onClick={handleEditClose}>
                Hủy
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
}