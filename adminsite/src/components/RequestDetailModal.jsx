import React, { useState, useEffect } from 'react';
import Button from '../components/ui/button/Button';
import { getRequestById } from '../services/scheduleChangeService';

const RequestDetailModal = ({ showModal, selectedRequest, onClose, onUpdate }) => {
  const [editedRequest, setEditedRequest] = useState({});

  useEffect(() => {
    const fetchRequest = async () => {
      if (selectedRequest && selectedRequest.id) {
        try {
          const fullRequest = await getRequestById(selectedRequest.id);
          // If time_change, copy old teacher to new teacher if not set
          if (fullRequest.request_type === 'time_change' && !fullRequest.new_teacher_id) {
            fullRequest.new_teacher_id = fullRequest.old_teacher_id;
            fullRequest.new_teacher_name = fullRequest.old_teacher_name;
            fullRequest.new_teacher_code = fullRequest.old_teacher_code;
          }
          setEditedRequest(fullRequest || { ...selectedRequest });
        } catch (err) {
          console.error('Failed to fetch request details', err);
          setEditedRequest({ ...selectedRequest });
        }
      } else if (selectedRequest) {
        setEditedRequest({ ...selectedRequest });
      }
    };
    fetchRequest();
  }, [selectedRequest]);

  if (!showModal || !selectedRequest) return null;

  const getTypeLabel = (type) => {
    switch (type) {
      case 'room_change': return 'Đổi phòng';
      case 'teacher_change': return 'Đổi giáo viên';
      case 'time_change': return 'Đổi ngày';
      case 'cancellation': return 'Hủy lịch';
      default: return type;
    }
  };

  const handleSave = () => {
    if (onUpdate) {
      onUpdate(editedRequest);
    }
    onClose();
  };

  const handleChange = (field, value) => {
    setEditedRequest(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 z-[100000] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl p-6 m-4 transform transition-all max-h-[80vh] overflow-y-auto">
        <h3 className="text-lg font-bold mb-4">Chi tiết yêu cầu chỉnh sửa lịch</h3>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">ID</label>
              <input
                type="text"
                value={editedRequest.id || ''}
                disabled
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Buổi học</label>
              <input
                type="text"
                value={editedRequest.schedule_instance_id || ''}
                disabled
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Loại yêu cầu</label>
              <input
                type="text"
                value={getTypeLabel(editedRequest.request_type) || ''}
                disabled
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Người yêu cầu</label>
              <input
                type="text"
                value={editedRequest.requester_name && editedRequest.requester_code ? `${editedRequest.requester_name} - ${editedRequest.requester_code}` : `User ${editedRequest.requested_by_user_id}` || ''}
                disabled
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Trạng thái</label>
              <select
                value={editedRequest.status || ''}
                onChange={(e) => handleChange('status', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              >
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="applied">Applied</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium">Ngày tạo</label>
              <input
                type="text"
                value={editedRequest.created_at || ''}
                disabled
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium">Lý do</label>
            <textarea
              value={editedRequest.reason || ''}
              onChange={(e) => handleChange('reason', e.target.value)}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            />
          </div>
          {editedRequest.request_type !== 'cancellation' && (
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h4 className="text-md font-semibold mb-2">Giá trị cũ</h4>
                <div className="space-y-2">
                  <div>
                    <label className="block text-sm">Phòng (Mã phòng)</label>
                    <input
                      type="text"
                      value={editedRequest.old_room_code || editedRequest.old_room_id || ''}
                      onChange={(e) => handleChange('old_room_id', e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                      placeholder="Mã phòng"
                    />
                  </div>
                  <div>
                    <label className="block text-sm">Tiết</label>
                    <input
                      type="text"
                      value={editedRequest.old_time_slot_name || editedRequest.old_time_slot_id || ''}
                      onChange={(e) => handleChange('old_time_slot_id', e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                      placeholder="Tên tiết"
                    />
                  </div>
                  <div>
                    <label className="block text-sm">Ngày</label>
                    <input
                      type="date"
                      value={editedRequest.old_date || ''}
                      onChange={(e) => handleChange('old_date', e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm">Giáo viên (Tên - Mã)</label>
                    <input
                      type="text"
                      value={editedRequest.old_teacher_name ? `${editedRequest.old_teacher_name} - ${editedRequest.old_teacher_code || editedRequest.old_teacher_id}` : editedRequest.old_teacher_id || ''}
                      onChange={(e) => handleChange('old_teacher_id', e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                      placeholder="Tên - Mã"
                    />
                  </div>
                </div>
              </div>
              <div>
                <h4 className="text-md font-semibold mb-2">Giá trị mới</h4>
                <div className="space-y-2">
                  <div>
                    <label className="block text-sm">Phòng (Mã phòng)</label>
                    <input
                      type="text"
                      value={editedRequest.new_room_code || editedRequest.new_room_id || ''}
                      onChange={(e) => handleChange('new_room_id', e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                      placeholder="Mã phòng"
                    />
                  </div>
                  <div>
                    <label className="block text-sm">Tiết</label>
                    <input
                      type="text"
                      value={editedRequest.new_time_slot_name || editedRequest.new_time_slot_id || ''}
                      onChange={(e) => handleChange('new_time_slot_id', e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                      placeholder="Tên tiết"
                    />
                  </div>
                  <div>
                    <label className="block text-sm">Ngày</label>
                    <input
                      type="date"
                      value={editedRequest.new_date || ''}
                      onChange={(e) => handleChange('new_date', e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm">Giáo viên (Tên - Mã)</label>
                    <input
                      type="text"
                      value={editedRequest.new_teacher_name ? `${editedRequest.new_teacher_name} - ${editedRequest.new_teacher_code || editedRequest.new_teacher_id}` : editedRequest.new_teacher_id || ''}
                      onChange={(e) => handleChange('new_teacher_id', e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                      placeholder="Tên - Mã"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="flex justify-end mt-6 gap-2">
          <Button onClick={onClose}>Hủy</Button>
          <Button onClick={handleSave}>Lưu</Button>
        </div>
      </div>
    </div>
  );
};

export default RequestDetailModal;