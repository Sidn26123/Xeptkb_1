import React from "react";

export default function ScheduleFilter({ onChange = () => {} }) {
  const [query, setQuery] = React.useState("");
  const [mode, setMode] = React.useState("week");

  const handleSearch = () => {
    onChange({ query, mode });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          type="text"
          placeholder="Tìm kiếm (mã hoặc tên)..."
          className="input input-bordered flex-1"
        />
        <select value={mode} onChange={(e) => setMode(e.target.value)} className="select select-bordered w-40">
          <option value="week">Tuần</option>
          <option value="month">Tháng</option>
          <option value="semester">Học kỳ</option>
        </select>
        <button onClick={handleSearch} className="btn btn-primary">Tìm</button>
      </div>
    </div>
  );
}
