import React, {useEffect, useMemo, useState} from 'react';
import {Calendar, ChevronDown, ChevronRight, Plus} from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faEnvelope } from '@fortawesome/free-solid-svg-icons';
import CommonTable from '../../commons/CommonTable.jsx';
import ScheduleGeneratorApp from './Scheduler.jsx';
import ScheduleViewer from './SchedulerViewer.jsx';
import {
    useCourses, useDepartments,
    useGAConfig,
    useRooms, useSchedulingActions, useSelectedCourses, useSelectedRooms, useSelectedTeachers,
    useSemesterConfig, useSubjects,
    useTeachers,
} from '../../stores/ScheduleDataStore.js';
import ScheduleAnalyzer from './SchedulerAnalyzer.jsx';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { CheckSquare, Square, RefreshCw, CheckCircle2, Users, BookOpen, Home } from 'lucide-react';
import ScheduleMetricsDashboard from "../scheduler/PreScheduleMetricDashboard.jsx";
import ResourceManager from "../scheduler/ResourceManager.jsx";

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
    const departments = useDepartments();
    const subjects = useSubjects();
    const selectedCourses = useSelectedCourses();
    const selectedTeachers = useSelectedTeachers();
    const selectedRooms = useSelectedRooms();
    const [result, setResult] = useState(null);

    const API_URL = 'http://localhost:5001/api/schedule';

    const generateSchedule = async () => {
        try {
            const data = {
                courses: selectedCourses,
                teachers: selectedTeachers,
                rooms: selectedRooms,
                semester_config: semester_config,
                ga_config: ga_config,
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
    // useEffect(() => {
    //     generateSchedule();
    // }, []);
    const handleStartGenerate = () => {
        generateSchedule();
    }
    return (
        <div className="p-6 min-h-full bg-surface-light dark:bg-surface-dark transition-colors duration-300">
            {/* Header */}
            <div className={"flex flex-col justify-between md:flex-row md:items-center mb-6"}>
                <div className="flex items-center gap-3 mb-6">
                    <Calendar className="w-8 h-8 text-blue-600"/>
                    <h1 className="text-3xl font-bold text-gray-800">
                        Tạo Thời Khóa Biểu Tự Động
                    </h1>
                </div>
                <div className="flex items-center gap-3 mb-6" onClick={handleStartGenerate}>
                    <Plus className="w-5 h-5 text-blue-600"/>
                    <span className="text-gray-600">
                                Tạo
                            </span>
                </div>
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
                    <ResourceManager/>
                </>
            ) : (
                <>
                    {/*<ScheduleGeneratorApp />*/}
                    {result && <ScheduleViewer courses = {courses} teachers = {teachers} rooms = {rooms} resultData={result}/>}
                    {/*{result && (*/}
                    {/*    <>*/}
                    {/*        <ScheduleAnalyzer/>*/}
                    {/*    </>*/}
                    {/*)}*/}
                </>
            )}
            <ScheduleMetricsDashboard />
        </div>
    );
};

export default SchedulerResourcesManagement;


