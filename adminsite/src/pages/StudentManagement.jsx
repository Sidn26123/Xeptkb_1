import PageMeta from "../components/common/PageMeta.jsx";
import { useState, useEffect } from "react";
import Button from "../components/ui/button/Button.jsx";
import Modal from "../components/ui/modal/index.jsx";
import { getAllClasses } from '../services/classService.js';
import { getAllStudents, createStudent, updateStudent, deleteStudent } from '../services/studentService.js';

export default function StudentManagement() {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editStudent, setEditStudent] = useState(null);
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [form, setForm] = useState({ name: '', student_identifier: '', class_id: '' });

  const openAdd = () => { setForm({ name: '', student_identifier: '', class_id: '' }); setIsAddOpen(true); };
  const closeAdd = () => { setIsAddOpen(false); };

  const handleEditOpen = (student) => {
    setEditStudent(student);
    // populate form with student values
    setForm({ name: student.name || '', student_identifier: student.student_identifier || '', class_id: student.class_id || '' });
    setIsEditOpen(true);
  };
  const handleEditClose = () => {
    setEditStudent(null);
    setIsEditOpen(false);
  };

  useEffect(() => { fetchClasses(); }, []);

  useEffect(() => { fetchStudents(); }, []);

  const fetchStudents = async () => {
    try {
      const data = await getAllStudents();
      setStudents(Array.isArray(data) ? data : []);
    } catch (err) { console.error('Failed to load students', err); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa sinh viên này?')) return;
    try {
      await deleteStudent(id);
      fetchStudents();
    } catch (err) { console.error(err); }
  };

  const fetchClasses = async () => {
    try {
      const data = await getAllClasses();
      setClasses(Array.isArray(data) ? data : []);
    } catch (err) { console.error('Failed to load classes', err); }
  };

  return (
    <>
      <PageMeta title="Quản lý sinh viên" description="Trang quản lý danh sách sinh viên trong hệ thống." />
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="flex justify-end items-center p-4">
          <Button size="md" variant="primary" className="!px-6 !py-2 font-semibold bg-green-600 hover:bg-green-700" onClick={openAdd}>
            Thêm sinh viên
          </Button>
        </div>
        <div className="max-w-full overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">STT</th>
                <th className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Tên sinh viên</th>
                <th className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Mã sinh viên</th>
                <th className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Lớp</th>
                <th className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {students.map((student, idx) => (
                <tr key={student.id}>
                  <td className="px-5 py-4 sm:px-6 text-start">{idx + 1}</td>
                  <td className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">{student.name}</td>
                  <td className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">{student.student_identifier}</td>
                  <td className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">{(classes.find(c => String(c.id) === String(student.class_id)) || {}).name || student.class_id}</td>
                  <td className="px-4 py-3 text-center">
                    <Button
                      size="sm"
                      variant="outline"
                      className="mr-2 font-semibold bg-yellow-400 hover:bg-yellow-500 text-white"
                      onClick={() => handleEditOpen(student)}
                    >
                      Sửa
                    </Button>
                    <Button size="sm" variant="primary" className="bg-red-600 hover:bg-red-700 font-semibold" onClick={() => handleDelete(student.id)}>
                      Xóa
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Thêm sinh viên */}
  <Modal isOpen={isAddOpen} onClose={closeAdd} className="max-w-lg w-full mx-auto bg-white/98 backdrop-blur-sm shadow-2xl">
        <div className="p-8 bg-gradient-to-br from-white via-gray-50 to-gray-100 rounded-xl shadow-lg">
          <h2 className="text-2xl font-bold mb-6 text-center text-green-700">Thêm sinh viên</h2>
          <form className="space-y-5" onSubmit={async (e) => { e.preventDefault(); try { await createStudent(form); closeAdd(); fetchStudents(); } catch (err) { console.error(err); } }}>
            <div>
              <label className="block mb-2 text-sm font-semibold text-gray-700">Tên sinh viên</label>
              <input className="w-full border border-green-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-400 transition" type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nhập tên sinh viên" required />
            </div>
            <div>
              <label className="block mb-2 text-sm font-semibold text-gray-700">Mã sinh viên</label>
              <input className="w-full border border-green-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-400 transition" type="text" value={form.student_identifier} onChange={(e) => setForm({ ...form, student_identifier: e.target.value })} placeholder="Nhập mã sinh viên" required />
            </div>
            <div>
              <label className="block mb-2 text-sm font-semibold text-gray-700">Lớp</label>
              <select className="w-full border border-green-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-400 transition" value={form.class_id} onChange={(e) => setForm({ ...form, class_id: e.target.value })} required>
                <option value="">-- Chọn lớp --</option>
                {classes.map(c => (<option key={c.id} value={c.id}>{c.name || c.id}</option>))}
              </select>
            </div>
            <div className="flex justify-end mt-6 gap-3">
              <Button size="md" variant="primary" className="bg-green-600 hover:bg-green-700 font-semibold px-6 py-2 rounded-lg shadow">
                Lưu
              </Button>
              <Button size="md" variant="outline" className="font-semibold px-6 py-2 rounded-lg shadow" onClick={closeAdd}>
                Hủy
              </Button>
            </div>
          </form>
        </div>
      </Modal>

      {/* Modal Sửa sinh viên */}
      <Modal isOpen={isEditOpen} onClose={handleEditClose} className="max-w-lg w-full mx-auto bg-white/98 backdrop-blur-sm shadow-2xl">
        <div className="p-8 bg-gradient-to-br from-white via-gray-50 to-gray-100 rounded-xl shadow-lg">
          <h2 className="text-2xl font-bold mb-6 text-center text-yellow-700">Sửa thông tin sinh viên</h2>
          <form className="space-y-5" onSubmit={async (e) => { e.preventDefault(); try { await updateStudent(editStudent.id, form); setIsEditOpen(false); fetchStudents(); } catch (err) { console.error(err); } }}>
            <div>
              <label className="block mb-2 text-sm font-semibold text-gray-700">Tên sinh viên</label>
              <input className="w-full border border-yellow-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition" type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div>
              <label className="block mb-2 text-sm font-semibold text-gray-700">Mã sinh viên</label>
              <input className="w-full border border-yellow-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition" type="text" value={form.student_identifier} onChange={(e) => setForm({ ...form, student_identifier: e.target.value })} required />
            </div>
            <div>
              <label className="block mb-2 text-sm font-semibold text-gray-700">Lớp</label>
              <select className="w-full border border-yellow-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition" value={form.class_id || ''} onChange={(e) => setForm({ ...form, class_id: e.target.value })} required>
                <option value="">-- Chọn lớp --</option>
                {classes.map(c => (<option key={c.id} value={c.id}>{c.name || c.id}</option>))}
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
