import React, { useState, useEffect } from "react";
import Button from "../ui/button/Button.jsx";
import Modal from "../ui/modal/index.jsx";
import HolidayAddForm from "./HolidayAddForm.jsx";
import HolidayInfoModal from "./HolidayInfoModal.jsx";
import PageMeta from "../common/PageMeta.jsx";
import ContinuousCalendar from "./ContinuousCalendar.jsx";

const initialEvents = [
  {
    id: 1,
    title: "Tết Dương lịch",
    dateFrom: "2025-01-01",
    dateEnd: "2025-01-05",
    description: "Ngày nghỉ lễ đầu năm mới",
  },
  {
    id: 2,
    title: "Tết Nguyên Đán",
    dateFrom: "2025-02-08",
    dateEnd: "2025-02-08",
    description: "Ngày nghỉ lễ truyền thống",
  },
  {
    id: 3,
    title: "Giỗ tổ Hùng Vương",
    dateFrom: "2025-04-18",
    dateEnd: "2025-04-18",
    description: "Ngày lễ tưởng nhớ các vua Hùng",
  },
];

export default function HolidayManagement() {
  const [events, setEvents] = useState(initialEvents);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [holidayName, setHolidayName] = useState("");
  const [holidayDesc, setHolidayDesc] = useState("");
  const [holidayDate, setHolidayDate] = useState("");
  // note: date range handled inside HolidayAddForm; only single-day selection stored here for info modal
  
  // Template list (mock) — passed to HolidayAddForm
  const [templates, setTemplates] = useState([]);

  // Xử lý khi click vào ngày trên calendar
  const handleDayClick = (day, month, year) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const holiday = events.find(ev => {
      const from = ev.dateFrom;
      const to = ev.dateEnd;
      return dateStr >= from && dateStr <= to;
    });
    setHolidayDate(dateStr);
    if (holiday) {
      setHolidayName(holiday.title);
      setHolidayDesc(holiday.description);
    } else {
      setHolidayName("");
      setHolidayDesc("");
    }
    setIsModalOpen(true);
  };

  // (original simple add handler removed - use handleAddHolidayWithTemplate below)

  // Hàm kiểm tra ngày có phải ngày lễ không
  const getHolidayInfo = (day, month, year) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return events.find(ev => ev.dateFrom <= dateStr && ev.dateEnd >= dateStr);
  };
  
  // --- template helpers ---
  useEffect(() => {
    // mock templates - replace with API fetch when available
    setTemplates([
      { id: "tpl-1", name: "Tết Nguyên Đán", desc: "Tết âm lịch mẫu", from: "02-08", to: "02-10" },
      { id: "tpl-2", name: "Tết Dương lịch", desc: "Đầu năm", from: "01-01", to: "01-01" },
      { id: "tpl-3", name: "Giỗ tổ Hùng Vương", desc: "Ngày lễ", from: "04-18", to: "04-18" },
    ]);
  }, []);
  // end template helpers (now handled inside HolidayAddForm)

  return (
    <>
      <PageMeta title="Quản lý ngày lễ" description="Trang quản lý các ngày nghỉ lễ trong hệ thống." />
      <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center" style={{ zoom: 0.65 }}>
        <div className="w-full max-w-7xl rounded-2xl shadow-2xl bg-white p-10 border border-gray-300 flex flex-col items-center">
          <div className="flex justify-between items-center w-full mb-10">
            <h1 className="text-4xl font-bold text-gray-800">Quản lý ngày lễ</h1>
            <Button
              size="md"
              variant="primary"
              className="px-8 py-3 font-semibold bg-gray-800 text-white rounded-xl shadow hover:bg-gray-700 transition"
              onClick={() => {
                setHolidayName("");
                setHolidayDesc("");
                setHolidayDate("");
                setIsAddModalOpen(true);
              }}
            >
              + Thêm ngày lễ
            </Button>
          </div>
          <ContinuousCalendar
            onClick={(day, month, year) => {
              const holiday = getHolidayInfo(day, month, year);
              if (holiday) {
                setHolidayDate(`${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`);
                setHolidayName(holiday.title);
                setHolidayDesc(holiday.description);
                setIsModalOpen(true);
              } else {
                handleDayClick(day, month, year);
              }
            }}
            events={events}
          />
        </div>
      </div>
      <HolidayInfoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={holidayName}
        dateIso={holidayDate}
        description={holidayDesc}
        ranges={events
          .filter(ev => {
            const from = ev.dateFrom;
            const to = ev.dateEnd;
            return holidayDate >= from && holidayDate <= to;
          })
          .map(ev => `${ev.dateFrom} - ${ev.dateEnd}`)}
      />
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} className="max-w-lg w-full mx-auto bg-white shadow">
        <div className="p-10 bg-white rounded-xl shadow border border-gray-200">
          <h2 className="text-2xl font-bold mb-8 text-center text-gray-800">Thêm ngày lễ</h2>
          <HolidayAddForm
            isOpen={isAddModalOpen}
            initial={{}}
            templates={templates}
            onClose={() => setIsAddModalOpen(false)}
            onSave={(evt) => {
              // simple local save; you can replace with API call
              setEvents((prev) => [...prev, { id: Date.now(), ...evt }]);
              setIsAddModalOpen(false);
            }}
          />
        </div>
      </Modal>
    </>
  );
}

