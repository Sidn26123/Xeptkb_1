# Kế hoạch triển khai tính năng Tra cứu Thời khóa biểu (Tuần tự)

Tài liệu này mô tả các bước triển khai tuần tự cho các chức năng:
- Tra cứu Thời khóa biểu theo Sinh viên
- Tra cứu Thời khóa biểu theo Lớp
- Tra cứu Thời khóa biểu theo Phòng học
- Tra cứu Lịch theo Cơ sở
- Xem Lịch theo Tuần/Tháng/Học kỳ

Mục tiêu: cung cấp roadmap, danh sách file cần tạo/sửa, API endpoints, tiêu chí chấp nhận (acceptance criteria), checklist test, và bước kiểm tra chất lượng trước khi deploy.

---

## Contract ngắn gọn (Inputs / Outputs / Success)

- Inputs:
  - studentId, classId, roomId, campusId, semester, week/month/date
- Outputs:
  - JSON array của các slot lịch: {date, day, time_slot, course_class, subject, teacher, room, campus, num_of_period}
  - UI: Weekly calendar, Monthly grid, Semester timeline
- Error modes:
  - Không tìm thấy entity (404)
  - Tham số thiếu / không hợp lệ (400)
  - Lỗi server (500)
- Success:
  - API trả dữ liệu đúng schema, UI hiển thị rõ ràng, export hoạt động, tests cover happy path

---

## Files / Components cần tạo hoặc chỉnh sửa

Frontend (adminsite):
- pages/
  - `adminsite/src/pages/ScheduleLookup.jsx` (Hub page)
  - `adminsite/src/pages/StudentSchedule.jsx`
  - `adminsite/src/pages/ClassSchedule.jsx`
  - `adminsite/src/pages/RoomSchedule.jsx`
  - `adminsite/src/pages/CampusSchedule.jsx`
- components/schedule/
  - `ScheduleFilter.jsx` - filters (năm học, học kỳ, tuần, tìm kiếm)
  - `ScheduleCalendar.jsx` - weekly/monthly/semester views
  - `ScheduleTable.jsx` - tabular view, export buttons
  - `ScheduleDetailModal.jsx` - chi tiết buổi học
  - `ScheduleExport.jsx` - xuất PDF/Excel
- routes: thêm route `/schedules` trong `adminsite` router

Backend (server):
- Controller: `server/controller/scheduleController.js` - thêm hàm:
  - `getSchedulesByStudent(req, res)`
  - `getSchedulesByClass(req, res)`
  - `getSchedulesByRoom(req, res)`
  - `getSchedulesByCampus(req, res)`
  - `getSchedulesMonthly(req, res)`
  - `getSchedulesSemesterOverview(req, res)`
- Routes: `server/routes/schedule.js` (nếu chưa có), đăng ký vào `server/index.js`
- Services/Queries: `server/services/scheduleService.js` (tách queries phức tạp)
- Models: dùng `Schedules.js`, `CourseClasses.js`, `Rooms.js`, `Teachers.js` (check associations)

DB (optional):
- Indexes: `schedules(date)`, `schedules(time_slot_id)`, `schedules(course_class_id)`
- Các view/summary queries cho monthly/semester để tối ưu

---

## API Endpoints đề xuất (contract)

- GET /api/schedules/student/:studentId?semester=&week=
  - Response: {student:{id,name,class}, schedules: [ {date, day, start_time, end_time, time_slot_id, course_class_id, subject, teacher, room, campus, num_of_period} ] }

- GET /api/schedules/class/:classId?semester=&week=
  - Response: {class:{id,code,name}, schedules: [...]}

- GET /api/schedules/room/:roomId?date=&week=
  - Response: {room:{id,code,building,campus}, schedules: [...]}

- GET /api/schedules/campus/:campusId?date=&week=
  - Response: {campus:{id,name}, stats: {usedRooms, totalRooms, useRate}, detailByBuilding: [...]}

- GET /api/schedules/monthly?type=student|class|room&id=&month=&year=
  - Response: calendar summary per day with counters

- GET /api/schedules/semester/:semesterId/overview
  - Response: totals and milestones for semester

Errors: standard { success: false, message, code }

---

## UI/UX Flow (tóm tắt tuần tự cho mỗi chức năng)

1) Hub page `/schedules` — 3 cards: Sinh viên / Lớp / Phòng / Cơ sở + quick filters
2) Người dùng chọn loại tra cứu -> chuyển đến trang tương ứng
3) Trang tra cứu: Search bar + Advanced filters (năm học, học kỳ, tuần/month)
4) Kết quả hiển thị mặc định Weekly calendar; người dùng có thể đổi sang Month/Semester
5) Click vào ô lịch mở `ScheduleDetailModal` (thông tin buổi học)
6) Export / Print / Send Email

---

## Acceptance criteria (Tiêu chí chấp nhận)

- API trả dữ liệu cho student/class/room/campus với độ trễ hợp lý (< 500ms cho queries cơ bản)
- UI hiển thị calendar tuần chính xác (thứ, tiết, phòng, giảng viên)
- Modal hiển thị đầy đủ thông tin buổi học
- Export PDF hoạt động (layout rõ ràng) và Excel có header + rows
- Tests: backend endpoint có ít nhất 2 test (happy path + not found). Frontend: component snapshot hoặc rendering cơ bản
- Lint và build không lỗi

---

## Test checklist (quick)

Backend:
- [ ] Unit test controller: getSchedulesByStudent returns 200 & proper body
- [ ] Integration test: route -> controller -> DB (mock hoặc test DB)
- [ ] Edge case: student không tồn tại -> 404

Frontend:
- [ ] StudentSchedule renders with empty state
- [ ] Calendar shows events for given fake data
- [ ] Modal opens and shows expected fields

Manual QA:
- [ ] So sánh dữ liệu API với dữ liệu hiển thị UI
- [ ] Exported PDF/Excel mở được, dữ liệu đúng
- [ ] Responsive check trên mobile

---

## Quality gates & CI

- Lint: `npm run lint` (project already uses ESLint)
- Build: `npm run build` (adminsite + server build check)
- Tests: `npm test` (server), `npm run test:client` (if exists)
- GitHub Actions: workflow chạy lint -> test -> build on PR

---

## Implementation step-by-step (chi tiết kỹ thuật)

Step 0 — Chuẩn bị
- Kiểm tra liên quan models/associations: `Schedules`, `CourseClasses`, `Rooms`, `Teachers`, `Students`, `Classes`.
- Nếu thiếu service layer, tạo `server/services/scheduleService.js` để tập trung các query.

Step 1 — Hub page (MVP start)
- Tạo component `adminsite/src/pages/ScheduleLookup.jsx`
- Thêm route `/schedules` vào router (thường trong `adminsite/src/routes`)
- UI: 4 card dẫn đến 4 trang
- Acceptance: card dẫn đúng route

Step 2 — Student schedule (MVP)
Backend:
- Thêm route: `GET /api/schedules/student/:studentId`
- Controller: hàm `getSchedulesByStudent`:
  - Validate params
  - Query: join `schedules` -> `courseclasses` -> `subjects` -> `teachers` -> `rooms`
  - Group/sort theo `date`, `time_slot`
Frontend:
- `StudentSchedule.jsx`:
  - Search input (tìm theo mã SV hoặc tên) — call `/api/students?query=` nếu cần
  - Khi chọn student -> fetch `/api/schedules/student/:id?semester=&week=`
  - Render `ScheduleCalendar` (weekly default)

Step 3 — Class schedule
- Backend: `GET /api/schedules/class/:classId`
- Frontend: `ClassSchedule.jsx` tương tự Student nhưng show class meta và option compare multiple classes

Step 4 — Room schedule
- Backend: `GET /api/schedules/room/:roomId` trả thêm thông tin trạng thái/phòng
- Frontend: `RoomSchedule.jsx` + thống kê sử dụng + export

Step 5 — Campus overview
- Backend: `GET /api/schedules/campus/:campusId` trả summary và detailByBuilding
- Frontend: `CampusSchedule.jsx` hiển thị bảng tòa nhà + heatmap

Step 6 — Views: Month & Semester
- Implement `ScheduleCalendar` with 3 modes
- Backend: monthly endpoint trả aggregated counts per day

Step 7 — Export & Email
- Implement PDF template server-side (puppeteer / html-pdf) or client-side (jsPDF)
- Excel: use `exceljs` on server to generate and return file
- Email: reuse existing mailController (server/controller/mailController.js)

Step 8 — Tests & CI
- Add tests described ở Test checklist
- Update Github Actions to run tests for PRs

Step 9 — Docs
- Ghi API docs (ví dụ request/response) vào `API_TEST_GUIDE.md` hoặc tạo `docs/schedules.md`

Step 10 — Release
- Merge feature branch -> staging -> run smoke tests -> prod

---

## Queries mẫu (gợi ý SQL/Sequelize)

- Truy vấn lịch theo studentId (Sequelize pseudo):

```js
Schedule.findAll({
  include: [
    { model: CourseClass, include: [Subject, Class] },
    { model: Room },
    { model: Teacher },
  ],
  where: { student_id: studentId, semester_id: semesterId },
  order: [['date', 'ASC'], ['time_slot_id', 'ASC']]
});
```

- Aggregation monthly (count per day):
```sql
SELECT DATE(date) as day, COUNT(*) as count
FROM schedules
WHERE course_class_id = :id AND MONTH(date) = :month AND YEAR(date) = :year
GROUP BY DATE(date)
```

---

## Risks & Edge cases

- Dữ liệu trùng lặp/tồn tại nhiều time_slot overlap -> cần conflict detection
- Sinh viên thuộc nhiều lớp (chương trình) -> cần xác định lớp chính để hiển thị
- Lịch phòng thay đổi/tạm huỷ -> cần versioning hoặc flag cancelled
- Large dataset for monthly/semester -> cần pagination / aggregation

---

## Acceptance checklist (khi hoàn thành)

- [ ] Feature list trong Phase 1 hoạt động
- [ ] Backend endpoints hoạt động, có unit tests
- [ ] Frontend có calendar tuần/tháng, modal chi tiết
- [ ] Export PDF/Excel hoạt động
- [ ] Lint/build/tests PASS
- [ ] Docs cập nhật

---

## Next steps tôi có thể làm ngay

- Tạo các file frontend skeleton (Hub + StudentSchedule) và commit PR
- Hoặc: implement backend endpoints cho Student schedule và viết 2 tests nhanh

Vui lòng chọn bước bạn muốn tôi bắt đầu (ví dụ: "Bắt đầu với Hub page" hoặc "Tạo API student schedule").
