import React, { useEffect, useState, useRef } from "react";
import Button from "../ui/button/Button.jsx";
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

// HolidayAddForm handles both manual and template-derived add
export default function HolidayAddForm({
  initial = {},
  templates = [],
  semesterStart = null,
  semesterEnd = null,
  existingHolidays = [],
  isOpen,
  onClose,
  onSave
}) {
  const [holidayName, setHolidayName] = useState(initial.title || "");
  const [holidayDesc, setHolidayDesc] = useState(initial.description || "");
  const [holidayDate, setHolidayDate] = useState(initial.dateFrom || "");
  const [holidayDateEnd, setHolidayDateEnd] = useState(initial.dateEnd || "");

  const [useTemplate, setUseTemplate] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState(initial.templateId || null);
  const [appliedTemplate, setAppliedTemplate] = useState(null);
  const [protectedDates, setProtectedDates] = useState(new Set());
  const [missingProtectedDates, setMissingProtectedDates] = useState([]);
  const [errorMsg, setErrorMsg] = useState("");
  const [openPicker, setOpenPicker] = useState(null); // 'start' | 'end' | null

  const openedRef = useRef(false);
  useEffect(() => {
    if (!isOpen) {
      // reset when closed
      setHolidayName(initial.title || "");
      setHolidayDesc(initial.description || "");
      setHolidayDate(initial.dateFrom || "");
      setHolidayDateEnd(initial.dateEnd || "");
      setUseTemplate(false);
      setSelectedTemplateId(initial.templateId || null);
      setAppliedTemplate(null);
      setProtectedDates(new Set());
      setMissingProtectedDates([]);
      setErrorMsg("");
      openedRef.current = false;
      return;
    }

    // initialize only when modal just opened (so user can still edit while open)
    if (!openedRef.current) {
      setHolidayName(initial.title || "");
      setHolidayDesc(initial.description || "");
      setUseTemplate(false);
      setSelectedTemplateId(initial.templateId || null);
      setAppliedTemplate(null);
      setProtectedDates(new Set());
      setMissingProtectedDates([]);
      setErrorMsg("");
      // prefer explicit initial values, otherwise use semester bounds
      setHolidayDate(initial.dateFrom || semesterStart || "");
      setHolidayDateEnd(initial.dateEnd || semesterEnd || "");
      openedRef.current = true;
    }
  }, [isOpen, initial, semesterStart, semesterEnd]);

  // existingHolidays is provided by parent (to avoid duplicate fetching)

  const getDatesBetween = (fromIso, toIso) => {
    try {
      if (!fromIso || !toIso) return [];
      const start = new Date(fromIso);
      const end = new Date(toIso);
      if (isNaN(start) || isNaN(end) || start > end) return [];
      const out = [];
      let cur = new Date(start);
      while (cur <= end) {
        out.push(cur.toISOString().slice(0,10));
        cur.setDate(cur.getDate() + 1);
      }
      return out;
    } catch {
      return [];
    }
  };

  const mapTemplateRangeToYear = (tpl, refYear) => {
    const year = refYear || new Date().getFullYear();
    const fromIso = `${year}-${tpl.from}`;
    const toIso = `${year}-${tpl.to}`;
    return { fromIso, toIso };
  };

  const applyTemplateToForm = (tplId) => {
    const tpl = templates.find((t) => t.id === tplId) || null;
    setSelectedTemplateId(tplId);
    setAppliedTemplate(tpl);
    if (!tpl) {
      setHolidayDate("");
      setHolidayDateEnd("");
      setProtectedDates(new Set());
      setErrorMsg("");
      return;
    }
    let refYear = new Date().getFullYear();
    if (holidayDate) {
      const y = new Date(holidayDate).getFullYear();
      if (!isNaN(y)) refYear = y;
    }
    const { fromIso, toIso } = mapTemplateRangeToYear(tpl, refYear);
    setHolidayDate(fromIso);
    setHolidayDateEnd(toIso);
    const p = new Set(getDatesBetween(fromIso, toIso));
    setProtectedDates(p);
    setErrorMsg("");
  };

  // compute missing when dates change
  useEffect(() => {
    if (!useTemplate || !appliedTemplate) {
      setMissingProtectedDates([]);
      setErrorMsg("");
      return;
    }
    if (!holidayDate) {
      setMissingProtectedDates([]);
      setErrorMsg("Vui lòng chọn ngày bắt đầu.");
      return;
    }
    const endIso = holidayDateEnd || holidayDate;
    const savedSet = new Set(getDatesBetween(holidayDate, endIso));
    const missing = [];
    for (const d of protectedDates) {
      if (!savedSet.has(d)) missing.push(d);
    }
    if (missing.length > 0) {
      setMissingProtectedDates(missing);
      setErrorMsg(`Có ${missing.length} ngày từ template bị loại bỏ — giữ hoặc mở rộng phạm vi.`);
    } else {
      setMissingProtectedDates([]);
      setErrorMsg("");
    }
  }, [holidayDate, holidayDateEnd, useTemplate, appliedTemplate, protectedDates]);

  const formatDateDisplay = (d) => {
    if (!d) return '';
    const dt = d instanceof Date ? d : new Date(d);
    if (isNaN(dt.getTime())) return '';
    const dd = String(dt.getDate()).padStart(2, '0');
    const mm = String(dt.getMonth() + 1).padStart(2, '0');
    const yyyy = dt.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  };

  const handleSubmit = (ev) => {
    ev.preventDefault();
    // Prevent submit if template-protected dates missing
    if (missingProtectedDates.length > 0) {
      setErrorMsg("Có ngày template bị loại bỏ. Vui lòng giữ hoặc mở rộng phạm vi.");
      return;
    }

    // Client-side validation: ensure start and end selected
    const sCheck = holidayDate;
    const eCheck = holidayDateEnd || holidayDate;

    if (!sCheck) {
      setErrorMsg("Vui lòng chọn ngày bắt đầu.");
      return;
    }
    if (!eCheck) {
      setErrorMsg("Vui lòng chọn ngày kết thúc.");
      return;
    }

    // Ensure date order
    try {
      const a1 = new Date(sCheck);
      const b1 = new Date(eCheck);
      if (isNaN(a1.getTime()) || isNaN(b1.getTime())) {
        setErrorMsg("Ngày không hợp lệ.");
        return;
      }
      if (a1 > b1) {
        setErrorMsg("Ngày kết thúc phải lớn hơn hoặc bằng ngày bắt đầu.");
        return;
      }
    } catch {
      setErrorMsg("Ngày không hợp lệ.");
      return;
    }
    
    for (const h of existingHolidays) {
      if (!h.start_date || !h.end_date) continue;
      const a1 = new Date(sCheck);
      const b1 = new Date(eCheck);
      const a2 = new Date(h.start_date);
      const b2 = new Date(h.end_date);
      // Check overlap: [a1, b1] overlaps [a2, b2] if a1 <= b2 AND a2 <= b1
      if (a1 <= b2 && a2 <= b1) {
        const type = h.rule_id !== null ? 'template' : 'thủ công';
        setErrorMsg(`Khoảng ngày chồng lấn với ngày nghỉ ${type}: "${h.name}" (${formatDateDisplay(h.start_date)} - ${formatDateDisplay(h.end_date)}). Vui lòng chọn khoảng khác.`);
        return;
      }
    }
    
    // Clear error and submit
    setErrorMsg("");
    const newEvent = {
      title: holidayName,
      dateFrom: holidayDate,
      dateEnd: holidayDateEnd || holidayDate,
      description: holidayDesc,
      source: useTemplate && appliedTemplate ? "template" : "manual",
      templateId: useTemplate && appliedTemplate ? appliedTemplate.id : null,
    };
    onSave(newEvent);
  };

  return (
    <div>
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div>
          <label className="block mb-2 text-base font-medium text-gray-700">Tên ngày lễ</label>
          <input className="w-full border rounded px-3 py-2" value={holidayName} onChange={(e) => setHolidayName(e.target.value)} required />
        </div>

        {/* Loại bỏ chọn nghỉ 1 ngày/nhiều ngày, luôn hiển thị cả ngày bắt đầu và kết thúc */}

        {useTemplate && (
          <div className="border rounded p-3 bg-gray-50">
            <label className="block text-sm font-medium mb-2">Template</label>
            <select className="w-full border rounded p-2" value={selectedTemplateId || ""} onChange={(e) => applyTemplateToForm(e.target.value)}>
              <option value="">-- Chọn template --</option>
              {templates.map((t) => (
                <option key={t.id} value={t.id}>{t.name} — {t.desc}</option>
              ))}
            </select>
            {appliedTemplate && (
              <div className="mt-3 text-sm text-gray-700">
                <div><b>Áp dụng:</b> {appliedTemplate.name}</div>
                <div className="text-xs text-gray-500">Khoảng mặc định: {holidayDate} → {holidayDateEnd}</div>
              </div>
            )}
          </div>
        )}

        {/* Hiển thị danh sách ngày nghỉ hiện có */}
        {existingHolidays.length > 0 && (
          <div className="border rounded p-3 bg-blue-50">
            <div className="text-sm font-medium text-blue-900 mb-2">📅 Ngày nghỉ đã tồn tại trong học kỳ:</div>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {existingHolidays.map((h, idx) => (
                <div key={idx} className="text-xs text-blue-800 flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded ${h.rule_id !== null ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}>
                    {h.rule_id !== null ? 'Template' : 'Thủ công'}
                  </span>
                  <span className="font-medium">{h.name}</span>
                  <span className="text-blue-600">({formatDateDisplay(h.start_date)} - {formatDateDisplay(h.end_date)})</span>
                </div>
              ))}
            </div>
            <div className="text-xs text-blue-700 mt-2 italic">
              💡 Vui lòng chọn khoảng thời gian KHÔNG chồng lấn với các ngày trên
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div className="relative">
            <label className="block text-sm font-medium mb-1">Ngày bắt đầu</label>
            <input
              type="text"
              readOnly
              value={holidayDate ? formatDateDisplay(holidayDate) : ''}
              onClick={() => setOpenPicker(openPicker === 'start' ? null : 'start')}
              className="w-full border-2 rounded-lg px-3 py-2 bg-white cursor-pointer hover:border-blue-400 focus:border-blue-500 transition-colors"
              placeholder="dd/MM/yyyy"
              aria-label="Chọn ngày bắt đầu"
              required
            />
            {openPicker === 'start' && (
              <div className="absolute z-50 mt-2 shadow-xl rounded-lg border-2 border-blue-200">
                <DatePicker
                  selected={holidayDate ? new Date(holidayDate) : null}
                  onChange={(d) => {
                    const iso = d.toISOString().slice(0,10);
                    setHolidayDate(iso);
                    setOpenPicker(null);
                    setErrorMsg(""); // Clear error when selecting
                  }}
                    inline
                    minDate={semesterStart ? new Date(semesterStart) : null}
                    maxDate={semesterEnd ? new Date(semesterEnd) : null}
                  dateFormat="dd/MM/yyyy"
                  onClickOutside={() => setOpenPicker(null)}
                />
              </div>
            )}
          </div>

          <div className="relative">
            <label className="block text-sm font-medium mb-1">Ngày kết thúc</label>
            <input
              type="text"
              readOnly
              value={holidayDateEnd ? formatDateDisplay(holidayDateEnd) : ''}
              onClick={() => setOpenPicker(openPicker === 'end' ? null : 'end')}
              className="w-full border-2 rounded-lg px-3 py-2 bg-white cursor-pointer hover:border-green-400 focus:border-green-500 transition-colors"
              placeholder="dd/MM/yyyy"
              aria-label="Chọn ngày kết thúc"
              required
            />
            {openPicker === 'end' && (
              <div className="absolute z-50 mt-2 shadow-xl rounded-lg border-2 border-green-200">
                <DatePicker
                  selected={holidayDateEnd ? new Date(holidayDateEnd) : (holidayDate ? new Date(holidayDate) : null)}
                  onChange={(d) => {
                    const iso = d.toISOString().slice(0,10);
                    setHolidayDateEnd(iso);
                    setOpenPicker(null);
                    setErrorMsg(""); // Clear error when selecting
                  }}
                  inline
                  minDate={holidayDate ? new Date(holidayDate) : (semesterStart ? new Date(semesterStart) : null)}
                  maxDate={semesterEnd ? new Date(semesterEnd) : null}
                  dateFormat="dd/MM/yyyy"
                  onClickOutside={() => setOpenPicker(null)}
                />
              </div>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Mô tả</label>
          <input className="w-full border rounded px-3 py-2" value={holidayDesc} onChange={(e) => setHolidayDesc(e.target.value)} />
        </div>

        {errorMsg && <div className="text-sm text-red-600">{errorMsg}</div>}
        {missingProtectedDates.length > 0 && (
          <div className="text-sm text-yellow-800 bg-yellow-50 border p-2 rounded">
            <div>Danh sách ngày bị thiếu:</div>
            <div className="flex flex-wrap gap-1 mt-1">{missingProtectedDates.slice(0,10).map(d => <span key={d} className="text-xs bg-yellow-100 px-2 py-0.5 rounded">{d}</span>)}{missingProtectedDates.length > 10 && <span className="text-xs">+{missingProtectedDates.length - 10} còn lại</span>}</div>
          </div>
        )}

        <div className="flex justify-end gap-3 mt-4">
          <Button type="submit" className="bg-gray-800 text-white" disabled={missingProtectedDates.length > 0}>Lưu</Button>
          <Button variant="outline" onClick={onClose}>Hủy</Button>
        </div>
      </form>
    </div>
  );
}
