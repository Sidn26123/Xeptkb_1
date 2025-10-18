import React, { useEffect, useState } from 'react';
import { Calendar, ChevronDown, ChevronRight } from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faEnvelope } from '@fortawesome/free-solid-svg-icons';
import CommonTable from '../../commons/CommonTable.jsx';
import ScheduleGeneratorApp from './Scheduler.jsx';
import ScheduleViewer from './SchedulerViewer.jsx';
import {
    useCourses,
    useGAConfig,
    useRooms,
    useSemesterConfig,
    useTeachers,
} from '../../stores/ScheduleDataStore.js';
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

const SchedulerResourcesManagement = () => {
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

    const courses = useCourses();
    const teachers = useTeachers();
    const rooms = useRooms();
    const semester_config = useSemesterConfig();
    const ga_config = useGAConfig();

    const [result, setResult] = useState(null);

    const API_URL = 'http://localhost:5000/api/schedule';

    const generateSchedule = async () => {
        try {
            const data = {
                courses,
                teachers,
                rooms,
                semester_config,
                ga_config,
            };

            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            const responseData = await response.json();

            if (response.ok && responseData.success) {
                setResult(responseData);
            } else {
                /* empty */
            }
        } catch (err) {
            /* empty */
        } finally {
            /* empty */
        }
    };
    useEffect(() => {
        generateSchedule();
    }, []);

    // return (
    //     <div className="p-6 min-h-full bg-gray-50 dark:bg-gray-800">
    //         <div className="flex items-center gap-3 mb-6">
    //             <Calendar className="w-8 h-8 text-blue-600" />
    //             <h1 className="text-3xl font-bold text-gray-800">
    //                 Tạo Thời Khóa Biểu Tự Động
    //             </h1>
    //         </div>
    //         {/* --- Bảng điều khiển --- */}
    //         <div className="flex gap-3 mb-6">
    //             <button
    //                 onClick={() => setActiveTab('data')}
    //                 className={`px-4 py-2 rounded-lg font-medium transition-all duration-200
    //         ${
    //             activeTab === 'data'
    //                 ? 'bg-blue-600 text-white shadow'
    //                 : 'bg-white text-gray-600 hover:bg-gray-100 border'
    //         }`}
    //             >
    //                 Dữ liệu
    //             </button>
    //             <button
    //                 onClick={() => setActiveTab('schedule')}
    //                 className={`px-4 py-2 rounded-lg font-medium transition-all duration-200
    //         ${
    //             activeTab === 'schedule'
    //                 ? 'bg-blue-600 text-white shadow'
    //                 : 'bg-white text-gray-600 hover:bg-gray-100 border'
    //         }`}
    //             >
    //                 Thời khoá biểu
    //             </button>
    //         </div>
    //         {activeTab === 'data' ? (
    //             <>
    //                 <div className="grid gap-6">
    //                     {/* Column 1: Danh sách Khoa và Giáo viên */}
    //                     <div className="bg-ocean-500 rounded-lg shadow-sm border border-gray-200">
    //                         <div className="p-4 border-b border-gray-200">
    //                             <div className="flex items-center justify-between mb-3">
    //                                 <h2 className="text-lg font-semibold ">
    //                                     Danh sách Khoa
    //                                 </h2>
    //
    //                                 <div className="flex items-center text-gray-700">
    //                                     <div className="flex gap-2 text-sm text-gray-500 mr-3">
    //                                         <div>
    //                                             <span>Tổng khoa: </span>
    //                                             <span>1</span>
    //                                         </div>
    //                                         <div>
    //                                             <span>Đã chọn: </span>
    //                                             <span>1</span>
    //                                         </div>
    //                                     </div>
    //
    //                                     {/* Icon xoay */}
    //                                     <FontAwesomeIcon
    //                                         icon={faChevronDown}
    //                                         className={`transition-transform duration-300 ${
    //                                             isCollapsed
    //                                                 ? '-rotate-90'
    //                                                 : 'rotate-0'
    //                                         }`}
    //                                         onClick={toggleCollapse}
    //                                     />
    //                                 </div>
    //                             </div>
    //                         </div>
    //                         {!isCollapsed && (
    //                             <>
    //                                 <div className="p-4 max-h-96 overflow-y-auto">
    //                                     {sampleData.departments.map((dept) => (
    //                                         <div key={dept.id} className="mb-3">
    //                                             <div
    //                                                 className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
    //                                                 onClick={() =>
    //                                                     toggleDepartment(
    //                                                         dept.id
    //                                                     )
    //                                                 }
    //                                             >
    //                                                 {expandedDepts[dept.id] ? (
    //                                                     <ChevronDown className="w-4 h-4 text-gray-600" />
    //                                                 ) : (
    //                                                     <ChevronRight className="w-4 h-4 text-gray-600" />
    //                                                 )}
    //                                                 <span className="font-medium text-gray-800">
    //                                                     {dept.name}
    //                                                 </span>
    //                                             </div>
    //
    //                                             {expandedDepts[dept.id] && (
    //                                                 <div className="ml-6 mt-2 space-y-2">
    //                                                     {dept.classes.map(
    //                                                         (cls) => (
    //                                                             <div
    //                                                                 key={cls.id}
    //                                                                 className="flex items-start gap-2"
    //                                                             >
    //                                                                 <input
    //                                                                     type="radio"
    //                                                                     name="selectedClass"
    //                                                                     checked={
    //                                                                         selectedClasses[
    //                                                                             cls
    //                                                                                 .id
    //                                                                         ] ||
    //                                                                         false
    //                                                                     }
    //                                                                     onChange={() =>
    //                                                                         toggleClass(
    //                                                                             cls.id
    //                                                                         )
    //                                                                     }
    //                                                                     className="mt-1"
    //                                                                 />
    //                                                                 <div className="flex-1">
    //                                                                     <div className="text-gray-800">
    //                                                                         <span className="font-medium">
    //                                                                             {
    //                                                                                 cls.name.split(
    //                                                                                     '['
    //                                                                                 )[0]
    //                                                                             }
    //                                                                         </span>
    //                                                                         <span className="text-blue-600">
    //                                                                             {
    //                                                                                 cls.name.match(
    //                                                                                     /\[.*\]/
    //                                                                                 )?.[0]
    //                                                                             }
    //                                                                         </span>
    //                                                                     </div>
    //                                                                     <div className="text-sm text-gray-500">
    //                                                                         {
    //                                                                             cls.info
    //                                                                         }
    //                                                                     </div>
    //                                                                 </div>
    //                                                             </div>
    //                                                         )
    //                                                     )}
    //                                                 </div>
    //                                             )}
    //                                         </div>
    //                                     ))}
    //                                 </div>
    //                             </>
    //                         )}
    //                     </div>

    return (
        <div className="p-6 min-h-full bg-surface-light dark:bg-surface-dark transition-colors duration-300">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <Calendar className="w-8 h-8 text-primary" />
                <h1 className="text-3xl font-bold text-text-primary-light dark:text-text-primary-dark">
                    Tạo Thời Khóa Biểu Tự Động
                </h1>
            </div>

            {/* Tabs */}
            <div className="flex gap-3 mb-6">
                <button
                    onClick={() => setActiveTab('data')}
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 border
          ${
              activeTab === 'data'
                  ? 'bg-primary text-white shadow'
                  : 'bg-card-light dark:bg-card-dark text-text-secondary-light dark:text-text-secondary-dark hover:bg-gray-100 dark:hover:bg-gray-700 border-border-light dark:border-border-dark'
          }`}
                >
                    Dữ liệu
                </button>
                <button
                    onClick={() => setActiveTab('schedule')}
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 border
          ${
              activeTab === 'schedule'
                  ? 'bg-primary text-white shadow'
                  : 'bg-card-light dark:bg-card-dark text-text-secondary-light dark:text-text-secondary-dark hover:bg-gray-100 dark:hover:bg-gray-700 border-border-light dark:border-border-dark'
          }`}
                >
                    Thời khoá biểu
                </button>
            </div>

            {activeTab === 'data' ? (
                <>
                    <div className="grid gap-6">
                        <div className="bg-card-light dark:bg-card-dark rounded-lg shadow-sm border border-border-light dark:border-border-dark">
                            <div className="p-4 border-b border-border-light dark:border-border-dark">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-lg font-semibold text-text-primary-light dark:text-text-primary-dark">
                                        Danh sách Khoa
                                    </h2>

                                    <div className="flex items-center text-text-secondary-light dark:text-text-secondary-dark">
                                        <div className="flex gap-2 text-sm mr-3">
                                            <div>
                                                <span>Tổng khoa: </span>
                                                <span>1</span>
                                            </div>
                                            <div>
                                                <span>Đã chọn: </span>
                                                <span>1</span>
                                            </div>
                                        </div>

                                        <FontAwesomeIcon
                                            icon={faChevronDown}
                                            className={`transition-transform duration-300 cursor-pointer ${
                                                isFacultyPartShown
                                                    ? '-rotate-90'
                                                    : 'rotate-0'
                                            }`}
                                            onClick={toggleFacultyPart}
                                        />
                                    </div>
                                </div>
                            </div>

                            {!isFacultyPartShown && (
                                <div className="p-4 max-h-96 overflow-y-auto">
                                    {sampleData.departments.map((dept) => (
                                        <div key={dept.id} className="mb-3">
                                            <div
                                                className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded transition-colors"
                                                onClick={() =>
                                                    toggleDepartment(dept.id)
                                                }
                                            >
                                                {expandedDepts[dept.id] ? (
                                                    <ChevronDown className="w-4 h-4 text-text-secondary-light dark:text-text-secondary-dark" />
                                                ) : (
                                                    <ChevronRight className="w-4 h-4 text-text-secondary-light dark:text-text-secondary-dark" />
                                                )}
                                                <span className="font-medium text-text-primary-light dark:text-text-primary-dark">
                                                    {dept.name}
                                                </span>
                                            </div>

                                            {expandedDepts[dept.id] && (
                                                <div className="ml-6 mt-2 space-y-2">
                                                    {dept.classes.map((cls) => (
                                                        <div
                                                            key={cls.id}
                                                            className="flex items-start gap-2"
                                                        >
                                                            <input
                                                                type="radio"
                                                                name="selectedClass"
                                                                checked={
                                                                    selectedClasses[
                                                                        cls.id
                                                                    ] || false
                                                                }
                                                                onChange={() =>
                                                                    toggleClass(
                                                                        cls.id
                                                                    )
                                                                }
                                                                className="mt-1 accent-primary"
                                                            />
                                                            <div className="flex-1">
                                                                <div className="text-text-primary-light dark:text-text-primary-dark">
                                                                    <span className="font-medium">
                                                                        {
                                                                            cls.name.split(
                                                                                '['
                                                                            )[0]
                                                                        }
                                                                    </span>
                                                                    <span className="text-primary">
                                                                        {
                                                                            cls.name.match(
                                                                                /\[.*\]/
                                                                            )?.[0]
                                                                        }
                                                                    </span>
                                                                </div>
                                                                <div className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                                                                    {cls.info}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        {/* Column 2: Khối giảng dạy */}
                        <div className="bg-card-light dark:bg-card-dark rounded-lg shadow-sm border border-border-light dark:border-border-dark my-5 transition-colors duration-300">
                            <div className="p-4 border-b border-border-light dark:border-border-dark">
                                <div className="flex items-center justify-between">
                                    <h2 className="font-semibold text-text-primary-light dark:text-text-primary-dark">
                                        Khối
                                    </h2>

                                    <div className="flex items-center text-text-secondary-light dark:text-text-secondary-dark">
                                        <div className="flex gap-2 text-sm mr-3">
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
                                            className={`transition-transform duration-300 cursor-pointer ${
                                                isCollapsed
                                                    ? '-rotate-90'
                                                    : 'rotate-0'
                                            }`}
                                            onClick={toggleGradePart}
                                        />
                                    </div>
                                </div>
                            </div>

                            {isGradePartShown && (
                                <div className="space-y-2 mx-5 my-2">
                                    {Object.entries(selectedGrades).map(
                                        ([grade, checked]) => (
                                            <label
                                                key={grade}
                                                className="flex items-center gap-2 cursor-pointer text-text-primary-light dark:text-text-primary-dark"
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={checked}
                                                    onChange={() =>
                                                        toggleGrade(grade)
                                                    }
                                                    className="w-4 h-4 accent-primary"
                                                />
                                                <span className="text-text-secondary-light dark:text-text-secondary-dark">
                                                    Khối {grade}
                                                </span>
                                            </label>
                                        )
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Column 3: Môn học */}
                        <div className="bg-card-light dark:bg-card-dark rounded-lg shadow-sm border border-border-light dark:border-border-dark transition-colors duration-300">
                            <div className="p-4 border-b border-border-light dark:border-border-dark">
                                <div className="flex items-center justify-between">
                                    <h2 className="font-semibold text-text-primary-light dark:text-text-primary-dark">
                                        Môn học
                                    </h2>

                                    <div className="flex items-center text-text-secondary-light dark:text-text-secondary-dark">
                                        <div className="flex gap-2 text-sm mr-3">
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
                                            className={`transition-transform duration-300 cursor-pointer ${
                                                isCollapsed
                                                    ? '-rotate-90'
                                                    : 'rotate-0'
                                            }`}
                                            onClick={toggleSubjectPart}
                                        />
                                    </div>
                                </div>
                            </div>

                            {!isSubjectPartShown && (
                                <>
                                    <div className="space-y-2 mx-5 my-2">
                                        {sampleData.subjects.map((subject) => (
                                            <label
                                                key={subject}
                                                className="flex items-center gap-2 cursor-pointer text-text-primary-light dark:text-text-primary-dark"
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={
                                                        selectedSubjects[
                                                            subject
                                                        ] || false
                                                    }
                                                    onChange={() =>
                                                        toggleSubjectPart(
                                                            subject
                                                        )
                                                    }
                                                    className="w-4 h-4 accent-primary"
                                                />
                                                <span className="text-text-secondary-light dark:text-text-secondary-dark">
                                                    {subject}
                                                </span>
                                            </label>
                                        ))}
                                    </div>

                                    <div className="text-text-primary-light dark:text-text-primary-dark">
                                        <CommonTable
                                            headers={[
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
                    </div>
                </>
            ) : (
                <>
                    {/*<ScheduleGeneratorApp />*/}
                    {result && <ScheduleViewer resultData={result} />}
                </>
            )}
        </div>
    );
};

export default SchedulerResourcesManagement;
