import React, { useEffect, useRef } from 'react';
import { Loader2, CheckCircle2, XCircle, Terminal, BrainCircuit, Layers, PenTool } from "lucide-react";

const ScheduleProgressModal = ({ isOpen, onClose, progress, logs, currentPhase, fitness, isComplete, result }) => {
    const logsEndRef = useRef(null);

    // Tự động cuộn xuống cuối log
    useEffect(() => {
        logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [logs]);

    if (!isOpen) return null;

    const phases = [
        { id: 'phase1', label: 'Khả thi (Feasibility)', icon: BrainCircuit },
        { id: 'phase2', label: 'Cấu trúc (Structure)', icon: Layers },
        { id: 'phase3', label: 'Tinh chỉnh (Refinement)', icon: PenTool },
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="p-6 bg-gray-50 border-b flex justify-between items-center">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            {isComplete ? (
                                <><CheckCircle2 className="text-green-600" /> Xếp lịch hoàn tất</>
                            ) : (
                                <><Loader2 className="animate-spin text-indigo-600" /> Đang xử lý thuật toán...</>
                            )}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">Hệ thống đang chạy Genetic Algorithm qua 3 giai đoạn</p>
                    </div>
                    {isComplete && (
                        <button onClick={onClose} className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition">
                            Xem kết quả
                        </button>
                    )}
                </div>

                {/* Body */}
                <div className="p-6 space-y-6 overflow-y-auto">

                    {/* 1. Progress Bar */}
                    <div>
                        <div className="flex justify-between text-sm font-medium text-gray-700 mb-2">
                            <span>Tiến độ tổng thể</span>
                            <span className="text-indigo-600">{Math.round(progress)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                            <div
                                className="bg-indigo-600 h-full transition-all duration-500 ease-out rounded-full"
                                style={{ width: `${progress}%` }}
                            ></div>
                        </div>
                    </div>

                    {/* 2. Phase Steps */}
                    <div className="grid grid-cols-3 gap-4">
                        {phases.map((phase, idx) => {
                            const Icon = phase.icon;
                            let statusColor = "text-gray-400 bg-gray-50 border-gray-200"; // Waiting

                            if (currentPhase === phase.id) {
                                statusColor = "text-indigo-600 bg-indigo-50 border-indigo-500 ring-1 ring-indigo-500"; // Active
                            } else if (phases.findIndex(p => p.id === currentPhase) > idx || isComplete) {
                                statusColor = "text-emerald-600 bg-emerald-50 border-emerald-500"; // Done
                            }

                            return (
                                <div key={phase.id} className={`p-3 border rounded-lg flex flex-col items-center text-center gap-2 transition-colors ${statusColor}`}>
                                    <Icon className="w-6 h-6" />
                                    <span className="text-xs font-medium">{phase.label}</span>
                                </div>
                            );
                        })}
                    </div>

                    {/* 3. Metrics */}
                    <div className="flex gap-4">
                        <div className="flex-1 bg-slate-50 p-3 rounded border border-slate-200">
                            <span className="text-xs text-slate-500 uppercase font-bold">Fitness (Penalty)</span>
                            <div className="text-2xl font-mono font-semibold text-slate-800">
                                {fitness !== null ? fitness.toLocaleString() : '---'}
                            </div>
                            <p className="text-xs text-slate-500">Càng thấp càng tốt</p>
                        </div>
                    </div>

                    {/* 4. Terminal Logs */}
                    <div className="bg-slate-900 rounded-lg p-4 font-mono text-xs text-green-400 h-48 overflow-y-auto flex flex-col-reverse shadow-inner">
                        <div ref={logsEndRef} />
                        {logs.length === 0 && <span className="text-slate-600 italic">Waiting for server stream...</span>}
                        {[...logs].reverse().map((log, i) => (
                            <div key={i} className="mb-1 border-l-2 border-slate-700 pl-2 break-all">
                                <span className="opacity-50">[{new Date().toLocaleTimeString()}]</span> {log}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ScheduleProgressModal;