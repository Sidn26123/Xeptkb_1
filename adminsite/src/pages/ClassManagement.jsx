import React, { useState } from "react";
import Button from "../components/ui/button/Button.jsx";
import Modal from "../components/ui/modal/index.jsx";

const tableData = [
  {
    id: 1,
    name: "CTK42",
    training_type_id: "Đại học",
    faculty_id: "CNTT",
  },
  {
    id: 2,
    name: "CTK43",
    training_type_id: "Cao đẳng",
    faculty_id: "Kinh tế",
  },
  {
    id: 3,
    name: "CTK44",
    training_type_id: "Đại học",
    faculty_id: "CNTT",
  },
];

export default function ClassManagement() {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editClass, setEditClass] = useState(null);

  const handleAddOpen = () => setIsAddOpen(true);
  const handleAddClose = () => setIsAddOpen(false);

  const handleEditOpen = (cls) => {
    setEditClass(cls);
    setIsEditOpen(true);
  };
  const handleEditClose = () => {
    setEditClass(null);
    setIsEditOpen(false);
  };

  return (
    <>
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="flex justify-end items-center p-4">
          <Button size="md" variant="primary" className="!px-6 !py-2 font-semibold bg-blue-600 hover:bg-blue-700" onClick={handleAddOpen}>
            Thêm lớp học
          </Button>
        </div>
        <div className="max-w-full overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">STT</th>
                <th className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Tên lớp</th>
                <th className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Loại hình đào tạo</th>
                <th className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Khoa</th>
                <th className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {tableData.map((cls, idx) => (
                <tr key={cls.id}>
                  <td className="px-5 py-4 sm:px-6 text-start">{idx + 1}</td>
                  <td className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">{cls.name}</td>
                  <td className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">{cls.training_type_id}</td>
                  <td className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">{cls.faculty_id}</td>
                  <td className="px-4 py-3 text-center">
                    <Button
                      size="sm"
                      variant="outline"
                      className="mr-2 font-semibold bg-yellow-400 hover:bg-yellow-500 text-white"
                      onClick={() => handleEditOpen(cls)}
                    >
                      Sửa
                    </Button>
                    <Button size="sm" variant="primary" className="bg-red-600 hover:bg-red-700 font-semibold">
                      Xóa
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Thêm lớp học */}
      <Modal isOpen={isAddOpen} onClose={handleAddClose} className="max-w-lg w-full mx-auto bg-white/98 shadow-2xl">
        <div className="p-8 bg-gradient-to-br from-white via-gray-50 to-gray-100 rounded-xl shadow-lg">
          <h2 className="text-2xl font-bold mb-6 text-center text-blue-700">Thêm lớp học</h2>
          <form className="space-y-5">
            <div>
              <label className="block mb-2 text-sm font-semibold text-gray-700">Tên lớp</label>
              <input className="w-full border border-blue-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition" type="text" placeholder="Nhập tên lớp" />
            </div>
            <div>
              <label className="block mb-2 text-sm font-semibold text-gray-700">Loại hình đào tạo</label>
              <input className="w-full border border-blue-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition" type="text" placeholder="Nhập loại hình đào tạo" />
            </div>
            <div>
              <label className="block mb-2 text-sm font-semibold text-gray-700">Khoa</label>
              <input className="w-full border border-blue-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition" type="text" placeholder="Nhập khoa" />
            </div>
            <div className="flex justify-end mt-6 gap-3">
              <Button size="md" variant="primary" className="bg-blue-600 hover:bg-blue-700 font-semibold px-6 py-2 rounded-lg shadow">
                Lưu
              </Button>
              <Button size="md" variant="outline" className="font-semibold px-6 py-2 rounded-lg shadow" onClick={handleAddClose}>
                Hủy
              </Button>
            </div>
          </form>
        </div>
      </Modal>

      {/* Modal Sửa lớp học */}
      <Modal isOpen={isEditOpen} onClose={handleEditClose} className="max-w-lg w-full mx-auto bg-white/98 shadow-2xl">
        <div className="p-8 bg-gradient-to-br from-white via-gray-50 to-gray-100 rounded-xl shadow-lg">
          <h2 className="text-2xl font-bold mb-6 text-center text-yellow-700">Sửa thông tin lớp học</h2>
          <form className="space-y-5">
            <div>
              <label className="block mb-2 text-sm font-semibold text-gray-700">Tên lớp</label>
              <input className="w-full border border-yellow-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition" type="text" defaultValue={editClass?.name} />
            </div>
            <div>
              <label className="block mb-2 text-sm font-semibold text-gray-700">Loại hình đào tạo</label>
              <input className="w-full border border-yellow-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition" type="text" defaultValue={editClass?.training_type_id} />
            </div>
            <div>
              <label className="block mb-2 text-sm font-semibold text-gray-700">Khoa</label>
              <input className="w-full border border-yellow-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition" type="text" defaultValue={editClass?.faculty_id} />
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