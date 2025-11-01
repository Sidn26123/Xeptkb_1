import { useState, useEffect } from "react";
import Button from "../components/ui/button/Button.jsx";
import Modal from "../components/ui/modal/index.jsx";
import HolidayAddTemplate from '../components/holiday/HolidayAddTemplate.jsx';
import HolidayAddHandmade from '../components/holiday/HolidayAddHandmade.jsx';
import PageMeta from "../components/common/PageMeta.jsx";
import ContinuousCalendar from "../components/holiday/ContinuousCalendar.jsx";
import { getAllSemesters } from '../services/semesterService.js';
import { getAllAcademicYears } from '../services/academicYearService.js';
import { getAllHolidayActuals, createHolidayActual, deleteHolidayActual } from '../services/holidayActualService.js';
import { getHolidayRulesForSemester } from '../services/holidayRuleService.js';

export default function HolidayManagement() {
  const [holidays, setHolidays] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [selectedAcademicYear, setSelectedAcademicYear] = useState(null);
  // holiday rules are mapped into `templateRows` when opening the modal
  const [semesters, setSemesters] = useState([]);
  const [selectedSemester, setSelectedSemester] = useState(null);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  // per-row selection is in templateRows
  const [templateLoading, setTemplateLoading] = useState(false);
  const [templateRows, setTemplateRows] = useState([]);
  

    // Manual modal open state (uses HolidayAddHandmade component)

  useEffect(() => {
    // Load academic years on mount; semesters will be loaded when an academic year is selected
    fetchAcademicYears();
  }, []);

  useEffect(() => {
    // whenever the selected academic year changes, reload semesters for that academic year
    if (selectedAcademicYear) {
      fetchSemestersByAcademicYear(selectedAcademicYear.id);
    } else {
      setSemesters([]);
      setSelectedSemester(null);
    }
  }, [selectedAcademicYear]);

  useEffect(() => {
    if (selectedSemester) {
      fetchHolidaysBySemester(selectedSemester.id);
    }
  }, [selectedSemester]);

  

  const fetchAcademicYears = async () => {
    try {
      const res = await getAllAcademicYears();
      const data = res || [];
      setAcademicYears(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load academic years', err);
    }
  };

  // fetch semesters but filter by AcademicYearsid to restrict by selected academic year
  const fetchSemestersByAcademicYear = async (academicYearId) => {
    try {
      const res = await getAllSemesters();
      const allData = res?.data?.data || res?.data || res;
      const arr = Array.isArray(allData) ? allData : [];
      // semesters have field `AcademicYearsid` (server model) or fallback to year_id
      const filtered = arr.filter(s => (s.AcademicYearsid || s.year_id) === academicYearId);
      setSemesters(filtered);
      setSelectedSemester(null);
    } catch (err) {
      console.error('Failed to load semesters', err);
      setSemesters([]);
      setSelectedSemester(null);
    }
  };

  const fetchHolidaysBySemester = async (semesterId) => {
    try {
      const res = await getAllHolidayActuals();
      const allData = res?.data?.data || res?.data || res;
      const data = Array.isArray(allData) ? allData.filter(h => h.semester_id === semesterId) : [];
      setHolidays(data);
    } catch (err) {
      console.error('Failed to load holidays', err);
    }
  };

  // (selection now handled per-row in modal via `templateRows` state)

  // Open template modal and fetch templates filtered by semester start/end
  const openTemplateModal = async () => {
    if (!selectedSemester) {
      alert('Vui lòng chọn học kỳ trước');
      return;
    }

    setIsTemplateModalOpen(true);
    setTemplateLoading(true);
    try {
      const res = await getHolidayRulesForSemester(selectedSemester.start, selectedSemester.end);
      const data = res?.data?.data || res?.data || res;
  const rules = Array.isArray(data) ? data : [];
      // initialize templateRows with per-row UI state
      const parseIso = (s) => {
        if (!s) return null;
        // accept YYYY-MM-DD
        if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return new Date(s + 'T00:00:00');
        // fallback: try Date constructor
        const d = new Date(s);
        return isNaN(d.getTime()) ? null : d;
      };

      // Exclude rules that were already created as HolidayActual for this semester
      const existingRuleIds = new Set((holidays || []).filter(h => h.rule_id).map(h => h.rule_id));
      const availableRules = rules.filter(r => !existingRuleIds.has(r.id));

      const rows = availableRules.map(r => ({
        ...r,
        // remove legacy `selected` flag; use `active` to indicate rows to apply
        // recurring templates are active by default and their toggle will be disabled in the UI
        startDate: parseIso(r.startDate || r.day_start) || null,
        endDate: parseIso(r.endDate || r.day_end) || null,
        active: !!r.recurring,
      }));
      setTemplateRows(rows);
  // reset any legacy selection
    } catch (err) {
      console.error('Failed to load templates for semester', err);
      alert('Không thể tải mẫu ngày nghỉ');
    } finally {
      setTemplateLoading(false);
    }
  };

  const handleApplyTemplates = async () => {
    if (!selectedSemester) {
      alert('Vui lòng chọn học kỳ trước');
      return;
    }

    try {
      // apply rows where `active === true`
      const rowsToApply = templateRows.filter(r => r.active);
      const toIso = (v) => {
        if (!v) return null;
        if (v instanceof Date) return v.toISOString().split('T')[0];
        const parsed = new Date(v);
        return isNaN(parsed.getTime()) ? null : parsed.toISOString().split('T')[0];
      };

      for (const row of rowsToApply) {
        const start_date = toIso(row.startDate) || (selectedSemester ? new Date(selectedSemester.start).toISOString().split('T')[0] : null);
        const end_date = toIso(row.endDate) || start_date;
        const holidayData = {
          semester_id: selectedSemester.id,
          rule_id: row.id,
          name: row.name,
          description: row.description,
          start_date,
          end_date,
        };
        await createHolidayActual(holidayData);
      }
      setIsTemplateModalOpen(false);
  // reset legacy selection
      setTemplateRows([]);
      fetchHolidaysBySemester(selectedSemester.id);
    } catch (err) {
      console.error('Failed to apply templates', err);
      alert('Có lỗi xảy ra khi áp dụng mẫu ngày nghỉ');
    }
  };
  // errors state removed — handled inside `HolidayAddHandmade`

  // Handler to save a manual holiday coming from HolidayAddHandmade
  const handleAddManualHoliday = async (evt) => {
    if (!selectedSemester) {
      alert('Vui lòng chọn học kỳ trước');
      return;
    }
    try {
      const holidayData = {
        semester_id: selectedSemester.id,
        rule_id: null,
        name: evt.title,
        description: evt.description,
        start_date: evt.dateFrom,
        end_date: evt.dateEnd || evt.dateFrom,
      };
      await createHolidayActual(holidayData);
      setIsManualModalOpen(false);
      fetchHolidaysBySemester(selectedSemester.id);
    } catch (err) {
      console.error('Failed to create manual holiday', err);
      alert('Có lỗi xảy ra khi thêm ngày nghỉ');
    }
  };

  const handleDeleteHoliday = async (id) => {
    if (window.confirm('Bạn có chắc muốn xóa ngày nghỉ này?')) {
      try {
        await deleteHolidayActual(id);
        fetchHolidaysBySemester(selectedSemester.id);
      } catch (err) {
        console.error('Failed to delete holiday', err);
      }
    }
  };

  // holidayRules available; selection is in templateRows when modal open

  const templateHolidays = holidays.filter(h => h.rule_id !== null);
  // manualHolidays grouped directly where needed
  const manualHolidays = holidays.filter(h => h.rule_id === null);

  // Format holidays for calendar
  const calendarEvents = holidays.map(h => ({
    id: h.id,
    title: h.name,
    dateFrom: h.start_date,
    dateEnd: h.end_date,
    source: h.rule_id ? 'template' : 'manual'
  }));

  

  return (
    <>
      <PageMeta 
        title="Quản lý ngày nghỉ" 
        description="Trang quản lý ngày nghỉ cho học kỳ" 
      />

      <div className="space-y-6">
        {/* Header & Semester Selector */}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Quản lý ngày nghỉ</h1>
              <p className="text-sm text-gray-600 mt-1">Thiết lập ngày nghỉ từ template hoặc thêm thủ công</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">Năm học:</label>
                <select
                  value={selectedAcademicYear?.id || ''}
                  onChange={(e) => {
                    const ay = academicYears.find(a => a.id === parseInt(e.target.value));
                    setSelectedAcademicYear(ay || null);
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">-- Chọn năm học --</option>
                  {academicYears.map(ay => (
                    <option key={ay.id} value={ay.id}>{ay.name || ay.year_code || ay.id}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">Học kỳ:</label>
                <select
                  value={selectedSemester?.id || ''}
                  onChange={(e) => {
                    const sem = semesters.find(s => s.id === parseInt(e.target.value));
                    setSelectedSemester(sem);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">-- Chọn học kỳ --</option>
                  {semesters.map(sem => (
                    <option key={sem.id} value={sem.id}>
                      {sem.name} ({sem.start} - {sem.end})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content: Split View */}
        {selectedSemester && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Sidebar: Holiday List */}
            <div className="lg:col-span-1">
              <div className="overflow-hidden rounded-xl border border-gray-200 bg-white p-4">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">
                  Danh sách ngày nghỉ ({holidays.length})
                </h3>

                <div className="space-y-6">
                  {/* Template holidays */}
                  {templateHolidays.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold flex items-center gap-2 mb-3 text-green-700">
                        <span>📋</span> Từ template ({templateHolidays.length})
                      </h4>
                      <div className="space-y-2">
                        {templateHolidays.map(h => (
                          <div key={h.id} className="flex items-start gap-2 p-3 bg-green-50 border border-green-200 rounded-lg hover:shadow-sm transition">
                            <div className="w-1 h-full bg-green-500 rounded-full" />
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-sm text-gray-800 truncate">{h.name}</div>
                              <div className="text-xs text-gray-500 mt-1">
                                {h.start_date} {h.end_date && h.end_date !== h.start_date && `→ ${h.end_date}`}
                              </div>
                              {h.description && (
                                <div className="text-xs text-gray-400 mt-1 italic">{h.description}</div>
                              )}
                            </div>
                            <button
                              onClick={() => handleDeleteHoliday(h.id)}
                              className="p-1.5 hover:bg-red-100 text-red-600 rounded transition"
                              title="Xóa"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* end of template/holiday lists */}

                  {/* Manual holidays */}
                  {manualHolidays.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold flex items-center gap-2 mb-3 text-blue-700">
                        <span>✍️</span> Thủ công ({manualHolidays.length})
                      </h4>
                      <div className="space-y-2">
                        {manualHolidays.map(h => (
                          <div key={h.id} className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg hover:shadow-sm transition">
                            <div className="w-1 h-full bg-blue-500 rounded-full" />
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-sm text-gray-800 truncate">{h.name}</div>
                              <div className="text-xs text-gray-500 mt-1">
                                {h.start_date} {h.end_date && h.end_date !== h.start_date && `→ ${h.end_date}`}
                              </div>
                              {h.description && (
                                <div className="text-xs text-gray-400 mt-1 italic">{h.description}</div>
                              )}
                            </div>
                            <button
                              onClick={() => handleDeleteHoliday(h.id)}
                              className="p-1.5 hover:bg-red-100 text-red-600 rounded transition"
                              title="Xóa"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Calendar View */}
            <div className="lg:col-span-2">
              <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">Lịch học kỳ</h3>
                      <div className="flex gap-4 mt-2 text-xs">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
                          <span className="text-gray-600">Template</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-blue-100 border border-blue-300 rounded"></div>
                          <span className="text-gray-600">Thủ công</span>
                        </div>
                      </div>
                    </div>

                    {/* Buttons aligned to the right of the header */}
                    {selectedSemester && (
                      <div className="flex items-center gap-3">
                        <Button
                          onClick={openTemplateModal}
                          size="md"
                          variant="primary"
                          className="!px-4 !py-2 font-semibold bg-green-600 hover:bg-green-700"
                        >
                          <span className="mr-2">📋</span>
                          Thêm từ template
                        </Button>
                        <Button
                          onClick={() => setIsManualModalOpen(true)}
                          size="md"
                          variant="secondary"
                          className="!px-4 !py-2 font-semibold bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          <span className="mr-2">✍️</span>
                          Thêm thủ công
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
                <div className="h-full">
                  <ContinuousCalendar
                    events={calendarEvents}
                    selectedStartIso={selectedSemester.start}
                    selectedEndIso={selectedSemester.end}
                    compact={true}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {!selectedSemester && (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
            <svg className="w-20 h-20 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-gray-500">Vui lòng chọn học kỳ để quản lý ngày nghỉ</p>
          </div>
        )}
      </div>

      {/* Template Selection Modal (extracted) */}
      <HolidayAddTemplate
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
        rows={templateRows}
        setRows={setTemplateRows}
        loading={templateLoading}
        onApply={handleApplyTemplates}
        semester={selectedSemester}
      />

      {/* Manual Holiday Modal — use dedicated component */}
      <Modal isOpen={isManualModalOpen} onClose={() => setIsManualModalOpen(false)} className="max-w-2xl w-full mx-auto bg-white/98 shadow-2xl">
        <div className="p-6">
          <HolidayAddHandmade
            isOpen={isManualModalOpen}
            onClose={() => setIsManualModalOpen(false)}
            existingHolidays={holidays}
            semesterStart={selectedSemester?.start}
            semesterEnd={selectedSemester?.end}
            templates={[]}
            onSave={handleAddManualHoliday}
          />
        </div>
      </Modal>
    </>
  );
}
