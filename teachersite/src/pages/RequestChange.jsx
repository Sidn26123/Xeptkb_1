import React, { useEffect, useState } from 'react';
import { listMyRequests } from '../services/scheduleChangeService';

export default function RequestChange() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedJson, setSelectedJson] = useState(null);

  const typeLabel = (t) => {
    if (!t) return '-';
    if (t === 'teacher_change') return 'Đổi giáo viên';
    if (t === 'time_change') return 'Đổi ngày';
    if (t === 'room_change') return 'Đổi phòng';
    if (t === 'cancellation') return 'Hủy';
    return t;
  };

  const typeDetail = (r) => {
    if (!r) return '-';
    switch (r.request_type) {
      case 'teacher_change':
        return r.new_teacher_name || r.new_teacher_id || '-';
      case 'time_change':
        return r.new_date || r.change_to_date || '-';
      case 'room_change':
        return r.new_room_name || r.new_room_id || '-';
      case 'cancellation':
        return 'Hủy buổi học';
      default:
        return '-';
    }
  };

  const load = async () => {
    setLoading(true);
    try {
      const data = await listMyRequests();
      setRequests(data || []);
    } catch (err) {
      console.error('Failed to load requests', err);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="p-4">
      <h2 className="text-lg font-bold mb-4">Các yêu cầu đã gửi</h2>

      {loading ? (
        <div>Đang tải...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-700">ID</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-700">Instance</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-700">Loại</th>
                {/* removed Requester and Range columns; show type-specific detail instead */}
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-700">Chi tiết yêu cầu</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-700">Lý do</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-700">Trạng thái</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-700">Ngày gửi</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-700">Hành động</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
                {requests.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-6 text-center text-sm text-gray-500">Chưa có yêu cầu nào</td></tr>
              ) : (
                requests.map(r => (
                  <tr key={r.id}>
                    <td className="px-3 py-2 text-sm text-gray-700">{r.id}</td>
                    <td className="px-3 py-2 text-sm text-gray-700">{r.schedule_instance_id || '-'}</td>
                    <td className="px-3 py-2 text-sm text-gray-700">{typeLabel(r.request_type)}</td>
                    <td className="px-3 py-2 text-sm text-gray-700">{typeDetail(r)}</td>
                    <td className="px-3 py-2 text-sm text-gray-700">{r.reason || '-'}</td>
                    <td className="px-3 py-2 text-sm text-gray-700">{r.status}</td>
                    <td className="px-3 py-2 text-sm text-gray-700">{(r.created_at || r.createdAt)?.slice?.(0,19).replace('T',' ') || '-'}</td>
                    <td className="px-3 py-2 text-sm text-gray-700">
                      <button className="text-sm text-blue-600 hover:underline" onClick={() => setSelectedJson(r)}>Chi tiết</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          {/* Modal for details */}
          {selectedJson && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-3xl p-6 m-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Chi tiết yêu cầu #{selectedJson.id}</h3>
                  <button className="text-sm text-red-600" onClick={() => setSelectedJson(null)}>Đóng</button>
                </div>
                <div className="overflow-auto max-h-80">
                  <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                    <div className="text-gray-600">ID</div>
                    <div className="font-medium text-gray-800">{selectedJson.id}</div>

                    <div className="text-gray-600">Instance</div>
                    <div className="font-medium text-gray-800">{selectedJson.schedule_instance_id || '-'}</div>

                    <div className="text-gray-600">Loại</div>
                    <div className="font-medium text-gray-800">{typeLabel(selectedJson.request_type)}</div>

                    <div className="text-gray-600">Chi tiết yêu cầu</div>
                    <div className="font-medium text-gray-800">{typeDetail(selectedJson)}</div>

                    <div className="text-gray-600">Giáo viên cũ</div>
                    <div className="font-medium text-gray-800">{selectedJson.old_teacher_name || selectedJson.old_teacher_id || '-'}</div>

                    <div className="text-gray-600">Phòng cũ</div>
                    <div className="font-medium text-gray-800">{selectedJson.old_room_name || selectedJson.old_room_id || '-'}</div>

                    <div className="text-gray-600">Ngày/Thời gian cũ</div>
                    <div className="font-medium text-gray-800">{selectedJson.old_date || selectedJson.change_from_date || '-'}</div>

                    <div className="text-gray-600">Ngày/Thời gian mới</div>
                    <div className="font-medium text-gray-800">{selectedJson.new_date || selectedJson.change_to_date || '-'}</div>

                    <div className="text-gray-600">Lý do</div>
                    <div className="font-medium text-gray-800 col-span-1">{selectedJson.reason || '-'}</div>

                    <div className="text-gray-600">Trạng thái</div>
                    <div className="font-medium text-gray-800">{selectedJson.status || '-'}</div>

                    <div className="text-gray-600">Ngày gửi</div>
                    <div className="font-medium text-gray-800">{(selectedJson.created_at || selectedJson.createdAt)?.slice?.(0,19).replace('T',' ') || '-'}</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
