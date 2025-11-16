import React, { useEffect, useState } from 'react';
import PageMeta from '../components/common/PageMeta.jsx';
import Button from '../components/ui/button/Button.jsx';
import Modal from '../components/ui/modal/index.jsx';
import {getAll} from '../services/constraintService.js';


export default function ConstraintManagement() {
    const [constraints, setConstraints] = useState([]);
    const [search, setSearch] = useState('');
    const [selectedType, setSelectedType] = useState('all');
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editConstraint, setEditConstraint] = useState(null);
    const [form, setForm] = useState({ name: '', code: '', description: '', weight: '', type: 'S' });
    const [errors, setErrors] = useState(null);

    // Mock data - thay thế bằng API call thực tế
    useEffect(() => {
        getAll().then(data => setConstraints(data));
    }, []);

    const handleTypeChange = (type) => {
        setSelectedType(prev => prev === type ? 'all' : type);
    };

    const handleAddOpen = () => {
        setForm({ name: '', code: '', description: '', weight: '', type: 'S' });
        setErrors(null);
        setIsAddOpen(true);
    };

    const handleAddClose = () => {
        setIsAddOpen(false);
        setForm({ name: '', code: '', description: '', weight: '', type: 'S' });
        setErrors(null);
    };

    const handleEditOpen = (constraint) => {
        setEditConstraint(constraint);
        setForm({
            name: constraint.name || '',
            code: constraint.code || '',
            description: constraint.description || '',
            weight: constraint.weight || '',
            type: constraint.type || 'S'
        });
        setErrors(null);
        setIsEditOpen(true);
    };

    const handleEditClose = () => {
        setEditConstraint(null);
        setIsEditOpen(false);
        setForm({ name: '', code: '', description: '', weight: '', type: 'S' });
        setErrors(null);
    };

    const handleSave = (e) => {
        e.preventDefault();
        // Implement save logic here
        console.log('Saving:', form);
        setIsAddOpen(false);
    };

    const handleUpdate = (e) => {
        e.preventDefault();
        // Implement update logic here
        console.log('Updating:', editConstraint.id, form);
        setIsEditOpen(false);
    };

    const handleDelete = (id) => {
        if (window.confirm('Bạn có chắc muốn xóa ràng buộc này?')) {
            // Implement delete logic here
            console.log('Deleting:', id);
            setConstraints(prev => prev.filter(c => c.id !== id));
        }
    };

    // Filter constraints
    const filtered = constraints.filter(c => {
        const matchesSearch =
            (c.name || '').toLowerCase().includes(search.toLowerCase()) ||
            (c.code || '').toLowerCase().includes(search.toLowerCase()) ||
            (c.description || '').toLowerCase().includes(search.toLowerCase());

        const matchesType = selectedType === 'all' || c.type === selectedType;

        return matchesSearch && matchesType;
    });

    // Separate by type for display
    const hardConstraints = filtered.filter(c => c.type === 'H');
    const softConstraints = filtered.filter(c => c.type === 'S');

    const formatWeight = (weight) => {
        return new Intl.NumberFormat('vi-VN').format(weight);
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="bg-white rounded-xl shadow-lg border border-gray-200">
                    {/* Header */}
                    <div className="border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-t-xl">
                        <h1 className="text-3xl font-bold text-gray-800 mb-2">Quản lý Ràng buộc</h1>
                        <p className="text-gray-600">Quản lý các ràng buộc cứng và mềm cho hệ thống xếp lịch</p>
                    </div>

                    {/* Controls */}
                    <div className="p-6 space-y-4">
                        <div className="flex justify-between items-center flex-wrap gap-4">
                            <div className="flex items-center gap-3 flex-1">
                                <input
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Tìm kiếm theo tên, mã hoặc mô tả..."
                                    className="flex-1 max-w-md border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                />
                            </div>
                            <Button size="md" variant="primary" onClick={handleAddOpen}>
                                + Thêm ràng buộc
                            </Button>
                        </div>

                        {/* Filter buttons */}
                        <div className="flex gap-2">
                            <Button
                                onClick={() => handleTypeChange('all')}
                                size="sm"
                                variant={selectedType === 'all' ? 'primary' : 'outline'}
                            >
                                Tất cả ({constraints.length})
                            </Button>
                            <Button
                                onClick={() => handleTypeChange('H')}
                                size="sm"
                                variant={selectedType === 'H' ? 'danger' : 'outline'}
                            >
                                Ràng buộc cứng ({constraints.filter(c => c.type === 'H').length})
                            </Button>
                            <Button
                                onClick={() => handleTypeChange('S')}
                                size="sm"
                                variant={selectedType === 'S' ? 'success' : 'outline'}
                            >
                                Ràng buộc mềm ({constraints.filter(c => c.type === 'S').length})
                            </Button>
                        </div>
                    </div>

                    {/* Hard Constraints Section */}
                    {(selectedType === 'all' || selectedType === 'H') && hardConstraints.length > 0 && (
                        <div className="px-6 pb-6">
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                                <h2 className="text-xl font-bold text-red-800 mb-2 flex items-center gap-2">
                                    <span className="w-3 h-3 bg-red-600 rounded-full"></span>
                                    Ràng buộc cứng (Hard Constraints)
                                </h2>
                                <p className="text-sm text-red-700">Các ràng buộc bắt buộc phải thỏa mãn, vi phạm sẽ làm giải pháp không hợp lệ</p>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-red-100">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-red-900 uppercase tracking-wider w-16">STT</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-red-900 uppercase tracking-wider">Mã</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-red-900 uppercase tracking-wider">Tên</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-red-900 uppercase tracking-wider">Mô tả</th>
                                        <th className="px-4 py-3 text-right text-xs font-semibold text-red-900 uppercase tracking-wider">Trọng số</th>
                                        <th className="px-4 py-3 text-center text-xs font-semibold text-red-900 uppercase tracking-wider w-32">Thao tác</th>
                                    </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                    {hardConstraints.map((c, idx) => (
                                        <tr key={c.id} className="hover:bg-red-50 transition-colors">
                                            <td className="px-4 py-3 text-sm text-gray-900">{idx + 1}</td>
                                            <td className="px-4 py-3">
                                                <code className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded font-mono">{c.code}</code>
                                            </td>
                                            <td className="px-4 py-3 text-sm font-medium text-gray-900">{c.name}</td>
                                            <td className="px-4 py-3 text-sm text-gray-600">{c.description}</td>
                                            <td className="px-4 py-3 text-sm text-right">
                                                <span className="font-bold text-red-700">{formatWeight(c.weight)}</span>
                                            </td>
                                            <td className="px-4 py-3 text-center space-x-2">
                                                <Button size="sm" variant="outline" onClick={() => handleEditOpen(c)}>Sửa</Button>
                                                <Button size="sm" variant="danger" onClick={() => handleDelete(c.id)}>Xóa</Button>
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Soft Constraints Section */}
                    {(selectedType === 'all' || selectedType === 'S') && softConstraints.length > 0 && (
                        <div className="px-6 pb-6">
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                                <h2 className="text-xl font-bold text-green-800 mb-2 flex items-center gap-2">
                                    <span className="w-3 h-3 bg-green-600 rounded-full"></span>
                                    Ràng buộc mềm (Soft Constraints)
                                </h2>
                                <p className="text-sm text-green-700">Các ràng buộc nên thỏa mãn để tối ưu chất lượng giải pháp</p>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-green-100">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-green-900 uppercase tracking-wider w-16">STT</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-green-900 uppercase tracking-wider">Mã</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-green-900 uppercase tracking-wider">Tên</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-green-900 uppercase tracking-wider">Mô tả</th>
                                        <th className="px-4 py-3 text-right text-xs font-semibold text-green-900 uppercase tracking-wider">Trọng số</th>
                                        <th className="px-4 py-3 text-center text-xs font-semibold text-green-900 uppercase tracking-wider w-32">Thao tác</th>
                                    </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                    {softConstraints.map((c, idx) => (
                                        <tr key={c.id} className="hover:bg-green-50 transition-colors">
                                            <td className="px-4 py-3 text-sm text-gray-900">{idx + 1}</td>
                                            <td className="px-4 py-3">
                                                <code className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded font-mono">{c.code}</code>
                                            </td>
                                            <td className="px-4 py-3 text-sm font-medium text-gray-900">{c.name}</td>
                                            <td className="px-4 py-3 text-sm text-gray-600">{c.description}</td>
                                            <td className="px-4 py-3 text-sm text-right">
                                                <span className="font-bold text-green-700">{formatWeight(c.weight)}</span>
                                            </td>
                                            <td className="px-4 py-3 text-center space-x-2">
                                                <Button size="sm" variant="outline" onClick={() => handleEditOpen(c)}>Sửa</Button>
                                                <Button size="sm" variant="danger" onClick={() => handleDelete(c.id)}>Xóa</Button>
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Empty state */}
                    {filtered.length === 0 && (
                        <div className="p-12 text-center">
                            <div className="text-gray-400 text-6xl mb-4">🔍</div>
                            <h3 className="text-xl font-semibold text-gray-600 mb-2">Không tìm thấy ràng buộc</h3>
                            <p className="text-gray-500">Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc</p>
                        </div>
                    )}
                </div>

                {/* Add Modal */}
                <Modal isOpen={isAddOpen} onClose={handleAddClose} className="max-w-2xl w-full mx-auto">
                    <div className="p-8 bg-gradient-to-br from-white via-blue-50 to-blue-100 rounded-xl">
                        <h2 className="text-2xl font-bold mb-6 text-center text-blue-800">Thêm ràng buộc mới</h2>
                        <form onSubmit={handleSave} className="space-y-5">
                            <div>
                                <label className="block mb-2 text-sm font-semibold text-gray-700">Loại ràng buộc</label>
                                <select
                                    className="w-full border border-blue-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                    value={form.type}
                                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                                    required
                                >
                                    <option value="H">Ràng buộc cứng (Hard)</option>
                                    <option value="S">Ràng buộc mềm (Soft)</option>
                                </select>
                            </div>

                            <div>
                                <label className="block mb-2 text-sm font-semibold text-gray-700">Mã ràng buộc</label>
                                <input
                                    className="w-full border border-blue-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 font-mono"
                                    type="text"
                                    value={form.code}
                                    onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                                    placeholder="VD: HARD_CONFLICT_TEACHER"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block mb-2 text-sm font-semibold text-gray-700">Tên ràng buộc</label>
                                <input
                                    className="w-full border border-blue-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                    type="text"
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    placeholder="VD: Teacher Conflict"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block mb-2 text-sm font-semibold text-gray-700">Mô tả</label>
                                <textarea
                                    className="w-full border border-blue-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                    value={form.description}
                                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                                    placeholder="Mô tả chi tiết về ràng buộc..."
                                    rows={3}
                                />
                            </div>

                            <div>
                                <label className="block mb-2 text-sm font-semibold text-gray-700">Trọng số (Weight)</label>
                                <input
                                    className="w-full border border-blue-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                    type="number"
                                    value={form.weight}
                                    onChange={(e) => setForm({ ...form, weight: e.target.value })}
                                    placeholder="VD: 1000000"
                                    required
                                    min="1"
                                />
                                <p className="text-xs text-gray-500 mt-1">Trọng số càng cao = ràng buộc càng quan trọng</p>
                            </div>

                            {errors && <div className="text-sm text-red-500 bg-red-50 p-3 rounded">{errors}</div>}

                            <div className="flex justify-end gap-3 mt-6">
                                <Button type="button" variant="outline" onClick={handleAddClose}>Hủy</Button>
                                <Button type="submit" variant="primary">Lưu</Button>
                            </div>
                        </form>
                    </div>
                </Modal>

                {/* Edit Modal */}
                <Modal isOpen={isEditOpen} onClose={handleEditClose} className="max-w-2xl w-full mx-auto">
                    <div className="p-8 bg-gradient-to-br from-white via-yellow-50 to-yellow-100 rounded-xl">
                        <h2 className="text-2xl font-bold mb-6 text-center text-yellow-800">Chỉnh sửa ràng buộc</h2>
                        <form onSubmit={handleUpdate} className="space-y-5">
                            <div>
                                <label className="block mb-2 text-sm font-semibold text-gray-700">Loại ràng buộc</label>
                                <select
                                    className="w-full border border-yellow-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                    value={form.type}
                                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                                    required
                                >
                                    <option value="H">Ràng buộc cứng (Hard)</option>
                                    <option value="S">Ràng buộc mềm (Soft)</option>
                                </select>
                            </div>

                            <div>
                                <label className="block mb-2 text-sm font-semibold text-gray-700">Mã ràng buộc</label>
                                <input
                                    className="w-full border border-yellow-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400 font-mono bg-gray-50"
                                    type="text"
                                    value={form.code}
                                    disabled
                                />
                                <p className="text-xs text-gray-500 mt-1">Mã không thể thay đổi</p>
                            </div>

                            <div>
                                <label className="block mb-2 text-sm font-semibold text-gray-700">Tên ràng buộc</label>
                                <input
                                    className="w-full border border-yellow-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                    type="text"
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block mb-2 text-sm font-semibold text-gray-700">Mô tả</label>
                                <textarea
                                    className="w-full border border-yellow-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                    value={form.description}
                                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                                    rows={3}
                                />
                            </div>

                            <div>
                                <label className="block mb-2 text-sm font-semibold text-gray-700">Trọng số (Weight)</label>
                                <input
                                    className="w-full border border-yellow-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                    type="number"
                                    value={form.weight}
                                    onChange={(e) => setForm({ ...form, weight: e.target.value })}
                                    required
                                    min="1"
                                />
                            </div>

                            {errors && <div className="text-sm text-red-500 bg-red-50 p-3 rounded">{errors}</div>}

                            <div className="flex justify-end gap-3 mt-6">
                                <Button type="button" variant="outline" onClick={handleEditClose}>Hủy</Button>
                                <Button type="submit" variant="primary">Cập nhật</Button>
                            </div>
                        </form>
                    </div>
                </Modal>
            </div>
        </div>
    );
}