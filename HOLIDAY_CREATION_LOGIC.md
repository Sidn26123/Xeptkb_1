# Luồng tạo ngày nghỉ (ghi chú triển khai)

Tài liệu này mô tả các quy tắc tạo ngày nghỉ đã được triển khai trong dự án (server + cách frontend nên xử lý). Nội dung ghi lại logic hiện tại khi tạo ngày nghỉ từ template và tạo thủ công, quy tắc không chồng lấn, quy tắc mở rộng khi rơi vào Chủ Nhật (Sunday-extension), ví dụ request/response và tham chiếu đến các file đã chỉnh sửa.

---

## Tổng quan

- Tất cả các khoảng ngày nghỉ lưu trong bảng `holidayactual` phải tách biệt (không chồng lấn). Nói cách khác: mọi yêu cầu tạo ngày nghỉ (template hoặc thủ công) sẽ bị từ chối nếu khoảng thời gian đề xuất trùng/chồng lấn với bất kỳ bản ghi `holidayactual` đã tồn tại.
- Template là định nghĩa cố định (bảng `holidayrule`). Việc áp template qua API tuân theo cùng quy tắc không chồng lấn.
- Ngày nghỉ thủ công cũng bị từ chối nếu chồng lấn với bất kỳ ngày nghỉ đã tồn tại (template hoặc thủ công). Người dùng phải chọn khoảng thời gian không giao nhau với các record hiện có.
- Khi tạo ngày nghỉ từ template (thông qua `rule_id`/`rule_ids`), controller áp quy tắc "mở rộng nếu có Chủ Nhật": nếu trong khoảng có ngày Chủ Nhật thì `end_date` lưu vào DB sẽ được cộng thêm 1 ngày.

Hành vi này giữ cho các bản ghi `holidayactual` tách biệt, giúp việc tính tổng ngày nghỉ, hiển thị calendar và báo cáo trở nên rõ ràng.

---

## File đã chỉnh / tham chiếu

- Server controller (triển khai chính): `server/controller/holidayActualController.js`
  - `createHolidayActual` thực hiện các quy tắc không chồng lấn và mở rộng Chủ Nhật.
- Tham chiếu frontend (ghi chú UX):
  - `adminsite/src/components/holiday/HolidayAddTemplate.jsx` (modal template — input ngày chỉ đọc)
  - `adminsite/src/pages/HolidayManagement.jsx` (trang gọi API tạo ngày nghỉ)

Ghi chú timezone: dự án sử dụng quy ước UTC+7 khi chuyển đổi từ rule (âm lịch/solar) sang ngày ISO; controller nhận các chuỗi ISO (`YYYY-MM-DD`) từ request và dùng `Date` để validate/so sánh. Trường lưu trữ là DATEONLY (`YYYY-MM-DD`).

---

## Quy tắc đã triển khai (chi tiết)

1. Kiểm tra đầu vào
   - Bắt buộc: `semester_id`, `start_date` (YYYY-MM-DD), `end_date` (YYYY-MM-DD)
   - `name` bắt buộc cho tạo thủ công (khi không có `rule_id`). Khi tạo từ template, `name` có thể truyền hoặc để null.
   - Ngày được parse bằng `new Date(iso)` và kiểm tra `isNaN`.
   - `start_date` phải <= `end_date`.

2. Kiểm tra chồng lấn (quy tắc chung)
   - Trước khi tạo, controller load tất cả `HolidayActual` của `semester_id` tương ứng.
   - Hai khoảng `[Astart, Aend]` và `[Bstart, Bend]` chồng lấn nếu:
     ```js
     // checkOverlap(start1,end1,start2,end2)
     return start1 <= end2 && start2 <= end1
     ```
   - Nếu chồng lấn với bất kỳ record hiện có, controller trả về lỗi HTTP 400 và message mô tả record gây xung đột (tên + khoảng) để caller điều chỉnh.

3. Tạo từ Template (`rule_id` / `rule_ids` được gửi)
   - Controller xử lý tạo template như tạo bình thường nhưng có thêm hành vi mở rộng Chủ Nhật.
   - Template KHÔNG được chồng lấn với bất kỳ ngày nghỉ nào (cả thủ công và template khác). Nếu trùng → bị từ chối.
   - Nếu trong khoảng có Chủ Nhật (getDay() === 0), `end_date` lưu vào DB sẽ được cộng thêm 1 ngày. Hiện tại code kiểm tra chồng lấn dựa trên khoảng gốc (trước khi mở rộng); khoảng lưu sẽ là khoảng đã mở rộng.
   - Controller hỗ trợ tạo nhiều template trong một request bằng `rule_ids: [ ... ]`. Hiện tại chưa có kiểm tra trùng lặp giữa các `rule_ids` trong cùng batch; nếu caller truyền nhiều `rule_ids` dẫn tới cùng khoảng lưu, controller sẽ cố gắng tạo nhiều bản ghi trùng — có thể cải tiến bằng dedupe nội bộ hoặc đóng gói trong transaction + kiểm tra unique.

4. Tạo thủ công (không có `rule_id`)
   - Tạo thủ công **bị từ chối** nếu khoảng đề xuất chồng lấn với bất kỳ record nào (template hoặc thủ công khác). Điều này thực thi chính sách "không chồng lấn".
   - Nếu bị từ chối, API trả về lỗi `400` kèm message chi tiết các record xung đột.

---

## Ví dụ hành vi

### 1) Template đã tồn tại (01-02 → 05-02). Thêm hai khoảng thủ công trước/sau.

- Template có sẵn: `Tết Nguyên Đán` (rule_id = X) lưu `2025-02-01` → `2025-02-05`.
- Tạo thủ công 1: `2025-01-30` → `2025-01-31` → OK (không chồng lấn) → insert.
- Tạo thủ công 2: `2025-02-06` → `2025-02-08` → OK (không chồng lấn) → insert.

Kết quả: ba bản ghi tách biệt: trước-template, template, sau-template.

### 2) Cố tạo thủ công `2025-01-31` → `2025-02-02` (chồng với template)

- Controller trả về 400 và message mô tả xung đột với record template.

### 3) Cố apply template có giao nhau với record thủ công

- Controller từ chối (400) vì template không được chồng lấn với ngày đã tồn tại.

---

## API: định dạng request/response mong đợi

- Endpoint: `POST /api/holiday-actuals`
- Body request (tạo từ template):

```json
{
  "semester_id": 1,
  "rule_id": 12,
  "start_date": "2025-02-01",
  "end_date": "2025-02-05",
  "name": "Tết Nguyên Đán"
}
```

- Body request (tạo thủ công):

```json
{
  "semester_id": 1,
  "start_date": "2025-01-30",
  "end_date": "2025-01-31",
  "name": "Nghỉ bù trước Tết",
  "description": "Bổ sung theo thông báo"
}
```

- Response thành công khi tạo: HTTP 201
  - Tạo template với `rule_ids` trả về mảng các bản ghi đã tạo
  - Tạo thủ công trả về bản ghi đã tạo

- Xung đột chồng lấn: HTTP 400 kèm message chi tiết record xung đột.

---

## Trường hợp biên & hạn chế đã biết

- Controller hiện chưa thực hiện dedupe nội bộ cho `rule_ids` — nếu caller truyền nhiều `rule_ids` cho ra cùng khoảng lưu, nhiều bản ghi trùng có thể được tạo. Khuyến nghị: thêm kiểm tra intra-batch hoặc constraint DB nếu muốn ngăn duplicate.

- Hiện tại code áp dụng mở rộng Chủ Nhật sau khi kiểm tra chồng lấn trên khoảng gốc. Nếu muốn kiểm tra chồng lấn trên khoảng cuối cùng (đã mở rộng), cần tính trước khoảng đã mở rộng và chạy kiểm tra dựa trên đó.

- Việc parse ngày dùng `new Date(iso)`; code giả định frontend gửi chuỗi ISO `YYYY-MM-DD`. Trong phần khác của dự án, khi chuyển đổi từ ngày âm lịch sang dương lịch có dùng quy ước UTC+7 — frontend cần gửi ngày ISO đúng như mong muốn.

- Để đảm bảo không chồng lấn trong môi trường có request đồng thời, có thể wrap việc tạo trong transaction và thêm ràng buộc DB nếu cần.

---

## Hướng xử lý frontend khuyến nghị

- Khi nhận lỗi `400` từ API: hiển thị message trả về cho user và yêu cầu điều chỉnh ngày trước khi retry.
- Khi nhận `201`: load lại danh sách ngày nghỉ và cập nhật calendar.
- Nếu API trả về nhiều item (tạo hàng loạt template), hiển thị message thành công kèm danh sách bản ghi đã tạo.

---

## Đề xuất cải tiến (chưa triển khai)

1. Dedupe nội bộ khi xử lý `rule_ids`.
2. Tùy chọn kiểm tra chồng lấn trên khoảng cuối cùng (bao gồm mở rộng Chủ Nhật) trước khi persist.
3. Thêm unit test cho logic chồng lấn và mở rộng Chủ Nhật.
4. Nếu cần đảm bảo cứng rắn, bổ sung ràng buộc DB (hoặc bảng calendar vật lý) để đảm bảo không chồng lấn.

---

Nếu bạn muốn, tôi có thể:
- Thêm ví dụ flow UI (modal + confirmation) trong `adminsite` để xử lý lỗi và hiển thị chi tiết xung đột.
- Triển khai dedupe intra-batch hoặc thay đổi kiểm tra chồng lấn để dùng khoảng đã mở rộng trước khi lưu.


