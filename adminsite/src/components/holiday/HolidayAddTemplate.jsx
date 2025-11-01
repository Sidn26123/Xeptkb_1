import React from 'react';
import Modal from "../ui/modal/index.jsx";
import Button from "../ui/button/Button.jsx";

export default function HolidayAddTemplate({
  isOpen,
  onClose,
  rows = [],
  setRows = () => {},
  loading = false,
  onApply = () => {},
  semester = null,
}) {
  const updateRow = (idx, patch) => {
    const next = [...rows];
    next[idx] = { ...next[idx], ...patch };
    setRows(next);
  };

  const formatDateDisplay = (d) => {
    if (!d) return '';
    const dt = d instanceof Date ? d : new Date(d);
    if (isNaN(dt.getTime())) return '';
    const dd = String(dt.getDate()).padStart(2, '0');
    const mm = String(dt.getMonth() + 1).padStart(2, '0');
    const yyyy = dt.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  };

  const selectedCount = rows.filter(r => r.active).length;

  const handleCancel = () => {
    setRows([]);
    if (onClose) onClose();
  };

  return (
  <Modal isOpen={isOpen} onClose={handleCancel} isFullscreen={true} className="w-full h-full">
    <div className="p-6 sm:p-8 bg-white rounded-none shadow border border-gray-200 h-screen flex flex-col">
        <div className="flex items-center justify-center mb-4 gap-6">
          <h2 className="text-2xl font-bold text-green-700 m-0">Chọn mẫu ngày nghỉ</h2>
          {semester && (
            <div className="text-base font-semibold text-gray-700 px-4 py-2 bg-green-50 rounded-lg border border-green-200">
              Học kỳ: {semester.name} ({semester.start} - {semester.end})
            </div>
          )}
        </div>

  <div className="flex-1 overflow-auto border rounded">
          {loading ? (
            <div className="py-8 text-center text-gray-500">Đang tải mẫu...</div>
          ) : rows.length === 0 ? (
            <div className="py-8 text-center text-gray-400">Không có mẫu phù hợp</div>
          ) : (
            <table className="w-full table-fixed text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="p-3 text-left">Tên ngày lễ</th>
                  <th className="p-3 text-center">Thời gian</th>
                  <th className="p-3 text-center">Active</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, idx) => (
                  <tr key={row.id} className="border-b">
                    <td className="p-3 align-top">
                      <div className="flex flex-col gap-1">
                        <div className="font-semibold text-gray-900 text-base">
                          {row.name}
                          {row.recurring && (
                            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800" title="Ngày lễ hàng năm - luôn được áp dụng">
                              🔁 Hàng năm
                            </span>
                          )}
                        </div>
                        {row.description && (
                          <div className="text-sm text-gray-600 leading-relaxed">
                            {row.description}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="flex-1">
                          <label className="text-xs font-medium text-gray-500 mb-1 block">Từ ngày</label>
                          <input
                            type="text"
                            readOnly
                            aria-label={`Ngày bắt đầu ${row.name}`}
                            value={formatDateDisplay(row.startDate)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50 text-gray-700 cursor-not-allowed"
                          />
                        </div>

                        <div className="self-end pb-2 text-gray-400 text-lg">→</div>

                        <div className="flex-1">
                          <label className="text-xs font-medium text-gray-500 mb-1 block">Đến ngày</label>
                          <input
                            type="text"
                            readOnly
                            aria-label={`Ngày kết thúc ${row.name}`}
                            value={formatDateDisplay(row.endDate)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50 text-gray-700 cursor-not-allowed"
                          />
                        </div>
                      </div>
                    </td>
                    <td className="p-3 text-center">
                      <div className="inline-flex items-center justify-center">
                        {/* Toggle switch – disabled for recurring rows but still shows active state */}
                        <label className={`relative inline-flex items-center ${row.recurring ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}`}>
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={!!row.active}
                            disabled={!!row.recurring}
                            aria-label={row.recurring ? 'Recurring holiday – always active' : 'Active'}
                            onChange={(e) => updateRow(idx, { active: e.target.checked })}
                          />
                          <div className="w-11 h-6 bg-gray-200 rounded-full peer-focus:ring-2 peer-checked:bg-green-600 peer-checked:after:translate-x-5 peer-checked:after:border-white relative after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all">
                          </div>
                        </label>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="mt-4 pt-4 border-t bg-white sticky bottom-0 z-40">
          <div className="flex justify-between items-center max-w-full px-2 sm:px-0">
            <div className="text-sm text-gray-600">
              Đã chọn: <span className="font-semibold text-green-600">{selectedCount}</span> mẫu
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={handleCancel}>
                Hủy
              </Button>
              <Button
                variant="primary"
                onClick={onApply}
                disabled={selectedCount === 0}
                className="bg-green-600 hover:bg-green-700"
              >
                Áp dụng ({selectedCount})
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
