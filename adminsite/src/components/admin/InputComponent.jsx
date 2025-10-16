// Course Component
import { useState } from 'react';
import useInputStore from '../../stores/InputDataStore.js';
import { Plus, Edit2, Trash2, X, Check } from 'lucide-react';

const CourseManager = () => {
    const { courses, addCourse, updateCourse, deleteCourse } = useInputStore();
    const [editing, setEditing] = useState(null);
    const [adding, setAdding] = useState(false);
    const [form, setForm] = useState({
        course_id: '',
        student_count: '',
        weeks_needed: '',
        sessions_per_week: '',
        duration_per_session: '',
    });

    const handleSave = () => {
        const data = {
            course_id: parseInt(form.course_id),
            student_count: parseInt(form.student_count),
            weeks_needed: parseInt(form.weeks_needed),
            sessions_per_week: parseInt(form.sessions_per_week),
            duration_per_session: parseInt(form.duration_per_session),
        };

        if (editing) {
            updateCourse(editing, data);
            setEditing(null);
        } else {
            addCourse(data);
            setAdding(false);
        }
        setForm({
            course_id: '',
            student_count: '',
            weeks_needed: '',
            sessions_per_week: '',
            duration_per_session: '',
        });
    };

    const startEdit = (course) => {
        setEditing(course.id);
        setForm({
            course_id: course.course_id,
            student_count: course.student_count,
            weeks_needed: course.weeks_needed,
            sessions_per_week: course.sessions_per_week,
            duration_per_session: course.duration_per_session,
        });
    };

    const handleCancel = () => {
        setAdding(false);
        setEditing(null);
        setForm({
            course_id: '',
            student_count: '',
            weeks_needed: '',
            sessions_per_week: '',
            duration_per_session: '',
        });
    };

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-800">Khóa Học</h2>
                <button
                    onClick={() => setAdding(true)}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-600"
                >
                    <Plus size={20} /> Thêm
                </button>
            </div>

            {(adding || editing) && (
                <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                    <div className="grid grid-cols-2 gap-3 mb-3">
                        <input
                            type="number"
                            placeholder="Course ID"
                            value={form.course_id}
                            onChange={(e) =>
                                setForm({ ...form, course_id: e.target.value })
                            }
                            className="border rounded px-3 py-2"
                        />
                        <input
                            type="number"
                            placeholder="Số sinh viên"
                            value={form.student_count}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    student_count: e.target.value,
                                })
                            }
                            className="border rounded px-3 py-2"
                        />
                        <input
                            type="number"
                            placeholder="Số tuần"
                            value={form.weeks_needed}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    weeks_needed: e.target.value,
                                })
                            }
                            className="border rounded px-3 py-2"
                        />
                        <input
                            type="number"
                            placeholder="Buổi/tuần"
                            value={form.sessions_per_week}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    sessions_per_week: e.target.value,
                                })
                            }
                            className="border rounded px-3 py-2"
                        />
                        <input
                            type="number"
                            placeholder="Giờ/buổi"
                            value={form.duration_per_session}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    duration_per_session: e.target.value,
                                })
                            }
                            className="border rounded px-3 py-2"
                        />
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={handleSave}
                            className="bg-green-500 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-green-600"
                        >
                            <Check size={18} /> Lưu
                        </button>
                        <button
                            onClick={handleCancel}
                            className="bg-gray-500 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-gray-600"
                        >
                            <X size={18} /> Hủy
                        </button>
                    </div>
                </div>
            )}

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="px-4 py-2 text-left">ID</th>
                            <th className="px-4 py-2 text-left">Course ID</th>
                            <th className="px-4 py-2 text-left">SV</th>
                            <th className="px-4 py-2 text-left">Tuần</th>
                            <th className="px-4 py-2 text-left">Buổi/tuần</th>
                            <th className="px-4 py-2 text-left">Giờ/buổi</th>
                            <th className="px-4 py-2 text-left">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {courses.map((course) => (
                            <tr
                                key={course.id}
                                className="border-b hover:bg-gray-50"
                            >
                                <td className="px-4 py-2">{course.id}</td>
                                <td className="px-4 py-2">
                                    {course.course_id}
                                </td>
                                <td className="px-4 py-2">
                                    {course.student_count}
                                </td>
                                <td className="px-4 py-2">
                                    {course.weeks_needed}
                                </td>
                                <td className="px-4 py-2">
                                    {course.sessions_per_week}
                                </td>
                                <td className="px-4 py-2">
                                    {course.duration_per_session}
                                </td>
                                <td className="px-4 py-2">
                                    <button
                                        onClick={() => startEdit(course)}
                                        className="text-blue-500 mr-2 hover:text-blue-700"
                                    >
                                        <Edit2 size={18} />
                                    </button>
                                    <button
                                        onClick={() => deleteCourse(course.id)}
                                        className="text-red-500 hover:text-red-700"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// Teacher Component
const TeacherManager = () => {
    const { teachers, addTeacher, updateTeacher, deleteTeacher } =
        useInputStore();
    const [editing, setEditing] = useState(null);
    const [adding, setAdding] = useState(false);
    const [form, setForm] = useState({ name: '', can_teach_courses: '' });

    const handleSave = () => {
        const data = {
            name: form.name,
            can_teach_courses: form.can_teach_courses
                .split(',')
                .map((c) => parseInt(c.trim()))
                .filter((c) => !isNaN(c)),
        };

        if (editing) {
            updateTeacher(editing, data);
            setEditing(null);
        } else {
            addTeacher(data);
            setAdding(false);
        }
        setForm({ name: '', can_teach_courses: '' });
    };

    const startEdit = (teacher) => {
        setEditing(teacher.id);
        setForm({
            name: teacher.name,
            can_teach_courses: teacher.can_teach_courses.join(', '),
        });
    };

    const handleCancel = () => {
        setAdding(false);
        setEditing(null);
        setForm({ name: '', can_teach_courses: '' });
    };

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-800">Giáo Viên</h2>
                <button
                    onClick={() => setAdding(true)}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-600"
                >
                    <Plus size={20} /> Thêm
                </button>
            </div>

            {(adding || editing) && (
                <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                    <div className="grid grid-cols-1 gap-3 mb-3">
                        <input
                            type="text"
                            placeholder="Tên giáo viên"
                            value={form.name}
                            onChange={(e) =>
                                setForm({ ...form, name: e.target.value })
                            }
                            className="border rounded px-3 py-2"
                        />
                        <input
                            type="text"
                            placeholder="Course IDs (phân cách bằng dấu phẩy)"
                            value={form.can_teach_courses}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    can_teach_courses: e.target.value,
                                })
                            }
                            className="border rounded px-3 py-2"
                        />
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={handleSave}
                            className="bg-green-500 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-green-600"
                        >
                            <Check size={18} /> Lưu
                        </button>
                        <button
                            onClick={handleCancel}
                            className="bg-gray-500 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-gray-600"
                        >
                            <X size={18} /> Hủy
                        </button>
                    </div>
                </div>
            )}

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="px-4 py-2 text-left">ID</th>
                            <th className="px-4 py-2 text-left">Tên</th>
                            <th className="px-4 py-2 text-left">Có thể dạy</th>
                            <th className="px-4 py-2 text-left">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {teachers.map((teacher) => (
                            <tr
                                key={teacher.id}
                                className="border-b hover:bg-gray-50"
                            >
                                <td className="px-4 py-2">{teacher.id}</td>
                                <td className="px-4 py-2">{teacher.name}</td>
                                <td className="px-4 py-2">
                                    {teacher.can_teach_courses.join(', ')}
                                </td>
                                <td className="px-4 py-2">
                                    <button
                                        onClick={() => startEdit(teacher)}
                                        className="text-blue-500 mr-2 hover:text-blue-700"
                                    >
                                        <Edit2 size={18} />
                                    </button>
                                    <button
                                        onClick={() =>
                                            deleteTeacher(teacher.id)
                                        }
                                        className="text-red-500 hover:text-red-700"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// Room Component
const RoomManager = () => {
    const { rooms, addRoom, updateRoom, deleteRoom } = useInputStore();
    const [editing, setEditing] = useState(null);
    const [adding, setAdding] = useState(false);
    const [form, setForm] = useState({ name: '', capacity: '' });

    const handleSave = () => {
        const data = { name: form.name, capacity: parseInt(form.capacity) };

        if (editing) {
            updateRoom(editing, data);
            setEditing(null);
        } else {
            addRoom(data);
            setAdding(false);
        }
        setForm({ name: '', capacity: '' });
    };

    const startEdit = (room) => {
        setEditing(room.id);
        setForm({ name: room.name, capacity: room.capacity });
    };

    const handleCancel = () => {
        setAdding(false);
        setEditing(null);
        setForm({ name: '', capacity: '' });
    };

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-800">Phòng Học</h2>
                <button
                    onClick={() => setAdding(true)}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-600"
                >
                    <Plus size={20} /> Thêm
                </button>
            </div>

            {(adding || editing) && (
                <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                    <div className="grid grid-cols-2 gap-3 mb-3">
                        <input
                            type="text"
                            placeholder="Tên phòng"
                            value={form.name}
                            onChange={(e) =>
                                setForm({ ...form, name: e.target.value })
                            }
                            className="border rounded px-3 py-2"
                        />
                        <input
                            type="number"
                            placeholder="Sức chứa"
                            value={form.capacity}
                            onChange={(e) =>
                                setForm({ ...form, capacity: e.target.value })
                            }
                            className="border rounded px-3 py-2"
                        />
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={handleSave}
                            className="bg-green-500 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-green-600"
                        >
                            <Check size={18} /> Lưu
                        </button>
                        <button
                            onClick={handleCancel}
                            className="bg-gray-500 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-gray-600"
                        >
                            <X size={18} /> Hủy
                        </button>
                    </div>
                </div>
            )}

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="px-4 py-2 text-left">ID</th>
                            <th className="px-4 py-2 text-left">Tên phòng</th>
                            <th className="px-4 py-2 text-left">Sức chứa</th>
                            <th className="px-4 py-2 text-left">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rooms.map((room) => (
                            <tr
                                key={room.id}
                                className="border-b hover:bg-gray-50"
                            >
                                <td className="px-4 py-2">{room.id}</td>
                                <td className="px-4 py-2">{room.name}</td>
                                <td className="px-4 py-2">{room.capacity}</td>
                                <td className="px-4 py-2">
                                    <button
                                        onClick={() => startEdit(room)}
                                        className="text-blue-500 mr-2 hover:text-blue-700"
                                    >
                                        <Edit2 size={18} />
                                    </button>
                                    <button
                                        onClick={() => deleteRoom(room.id)}
                                        className="text-red-500 hover:text-red-700"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// Semester Config Component
const SemesterConfig = () => {
    const { semester_config, updateSemesterConfig } = useInputStore();
    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState(semester_config);

    const handleSave = () => {
        updateSemesterConfig({
            start_week: parseInt(form.start_week),
            end_week: parseInt(form.end_week),
            max_concurrent_courses: parseInt(form.max_concurrent_courses),
        });
        setEditing(false);
    };

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-800">
                    Cấu Hình Học Kỳ
                </h2>
                {!editing && (
                    <button
                        onClick={() => {
                            setEditing(true);
                            setForm(semester_config);
                        }}
                        className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-600"
                    >
                        <Edit2 size={20} /> Sửa
                    </button>
                )}
            </div>

            {editing ? (
                <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="grid grid-cols-3 gap-3 mb-3">
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Tuần bắt đầu
                            </label>
                            <input
                                type="number"
                                value={form.start_week}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        start_week: e.target.value,
                                    })
                                }
                                className="border rounded px-3 py-2 w-full"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Tuần kết thúc
                            </label>
                            <input
                                type="number"
                                value={form.end_week}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        end_week: e.target.value,
                                    })
                                }
                                className="border rounded px-3 py-2 w-full"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Khóa tối đa
                            </label>
                            <input
                                type="number"
                                value={form.max_concurrent_courses}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        max_concurrent_courses: e.target.value,
                                    })
                                }
                                className="border rounded px-3 py-2 w-full"
                            />
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={handleSave}
                            className="bg-green-500 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-green-600"
                        >
                            <Check size={18} /> Lưu
                        </button>
                        <button
                            onClick={() => {
                                setEditing(false);
                                setForm(semester_config);
                            }}
                            className="bg-gray-500 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-gray-600"
                        >
                            <X size={18} /> Hủy
                        </button>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                        <p className="text-sm text-gray-600">Tuần bắt đầu</p>
                        <p className="text-2xl font-bold text-blue-600">
                            {semester_config.start_week}
                        </p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg">
                        <p className="text-sm text-gray-600">Tuần kết thúc</p>
                        <p className="text-2xl font-bold text-green-600">
                            {semester_config.end_week}
                        </p>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-lg">
                        <p className="text-sm text-gray-600">Khóa học tối đa</p>
                        <p className="text-2xl font-bold text-purple-600">
                            {semester_config.max_concurrent_courses}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

const InputTaking = () => {
    const [activeTab, setActiveTab] = useState('courses');

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-4xl font-bold text-gray-900 mb-6">
                    Hệ Thống Quản Lý Khóa Học
                </h1>

                <div className="flex gap-2 mb-6">
                    <button
                        onClick={() => setActiveTab('courses')}
                        className={`px-6 py-3 rounded-lg font-medium transition ${activeTab === 'courses' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                    >
                        Khóa Học
                    </button>
                    <button
                        onClick={() => setActiveTab('teachers')}
                        className={`px-6 py-3 rounded-lg font-medium transition ${activeTab === 'teachers' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                    >
                        Giáo Viên
                    </button>
                    <button
                        onClick={() => setActiveTab('rooms')}
                        className={`px-6 py-3 rounded-lg font-medium transition ${activeTab === 'rooms' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                    >
                        Phòng Học
                    </button>
                    <button
                        onClick={() => setActiveTab('config')}
                        className={`px-6 py-3 rounded-lg font-medium transition ${activeTab === 'config' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                    >
                        Cấu Hình
                    </button>
                </div>

                <div>
                    {activeTab === 'courses' && <CourseManager />}
                    {activeTab === 'teachers' && <TeacherManager />}
                    {activeTab === 'rooms' && <RoomManager />}
                    {activeTab === 'config' && <SemesterConfig />}
                </div>
            </div>
        </div>
    );
};

export {
    CourseManager,
    TeacherManager,
    RoomManager,
    SemesterConfig,
    InputTaking,
};
