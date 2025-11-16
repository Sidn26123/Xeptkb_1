import React, { useEffect, useState } from 'react';
import { CheckSquare, Square, Search, Filter } from 'lucide-react';
import Button from '../ui/button/Button.jsx';
import {addConstraint, removeConstraint, setConstraints, useConstraints} from "../../stores/ScheduleDataStore.js";

export default function ConstraintSelector({constraintsProps}) {
    console.log('ConstraintSelector constraintsProps:', constraintsProps);
    const [allConstraints, setAllConstraints] = useState([]);
    // const [constraints, setConstraints] = useState([]);
    // const [constraints, setSelectedConstraints] = useState([]);
    const [search, setSearch] = useState('');
    const [selectedType, setSelectedType] = useState('all');
    const constraints = useConstraints();
    // Mock data
    useEffect(() => {
        setAllConstraints(constraintsProps || []);
        if (constraintsProps && constraintsProps.length > 0 && constraints.length === 0) {
            const hardConstraints = constraintsProps.filter(c => c.type === 'H');
            setConstraints(hardConstraints);
        }
    }, [constraintsProps]);

    const toggleSelection = (constraint) => {
        const isSelected = constraints.some(c => c.id === constraint.id);

        if (isSelected) {
            removeConstraint(constraint.id);
        } else {
            addConstraint(constraint);
        }
    };

    const selectAll = () => {
        setConstraints([...filtered]);
    };

    const deselectAll = () => {
        setConstraints([]);
    };

    const formatWeight = (weight) => {
        return new Intl.NumberFormat('vi-VN').format(weight);
    };

    // Filter constraints
    console.log('constraints in ConstraintSelector:', constraints);
    const filtered = allConstraints.filter(c => {
        const matchesSearch =
            (c.name || '').toLowerCase().includes(search.toLowerCase()) ||
            (c.code || '').toLowerCase().includes(search.toLowerCase()) ||
            (c.description || '').toLowerCase().includes(search.toLowerCase());

        const matchesType = selectedType === 'all' || c.type === selectedType;

        return matchesSearch && matchesType;
    });

    const renderConstraintList = () => (
        <div className="space-y-2">
            {filtered.map(constraint => {
                const isSelected = constraints.some(c => c.id === constraint.id);
                const isHard = constraint.type === 'H';

                return (
                    <div
                        key={constraint.id}
                        className={`p-4 border rounded-lg cursor-pointer transition-all ${
                            isSelected
                                ? isHard
                                    ? 'border-red-500 bg-red-50'
                                    : 'border-green-500 bg-green-50'
                                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                        onClick={() => toggleSelection(constraint)}
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-3 flex-1">
                                {isSelected ? (
                                    <CheckSquare className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                                        isHard ? 'text-red-600' : 'text-green-600'
                                    }`}/>
                                ) : (
                                    <Square className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0"/>
                                )}
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <h3 className="font-semibold text-gray-900">{constraint.name}</h3>
                                        <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                                            isHard
                                                ? 'bg-red-100 text-red-800'
                                                : 'bg-green-100 text-green-800'
                                        }`}>
                      {isHard ? 'HARD' : 'SOFT'}
                    </span>
                                    </div>

                                    <code className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded font-mono">
                                        {constraint.code}
                                    </code>

                                    <p className="mt-2 text-sm text-gray-600">{constraint.description}</p>

                                    <div className="mt-2 flex items-center gap-4 text-sm">
                                        <div>
                                            <span className="font-medium text-gray-700">Trọng số:</span>
                                            <span className={`ml-1 font-bold ${
                                                isHard ? 'text-red-700' : 'text-green-700'
                                            }`}>
                        {formatWeight(constraint.weight)}
                      </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-xl shadow-lg border border-gray-200">
                    {/* Header */}
                    <div className="border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-t-xl">
                        <h1 className="text-3xl font-bold text-gray-800 mb-2">Chọn Ràng buộc</h1>
                        <p className="text-gray-600">
                            Đã chọn: <span className="font-semibold text-purple-600">{constraints.length}</span> / {filtered.length} ràng buộc
                        </p>
                    </div>

                    {/* Controls */}
                    <div className="p-6 space-y-4">
                        {/* Search and Actions */}
                        <div className="flex justify-between items-center gap-4 flex-wrap">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Tìm kiếm theo tên, mã hoặc mô tả..."
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                                />
                            </div>

                            <div className="flex gap-2">
                                <Button size="sm" variant="outline" onClick={selectAll}>
                                    Chọn tất cả
                                </Button>
                                <Button size="sm" variant="outline" onClick={deselectAll}>
                                    Bỏ chọn
                                </Button>
                            </div>
                        </div>

                        {/* Filter buttons */}
                        <div className="flex gap-2 items-center">
                            <Filter className="w-5 h-5 text-gray-500" />
                            <Button
                                onClick={() => setSelectedType('all')}
                                size="sm"
                                variant={selectedType === 'all' ? 'primary' : 'outline'}
                            >
                                Tất cả ({constraints.length})
                            </Button>
                            <Button
                                onClick={() => setSelectedType('H')}
                                size="sm"
                                variant={selectedType === 'H' ? 'danger' : 'outline'}
                            >
                                Ràng buộc cứng ({constraints.filter(c => c.type === 'H').length})
                            </Button>
                            <Button
                                onClick={() => setSelectedType('S')}
                                size="sm"
                                variant={selectedType === 'S' ? 'success' : 'outline'}
                            >
                                Ràng buộc mềm ({constraints.filter(c => c.type === 'S').length})
                            </Button>
                        </div>

                        {/* Selected Summary */}
                        {constraints.length > 0 && (
                            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                                <h3 className="font-semibold text-purple-900 mb-2">Đã chọn ({constraints.length})</h3>
                                <div className="flex flex-wrap gap-2">
                                    {constraints.map(c => (
                                        <span
                                            key={c.id}
                                            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                                                c.type === 'H'
                                                    ? 'bg-red-100 text-red-800'
                                                    : 'bg-green-100 text-green-800'
                                            }`}
                                        >
                      {c.name}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    toggleSelection(c);
                                                }}
                                                className="ml-1 hover:bg-white/50 rounded-full p-0.5"
                                            >
                        ×
                      </button>
                    </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Constraint List */}
                    <div className="px-6 pb-6">
                        {filtered.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="text-gray-400 text-6xl mb-4">🔍</div>
                                <h3 className="text-xl font-semibold text-gray-600 mb-2">Không tìm thấy ràng buộc</h3>
                                <p className="text-gray-500">Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc</p>
                            </div>
                        ) : (
                            renderConstraintList()
                        )}
                    </div>

                    {/* Footer Actions */}
                    <div className="border-t border-gray-200 p-6 bg-gray-50 rounded-b-xl">
                        <div className="flex justify-between items-center">
                            <div className="text-sm text-gray-600">
                                Tổng số ràng buộc đã chọn: <span className="font-bold text-purple-600">{constraints.length}</span>
                            </div>
                            <div className="flex gap-3">
                                <Button variant="outline" onClick={() => console.log('Cancelled')}>
                                    Hủy
                                </Button>
                                <Button
                                    variant="primary"
                                    onClick={() => console.log('Selected:', constraints)}
                                    disabled={constraints.length === 0}
                                    className={constraints.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}
                                >
                                    Xác nhận ({constraints.length})
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}