# Teacher → Admin: Room/Time Change Flow

Mục đích: mô tả flow đơn giản khi giảng viên (teacher) yêu cầu đổi phòng hoặc đổi lịch do trục trặc/việc bận, admin kiểm tra và phê duyệt/từ chối, sau khi phê duyệt hệ thống cập nhật trực tiếp `schedule_instances`.

---

**Summary (tóm tắt)**
- Teacher tạo request (type = `room_change` | `time_change`) cho một `schedule_instance` cụ thể.
- Request lưu vào `schedule_change_requests` với `status = 'pending'` và `old_*` đã được điền.
- Admin xem request, kiểm tra conflict, tìm phòng/khung giờ phù hợp và chọn `new_*`.
- Admin approve → hệ thống UPDATE `schedule_instances` (không tạo mới), set `status='rescheduled'` cho instance.
- Nếu admin reject → `schedule_instances` không thay đổi.

---

**Bảng liên quan**
- `users`, `teachers` — xác thực, thông tin giảng viên
- `schedules`, `courseclasses` — pattern của môn
- `schedule_instances` — buổi học cụ thể (cập nhật khi apply)
- `schedule_change_requests` — lưu request đổi phòng/đổi lịch
- `rooms`, `timeslots` — tra cứu phòng/khung giờ trống
- `students` — để gửi thông báo (nếu cần)
- `holidayactual` — kiểm tra ngày nghỉ

---

## Flow chi tiết (step-by-step)

1) Teacher: tạo request
- UI: teacher chọn `schedule_instance` (id), chọn `request_type` ('room_change' | 'time_change'), nhập `reason`.
- Backend sẽ read hiện trạng instance và insert record mới:

```sql
INSERT INTO schedule_change_requests
 (schedule_instance_id, request_type, status, requested_by_user_id, requested_by_role, reason,
  old_room_id, old_time_slot_id, old_date, old_teacher_id, created_at, updated_at)
VALUES
 (<instance_id>, 'room_change', 'pending', <user_id>, 'teacher', '<reason>',
  <old_room_id>, <old_time_slot_id>, <old_date>, <old_teacher_id>, NOW(), NOW());
```

> Lưu ý: `new_room_id`, `new_time_slot_id`, `new_date` để NULL lúc teacher chỉ gửi request — admin sẽ chọn phòng/giờ phù hợp.

2) Admin: xem request
- Admin query ra các request `status='pending'` kèm thông tin buổi học, lớp, số sinh viên, phòng/giờ hiện tại.
- Admin cần kiểm tra conflict (room/teacher availability) trước khi approve.

3) Admin: tìm phòng/khung giờ phù hợp
- Tìm phòng active có capacity >= số sinh viên và không bị đặt cùng ngày/tiết:

```sql
SELECT r.id, r.code, r.name, r.capacity_max
FROM rooms r
WHERE r.status='active'
  AND r.capacity_max >= <required_capacity>
  AND r.id NOT IN (
    SELECT si.room_id
    FROM schedule_instances si
    WHERE si.date = <target_date>
      AND si.time_slot_id = <target_timeslot_id>
      AND si.status IN ('scheduled','rescheduled')
  );
```

4) Admin: approve hoặc reject
- Approve: cập nhật request với `new_*` và set `status='approved'`, rồi apply change vào `schedule_instances`.

```sql
-- mark approved + set chosen new room/time
UPDATE schedule_change_requests
SET status='approved', new_room_id = <new_room_id>, new_time_slot_id = <new_time_slot_id>, new_date = <new_date>, updated_at = NOW()
WHERE id = <req_id>;

-- apply vào schedule_instances
UPDATE schedule_instances si
JOIN schedule_change_requests scr ON si.id = scr.schedule_instance_id
SET si.room_id = COALESCE(scr.new_room_id, si.room_id),
    si.time_slot_id = COALESCE(scr.new_time_slot_id, si.time_slot_id),
    si.date = COALESCE(scr.new_date, si.date),
    si.status = 'rescheduled',
    si.updatedAt = NOW()
WHERE scr.id = <req_id> AND scr.status = 'approved';

-- mark request applied
UPDATE schedule_change_requests
SET status = 'applied', updated_at = NOW()
WHERE id = <req_id>;
```

- Reject: set `status='rejected'` (no change to `schedule_instances`).

```sql
UPDATE schedule_change_requests
SET status = 'rejected', updated_at = NOW()
WHERE id = <req_id>;
```

5) Notifications (optional)
- Nếu approved/applied → gửi thông báo/email cho teacher + students trong lớp.
- Nếu rejected → thông báo cho teacher.

---

## Validation checklist (backend before creating/updating request)
- Khi teacher tạo request:
  - đảm bảo `schedule_instance_id` tồn tại và thuộc teacher đó (security check).
  - populate `old_room_id`, `old_time_slot_id`, `old_date`, `old_teacher_id` từ `schedule_instances` server-side.
- Khi admin chọn `new_room_id` / `new_time_slot_id` / `new_date`:
  - kiểm tra `new_date` không trùng `holidayactual`.
  - kiểm tra teacher availability: teacher không có `schedule_instances` khác cùng `new_date`+`new_time_slot_id`.
  - kiểm tra phòng availability: phòng không bị occupy cùng `new_date`+`new_time_slot_id`.
  - kiểm tra capacity phòng >= số sinh viên lớp.

---

## API endpoints (pseudocode)
- POST `/api/teacher/requests` — create request (teacher)
- GET `/api/admin/requests?status=pending` — list pending requests (admin)
- POST `/api/admin/requests/:id/approve` — approve; body: `{new_room_id?, new_time_slot_id?, new_date?}`
- POST `/api/admin/requests/:id/reject` — reject

---

## Acceptance criteria / QA
- Khi admin approve và apply, `schedule_instances` đươc cập nhật (phòng/ngày/tiết) và request status chuyển sang `applied`.
- Khi admin reject, `schedule_instances` không thay đổi.
- Tất cả thay đổi có `old_*` và `new_*` lưu trong `schedule_change_requests` để audit.
- Không có conflict (phòng/giờ/teacher) sau khi apply.

---

## Implementation tasks (recommended)
- [ ] Backend: endpoint create request (populate old_* server-side).
- [ ] Backend: admin endpoints approve/reject + apply logic.
- [ ] Frontend: teacher UI để chọn instance + submit request.
- [ ] Frontend: admin UI list pending + choose new room/time + approve/reject.
- [ ] (Optional) Notifications service for sending emails.

---

## Notes
- We update existing `schedule_instances` on apply (do not create duplicate instances). Keep `schedule_change_requests` as history/audit.
- If later you want to support automatic makeup scheduling, consider a separate flow/table for makeup proposals.

---

*File created by assistant — chỉnh sửa thêm nếu bạn muốn format khác hoặc thêm ví dụ cụ thể.*

---

## Table: `schedule_change_requests` (schema reference)

Đây là DDL hiện tại được chèn vào `school_management.sql`. Giữ bản tham chiếu trong tài liệu để developer và DBA biết cấu trúc khi triển khai.

```sql
CREATE TABLE `schedule_change_requests` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `schedule_instance_id` int(11) NOT NULL,
  `request_type` varchar(50) NOT NULL,
  `status` varchar(50) DEFAULT 'pending',
  `requested_by_user_id` int(11) NOT NULL,
  `requested_by_role` varchar(50) NOT NULL,
  `reason` text NOT NULL,

  `old_room_id` int(11) DEFAULT NULL,
  `old_time_slot_id` int(11) DEFAULT NULL,
  `old_date` date DEFAULT NULL,
  `old_teacher_id` int(11) DEFAULT NULL,

  `new_room_id` int(11) DEFAULT NULL,
  `new_time_slot_id` int(11) DEFAULT NULL,
  `new_date` date DEFAULT NULL,
  `new_teacher_id` int(11) DEFAULT NULL,

  `change_from_date` date DEFAULT NULL,
  `change_to_date` date DEFAULT NULL,

  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  KEY `idx_schedule_instance` (`schedule_instance_id`),
  KEY `idx_status` (`status`),
  KEY `idx_request_type` (`request_type`),
  KEY `idx_requested_by` (`requested_by_user_id`),
  KEY `idx_created_at` (`created_at`),
  KEY `idx_new_room` (`new_room_id`),
  KEY `idx_new_teacher` (`new_teacher_id`),

  CONSTRAINT `scr_fk_schedule_instance`
    FOREIGN KEY (`schedule_instance_id`) REFERENCES `schedule_instances` (`id`) ON DELETE CASCADE,
  CONSTRAINT `scr_fk_requested_by`
    FOREIGN KEY (`requested_by_user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `scr_fk_old_room`
    FOREIGN KEY (`old_room_id`) REFERENCES `rooms` (`id`) ON DELETE SET NULL,
  CONSTRAINT `scr_fk_new_room`
    FOREIGN KEY (`new_room_id`) REFERENCES `rooms` (`id`) ON DELETE SET NULL,
  CONSTRAINT `scr_fk_old_teacher`
    FOREIGN KEY (`old_teacher_id`) REFERENCES `teachers` (`id`) ON DELETE SET NULL,
  CONSTRAINT `scr_fk_new_teacher`
    FOREIGN KEY (`new_teacher_id`) REFERENCES `teachers` (`id`) ON DELETE SET NULL,
  CONSTRAINT `scr_fk_old_timeslot`
    FOREIGN KEY (`old_time_slot_id`) REFERENCES `timeslots` (`id`) ON DELETE SET NULL,
  CONSTRAINT `scr_fk_new_timeslot`
    FOREIGN KEY (`new_time_slot_id`) REFERENCES `timeslots` (`id`) ON DELETE SET NULL,
  CONSTRAINT `scr_chk_request_type` CHECK (`request_type` IN ('room_change','time_change','teacher_change','cancellation')),
  CONSTRAINT `scr_chk_status` CHECK (`status` IN ('pending','under_review','approved','rejected','applied','cancelled'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## Deployment / Migration checklist

If you already have an existing database and want to apply this table or synchronize schema, follow these safe steps.

1. Backup current database (always first):

```bash
mysqldump -u <user> -p --single-transaction school_management > school_management_backup.sql
```

2. If you have not imported the updated dump yet: re-import the edited `school_management.sql` into a test DB and verify.

3. If the DB already contains an older `schedule_change_requests` or different schema and you need to ALTER in-place, run (example):

```sql
-- Drop any leftover FK/index that reference removed columns (example names)
ALTER TABLE `schedule_change_requests`
  DROP FOREIGN KEY IF EXISTS `scr_fk_makeup_room`,
  DROP FOREIGN KEY IF EXISTS `scr_fk_makeup_timeslot`;

-- Then add/modify columns as needed (example adds are idempotent in scripts that check existence first)
ALTER TABLE `schedule_change_requests`
  ADD COLUMN IF NOT EXISTS `new_room_id` int(11) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS `new_time_slot_id` int(11) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS `new_date` date DEFAULT NULL;

-- Add FK constraints (run after columns exist)
ALTER TABLE `schedule_change_requests`
  ADD CONSTRAINT IF NOT EXISTS `scr_fk_new_room` FOREIGN KEY (`new_room_id`) REFERENCES `rooms`(`id`) ON DELETE SET NULL;
```

4. Run basic smoke tests on test DB:
  - Create a sample `schedule_change_requests` row referencing an existing `schedule_instance` and user.
  - Approve and apply using the SQL shown in this doc and verify `schedule_instances` updates.

5. Deploy to production only after successful test and backup.

---

If you want, I can also add a ready-to-run migration SQL file in the repo (e.g. `migrations/20251116_add_scr.sql`) that performs the ALTERs safely. Chọn `có` nếu muốn tôi tạo file migration.
