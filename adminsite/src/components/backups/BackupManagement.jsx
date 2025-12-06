import React, { useEffect, useState } from 'react';
import { HardDrive, Download, Trash2, RefreshCcw, Save, AlertTriangle, Loader2 } from 'lucide-react';
// import api from '../../services/api'; // Axios instance
import {getAllBackups, createBackup, downloadBackup, restoreBackup} from '../../services/backupService';
const BackupManager = () => {
    const [backups, setBackups] = useState([]);
    const [loading, setLoading] = useState(false);
    const [processing, setProcessing] = useState(false);

    // 1. Fetch Data
    const fetchBackups = async () => {
        setLoading(true);
        try {
            const res = await getAllBackups();
            setBackups(res.data);
            setLoading(false);
            // // MOCK D
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    useEffect(() => { fetchBackups(); }, []);

    // 2. Create Backup
    const handleCreate = async () => {
        setProcessing(true);
        try {
            // await api.post('/backup/create');
            alert("Tạo backup thành công!");
            await fetchBackups();
        } catch (error) {
            alert("Lỗi: " + error.message);
        } finally {
            setProcessing(false);
        }
    };

    // 3. Download Local File
    const handleDownload = (filename) => {
        const downloadUrl = `http://localhost:5000/api/backup/download/${filename}`;
        window.open(downloadUrl, '_blank');
    };

    // 4. Restore
    const handleRestore = async (filename) => {
        if (window.confirm("CẢNH BÁO: Dữ liệu hiện tại sẽ bị xóa và thay thế bằng bản backup này. Tiếp tục?")) {
            setProcessing(true);
            try {
                // await api.post('/backup/restore', { filename });
                await restoreBackup(filename);
                alert("Khôi phục thành công! Trang sẽ tải lại.");
                window.location.reload();
            } catch (error) {
                alert("Lỗi: " + error.message);
            } finally {
                setProcessing(false);
            }
        }
    };

    // 5. Delete
    const handleDelete = async (id, filename) => {
        if (confirm("Xóa bản backup này?")) {
            try {
                // await api.post('/backup/delete', { id, filename });
                await deleteBackup(id, filename);
                setBackups(prev => prev.filter(b => b.id !== id));
            } catch (error) {
                alert("Lỗi xóa");
            }
        }
    };

    return (
        <div className="p-6 max-w-5xl mx-auto bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="flex justify-between items-center mb-6 pb-4 border-b">
                <div>
                    <h2 className="text-xl font-bold flex items-center gap-2 text-gray-800">
                        <HardDrive className="text-blue-600" /> Quản lý Backup (Local)
                    </h2>
                    <p className="text-sm text-gray-500">Dữ liệu được lưu tại thư mục <code>/backups</code> trên server</p>
                </div>
                <button
                    onClick={handleCreate}
                    disabled={processing}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 disabled:opacity-50"
                >
                    {processing ? <Loader2 className="animate-spin w-4 h-4"/> : <Save className="w-4 h-4"/>}
                    Sao lưu ngay
                </button>
            </div>

            {loading ? <div className="text-center py-8">Đang tải...</div> : (
                <table className="w-full text-left border-collapse">
                    <thead>
                    <tr className="bg-gray-50 text-gray-600 text-sm">
                        <th className="p-3">Tên File</th>
                        <th className="p-3">Ngày tạo</th>
                        <th className="p-3">Kích thước</th>
                        <th className="p-3 text-right">Hành động</th>
                    </tr>
                    </thead>
                    <tbody>
                    {backups.map(item => (
                        <tr key={item.id} className="border-t hover:bg-gray-50">
                            <td className="p-3 font-medium text-gray-700">{item.filename}</td>
                            <td className="p-3 text-gray-500">{new Date(item.created_at).toLocaleString('vi-VN')}</td>
                            <td className="p-3 text-gray-500 font-mono">{item.file_size}</td>
                            <td className="p-3 flex justify-end gap-2">
                                <button
                                    onClick={() => handleDownload(item.filename)}
                                    className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded"
                                    title="Tải về máy"
                                >
                                    <Download size={18} />
                                </button>
                                <button
                                    onClick={() => handleRestore(item.filename)}
                                    disabled={processing}
                                    className="p-2 text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded"
                                    title="Khôi phục"
                                >
                                    <RefreshCcw size={18} />
                                </button>
                                <button
                                    onClick={() => handleDelete(item.id, item.filename)}
                                    className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded"
                                    title="Xóa"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </td>
                        </tr>
                    ))}
                    {backups.length === 0 && (
                        <tr><td colSpan="4" className="text-center py-8 text-gray-400">Chưa có bản backup nào</td></tr>
                    )}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default BackupManager;