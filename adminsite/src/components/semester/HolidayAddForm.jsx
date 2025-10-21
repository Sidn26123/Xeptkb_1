import React, { useEffect, useState } from "react";
import Button from "../ui/button/Button.jsx";

// HolidayAddForm handles both manual and template-derived add
export default function HolidayAddForm({
  initial = {},
  templates = [],
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
    }
  }, [isOpen, initial]);

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

  const handleSubmit = (ev) => {
    ev.preventDefault();
    if (missingProtectedDates.length > 0) return;
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

        <div className="flex items-center gap-3">
          <label className="inline-flex items-center gap-2">
            <input type="checkbox" checked={useTemplate} onChange={(e) => setUseTemplate(e.target.checked)} />
            <span className="text-sm">Chọn từ template</span>
          </label>
        </div>

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

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1">Ngày bắt đầu</label>
            <input type="date" className="w-full border rounded px-3 py-2" value={holidayDate} onChange={(e) => setHolidayDate(e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Ngày kết thúc</label>
            <input type="date" className="w-full border rounded px-3 py-2" value={holidayDateEnd || ""} onChange={(e) => setHolidayDateEnd(e.target.value)} required />
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
