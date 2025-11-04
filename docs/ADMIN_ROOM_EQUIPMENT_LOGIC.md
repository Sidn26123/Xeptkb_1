# Tổng hợp logic quản lý Phòng & Thiết bị

Tài liệu này tổng hợp logic hiện tại về quản lý phòng và thiết bị trong repository `Hethongxeplich` (frontend `adminsite` + backend `server`). Mục đích: cung cấp bản tóm tắt để dễ hiểu, test và bảo trì.

---

## 1. Tổng quan
- Giao diện quản lý phòng chính: `adminsite/src/pages/RoomManagement.jsx`.
- Dữ liệu liên quan: `Campus`, `Building`, `Room` và `Equipment`. Quan hệ chính: `Room` <-> `Equipment` thông qua bảng quan hệ `RoomEquipment`.
- Các thao tác chính: danh sách, tạo (Add), cập nhật (Edit), xóa (Delete) phòng; chọn/sync thiết bị cho phòng khi tạo/cập nhật.

## 2. Mô hình dữ liệu (tóm tắt)
- Room
  - id, code, name, type, status, buildings_id, floor_number, room_seq, capacity_max, capacity_optimal, ...
- Building
  - id, code, name, campus_id, floor_count, ...
- Campus
  - id, code, name, ...
- Equipment
  - id, code, name, ...
- RoomEquipment (relation)
  - id, room_id, equipment_id, quantity

(Tệp model/ORM hiện nằm trong `server/models/`)

## 3. Luồng frontend chính (RoomManagement.jsx)
1. On mount
   - `fetchCampuses()` → gán `campuses`
   - `fetchEquipments()` → gán `equipments`
   - `fetchList()` → lấy danh sách `rooms`
2. Mở modal Thêm (Add)
   - `openAddRoom()` đặt form rỗng, `selectedCampus = ''`, `buildings = []`, `selectedEquipments = []`, `errors = {}`
   - Khi user chọn `Cơ sở` (campus): gọi `fetchBuildings(campusId)` → gán `buildings` (lưu toàn bộ danh sách buildings trong `allBuildings` để tra cứu)
   - Khi user chọn `Tòa nhà` (building): set `form.buildings_id` và reset `floor_number` (floor dropdown sẽ dùng `getFloorOptions(buildings_id)`)
   - `Tầng`: select options được tạo từ `building.floor_count` như 0..N-1; giá trị 0 hiển thị là "Tầng trệt"
   - `Số phòng` (`room_seq`): input số
   - Khi campus + building + floor + room_seq đều có giá trị, effect sẽ auto-generate `form.code` theo mẫu: `${campus}${bLabel}${floor}${seq}`
     - `bLabel` lấy ký tự cuối cùng của token chữ-số cuối cùng trong `building.code` hoặc `building.name` (chuyển thành chữ hoa)
     - `code` input là `readOnly` và `disabled` (không cho sửa tay)
   - Thiết bị: checkbox list từ `equipments`, user chọn và nhập `quantity`.
   - Submit Add: validate form client-side (`validateForm()`), gửi payload `createRoom(payload)` rồi nếu có `selectedEquipments` tạo các bản ghi `RoomEquipment` tương ứng (qua `createRoomEquipment`)

3. Mở modal Sửa (Edit)
   - `handleEditOpen(r)`:
     - set `editRoom = r`, clear `errors` và `selectedEquipments` để khởi tạo sạch
     - set form fields from `r` (code, name, type, capacity, floor_number, buildings_id, room_seq...)
     - Guaranteed: nếu `allBuildings` chưa có, `fetchBuildings()` để populate `allBuildings` (dùng cho parsing)
     - Nếu `r.buildings_id` tồn tại: fetch building bằng `getBuildingById` để lấy `campus_id`, set `selectedCampus` và gọi `fetchBuildings(campusId)`
     - Nếu `r.buildings_id` không tồn tại nhưng `r.code` có giá trị: gọi `parseRoomCode(r.code, allBuildings)` (util) để cố gắng tách `campus`, `building`, `floor`, `room_seq`; sau đó resolve campus/building id dựa trên dữ liệu `campuses` và `allBuildings`, set `selectedCampus`, gọi `fetchBuildings(campus)` và set form fields tương ứng
     - Đảm bảo `equipments` đã được load trước khi gọi `getRoomEquipmentsByRoomId(r.id)` để map các relation vào `selectedEquipments` (dạng { equipment_id, quantity, id }) — điều này sửa lỗi trước đây khi edit modal không hiện thiết bị được chọn
   - Submit Edit: validate form → `updateRoom(editRoom.id, payload)`; sau khi cập nhật thành công, đồng bộ thiết bị: lấy các relation hiện tại `getRoomEquipmentsByRoomId(roomId)` → xóa từng relation (`deleteRoomEquipment(id)`) → tái tạo từ `selectedEquipments` (gọi `createRoomEquipment`). Nếu sync thiết bị lỗi thì báo (toast) nhưng không rollback cập nhật phòng.

4. Xóa phòng
   - Gọi `deleteRoom(room.id)` rồi refresh danh sách.

## 4. Endpoints & Services (frontend ↔ backend)
- Frontend services (path):
  - `adminsite/src/services/roomService.js` — getAllRooms, createRoom, updateRoom, deleteRoom
  - `adminsite/src/services/buildingService.js` — getAllBuildings, getBuildingById
  - `adminsite/src/services/campusService.js` — getAllCampus
  - `adminsite/src/services/equipmentService.js` — getAllEquipments
  - `adminsite/src/services/roomEquipmentService.js` — getRoomEquipmentsByRoomId(roomId), createRoomEquipment, deleteRoomEquipment, ...

- Backend controllers & routes (path):
  - `server/controller/roomEquipmentController.js` — hỗ trợ `getRoomEquipmentsByRoomId` (SELECT WHERE room_id = :roomId)
  - `server/routes/roomEquipment.js` — route `GET /room-equipments/room/:roomId`
  - Các route khác: rooms, buildings, campuses, equipments (xem `server/routes/`)

Response shapes
- Các service frontend mong đợi shape: `res.data.data` chứa mảng hoặc object (tuân theo cách backend bọc dữ liệu bằng SuccessResponse).
- RoomEquipment items: { id, room_id, equipment_id, quantity }

## 5. Validation rules (client-side)
- code: required, length 2..30 (auto-generated; input disabled)
- name: required
- campus: required (selectedCampus)
- buildings_id: required
- floor_number: required (integer within valid range; 0.. maxFloor-1)
- room_seq: required (string/number; 0 allowed?), used in code generation
- type: required
- status: required
- capacity_max: required integer >=1 and <=1000
- capacity_optimal: required integer >=0 and <= capacity_max

Notes: validation runs in `validateForm()` before submit and shows inline error messages; when opening Add/Edit modals errors are cleared so stale messages don't persist.

## 6. Room code generation & parsing
- Generation (auto-fill): `${campusPart}${bLabel}${floor}${room_seq}`
  - campusPart: uses `selectedCampus` (typically campus id)
  - bLabel: last character of the last alphanumeric token from `building.code` or `building.name` (toUpperCase)
  - floor: numeric (0 acceptable, shown as "Tầng trệt")
  - room_seq: numeric sequence

- Parsing util: `adminsite/src/utils/parseRoomCode.js`
  - Expected pattern currently: `^(\d+)([A-Za-z])(\d+)$` (campus digits + building letter + rest digits)
  - It finds candidate buildings whose last token's last char matches the building letter.
  - Splits the trailing digits into floor and room_seq by testing splits and preferring splits that match a candidate building's `floor_count` (i.e., floor <= maxFloor-1).
  - Returns `{ campusPart, buildingId, floor, room_seq }` or `null`.
  - Important fix applied: frontend select value uses `form.floor_number ?? ''` so floor `0` is rendered correctly (previous `|| ''` treated 0 as falsy and hid it).

Limitations & edge cases
- Parser assumes building-label is a single letter and code shape matches the regexp. If your codes use multi-letter building tokens or different patterns, parser needs to be extended.
- campusPart may be campus id or campus code — when parsing we try to resolve it against loaded `campuses` and convert to campus id if needed.

## 7. Equipment sync logic (Add / Edit)
- Add flow
  - After `createRoom(payload)` returns the created room (with id), create RoomEquipment records for each selected equipment: `createRoomEquipment({ room_id, equipment_id, quantity })`.
- Edit flow
  - After successful room update:
    - Fetch current relations `existing = getRoomEquipmentsByRoomId(roomId)`
    - Delete each existing relation: `deleteRoomEquipment(existing.id)`
    - Recreate relations from current UI selection `selectedEquipments`
  - Note: errors while syncing equipment will be reported (toast) but will not rollback the room update.

## 8. Edge cases & recommended improvements
- Parser: Expand supported patterns (multi-letter building tokens, numeric building labels, optional campus prefix). Provide explicit rule examples for allowed room.code formats.
- Equipment sync: Consider a diff-based sync (update existing relations when equipment id matches, only delete obsolete ones and create new ones) to avoid unnecessary deletes/creates and preserve relation ids.
- Race conditions: Ensure `equipments` is loaded before mapping existing relations (already handled by `handleEditOpen`), but verify concurrency when multiple modals open.
- Auth & error handling: Routes are protected; ensure the frontend has a valid auth token for all requests.

## 9. Testing checklist
- [ ] Open Add modal
  - [ ] Campuses fetched on open
  - [ ] Building dropdown empty until campus selected
  - [ ] After selecting campus, buildings loaded
  - [ ] Floor dropdown shows `Tầng trệt` for 0 and other floors correctly
  - [ ] Enter room_seq and verify code auto-generated and disabled
  - [ ] Select equipments and quantities; submit and verify room + room-equipment created in DB
- [ ] Open Edit modal for room with `buildings_id` present
  - [ ] Building/campus pre-selected
  - [ ] Equipments previously assigned appear checked and quantities filled
  - [ ] Update and verify room and equipment sync
- [ ] Open Edit modal for room with only `code` (no buildings_id/floor/seq)
  - [ ] Parser extracts campus/building/floor/seq (ground floor 0 should show as `Tầng trệt`)
  - [ ] Form fields populated accordingly
- [ ] Test edge codes that do not match parser and verify fallback behavior (no crash, fields remain blank)
- [ ] Test validation messages for all required fields and numeric ranges

## 10. Next steps (optional improvements)
- Improve `parseRoomCode.js` to support additional formats. Provide a small unit test file to validate many code examples.
- Change equipment sync to diff-based updates to preserve existing relation ids.
- Add server-side validation for room code uniqueness and relationship constraints.
- Add E2E tests (Cypress / Playwright) for Add/Edit flows and equipment sync.

---

Files referenced
- `adminsite/src/pages/RoomManagement.jsx`
- `adminsite/src/services/roomService.js`
- `adminsite/src/services/buildingService.js`
- `adminsite/src/services/campusService.js`
- `adminsite/src/services/equipmentService.js`
- `adminsite/src/services/roomEquipmentService.js`
- `adminsite/src/utils/parseRoomCode.js`
- `server/controller/roomEquipmentController.js`
- `server/routes/roomEquipment.js`

Nếu bạn muốn, tôi có thể:
- Thêm ví dụ cụ thể (sample room.code strings) và cập nhật parser để xử lý các định dạng đó.
- Tạo unit tests cho `parseRoomCode.js`.
- Chạy lint/build và sửa lỗi nếu bạn cho phép chạy lệnh trong workspace.

