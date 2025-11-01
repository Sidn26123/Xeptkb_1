import React from "react";

export default function ResearchScheduleHub({ onSelect }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <button onClick={() => onSelect('student')} className="card p-4 rounded-lg bg-sky-50 hover:bg-sky-100 dark:bg-sky-900/20 text-left">
          <div className="text-lg font-semibold">Theo Sinh viên</div>
          <div className="text-sm text-gray-500 mt-1">Tìm kiếm theo mã hoặc tên sinh viên</div>
        </button>
        <button onClick={() => onSelect('class')} className="card p-4 rounded-lg bg-amber-50 hover:bg-amber-100 dark:bg-amber-900/20 text-left">
          <div className="text-lg font-semibold">Theo Lớp</div>
          <div className="text-sm text-gray-500 mt-1">Xem lịch theo lớp, so sánh nhiều lớp</div>
        </button>
        <button onClick={() => onSelect('room')} className="card p-4 rounded-lg bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/20 text-left">
          <div className="text-lg font-semibold">Theo Phòng học</div>
          <div className="text-sm text-gray-500 mt-1">Kiểm tra lịch sử sử dụng phòng</div>
        </button>
        <button onClick={() => onSelect('campus')} className="card p-4 rounded-lg bg-violet-50 hover:bg-violet-100 dark:bg-violet-900/20 text-left">
          <div className="text-lg font-semibold">Theo Cơ sở</div>
          <div className="text-sm text-gray-500 mt-1">Tổng quan tòa nhà, heatmap sử dụng</div>
        </button>
      </div>
    </div>
  );
}
