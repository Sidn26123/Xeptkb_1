import React from 'react';

// Modern week grid using table layout but with enhanced styles and animations
export default function WeekUnavailableGrid({ timeSlots = [], days = [], value = new Set(), onToggle = () => {} }) {
  const keyFor = (d, s) => `${d}:${s}`;
  // Hide Sunday (Chủ Nhật) — days may come with id 7 for Sunday
  const visibleDays = (days || []).filter(d => d && d.id !== 7 && (d.label || '').toLowerCase() !== 'chủ nhật');

  return (
    <div className="week-unavailable-grid overflow-auto">
      <table className="min-w-full border-collapse font-sans text-sm md:text-base">
        <thead>
          <tr className="bg-gradient-to-r from-blue-50 to-indigo-50">
            <th className="px-3 py-2 text-left text-xs text-blue-600 md:text-sm sticky left-0 z-30 bg-gradient-to-r from-indigo-50/80 to-white/60 border-r border-indigo-100">Tiết / Thứ</th>
            {visibleDays.map(d => (
              <th key={d.id} className="px-3 py-2 text-center text-sm text-blue-700">{d.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {timeSlots.map(slot => (
            <tr key={slot.id} className="align-top">
              <td className="px-3 py-2 align-top w-36 md:w-44 bg-gradient-to-r from-indigo-50/60 to-white/40 text-indigo-700 border-r border-indigo-100 sticky left-0 z-20">
                <div className="text-sm font-semibold text-indigo-800">{slot.label}</div>
                <div className="text-xs text-indigo-500 mt-1">{slot.start || ''}</div>
              </td>
              {visibleDays.map(d => {
                const k = keyFor(d.id, slot.id);
                const checked = value.has(k);
                return (
                  <td key={d.id} className="px-2 py-2 text-center">
                    <button
                      type="button"
                      aria-pressed={checked}
                      aria-label={`${d.label} - ${slot.label} ${checked ? 'đã chọn' : 'chưa chọn'}`}
                      onClick={() => onToggle(d.id, slot.id)}
                      className={
                        `inline-flex items-center justify-center w-9 h-9 md:w-10 md:h-10 transition-transform transform-gpu duration-150 ease-in-out rounded-lg select-none ` +
                        (checked
                          ? 'bg-gradient-to-br from-indigo-500 to-blue-600 text-white shadow-lg ring-4 ring-blue-200/40 hover:brightness-105 scale-105'
                          : 'bg-gradient-to-br from-white to-gray-50 text-gray-700 border border-gray-200 hover:shadow-sm hover:-translate-y-0.5')
                      }
                    >
                      <span className={`font-semibold transition-transform ${checked ? 'text-white scale-110' : 'text-gray-700'}`}>
                        {checked ? '✓' : ''}
                      </span>
                    </button>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <style>{`\n        /* Subtle click animation */\n        .week-unavailable-grid button:active { transform: scale(0.96); }\n        /* gentle glow for selected items */\n        .week-unavailable-grid button[aria-pressed='true'] { box-shadow: 0 8px 20px rgba(59,130,246,0.18); }\n        @media (max-width: 640px) {\n          .week-unavailable-grid td:first-child { width: 120px; }\n        }\n      `}</style>
    </div>
  );
}
