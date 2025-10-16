import React, { useState } from 'react';
import { Calendar, ChevronDown, ChevronRight } from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faEnvelope } from '@fortawesome/free-solid-svg-icons';
import CommonTable from '../../commons/CommonTable.jsx';
import ScheduleGeneratorApp from './Scheduler.jsx';
// Sample data
const sampleData = {
    departments: [
        {
            id: 1,
            name: 'Khoa Công nghệ thông tin',
            classes: [
                {
                    id: 1,
                    name: 'T.Chang [10, 11, 12]',
                    info: 'Chào cô, S hoạt, Toán, N.ngữ',
                    grades: [10, 11, 12],
                },
                {
                    id: 2,
                    name: 'C.Hiền [10, 11, 12]',
                    info: 'Chào cô, S hoạt, Sinh',
                    grades: [10, 11, 12],
                },
                {
                    id: 3,
                    name: 'Cô Dịu [10, 11, 12]',
                    info: 'Lđtl, S hoạt, Chào cô',
                    grades: [10, 11, 12],
                },
            ],
        },
        {
            id: 2,
            name: 'Khoa Khoa học tự nhiên',
            classes: [
                {
                    id: 4,
                    name: 'C.Thủy [10, 11, 12]',
                    info: 'Sinh, GDQP',
                    grades: [10, 11, 12],
                },
                {
                    id: 5,
                    name: 'C.Minh [11, 12]',
                    info: 'N.ngữ',
                    grades: [11, 12],
                },
                {
                    id: 6,
                    name: 'C.Dung [10, 11, 12]',
                    info: 'N.ngữ',
                    grades: [10, 11, 12],
                },
            ],
        },
    ],
    schools: ['THCS Nghĩa Dân', 'THPT Lê Quý Đôn', 'THCS Trần Phú'],
    subjects: [
        'Chào cờ',
        'Tiếng Anh có yêu tố nước ngoài',
        'Sinh hoạt',
        'Toán',
        'Ngữ văn',
        'Vật lý',
        'Hóa học',
    ],
};

const Content = () => {
    const [expandedDepts, setExpandedDepts] = useState({});
    const [selectedClasses, setSelectedClasses] = useState({});
    const [selectedGrades, setSelectedGrades] = useState({
        10: true,
        11: true,
        12: true,
        9: false,
    });
    const [selectedSchool, setSelectedSchool] = useState('THCS Nghĩa Dân');
    const [selectedSubjects, setSelectedSubjects] = useState({
        'Chào cờ': true,
        'Tiếng Anh có yêu tố nước ngoài': false,
        'Sinh hoạt': true,
    });

    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isFacultyPartShown, setIsFacultyPartShown] = useState(true);
    const [isGradePartShown, setIsGradePartShown] = useState(false);
    const [isSubjectPartShown, setIsSubjectPartShown] = useState(true);
    const [activeTab, setActiveTab] = useState('data');

    const toggleCollapse = () => setIsCollapsed(!isCollapsed);

    const toggleFacultyPart = () => setIsFacultyPartShown(!isFacultyPartShown);

    const toggleGradePart = () => setIsGradePartShown(!isGradePartShown);

    const toggleSubjectPart = () => setIsSubjectPartShown(!isSubjectPartShown);

    const toggleDepartment = (deptId) => {
        setExpandedDepts((prev) => ({
            ...prev,
            [deptId]: !prev[deptId],
        }));
    };

    const toggleClass = (classId) => {
        setSelectedClasses((prev) => ({
            ...prev,
            [classId]: !prev[classId],
        }));
    };

    const toggleGrade = (grade) => {
        setSelectedGrades((prev) => ({
            ...prev,
            [grade]: !prev[grade],
        }));
    };

    const toggleSubject = (subject) => {
        setSelectedSubjects((prev) => ({
            ...prev,
            [subject]: !prev[subject],
        }));
    };

    return (
        <div className="p-6 h-full bg-gray-50">
            <div className="flex items-center gap-3 mb-6">
                <Calendar className="w-8 h-8 text-blue-600" />
                <h1 className="text-3xl font-bold text-gray-800">
                    Tạo Thời Khóa Biểu Tự Động
                </h1>
            </div>
            {/* --- Bảng điều khiển --- */}
            <div className="flex gap-3 mb-6">
                <button
                    onClick={() => setActiveTab('data')}
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-200
            ${
                activeTab === 'data'
                    ? 'bg-blue-600 text-white shadow'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border'
            }`}
                >
                    Dữ liệu
                </button>
                <button
                    onClick={() => setActiveTab('schedule')}
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-200
            ${
                activeTab === 'schedule'
                    ? 'bg-blue-600 text-white shadow'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border'
            }`}
                >
                    Thời khoá biểu
                </button>
            </div>
            {activeTab === 'data' ? (
                <>
                    <div className="grid gap-6">
                        {/* Column 1: Danh sách Khoa và Giáo viên */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                            <div className="p-4 border-b border-gray-200">
                                <div className="flex items-center justify-between mb-3">
                                    <h2 className="text-lg font-semibold text-gray-800">
                                        Danh sách Khoa
                                    </h2>
                                    {/*    /!*<div className="flex gap-2">*!/*/}
                                    {/*    /!*    <button className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded">*!/*/}
                                    {/*    /!*        Bỏ chọn*!/*/}
                                    {/*    /!*    </button>*!/*/}
                                    {/*    /!*    <button className="px-3 py-1 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded">*!/*/}
                                    {/*    /!*        Thêm nhanh*!/*/}
                                    {/*    /!*    </button>*!/*/}
                                    {/*    /!*    <button className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded">*!/*/}
                                    {/*    /!*        Sắp xếp*!/*/}
                                    {/*    /!*    </button>*!/*/}
                                    {/*    /!*    <button className="px-3 py-1 text-sm bg-green-500 hover:bg-green-600 text-white rounded">*!/*/}
                                    {/*    /!*        Thêm*!/*/}
                                    {/*    /!*    </button>*!/*/}
                                    {/*    /!*</div>*!/*/}
                                    {/*    <div className={'flex flex-row items-end'}>*/}
                                    {/*        <div className="flex gap-2 text-sm text-gray-500 mr-2">*/}
                                    {/*            <div className={'ml-2'}>*/}
                                    {/*                <span>Tổng khoa: </span>*/}
                                    {/*                <span>1</span>*/}
                                    {/*            </div>*/}
                                    {/*            <div>*/}
                                    {/*                <span>Tổng khoa đã chọn: </span>*/}
                                    {/*                <span>1</span>*/}
                                    {/*            </div>*/}
                                    {/*        </div>*/}
                                    {/*        <div className={'text-gray-700'}>*/}
                                    {/*            <FontAwesomeIcon icon={faChevronDown} />*/}
                                    {/*        </div>*/}
                                    {/*    </div>*/}
                                    {/*</div>*/}

                                    <div className="flex items-center text-gray-700">
                                        <div className="flex gap-2 text-sm text-gray-500 mr-3">
                                            <div>
                                                <span>Tổng khoa: </span>
                                                <span>1</span>
                                            </div>
                                            <div>
                                                <span>Đã chọn: </span>
                                                <span>1</span>
                                            </div>
                                        </div>

                                        {/* Icon xoay */}
                                        <FontAwesomeIcon
                                            icon={faChevronDown}
                                            className={`transition-transform duration-300 ${
                                                isCollapsed
                                                    ? '-rotate-90'
                                                    : 'rotate-0'
                                            }`}
                                            onClick={toggleCollapse}
                                        />
                                    </div>

                                    {/*<input*/}
                                    {/*    type="text"*/}
                                    {/*    placeholder="Tìm giáo viên"*/}
                                    {/*    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"*/}
                                    {/*/>*/}
                                </div>
                            </div>
                            {!isCollapsed && (
                                <>
                                    <div className="p-4 max-h-96 overflow-y-auto">
                                        {sampleData.departments.map((dept) => (
                                            <div key={dept.id} className="mb-3">
                                                <div
                                                    className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                                                    onClick={() =>
                                                        toggleDepartment(
                                                            dept.id
                                                        )
                                                    }
                                                >
                                                    {expandedDepts[dept.id] ? (
                                                        <ChevronDown className="w-4 h-4 text-gray-600" />
                                                    ) : (
                                                        <ChevronRight className="w-4 h-4 text-gray-600" />
                                                    )}
                                                    <span className="font-medium text-gray-800">
                                                        {dept.name}
                                                    </span>
                                                </div>

                                                {expandedDepts[dept.id] && (
                                                    <div className="ml-6 mt-2 space-y-2">
                                                        {dept.classes.map(
                                                            (cls) => (
                                                                <div
                                                                    key={cls.id}
                                                                    className="flex items-start gap-2"
                                                                >
                                                                    <input
                                                                        type="radio"
                                                                        name="selectedClass"
                                                                        checked={
                                                                            selectedClasses[
                                                                                cls
                                                                                    .id
                                                                            ] ||
                                                                            false
                                                                        }
                                                                        onChange={() =>
                                                                            toggleClass(
                                                                                cls.id
                                                                            )
                                                                        }
                                                                        className="mt-1"
                                                                    />
                                                                    <div className="flex-1">
                                                                        <div className="text-gray-800">
                                                                            <span className="font-medium">
                                                                                {
                                                                                    cls.name.split(
                                                                                        '['
                                                                                    )[0]
                                                                                }
                                                                            </span>
                                                                            <span className="text-blue-600">
                                                                                {
                                                                                    cls.name.match(
                                                                                        /\[.*\]/
                                                                                    )?.[0]
                                                                                }
                                                                            </span>
                                                                        </div>
                                                                        <div className="text-sm text-gray-500">
                                                                            {
                                                                                cls.info
                                                                            }
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Column 2:  Khối giảng dạy */}

                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-5">
                            <div className="p-4 border-b border-gray-200">
                                <div className="flex items-center justify-between">
                                    <h2 className="font-semibold text-gray-800">
                                        Khối
                                    </h2>
                                    <div className="flex items-center text-gray-700">
                                        <div className="flex gap-2 text-sm text-gray-500 mr-3">
                                            <div>
                                                <span>Tổng khoa: </span>
                                                <span>1</span>
                                            </div>
                                            <div>
                                                <span>Đã chọn: </span>
                                                <span>1</span>
                                            </div>
                                        </div>

                                        {/* Icon xoay */}
                                        <FontAwesomeIcon
                                            icon={faChevronDown}
                                            className={`transition-transform duration-300 ${
                                                isCollapsed
                                                    ? '-rotate-90'
                                                    : 'rotate-0'
                                            }`}
                                            onClick={toggleGradePart}
                                        />
                                    </div>

                                    {/*<input*/}
                                    {/*    type="text"*/}
                                    {/*    placeholder="Tìm giáo viên"*/}
                                    {/*    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"*/}
                                    {/*/>*/}
                                </div>
                            </div>
                            {isGradePartShown && (
                                <>
                                    <div className="space-y-2 mx-5 my-2">
                                        {Object.entries(selectedGrades).map(
                                            ([grade, checked]) => (
                                                <label
                                                    key={grade}
                                                    className="flex items-center gap-2 cursor-pointer"
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={checked}
                                                        onChange={() =>
                                                            toggleGrade(grade)
                                                        }
                                                        className="w-4 h-4"
                                                    />
                                                    <span className="text-gray-700">
                                                        Khối {grade}
                                                    </span>
                                                </label>
                                            )
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                    {/* Column 3: Môn học */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                        <div className="p-4 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <h2 className="font-semibold text-gray-800">
                                    Môn học
                                </h2>
                                <div className="flex items-center text-gray-700">
                                    <div className="flex gap-2 text-sm text-gray-500 mr-3">
                                        <div>
                                            <span>Tổng khoa: </span>
                                            <span>1</span>
                                        </div>
                                        <div>
                                            <span>Đã chọn: </span>
                                            <span>1</span>
                                        </div>
                                    </div>

                                    {/* Icon xoay */}
                                    <FontAwesomeIcon
                                        icon={faChevronDown}
                                        className={`transition-transform duration-300 ${
                                            isCollapsed
                                                ? '-rotate-90'
                                                : 'rotate-0'
                                        }`}
                                        onClick={toggleSubjectPart}
                                    />
                                </div>

                                {/*<input*/}
                                {/*    type="text"*/}
                                {/*    placeholder="Tìm giáo viên"*/}
                                {/*    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"*/}
                                {/*/>*/}
                            </div>
                        </div>
                        {!isSubjectPartShown && (
                            <>
                                <div className="space-y-2 mx-5 my-2">
                                    {sampleData.subjects.map((subject) => (
                                        <label
                                            key={subject}
                                            className="flex items-center gap-2 cursor-pointer"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={
                                                    selectedSubjects[subject] ||
                                                    false
                                                }
                                                onChange={() =>
                                                    toggleSubjectPart(subject)
                                                }
                                                className="w-4 h-4"
                                            />
                                            <span className="text-gray-700">
                                                {subject}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                                <div className={'text-gray-800'}>
                                    <CommonTable
                                        headers={[
                                            // { label: "Tên truyện", key: "displayName" },

                                            {
                                                label: 'Mô tả',
                                                key: 'description',
                                            },
                                            {
                                                label: 'Trạng thái',
                                                key: 'status',
                                                filter: {
                                                    key: 'novelStates',
                                                    label: 'Trạng thái',
                                                },
                                            },
                                            // { label: "Slug", key: "slug" },
                                            {
                                                label: 'Hành động',
                                                key: 'actions',
                                            },
                                        ]}
                                    />
                                </div>
                            </>
                        )}
                    </div>
                </>
            ) : (
                <>
                    <ScheduleGeneratorApp />
                </>
            )}
        </div>
    );
};

export default Content;
