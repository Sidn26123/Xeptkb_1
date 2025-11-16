# Triển khai `schedule_change_requests`

## Mục đích
Tài liệu này mô tả chi tiết cách triển khai tính năng "Yêu cầu thay đổi lịch" (schedule change requests). Bao gồm schema, workflow, API, validation, UI cần thiết, truy vấn SQL hữu ích và checklist triển khai.

---

## 1. Bảng dữ liệu (schema)
Bảng: `schedule_change_requests`
- `id` (PK)
- `schedule_instance_id` (FK -> `schedule_instances.id`) - buổi học cụ thể
- `request_type` - `'room_change'|'time_change'|'teacher_change'|'cancellation'`
- `status` - `'pending'|'under_review'|'approved'|'rejected'|'applied'|'cancelled'`
- `requested_by_user_id` (FK -> `users.id`)
- `requested_by_role` - ví dụ `'teacher'|'admin'` (dùng để phân quyền/hiển thị)
- `reason` - lý do (text)

- Thông tin trước thay đổi (old): `old_room_id`, `old_time_slot_id`, `old_date`, `old_teacher_id`
- Thông tin sau thay đổi (new): `new_room_id`, `new_time_slot_id`, `new_date`, `new_teacher_id`
- Phạm vi áp dụng thay đổi nhiều buổi: `change_from_date`, `change_to_date`
- `created_at`, `updated_at`

Constraints có sẵn: FK tới `schedule_instances`, `rooms`, `timeslots`, `teachers`, `users`; check cho `request_type` và `status`.

---

## 2. Workflow & trạng thái
- Teacher tạo request → trạng thái `pending`.
- Admin xem → chuyển `under_review` hoặc duyệt ngay `approved`.
- Khi `approved`, backend có thể tự động áp dụng thay đổi (cập nhật `schedule_instances`) và đặt status `applied`.
- Nếu `rejected`, admin cập nhật trạng thái `rejected` và có thể thêm `reason` từ chối.
- Teacher có thể hủy request khi `pending` -> `cancelled`.

Ghi chú: Có thể yêu cầu audit/log mỗi lần thay đổi để phục hồi/kiểm tra.

---

## 3. API đề xuất (REST)
Base: `/api/schedule-change-requests`

- POST `/` - tạo request
  - body: `schedule_instance_id`, `request_type`, `reason`, `new_*` (tuỳ loại), `change_from_date`, `change_to_date`.
  - auth: teacher/admin
  - validate: `schedule_instance_id` hợp lệ, các trường bắt buộc theo `request_type`.

- GET `/` - list request
  - query: `role=teacher` trả requests của teacher hiện tại; `role=admin` trả toàn bộ với filter `status, request_type, requested_by`.
  - pagination + sorting

- GET `/:id` - chi tiết request (includes related schedule_instance, schedule, courseclass, subject, old/new room names)

- PUT `/:id/cancel` - hủy request (only requested_by & status pending)

- PUT `/:id/approve` - admin approve
  - action: validate again (room availability, capacity, equipment), nếu pass -> apply change (update `schedule_instances` hoặc tạo instances thay thế theo phạm vi) -> set status `applied`.
  - nếu muốn, tách `approved` (duyệt) và `applied` (đã cập nhật dữ liệu). Có thể cho admin tùy chọn "Áp dụng tự động".

- PUT `/:id/reject` - admin reject (kèm lý do từ chối optional)

- GET `/mine` - trả request của teacher hiện tại (shortcut)

---

## 4. Validation & business rules
1. Common validations:
   - `schedule_instance_id` tồn tại.
   - `request_type` nằm trong danh sách hợp lệ.
   - `requested_by_user_id` phải là user hợp lệ.

2. Room change validation:
   - Kiểm tra `new_room_id` tồn tại và room status = 'active'.
   - Kiểm tra phòng trống vào `new_date` & `new_time_slot_id` (không có `schedule_instances` khác occupation OR check `schedules` theo generation nếu áp dụng pattern).
   - Kiểm tra sức chứa (số SV của `courseclass` <= `capacity_optimal` hoặc `capacity_max`).
   - Kiểm tra thiết bị: nếu môn yêu cầu equipment, room phải có đủ `roomsequipments`.

3. Time change validation:
   - Kiểm tra `new_time_slot_id` hợp lệ.
   - Kiểm tra room hiện tại có trống vào `new_time_slot_id` nếu giữ room cũ.
   - Nếu new_date khác, kiểm tra xung đột ngày.

4. Teacher change validation:
   - Kiểm tra `new_teacher_id` khả dụng (không trùng thời gian với lịch khác của họ) và thuộc cùng khoa/được phép dạy môn (nếu cần business rule).

5. Cancellation:
   - Có thể cho phép cancel nhiều buổi theo `change_from_date`/`change_to_date`.

6. Atomicity:
   - Khi apply change cho range (nhiều `schedule_instances`), xử lý transaction để tránh trạng thái không nhất quán.

---

## 5. Queries mẫu
- Danh sách request của teacher:
```sql
SELECT scr.*, si.date, ts.name as time_slot_name, cc.name as course_class_name, s.name as subject_name, r_old.name as old_room_name, r_new.name as new_room_name
FROM schedule_change_requests scr
JOIN schedule_instances si ON scr.schedule_instance_id = si.id
JOIN schedules sch ON si.schedule_id = sch.id
JOIN courseclasses cc ON sch.course_class_id = cc.id
JOIN subjects s ON cc.subject_id = s.id
LEFT JOIN timeslots ts ON si.time_slot_id = ts.id
LEFT JOIN rooms r_old ON scr.old_room_id = r_old.id
LEFT JOIN rooms r_new ON scr.new_room_id = r_new.id
WHERE scr.requested_by_user_id = :userId
ORDER BY scr.created_at DESC;
```

- Request pending cho admin:
```sql
SELECT scr.*, u.username, t.name as teacher_name, si.date, cc.name as course_class_name
FROM schedule_change_requests scr
JOIN users u ON scr.requested_by_user_id = u.id
LEFT JOIN teachers t ON u.id = t.user_id
JOIN schedule_instances si ON scr.schedule_instance_id = si.id
JOIN schedules sch ON si.schedule_id = sch.id
JOIN courseclasses cc ON sch.course_class_id = cc.id
WHERE scr.status IN ('pending', 'under_review')
ORDER BY scr.created_at ASC;
```

---

## 6. UI đề xuất

### TeacherSite
- Trang "Yêu cầu thay đổi lịch":
  - Form chọn buổi học (từ lịch của giáo viên) + chọn `request_type` + lý do.
  - Theo loại hiển thị trường tương ứng (room dropdown, date/time picker, teacher dropdown).
  - Danh sách request đã gửi: trạng thái, lịch sử, nút hủy (nếu pending).
  - Notification khi status thay đổi.

### AdminSite
- Dashboard quản lý request:
  - Danh sách với filter by status/type/date/teacher
  - Modal chi tiết request + kiểm tra tự động: phòng trống, capacity, equipment.
  - Buttons: Approve (apply or just mark approved), Reject (cho lý do), Mark as Under Review.
  - Option để apply change cho một lần hoặc cho cả range ngày.

---

## 7. API contract (ví dụ JSON)
- POST `/api/schedule-change-requests`
```json
{
  "schedule_instance_id": 123,
  "request_type": "room_change",
  "reason": "Máy chiếu hỏng",
  "new_room_id": 18,
  "new_date": "2025-12-15",
  "new_time_slot_id": 4,
  "change_from_date": "2025-12-15",
  "change_to_date": "2025-12-15"
}
```

- Admin Approve
  - PUT `/api/schedule-change-requests/:id/approve`
  - body: `{ "apply_immediately": true }` (optional)

---

## 8. Checklist triển khai (chi tiết)
- [ ] Tạo migrations (nếu cần bổ sung trường/constraint)
- [x] Soạn tài liệu này và lưu ở `docs/SCHEDULE_CHANGE_REQUESTS_IMPLEMENTATION.md`
- [ ] Backend:
  - [ ] Model/Repository cho `schedule_change_requests` (nếu chưa có)
  - [ ] Controller: create, list (teacher/admin), detail
  - [ ] Controller: approve, reject, cancel
  - [ ] Validation service (room availability, capacity, equipment, teacher availability)
  - [ ] Apply service (thực hiện cập nhật `schedule_instances`)
  - [ ] Logging/audit
  - [ ] Tests: unit + integration
- [ ] Frontend TeacherSite
  - [ ] Form tạo request
  - [ ] List & detail request
  - [ ] Notifications
- [ ] Frontend AdminSite
  - [ ] List & filters
  - [ ] Detail modal + auto-checks
  - [ ] Approve/Reject UI
- [ ] Tài liệu vận hành: mô tả trigger apply, rollback, backup policy

---

## 9. Next steps đề nghị
1. Triển khai backend API cơ bản (create/list/detail/cancel). Thực hiện migration nếu có thay đổi schema.
2. Viết validator `checkRoomAvailability`, `checkRoomCapacity`, `checkRoomEquipments`, `checkTeacherAvailability`.
3. Tích hợp UI TeacherSite: form + list.
4. Tích hợp AdminSite: xử lý/duyệt.
5. Viết test và chạy QA.

---

Nếu bạn đồng ý, mình có thể bắt đầu tạo API skeleton trong `server/` (Node/Express/Sequelize) hoặc Python (tuỳ backend hiện tại). Bạn muốn mình bắt tay vào phần nào tiếp theo?
