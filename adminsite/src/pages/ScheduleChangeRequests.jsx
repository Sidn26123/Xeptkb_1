// import React, { useEffect, useState } from 'react';
// // import { listScheduleChangeRequests, approveRequest, applyRequest, rejectRequest } from '../services/scheduleService.js';
// import Button from '../components/ui/button/Button';
// import RequestDetailModal from '../components/RequestDetailModal';
//
// export default function ScheduleChangeRequests() {
//   const [requests, setRequests] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [selectedRequest, setSelectedRequest] = useState(null);
//   const [showModal, setShowModal] = useState(false);
//
//   const load = async () => {
//     setLoading(true);
//     try {
//       const data = await listScheduleChangeRequests();
//       setRequests(data);
//     } catch (err) {
//       console.error(err);
//     } finally { setLoading(false); }
//   };
//
//   useEffect(() => { load(); }, []);
//
//   const getTypeLabel = (type) => {
//     switch (type) {
//       case 'room_change': return 'Đổi phòng';
//       case 'teacher_change': return 'Đổi giáo viên';
//       case 'time_change': return 'Đổi ngày';
//       case 'cancellation': return 'Hủy lịch';
//       default: return type;
//     }
//   };
//
//   const getRequesterName = (request) => {
//     return request.requester_name || `User ${request.requested_by_user_id}`;
//   };
//
//   const handleUpdate = async (updatedRequest) => {
//     try {
//       if (updatedRequest.status === 'approved' && selectedRequest.status !== 'approved') {
//         await approveRequest(updatedRequest.id);
//       } else if (updatedRequest.status === 'rejected' && selectedRequest.status !== 'rejected') {
//         await rejectRequest(updatedRequest.id);
//       } else if (updatedRequest.status === 'applied' && selectedRequest.status !== 'applied') {
//         await applyRequest(updatedRequest.id);
//       }
//       // For other changes, perhaps add an update API if needed
//       load(); // Reload list
//     } catch (err) {
//       console.error('Failed to update request', err);
//       alert('Cập nhật thất bại');
//     }
//   };
//
//   const openDetailModal = (request) => {
//     setSelectedRequest(request);
//     setShowModal(true);
//   };
//
//   return (
//     <div className="p-4">
//       <h2 className="text-xl font-bold mb-4">Yêu cầu chỉnh sửa lịch</h2>
//       {loading ? <div>Loading...</div> : (
//         <table className="min-w-full bg-white border">
//           <thead className="bg-gray-50">
//             <tr>
//               <th className="px-4 py-2 border">ID</th>
//               <th className="px-4 py-2 border">Buổi học</th>
//               <th className="px-4 py-2 border">Loại yêu cầu</th>
//               <th className="px-4 py-2 border">Người yêu cầu</th>
//               <th className="px-4 py-2 border">Trạng thái</th>
//               <th className="px-4 py-2 border">Hành động</th>
//             </tr>
//           </thead>
//           <tbody>
//             {requests.map(r => (
//               <tr key={r.id} className="border-t">
//                 <td className="px-4 py-2 border">{r.id}</td>
//                 <td className="px-4 py-2 border">{r.schedule_instance_id}</td>
//                 <td className="px-4 py-2 border">{getTypeLabel(r.request_type)}</td>
//                 <td className="px-4 py-2 border">{getRequesterName(r)}</td>
//                 <td className="px-4 py-2 border">{r.status}</td>
//                 <td className="px-4 py-2 border">
//                   <Button size="sm" onClick={() => openDetailModal(r)}>Xem chi tiết</Button>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       )}
//
//       {showModal && selectedRequest && (
//         <RequestDetailModal
//           showModal={showModal}
//           selectedRequest={selectedRequest}
//           onClose={() => setShowModal(false)}
//           onUpdate={handleUpdate}
//         />
//       )}
//     </div>
//   );
// }
