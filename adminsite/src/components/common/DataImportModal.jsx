import React, {useState, useRef, useEffect} from 'react';
import * as XLSX from 'xlsx';
import Button from '../ui/button/Button.jsx'; // Sử dụng lại Button của bạn
import Modal from '../ui/modal/index.jsx';   // Sử dụng lại Modal của bạn

export default function DataImportModal({
                                            isOpen,
                                            onClose,
                                            onImport, // Hàm callback khi user bấm "Lưu/Import" (nhận vào mảng data)
                                            title = "Import dữ liệu",
                                            templateHeaders = [], // Mảng chứa các key mẫu: ['code', 'name', 'total']
                                            columnMapping = {},    // Map header tiếng Việt sang key tiếng Anh: { 'Mã': 'code', 'Tên': 'name'
                                            templateName = "",
                                            errors = []
                                        }) {
    const [previewData, setPreviewData] = useState([]);
    const [fileName, setFileName] = useState('');
    const fileInputRef = useRef(null);
    useEffect(() => {
        if (!isOpen) {
            setPreviewData([]);
            setFileName('');
        }
    }, [isOpen]);
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setFileName(file.name);

        const reader = new FileReader();
        reader.onload = (evt) => {
            const bstr = evt.target.result;
            const wb = XLSX.read(bstr, { type: 'binary' });
            const wsname = wb.SheetNames[0];
            const ws = wb.Sheets[wsname];

            // Chuyển Excel sang JSON
            const data = XLSX.utils.sheet_to_json(ws, { header: 1 });

            // Xử lý data: Dòng 0 là header, các dòng sau là data
            if (data.length > 0) {
                const headers = data[0];
                const rows = data.slice(1);

                const formattedData = rows.map(row => {
                    let obj = {};
                    headers.forEach((header, index) => {
                        // Map từ Header Excel sang Key API (nếu có config), nếu không giữ nguyên header
                        const key = columnMapping[header] || header;
                        obj[key] = row[index];
                    });
                    return obj;
                });
                setPreviewData(formattedData);
            }
        };
        reader.readAsBinaryString(file);
    };

    const handleSubmit = () => {
        if (onImport && previewData.length > 0) {
            onImport(previewData);
        }
    };

    const handleReset = () => {
        setPreviewData([]);
        setFileName('');
        if(fileInputRef.current) fileInputRef.current.value = '';
    };

    // Tự động tải file mẫu đơn giản
    const downloadTemplate = () => {
        const ws = XLSX.utils.json_to_sheet([{}], { header: Object.keys(columnMapping) });
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Template");
        XLSX.writeFile(wb, templateName ? templateName:  "import_template.xlsx");
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-3xl w-full mx-auto bg-white shadow-2xl">
            <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">{title}</h2>
                    <div className="flex gap-2 mr-20">
                        <Button type="button" variant="outline" onClick={handleReset}>Đặt lại</Button>
                        <Button type="button" variant="outline" onClick={downloadTemplate}>Tải file mẫu</Button>
                    </div>
                </div>

                {/* --- UI HIỂN THỊ LỖI --- */}
                {errors && errors.length > 0 && (
                    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-center gap-2 text-red-700 font-bold mb-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                            <span>Có {errors.length} lỗi xảy ra:</span>
                        </div>

                        {/* Danh sách cuộn được nếu quá dài */}
                        <ul className="list-disc list-inside text-sm text-red-600 space-y-1 max-h-40 overflow-y-auto pr-2">
                            {errors.map((err, index) => (
                                <li key={index}>
                                    {/* Hiển thị MSG từ Backend trả về */}
                                    {err.msg || err.message || JSON.stringify(err)}
                                </li>
                            ))}
                        </ul>
                        <div className="mt-2 text-xs text-red-500 italic">
                            * Vui lòng mở file Excel, sửa các mã bị trùng trên và thử import lại.
                        </div>
                    </div>
                )}

                {/* Vùng Upload File */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center mb-4 bg-gray-50">
                    <input type="file" accept=".xlsx, .xls" onChange={handleFileChange} ref={fileInputRef} className="hidden" id="file-upload"/>
                    <label htmlFor="file-upload" className="cursor-pointer block">
                        {fileName ? <span className="font-semibold text-blue-600">{fileName}</span> : <span className="text-gray-500">Chọn file Excel...</span>}
                    </label>
                </div>

                {/* Vùng Preview Table (Giữ nguyên) */}
                {previewData.length > 0 && (
                    <div className="max-h-60 overflow-auto border rounded mb-4">
                        {/* ... table render code cũ ... */}
                        <table className="min-w-full text-xs divide-y divide-gray-200">
                            <thead className="bg-gray-100">
                            <tr>{Object.keys(previewData[0]).map(k => <th key={k} className="px-2 py-1">{k}</th>)}</tr>
                            </thead>
                            <tbody>
                            {previewData.map((row, i) => (
                                <tr key={i}>{Object.values(row).map((v, j) => <td key={j} className="px-2 py-1">{v}</td>)}</tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}

                <div className="flex justify-end gap-3 mt-4">
                    <Button type="button" variant="outline" onClick={onClose}>Hủy</Button>
                    <Button type="button" variant="primary" onClick={handleSubmit} disabled={previewData.length === 0}>
                        Xác nhận Import
                    </Button>
                </div>
            </div>
        </Modal>
    );
}