# Schedule Change Helper — Tóm tắt và hướng dẫn

Tài liệu này tóm tắt các kiểm tra cần thiết, luồng xử lý và ví dụ truy vấn/logic để triển khai tính năng "đổi 1 buổi học của 1 giảng viên" theo yêu cầu:

- Tránh ngày nghỉ học (HolidayActual)
- Kiểm tra unavailability cấu hình đầu học kỳ (instructorsunavailabletime)
- Tránh conflict cho giảng viên, lớp, phòng tại ngày đó
- Hỗ trợ hai luồng ưu tiên: `room-first` hoặc `time-first`

Mục lục
- Mục đích
- Dữ liệu / models liên quan
- Checklist kiểm tra (hard constraints)
- Hai luồng đề xuất (algorithms)
- Ví dụ truy vấn Sequelize (sketch)
- Cấu trúc trả về gợi ý
- Ghi nhận thay đổi (audit) & policy
- Gợi ý triển khai tiếp

---

Mục đích
- Cung cấp hàm helper dùng bởi endpoint `propose-change` để trả về các phương án (phòng + timeslot) khả thi khi giảng viên muốn đổi 1 buổi trong 1 ngày cụ thể.
- **Lưu ý**: Flow này chỉ áp dụng khi đã có `schedule_instances` được sinh từ schedule pattern. Nếu chưa có instances, cần chạy generator trước.

**Khái niệm quan trọng**:
- `courseclasses` (học phần) = 1 lớp học 1 môn. Ví dụ: Lớp A học Môn B → 1 courseclass, Lớp A học Môn C → 1 courseclass khác, Lớp X học Môn B → 1 courseclass khác.
- Mỗi `courseclass` có `class_id` (lớp nào), `subject_id` (môn gì), `teacher_id`, `duration_per_session` (số tiết/buổi).

Models / Tables liên quan (từ schema hiện có)
- `HolidayActual` (semester_id, start_date, end_date)
- `instructorsunavailabletime` (day_id, teacher_id, time_slot_id) — unavailability cấu hình đầu học kỳ
- `schedule_instances` (id, schedule_id, date, time_slot_id, room_id, teacher_id, status, origin, metadata) — **KHÔNG có class_id trực tiếp**
- `schedules` (id, course_class_id, day_id, time_slot_id, week_start, week_end, num_of_period, generation_id) — pattern
- `courseclasses` (id, subject_id, class_id, duration_per_session, session_per_week, teacher_id, semester_id) — **học phần = lớp học môn**
- `timeslots` (id, idx, is_break, name) — tiết học, idx để sắp xếp
- `rooms` (id, name, capacity_max, capacity_optimal, buildings_id), `roomsequipments`, `equipments`
- `subjectrequiresequipment` (subject_id, equipment_id)
- `schedule_generations` (id, semester_id, generated_at, fitness_score) — metadata của đợt sinh lịch
- `classes` (id, name, training_type_id, faculty_id) — lớp sinh viên
- `buildings` (id, campus_id), `campus` — để check travel constraints

**Quan hệ quan trọng**:
- `schedule_instances` → `schedules` → `courseclasses` → `classes` (để lấy class_id)
- `schedules` → `schedule_generations` → `semesters` (để filter đúng kỳ)

Nếu cần mở rộng: nên thêm `schedule_changes` (audit log).

---

Checklist kiểm tra (Hard constraints) khi propose 1 option

**Pre-validation (reject nhanh)**:
0. **Past date check**: `date` không được ở quá khứ (< today).
1. **Holiday check**: `date` không rơi vào `HolidayActual` cho semester.
2. **Teacher recurring availability**: Tính `day_id` từ `date` (Mon=1..Sun=7), check `instructorsunavailabletime` KHÔNG cấm các slot trong block.

**Multi-period block calculation** (QUAN TRỌNG):
- Nếu `duration_per_session = 4` và `start_slot = 3` → block chiếm slots `[3, 4, 5, 6]`.
- Hàm helper: `getOccupiedSlots(start_slot, duration) => [start_slot, start_slot+1, ..., start_slot+duration-1]`.
- TẤT CẢ checks conflict phải dùng `overlapSlots = getOccupiedSlots()` thay vì chỉ `start_slot`.

**Resource conflict checks** (cho toàn bộ block):
3. **Teacher conflict**: Teacher không có instance nào khác trên `date` với slots overlapping block.
4. **Class conflict** (TUYỆT ĐỐI): Lấy `class_id` từ `courseclasses`, đảm bảo KHÔNG có instance nào khác của cùng `class_id` trên `date` overlapping block. Cần JOIN: `schedule_instances` → `schedules` → `courseclasses`.
5. **Room conflict**: Room không bị bận trên `date` overlapping block.

**Room suitability**:
6. **Room capacity**: `room.capacity_max >= student_count` (lấy từ courseclasses hoặc count students trong class).
7. **Room equipment**: Room có tất cả equipment cần thiết (join `subjectrequiresequipment` + `roomsequipments`).

**Timeslot validity**:
8. **Block liên tiếp hợp lệ**: 
   - Tất cả slots trong block tồn tại (`idx` trong range hợp lệ).
   - KHÔNG có slot nào có `is_break = true` (giờ nghỉ trưa).
   - `start_slot + duration - 1 <= max_timeslot_idx` (thường 12 hoặc 14).

**Optional** (nếu áp dụng):
9. **Travel constraint**: Tránh campus khác cho ca nối tiếp (check buildings_id → campus_id).

---

Hai luồng đề xuất (tóm tắt thuật toán)

1) Room-first (Ưu tiên phòng trước)
- Lọc `eligibleRooms` theo capacity + equipment.
- Với mỗi phòng, tìm tất cả `startSlot` trên `date` sao cho block [start, start+duration-1] thỏa các ràng buộc (teacher free, class free, room free, không rơi holiday, không có break).
- Tạo đề xuất { room_id, room_name, starts: [startIdx,...], score }
- Rank & trả top-k.

2) Time-first (Ưu tiên giờ trước)
- Sinh danh sách `startSlot` khả thi (theo preference: sáng/chiều, tránh lunch hoặc prefer prime slots).
- Với mỗi `startSlot`, tìm `rooms` trống cho toàn bộ block và thỏa capacity/equipment.
- Tạo đề xuất { start_slot, rooms: [{room_id,room_name}], score }

Pruning & performance
- Prune sớm (holiday, teacher availability) trước khi dò room để giảm truy vấn.
- Giới hạn `maxCandidates` (ví dụ 50) để tránh nổ tổ hợp.
- Cache mặc định: timeslots, room equipments, và biểu mẫu busy map trên `date`.

---

Ví dụ truy vấn Sequelize (chi tiết & đúng logic)

**Helper functions** (dùng chung):

```javascript
const { Op } = require('sequelize');

// Helper: Tính occupied slots cho multi-period
function getOccupiedSlots(startSlot, duration) {
  const slots = [];
  for (let i = 0; i < duration; i++) {
    slots.push(startSlot + i);
  }
  return slots;
}

// Helper: Map date -> day_id (1=Mon..7=Sun)
function getDayIdFromDate(dateStr) {
  const d = new Date(dateStr);
  const jsDay = d.getDay(); // 0=Sun, 1=Mon..6=Sat
  return jsDay === 0 ? 7 : jsDay; // Convert to 1=Mon..7=Sun
}
```

**1) Past date & Holiday check**

```javascript
// Reject past dates
if (new Date(date) < new Date()) {
  return { success: false, reason: 'date_in_past' };
}

// Holiday check
const isHoliday = await HolidayActual.findOne({
  where: {
    semester_id,
    start_date: { [Op.lte]: date },
    end_date: { [Op.gte]: date }
  }
});
if (isHoliday) {
  return { success: false, reason: 'date_is_holiday', holiday: isHoliday.name };
}
```

**2) Get target courseclass info & calculate block**

```javascript
const courseClass = await CourseClass.findByPk(courseClassId, {
  include: [{ model: Class }, { model: Subject }]
});
if (!courseClass) return { success: false, reason: 'invalid_courseclass' };

const targetClassId = courseClass.class_id; // Lấy class_id để check conflict
const duration = courseClass.duration_per_session || 2;
const subjectId = courseClass.subject_id;

// Assume startSlot is candidate, calculate occupied block
const overlapSlots = getOccupiedSlots(startSlot, duration); // e.g. [3,4,5,6]
```

**3) Check teacher recurring unavailability**

```javascript
const dayId = getDayIdFromDate(date);
const teacherUnavailable = await InstructorsUnavailableTime.findAll({
  where: {
    teacher_id: teacherId,
    day_id: dayId,
    time_slot_id: { [Op.in]: overlapSlots } // Check tất cả slots trong block
  }
});

// LƯU Ý: Nếu giảng viên KHÔNG có dữ liệu unavailability (teacherUnavailable rỗng),
// mặc định BỎ QUA (cho phép) - không reject
if (teacherUnavailable.length > 0) {
  return { success: false, reason: 'teacher_unavailable_recurring' };
}
```

**4) Check teacher conflict (other instances on same date)**

```javascript
const teacherConflict = await ScheduleInstance.findOne({
  where: {
    date,
    teacher_id: teacherId,
    time_slot_id: { [Op.in]: overlapSlots },
    status: 'scheduled'
  }
});
if (teacherConflict) {
  return { success: false, reason: 'teacher_busy' };
}
```

**5) Check class conflict (CRITICAL - needs JOIN)**

```javascript
// Find all instances on date overlapping our block, join to get class_id
const classConflicts = await ScheduleInstance.findAll({
  where: {
    date,
    time_slot_id: { [Op.in]: overlapSlots },
    status: 'scheduled'
  },
  include: [{
    model: Schedule,
    required: true,
    include: [{
      model: CourseClass,
      required: true,
      where: { class_id: targetClassId } // Same class = conflict
    }]
  }]
});

if (classConflicts.length > 0) {
  return { success: false, reason: 'class_conflict' };
}
```

**6) Check room conflict & find available rooms**

```javascript
// Find busy rooms on date for overlapping slots
const busyRooms = await ScheduleInstance.findAll({
  where: {
    date,
    time_slot_id: { [Op.in]: overlapSlots },
    status: 'scheduled'
  },
  attributes: ['room_id']
});
const busyRoomIds = [...new Set(busyRooms.map(r => r.room_id))];

// Find eligible rooms (capacity + not busy)
const candidateRooms = await Room.findAll({
  where: {
    id: { [Op.notIn]: busyRoomIds },
    capacity_max: { [Op.gte]: studentCount || 0 }
  }
});
```

**7) Filter rooms by equipment**

```javascript
// Get required equipment for subject
const requiredEquip = await SubjectRequiresequipment.findAll({
  where: { subject_id: subjectId },
  attributes: ['equipment_id']
});
const requiredEquipIds = requiredEquip.map(e => e.equipment_id);

if (requiredEquipIds.length > 0) {
  // Get rooms that have ALL required equipment
  const roomsWithEquip = await Roomsequipments.findAll({
    where: {
      room_id: { [Op.in]: candidateRooms.map(r => r.id) },
      equipment_id: { [Op.in]: requiredEquipIds }
    }
  });
  
  // Group by room and count equipment
  const roomEquipCount = {};
  roomsWithEquip.forEach(re => {
    roomEquipCount[re.room_id] = (roomEquipCount[re.room_id] || 0) + 1;
  });
  
  // Keep only rooms with ALL required equipment
  candidateRooms = candidateRooms.filter(r => 
    roomEquipCount[r.id] >= requiredEquipIds.length
  );
}
```

**8) Check timeslot validity (is_break, out of bounds)**

```javascript
const timeslots = await Timeslot.findAll({ order: [['idx', 'ASC']] });
const maxIdx = Math.max(...timeslots.map(t => t.idx));
const breakSlotIds = timeslots.filter(t => t.is_break).map(t => t.id);

// Check block validity
if (startSlot + duration - 1 > maxIdx) {
  return { success: false, reason: 'exceeds_daily_limit' };
}

// Check if block touches break slots
const touchesBreak = overlapSlots.some(s => breakSlotIds.includes(s));
if (touchesBreak) {
  return { success: false, reason: 'overlaps_break_time' };
}
```

---

Return structure gợi ý

**Success case (tìm thấy proposals)**:
```json
{
  "success": true,
  "summary": {
    "total_found": 12,
    "scanned_rooms": 20,
    "scanned_slots": 42,
    "target_class_id": 1,
    "duration_per_session": 4
  },
  "proposals": [
    {
      "room_id": 10,
      "room_name": "1A01",
      "start_slot": 2,
      "start_slot_name": "Tiết 2",
      "occupied_slots": [2, 3, 4, 5],
      "capacity": 60,
      "has_required_equipment": true,
      "score": 95
    },
    {
      "room_id": 11,
      "room_name": "1A02",
      "start_slot": 7,
      "occupied_slots": [7, 8, 9, 10],
      "capacity": 50,
      "score": 90
    }
  ]
}
```

**Failure case (không tìm thấy hoặc vi phạm hard constraint)**:
```json
{
  "success": false,
  "reason": "no_available_slots",
  "message": "Không tìm thấy phòng và giờ phù hợp",
  "details": {
    "date": "2025-11-20",
    "checked_rooms": 20,
    "checked_slots": 42,
    "blocking_reasons": {
      "teacher_busy_count": 10,
      "room_busy_count": 8,
      "class_conflict_count": 5,
      "equipment_missing_count": 3
    }
  }
}
```

**Error codes**:
- `date_in_past`: Ngày đã qua
- `date_is_holiday`: Ngày nghỉ học
- `invalid_courseclass`: Không tìm thấy học phần
- `teacher_unavailable_recurring`: GV không thể dạy vào ngày này (cấu hình đầu kỳ)
- `no_available_slots`: Không tìm được slot phù hợp
- `exceeds_daily_limit`: Vượt số tiết/ngày
- `overlaps_break_time`: Chạm giờ nghỉ

---

Audit / Apply change (recommended)
- Khi user chọn 1 proposal: do re-validation trong DB transaction; nếu ok:
  - Nếu `schedule_instances` tồn tại cho `date`: insert new instance(s) (or update existing depending policy), mark old one `status='canceled'` và set `replaced_by_instance_id`.
  - Commit transaction.

Policy note
- Mặc định: chỉ thay đổi 1 `schedule_instance` (1 date). Nếu muốn đổi pattern cho nhiều tuần tương tự thì cần quyền admin/giảng viên confirm và logic bổ sung.

---

Gợi ý triển khai tiếp

**1. Implement helper `proposeOptions(params)`** (server/services/scheduleHelper.js):
   - Input params: `{ date, teacherId, courseClassId, semesterId, generationId, prefer: 'room'|'time', maxCandidates: 20 }`
   - Logic: Follow checklist + Sequelize examples ở trên.
   - Output: Return structure như mô tả.
   - Performance: Cache timeslots, rooms, equipment data để tái sử dụng.

**2. Endpoint `POST /api/schedules/propose-change`**:
   - Payload: `{ date, courseClassId, prefer?, maxCandidates? }`
   - Middleware: Xác thực teacher từ token/session.
   - Logic: Lấy `semesterId` và `generationId` active từ DB, gọi helper.
   - Response: Trả proposals hoặc error.

**3. Endpoint `POST /api/schedules/apply-change`**:
   - Payload: `{ date, courseClassId, selectedRoomId, selectedStartSlot, reason }`
   - Logic:
     1. Re-validate (gọi lại checks) trong transaction.
     2. Tìm old `schedule_instance` cho courseclass tại date.
     3. Insert new instance(s) với new room/timeslot, mark old `status='canceled'`, set `replaced_by_instance_id`.
     4. Commit transaction.
   - Response: `{ success, appliedInstanceId, message }`.

**4. (Optional) Migration**:
   - Thêm `schedule_changes` (audit log): `(id, requester_id, requester_role, old_instance_id, new_instance_id, change_type, reason, status, created_at, applied_at, metadata)`.

**5. Filter by generation_id** (QUAN TRỌNG):
   - Khi query `schedule_instances`, luôn join qua `schedules` và filter `generation_id = activeGenerationId` để tránh lấy nhầm data kỳ cũ hoặc draft.
   - Query active generation: `SELECT id FROM schedule_generations WHERE semester_id = ? ORDER BY generated_at DESC LIMIT 1`.

---

Nếu bạn muốn, tôi có thể tiếp:
- Viết helper hoàn chỉnh bằng Sequelize (service file),
- Hoặc tạo migration SQL cho `schedule_changes`.

Hãy cho biết bạn muốn mình bắt đầu phần nào.
