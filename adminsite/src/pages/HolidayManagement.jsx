import React, { useState } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { format, parse, startOfWeek, getDay } from "date-fns";
import vi from "date-fns/locale/vi";
import Button from "../components/ui/button/Button.jsx";
import Modal from "../components/ui/modal/index.jsx";

const locales = { vi: vi };
const localizer = dateFnsLocalizer({
format: (date, formatStr, culture) => {
    try {
      if (!formatStr) return "";
      // react-big-calendar đôi khi truyền một object có preprocessor
      if (typeof formatStr === "object" && formatStr !== null && typeof formatStr.preprocessor === "function") {
        return formatStr.preprocessor(date, culture);
      }
      const localeObj = locales[culture] || vi;
      return format(date, formatStr, { locale: localeObj });
    } catch (err) {
      // tránh crash nếu format lỗi
      // eslint-disable-next-line no-console
      console.error("localizer.format error:", err);
      return "";
    }
  },
  parse: (value, formatStr, culture) => {
    const localeObj = locales[culture] || vi;
    try {
      if (!value || !formatStr) return new Date(value);
      return parse(value, formatStr, new Date(), { locale: localeObj });
    } catch (err) {
      // fallback an toàn
      // eslint-disable-next-line no-console
      console.warn("localizer.parse fallback:", err);
      return new Date(value);
    }
  },
  // ensure startOfWeek nhận date nếu được truyền
  startOfWeek: (date) => startOfWeek(date || new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

const initialEvents = [
  {
    id: 1,
    title: "Tết Dương lịch",
    start: new Date("2025-01-01"),
    end: new Date("2025-01-01"),
    description: "Ngày nghỉ lễ đầu năm mới",
  },
  {
    id: 2,
    title: "Tết Nguyên Đán",
    start: new Date("2025-02-08"),
    end: new Date("2025-02-08"),
    description: "Ngày nghỉ lễ truyền thống",
  },
  {
    id: 3,
    title: "Giỗ tổ Hùng Vương",
    start: new Date("2025-04-18"),
    end: new Date("2025-04-18"),
    description: "Ngày lễ tưởng nhớ các vua Hùng",
  },
];

export default function HolidayManagement() {
  const [events, setEvents] = useState(initialEvents);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [holidayName, setHolidayName] = useState("");
  const [holidayDesc, setHolidayDesc] = useState("");
  const [holidayDate, setHolidayDate] = useState("");

  const handleSelectSlot = (slotInfo) => {
    setHolidayDate(format(slotInfo.start, "yyyy-MM-dd"));
    setHolidayName("");
    setHolidayDesc("");
    setIsModalOpen(true);
  };

  const handleAddHoliday = (e) => {
    e.preventDefault();
    const dateObj = new Date(holidayDate);
    setEvents([
      ...events,
      {
        id: Date.now(),
        title: holidayName,
        start: dateObj,
        end: dateObj,
        description: holidayDesc,
      },
    ]);
    setIsModalOpen(false);
  };

const EventComponent = ({ event }) => (
  // changed code: dùng div thay span để chứa block element
  <div>
    <b>{event.title}</b>
    <div className="text-xs text-gray-500">{event.description}</div>
  </div>
);

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center py-12">
      <div className="w-full max-w-4xl rounded-2xl shadow bg-white p-12 border border-gray-200">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-4xl font-bold text-gray-800">Quản lý ngày lễ</h1>
          <Button
            size="md"
            variant="primary"
            className="px-8 py-3 font-semibold bg-gray-800 text-white rounded-xl shadow hover:bg-gray-700 transition"
            onClick={() => setIsModalOpen(true)}
          >
            + Thêm ngày lễ
          </Button>
        </div>
        <div className="bg-white rounded-xl shadow p-8 border border-gray-200">
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: 540, borderRadius: "1rem", background: "#fff" }}
            views={["month"]}
            selectable
            onSelectSlot={handleSelectSlot}
            components={{
              event: EventComponent,
            }}
            formats={{
              dateFormat: "dd/MM/yyyy",
              dayFormat: "dd/MM",
              weekdayFormat: "EEE",
              monthHeaderFormat: "MMMM yyyy",
            }}
            messages={{
              month: "Tháng",
              today: "Hôm nay",
              previous: "Trước",
              next: "Sau",
              showMore: (total) => `+${total} thêm`,
            }}
            eventPropGetter={() => ({
              style: {
                background: "#e5e7eb",
                color: "#111827",
                borderRadius: "0.75rem",
                border: "1px solid #d1d5db",
                fontWeight: "500",
                boxShadow: "none",
                padding: "8px 14px",
              },
            })}
          />
        </div>
      </div>
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        className="max-w-lg w-full mx-auto bg-white shadow"
      >
        <div className="p-10 bg-white rounded-xl shadow border border-gray-200">
          <h2 className="text-2xl font-bold mb-8 text-center text-gray-800">Thêm ngày lễ</h2>
          <form className="space-y-6" onSubmit={handleAddHoliday}>
            <div>
              <label className="block mb-2 text-base font-medium text-gray-700">Tên ngày lễ</label>
              <input
                className="w-full border border-gray-300 rounded-lg px-5 py-3 bg-white focus:border-gray-500 transition text-base"
                type="text"
                value={holidayName}
                onChange={(e) => setHolidayName(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block mb-2 text-base font-medium text-gray-700">Ngày</label>
              <input
                className="w-full border border-gray-300 rounded-lg px-5 py-3 bg-white focus:border-gray-500 transition text-base"
                type="date"
                value={holidayDate}
                onChange={(e) => setHolidayDate(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block mb-2 text-base font-medium text-gray-700">Mô tả</label>
              <input
                className="w-full border border-gray-300 rounded-lg px-5 py-3 bg-white focus:border-gray-500 transition text-base"
                type="text"
                value={holidayDesc}
                onChange={(e) => setHolidayDesc(e.target.value)}
              />
            </div>
            <div className="flex justify-end mt-8 gap-4">
              <Button
                size="md"
                variant="primary"
                className="bg-gray-800 text-white font-semibold px-8 py-3 rounded-lg shadow hover:bg-gray-700 transition"
                type="submit"
              >
                Lưu
              </Button>
              <Button
                size="md"
                variant="outline"
                className="font-semibold px-8 py-3 rounded-lg shadow border border-gray-400 text-gray-700 hover:bg-gray-100 transition"
                onClick={() => setIsModalOpen(false)}
              >
                Hủy
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}
