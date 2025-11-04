# Flow kiểm tra chồng lấn ngày nghỉ

Tài liệu này mô tả chi tiết flow validation khi tạo ngày nghỉ thủ công, bao gồm cả client-side và server-side checks.

---

## 📋 Tổng quan Flow

```
User mở form → Fetch ngày nghỉ hiện có → Hiển thị list → User chọn ngày → Client check → Server check → Tạo/Reject
```

---

## 🔄 Chi tiết từng bước

### **Bước 1: User mở modal tạo ngày nghỉ thủ công**

**Component:** `HolidayAddHandmade.jsx`

**Trigger:** `isOpen = true`

**Action:**
```javascript
useEffect(() => {
  if (!isOpen) return;
  if (!semesterId) return;
  
  // Fetch tất cả holidayactual của học kỳ
  fetch(`/api/holiday-actuals/semester/${semesterId}`)
    .then(res => res.json())
    .then(data => {
      setExistingHolidays(data);
    });
}, [isOpen, semesterId]);
```

**Kết quả:** State `existingHolidays` chứa tất cả ngày nghỉ (template + thủ công) của học kỳ.

---

### **Bước 2: Hiển thị danh sách ngày nghỉ hiện có**

**UI Component:**
```jsx
{existingHolidays.length > 0 && (
  <div className="border rounded p-3 bg-blue-50">
    <div className="text-sm font-medium text-blue-900 mb-2">
      📅 Ngày nghỉ đã tồn tại trong học kỳ:
    </div>
    <div className="space-y-1 max-h-32 overflow-y-auto">
      {existingHolidays.map((h, idx) => (
        <div key={idx} className="text-xs text-blue-800 flex items-center gap-2">
          <span className={h.rule_id !== null ? 'bg-green-100' : 'bg-orange-100'}>
            {h.rule_id !== null ? 'Template' : 'Thủ công'}
          </span>
          <span className="font-medium">{h.name}</span>
          <span>({formatDate(h.start_date)} - {formatDate(h.end_date)})</span>
        </div>
      ))}
    </div>
    <div className="text-xs text-blue-700 mt-2 italic">
      💡 Vui lòng chọn khoảng thời gian KHÔNG chồng lấn với các ngày trên
    </div>
  </div>
)}
```

**Mục đích:**
- User nhìn thấy tất cả ngày nghỉ hiện có
- Phân biệt rõ Template (xanh) vs Thủ công (cam)
- User tự tránh chọn khoảng chồng lấn

---

### **Bước 3: User chọn ngày bắt đầu và kết thúc**

**Input Method:** ReadOnly input + Popup DatePicker

**DatePicker Config:**
```javascript
<DatePicker
  selected={holidayDate ? new Date(holidayDate) : null}
  onChange={(d) => {
    const iso = d.toISOString().slice(0,10);
    setHolidayDate(iso);
    setOpenPicker(null);
    setErrorMsg(""); // Xóa lỗi cũ khi chọn ngày mới
  }}
  inline
  dateFormat="dd/MM/yyyy"
  minDate={...} // Chỉ áp dụng cho end date
  onClickOutside={() => setOpenPicker(null)}
  // ❌ KHÔNG dùng filterDate - cho phép chọn bất kỳ ngày nào
/>
```

**Lý do KHÔNG dùng `filterDate`:**
- Logic check overlap phức tạp (phải check cả khoảng, không chỉ từng ngày riêng lẻ)
- Dễ sai logic (VD: disable 01-05 nhưng user chọn 31/01-02/02 vẫn overlap)
- User experience không tốt (không hiểu vì sao ngày bị disable)

**Approach tốt hơn:**
- Cho phép user chọn tự do
- Hiển thị list ngày nghỉ để user tự tránh
- Validate chặt chẽ khi submit

---

### **Bước 4: User nhấn Submit → Client-side validation**

**Function:** `handleSubmit()`

**Logic check:**

```javascript
const handleSubmit = (ev) => {
  ev.preventDefault();
  
  // 1. Validate input cơ bản
  const sCheck = holidayDate;
  const eCheck = holidayDateEnd || holidayDate;
  
  if (!sCheck || !eCheck) {
    setErrorMsg("Vui lòng chọn ngày bắt đầu và kết thúc.");
    return;
  }
  
  // 2. Check overlap với TẤT CẢ ngày nghỉ hiện có
  for (const h of existingHolidays) {
    if (!h.start_date || !h.end_date) continue;
    
    const a1 = new Date(sCheck);
    const b1 = new Date(eCheck);
    const a2 = new Date(h.start_date);
    const b2 = new Date(h.end_date);
    
    // Công thức check overlap:
    // [a1, b1] overlaps [a2, b2] ⟺ a1 <= b2 AND a2 <= b1
    if (a1 <= b2 && a2 <= b1) {
      const type = h.rule_id !== null ? 'template' : 'thủ công';
      setErrorMsg(
        `Khoảng ngày chồng lấn với ngày nghỉ ${type}: "${h.name}" ` +
        `(${formatDate(h.start_date)} - ${formatDate(h.end_date)}). ` +
        `Vui lòng chọn khoảng khác.`
      );
      return; // ❌ CHẶN submit
    }
  }
  
  // 3. Pass validation → Clear error và gọi API
  setErrorMsg("");
  onSave({
    title: holidayName,
    dateFrom: holidayDate,
    dateEnd: holidayDateEnd || holidayDate,
    description: holidayDesc,
    source: "manual",
    templateId: null
  });
};
```

**Output:**
- ✅ Nếu KHÔNG overlap → Gọi `onSave()` → Trigger API call
- ❌ Nếu overlap → Hiển thị error message chi tiết, KHÔNG gọi API

---

### **Bước 5: Parent component gọi API tạo ngày nghỉ**

**API Endpoint:** `POST /api/holiday-actuals`

**Request body:**
```json
{
  "semester_id": 1,
  "start_date": "2025-01-30",
  "end_date": "2025-01-31",
  "name": "Nghỉ bù trước Tết",
  "description": "Bổ sung theo thông báo Bộ GD&ĐT"
}
```

**Server Controller:** `holidayActualController.js` → `createHolidayActual()`

---

### **Bước 6: Server-side validation (Double-check)**

**Logic trong controller:**

```javascript
exports.createHolidayActual = async (req, res) => {
  const { semester_id, start_date, end_date, name, description } = req.body;
  
  // 1. Validate semester exists
  const semester = await Semester.findByPk(semester_id);
  if (!semester) {
    return res.status(404).json({ error: 'Không tìm thấy học kỳ' });
  }
  
  // 2. Validate dates
  const s = new Date(start_date);
  const e = new Date(end_date);
  if (isNaN(s) || isNaN(e) || s > e) {
    return res.status(400).json({ error: 'Ngày không hợp lệ' });
  }
  
  // 3. Load tất cả ngày nghỉ hiện có của học kỳ
  const existingHolidays = await HolidayActual.findAll({
    where: { semester_id },
    order: [['start_date', 'ASC']]
  });
  
  // 4. Check overlap với TẤT CẢ (template + thủ công)
  const checkOverlap = (start1, end1, start2, end2) => {
    return start1 <= end2 && start2 <= end1;
  };
  
  const startIso = s.toISOString().split('T')[0];
  const endIso = e.toISOString().split('T')[0];
  
  for (const existing of existingHolidays) {
    if (checkOverlap(
      new Date(startIso),
      new Date(endIso),
      new Date(existing.start_date),
      new Date(existing.end_date)
    )) {
      const existingType = existing.rule_id !== null ? 'template' : 'thủ công';
      return res.status(400).json({
        error: `Ngày nghỉ thủ công KHÔNG được chồng lấn với ngày nghỉ ${existingType} ` +
               `đã tồn tại: "${existing.name}" (${existing.start_date} - ${existing.end_date}). ` +
               `Vui lòng chọn khoảng thời gian khác.`
      });
    }
  }
  
  // 5. Tạo record mới
  const created = await HolidayActual.create({
    semester_id,
    rule_id: null, // thủ công không có rule_id
    start_date: startIso,
    end_date: endIso,
    name,
    description: description || null
  });
  
  return res.status(201).json({ data: created });
};
```

---

## 🧪 Test Cases

### **Case 1: Thành công - Khoảng TRƯỚC template**

**Dữ liệu hiện có:**
- Template: Tết Nguyên Đán `[2025-02-01 → 2025-02-05]`

**User tạo:**
- Thủ công: Nghỉ bù trước Tết `[2025-01-30 → 2025-01-31]`

**Client check:**
```
a1 = 2025-01-30, b1 = 2025-01-31
a2 = 2025-02-01, b2 = 2025-02-05

Check: a1 <= b2 ? ✅ (30/01 <= 05/02)
       a2 <= b1 ? ❌ (01/02 > 31/01)

→ KHÔNG overlap → ✅ PASS
```

**Server check:** ✅ PASS
**Kết quả:** ✅ Tạo thành công

---

### **Case 2: Thất bại - Khoảng CHỒNG LẤN với template**

**Dữ liệu hiện có:**
- Template: Tết Nguyên Đán `[2025-02-01 → 2025-02-05]`

**User tạo:**
- Thủ công: Nghỉ bù `[2025-01-31 → 2025-02-02]`

**Client check:**
```
a1 = 2025-01-31, b1 = 2025-02-02
a2 = 2025-02-01, b2 = 2025-02-05

Check: a1 <= b2 ? ✅ (31/01 <= 05/02)
       a2 <= b1 ? ✅ (01/02 <= 02/02)

→ OVERLAP → ❌ REJECT
```

**Error message:**
```
Khoảng ngày chồng lấn với ngày nghỉ template: "Tết Nguyên Đán" 
(01/02/2025 - 05/02/2025). Vui lòng chọn khoảng khác.
```

**Server check:** Không được gọi (đã chặn ở client)
**Kết quả:** ❌ Không tạo được

---

### **Case 3: Thành công - Khoảng SAU template**

**Dữ liệu hiện có:**
- Template: Tết Nguyên Đán `[2025-02-01 → 2025-02-05]`

**User tạo:**
- Thủ công: Nghỉ bù sau Tết `[2025-02-06 → 2025-02-08]`

**Client check:**
```
a1 = 2025-02-06, b1 = 2025-02-08
a2 = 2025-02-01, b2 = 2025-02-05

Check: a1 <= b2 ? ❌ (06/02 > 05/02)

→ KHÔNG overlap → ✅ PASS
```

**Server check:** ✅ PASS
**Kết quả:** ✅ Tạo thành công

---

### **Case 4: Thất bại - Chồng với ngày nghỉ thủ công khác**

**Dữ liệu hiện có:**
- Thủ công 1: Nghỉ bù `[2025-02-06 → 2025-02-08]`

**User tạo:**
- Thủ công 2: Nghỉ thêm `[2025-02-07 → 2025-02-10]`

**Client check:**
```
a1 = 2025-02-07, b1 = 2025-02-10
a2 = 2025-02-06, b2 = 2025-02-08

Check: a1 <= b2 ? ✅ (07/02 <= 08/02)
       a2 <= b1 ? ✅ (06/02 <= 10/02)

→ OVERLAP → ❌ REJECT
```

**Error message:**
```
Khoảng ngày chồng lấn với ngày nghỉ thủ công: "Nghỉ bù" 
(06/02/2025 - 08/02/2025). Vui lòng chọn khoảng khác.
```

**Kết quả:** ❌ Không tạo được

---

## 🎯 Tóm tắt quy tắc

### **Overlap Detection (Công thức kiểm tra)**

Hai khoảng `[A_start, A_end]` và `[B_start, B_end]` chồng lấn khi và chỉ khi:

```
A_start <= B_end  AND  B_start <= A_end
```

**Giải thích:**
- Nếu A bắt đầu sau khi B kết thúc → KHÔNG overlap
- Nếu B bắt đầu sau khi A kết thúc → KHÔNG overlap
- Ngược lại → OVERLAP

**Ví dụ:**
```
[01, 05] và [06, 10] → KHÔNG overlap (01 <= 10 ✅, nhưng 06 > 05 ❌)
[01, 05] và [03, 08] → OVERLAP (01 <= 08 ✅, 03 <= 05 ✅)
[01, 05] và [05, 10] → OVERLAP (01 <= 10 ✅, 05 <= 05 ✅) - TOUCH cũng là overlap
```

---

## ✅ Checklist triển khai

- [x] Component nhận prop `semesterId`
- [x] Fetch `holidayactual` khi modal mở
- [x] Hiển thị list ngày nghỉ hiện có với badge Template/Thủ công
- [x] ReadOnly input + Popup DatePicker
- [x] Format hiển thị dd/MM/yyyy
- [x] Client-side overlap check trước submit
- [x] Error message chi tiết (tên + khoảng xung đột)
- [x] Clear error khi user chọn ngày mới
- [x] Server-side double-check (đã có sẵn)

---

## 🚀 Hướng cải tiến (tương lai)

1. **Visual highlight trên calendar:**
   - Đánh dấu màu các ngày đã có trong `existingHolidays`
   - Xanh: Template, Cam: Thủ công
   - Giúp user nhìn trực quan hơn

2. **Suggest khoảng trống:**
   - Tính toán các khoảng còn trống giữa các ngày nghỉ
   - Gợi ý user: "Có thể chọn: 30/01-31/01 hoặc 06/02-..."

3. **Real-time validation:**
   - Khi user chọn end date, check ngay và hiển thị warning
   - Không cần đợi đến lúc submit

4. **Concurrent request handling:**
   - Wrap server create trong transaction
   - Lock bảng `holidayactual` khi tạo để tránh race condition

