import React, { useEffect, useMemo, useRef, useState } from "react";

// ContinuousCalendar component
import Dropdown from "../ui/dropdown/Dropdown.jsx";
import DropdownItem from "../ui/dropdown/DropdownItem.jsx";

function ContinuousCalendar({ onClick, events = [] }) {
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const today = new Date();
  const dayRefs = useRef([]);
  const [year, setYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(0);
  const [monthDropdownOpen, setMonthDropdownOpen] = useState(false);
  // Đã thay thế dropdown, không cần monthOptions nữa

  const scrollToDay = (monthIndex, dayIndex) => {
    const targetDayIndex = dayRefs.current.findIndex(
      (ref) => ref && ref.getAttribute('data-month') === `${monthIndex}` && ref.getAttribute('data-day') === `${dayIndex}`,
    );
    const targetElement = dayRefs.current[targetDayIndex];
    if (targetDayIndex !== -1 && targetElement) {
      const container = document.querySelector('.calendar-container');
      const elementRect = targetElement.getBoundingClientRect();
      const is2xl = window.matchMedia('(min-width: 1536px)').matches;
      const offsetFactor = is2xl ? 3 : 2.5;
      if (container) {
        const containerRect = container.getBoundingClientRect();
        const offset = elementRect.top - containerRect.top - (containerRect.height / offsetFactor) + (elementRect.height / 2);
        container.scrollTo({
          top: container.scrollTop + offset,
          behavior: 'smooth',
        });
      } else {
        const offset = window.scrollY + elementRect.top - (window.innerHeight / offsetFactor) + (elementRect.height / 2);
        window.scrollTo({
          top: offset,
          behavior: 'smooth',
        });
      }
    }
  };

  const handlePrevYear = () => setYear((prevYear) => prevYear - 1);
  const handleNextYear = () => setYear((prevYear) => prevYear + 1);

  // Đã thay thế dropdown, không cần handleMonthChange nữa

  const handleTodayClick = () => {
    setYear(today.getFullYear());
    setSelectedMonth(today.getMonth());
    scrollToDay(today.getMonth(), today.getDate());
  };

  const handleDayClick = (day, month, year) => {
    if (!onClick) { return; }
    if (month < 0) {
      onClick(day, 11, year - 1);
    } else {
      onClick(day, month, year);
    }
  };

  const generateCalendar = useMemo(() => {
    const today = new Date();
    const daysInMonth = new Date(year, selectedMonth + 1, 0).getDate();
    const firstDayOfWeek = new Date(year, selectedMonth, 1).getDay();

    // Tạo mảng các ngày trong tháng
    const days = [];
    // Ngày cuối tháng trước
    const prevMonth = selectedMonth === 0 ? 11 : selectedMonth - 1;
    const prevYear = selectedMonth === 0 ? year - 1 : year;
    const prevMonthDays = new Date(prevYear, prevMonth + 1, 0).getDate();
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push({ day: prevMonthDays - firstDayOfWeek + 1 + i, month: prevMonth, year: prevYear, isOther: true });
    }
    // Ngày trong tháng hiện tại
    for (let day = 1; day <= daysInMonth; day++) {
      days.push({ day, month: selectedMonth, year, isOther: false });
    }
    // Ngày đầu tháng sau
    const nextMonth = selectedMonth === 11 ? 0 : selectedMonth + 1;
    const nextYear = selectedMonth === 11 ? year + 1 : year;
    while (days.length % 7 !== 0) {
      const nextDay = days.length - (firstDayOfWeek + daysInMonth) + 1;
      days.push({ day: nextDay, month: nextMonth, year: nextYear, isOther: true });
    }

    // Chia thành các tuần
    const weeks = [];
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7));
    }

    // Lấy danh sách ngày lễ của toàn bộ năm
    const holidays = events;

    return weeks.map((week, weekIdx) => (
      <div className="flex w-full" key={`week-${weekIdx}`}>
        {week.map((cell, dayIdx) => {
          const isToday = cell.year === today.getFullYear() && cell.month === today.getMonth() && cell.day === today.getDate();
          const dateStr = `${cell.year}-${String(cell.month + 1).padStart(2, "0")}-${String(cell.day).padStart(2, "0")}`;
          // Tìm ngày lễ theo khoảng dateFrom - dateTo
          const holiday = holidays.find(ev => {
            if (ev.dateFrom && ev.dateEnd) {
              // Chuẩn hóa về yyyy-MM-dd để so sánh chính xác
              const normalize = (date) => {
                if (typeof date === "string" && date.length === 10) return date;
                const d = new Date(date);
                return d.toISOString().slice(0, 10);
              };
              const dStr = normalize(dateStr);
              const fromStr = normalize(ev.dateFrom);
              const toStr = normalize(ev.dateEnd);
              const inRange = dStr >= fromStr && dStr <= toStr;
              if (inRange) {
                // eslint-disable-next-line no-console
                console.log(`[CALENDAR DEBUG]`, { dStr, fromStr, toStr, event: ev });
              }
              return inRange;
            }
            // fallback cho dữ liệu cũ chỉ có ev.date
            return ev.date === dateStr;
          });
          return (
            <div
              key={dayIdx}
              onClick={() => handleDayClick(cell.day, cell.month, cell.year)}
              className={`relative z-10 group aspect-square w-full grow cursor-pointer rounded-xl border font-medium transition-all hover:z-20 hover:border-cyan-400 sm:size-20 sm:rounded-2xl sm:border-2 lg:size-36 lg:rounded-3xl 2xl:size-40
                ${isToday ? "bg-blue-500 text-white" : ""}
                ${holiday ? "bg-red-100 border-red-400" : ""}
                ${cell.isOther ? "bg-gray-50 text-gray-400" : ""}
              `}
            >
              <span className="absolute left-1 top-1 flex size-5 items-center justify-center rounded-full text-xs sm:size-6 sm:text-sm lg:left-2 lg:top-2 lg:size-8 lg:text-base">
                {cell.day}
              </span>
              {holiday && (
                <div className="absolute inset-0 flex justify-center items-center">
                  <span className="text-xs font-bold text-red-600 bg-white bg-opacity-80 rounded px-1 py-0.5 shadow max-w-[120px] overflow-hidden text-ellipsis whitespace-nowrap">
                    {holiday.title}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    ));
  }, [year, selectedMonth]);

  useEffect(() => {
    const calendarContainer = document.querySelector('.calendar-container');
    const observer = new window.IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const month = parseInt(entry.target.getAttribute('data-month'), 10);
            setSelectedMonth(month);
          }
        });
      },
      {
        root: calendarContainer,
        rootMargin: '-75% 0px -25% 0px',
        threshold: 0,
      },
    );
    dayRefs.current.forEach((ref) => {
      if (ref && ref.getAttribute('data-day') === '15') {
        observer.observe(ref);
      }
    });
    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div className="no-scrollbar calendar-container max-h-full overflow-y-scroll rounded-t-2xl bg-white pb-10 text-slate-800 shadow-xl border-2 border-gray-200">
      <div className="sticky -top-px z-50 w-full rounded-t-2xl bg-white px-5 pt-7 sm:px-8 sm:pt-8">
        <div className="mb-4 flex w-full flex-wrap items-center gap-6">
          <div className="flex flex-wrap gap-2 sm:gap-3">
            {/* Dropdown chọn tháng sử dụng mẫu Dropdown của hệ thống */}
            <div className="relative">
              <button
                type="button"
                className="dropdown-toggle w-32 px-3 py-2 rounded-lg border border-gray-300 bg-white text-sm font-medium text-gray-900 flex justify-between items-center"
                onClick={() => setMonthDropdownOpen((open) => !open)}
              >
                {monthNames[selectedMonth]}
                <svg className="ml-2 size-4 text-slate-600" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 3a.75.75 0 01.55.24l3.25 3.5a.75.75 0 11-1.1 1.02L10 4.852 7.3 7.76a.75.75 0 01-1.1-1.02l3.25-3.5A.75.75 0 0110 3zm-3.76 9.2a.75.75 0 011.06.04l2.7 2.908 2.7-2.908a.75.75 0 111.1 1.02l-3.25 3.5a.75.75 0 01-1.1 0l-3.25-3.5a.75.75 0 01.04-1.06z" clipRule="evenodd" />
                </svg>
              </button>
              <Dropdown isOpen={monthDropdownOpen} onClose={() => setMonthDropdownOpen(false)}>
                {monthNames.map((month, idx) => (
                  <DropdownItem
                    key={month}
                    onClick={() => {
                      setSelectedMonth(idx);
                      setMonthDropdownOpen(false);
                    }}
                  >
                    {month}
                  </DropdownItem>
                ))}
              </Dropdown>
            </div>
            <button onClick={handleTodayClick} type="button" className="rounded-lg border border-gray-300 bg-white w-20 h-10 px-3 text-sm font-medium text-gray-900 hover:bg-gray-100 flex items-center justify-center">
              Today
            </button>
          </div>
          <div className="flex w-fit items-center gap-4 ml-auto">
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (selectedMonth === 0) {
                    setSelectedMonth(11);
                    setYear(year - 1);
                  } else {
                    setSelectedMonth(selectedMonth - 1);
                  }
                }}
                className="rounded-full border border-slate-300 p-1 transition-colors hover:bg-slate-100 sm:p-2"
              >
                <svg className="size-5 text-slate-800" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m15 19-7-7 7-7"/>
                </svg>
              </button>
              <h1 className="min-w-16 text-center text-lg font-semibold sm:min-w-20 sm:text-xl">{monthNames[selectedMonth]}</h1>
              <button
                onClick={() => {
                  if (selectedMonth === 11) {
                    setSelectedMonth(0);
                    setYear(year + 1);
                  } else {
                    setSelectedMonth(selectedMonth + 1);
                  }
                }}
                className="rounded-full border border-slate-300 p-1 transition-colors hover:bg-slate-100 sm:p-2"
              >
                <svg className="size-5 text-slate-800" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m9 5 7 7-7 7"/>
                </svg>
              </button>
            </div>
          </div>
          <div className="flex w-fit items-center gap-4">
            <button
              onClick={handlePrevYear}
              className="rounded-full border border-slate-300 p-1 transition-colors hover:bg-slate-100 sm:p-2"
            >
              <svg className="size-5 text-slate-800" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m15 19-7-7 7-7"/>
              </svg>
            </button>
            <h1 className="min-w-16 text-center text-lg font-semibold sm:min-w-20 sm:text-xl">{year}</h1>
            <button
              onClick={handleNextYear}
              className="rounded-full border border-slate-300 p-1 transition-colors hover:bg-slate-100 sm:p-2"
            >
              <svg className="size-5 text-slate-800" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m9 5 7 7-7 7"/>
              </svg>
            </button>
          </div>
        </div>
        <div className="grid w-full grid-cols-7 justify-between text-slate-500">
          {daysOfWeek.map((day, index) => (
            <div key={index} className="w-full border-b border-slate-200 py-2 text-center font-semibold">
              {day}
            </div>
          ))}
        </div>
      </div>
      <div className="w-full px-5 pt-4 sm:px-8 sm:pt-6">
        {generateCalendar}
      </div>
    </div>
  );
}

export default ContinuousCalendar;


