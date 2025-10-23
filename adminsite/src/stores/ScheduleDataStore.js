import { create } from 'zustand';

const useSchedulerStore = create((set) => ({
    // --- DATA ---

    courses: [
        {
            id: 1,
            course_id: 101,
            student_count: 50,
            weeks_needed: 4,
            sessions_per_week: 2,
            duration_per_session: 2,
        },
        {
            id: 2,
            course_id: 102,
            student_count: 40,
            weeks_needed: 3,
            sessions_per_week: 2,
            duration_per_session: 2,
        },
        {
            id: 3,
            course_id: 103,
            student_count: 60,
            weeks_needed: 5,
            sessions_per_week: 3,
            duration_per_session: 2,
        },
        {
            id: 4,
            course_id: 104,
            student_count: 45,
            weeks_needed: 4,
            sessions_per_week: 2,
            duration_per_session: 2,
        },
        {
            id: 5,
            course_id: 105,
            student_count: 50,
            weeks_needed: 3,
            sessions_per_week: 2,
            duration_per_session: 2,
        },
        {
            id: 6,
            course_id: 106,
            student_count: 35,
            weeks_needed: 4,
            sessions_per_week: 2,
            duration_per_session: 2,
        },
        {
            id: 7,
            course_id: 107,
            student_count: 55,
            weeks_needed: 5,
            sessions_per_week: 3,
            duration_per_session: 2,
        },
    ],

    teachers: [
        { id: 1, name: 'Teacher A', can_teach_courses: [101, 102] },
        { id: 2, name: 'Teacher B', can_teach_courses: [102, 103, 104] },
        { id: 3, name: 'Teacher C', can_teach_courses: [104, 105, 106] },
        { id: 4, name: 'Teacher D', can_teach_courses: [106, 107] },
    ],

    rooms: [
        { id: 1, name: 'Room 101', capacity: 60 },
        { id: 2, name: 'Room 102', capacity: 50 },
        { id: 3, name: 'Room 103', capacity: 40 },
        { id: 4, name: 'Room 201', capacity: 70 },
    ],

    semester_config: {
        start_week: 1,
        end_week: 10,
        max_concurrent_courses: 4,
    },

    ga_config: {
        population_size: 50,
        generations: 300,
        crossover_rate: 0.8,
        mutation_rate: 0.2,
        elite_size: 5,
        tournament_size: 3,
    },

    // --- NEW DATA (from sampleData) ---
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

    // --- ACTIONS ---
    actions: {
        // ====== COURSES ======
        addCourse: (course) =>
            set((state) => ({
                courses: [
                    ...state.courses,
                    {
                        ...course,
                        id: Math.max(...state.courses.map((c) => c.id), 0) + 1,
                    },
                ],
            })),

        updateCourse: (id, course) =>
            set((state) => ({
                courses: state.courses.map((c) =>
                    c.id === id ? { ...c, ...course } : c
                ),
            })),

        deleteCourse: (id) =>
            set((state) => ({
                courses: state.courses.filter((c) => c.id !== id),
            })),

        // ====== TEACHERS ======
        addTeacher: (teacher) =>
            set((state) => ({
                teachers: [
                    ...state.teachers,
                    {
                        ...teacher,
                        id: Math.max(...state.teachers.map((t) => t.id), 0) + 1,
                    },
                ],
            })),

        updateTeacher: (id, teacher) =>
            set((state) => ({
                teachers: state.teachers.map((t) =>
                    t.id === id ? { ...t, ...teacher } : t
                ),
            })),

        deleteTeacher: (id) =>
            set((state) => ({
                teachers: state.teachers.filter((t) => t.id !== id),
            })),

        // ====== ROOMS ======
        addRoom: (room) =>
            set((state) => ({
                rooms: [
                    ...state.rooms,
                    {
                        ...room,
                        id: Math.max(...state.rooms.map((r) => r.id), 0) + 1,
                    },
                ],
            })),

        updateRoom: (id, room) =>
            set((state) => ({
                rooms: state.rooms.map((r) =>
                    r.id === id ? { ...r, ...room } : r
                ),
            })),

        deleteRoom: (id) =>
            set((state) => ({
                rooms: state.rooms.filter((r) => r.id !== id),
            })),

        // ====== DEPARTMENTS ======
        addDepartment: (dept) =>
            set((state) => ({
                departments: [
                    ...state.departments,
                    {
                        ...dept,
                        id:
                            Math.max(...state.departments.map((d) => d.id), 0) +
                            1,
                    },
                ],
            })),

        updateDepartment: (id, dept) =>
            set((state) => ({
                departments: state.departments.map((d) =>
                    d.id === id ? { ...d, ...dept } : d
                ),
            })),

        deleteDepartment: (id) =>
            set((state) => ({
                departments: state.departments.filter((d) => d.id !== id),
            })),

        // ====== SCHOOLS ======
        addSchool: (school) =>
            set((state) => ({
                schools: [...state.schools, school],
            })),

        deleteSchool: (school) =>
            set((state) => ({
                schools: state.schools.filter((s) => s !== school),
            })),

        // ====== SUBJECTS ======
        addSubject: (subject) =>
            set((state) => ({
                subjects: [...state.subjects, subject],
            })),

        deleteSubject: (subject) =>
            set((state) => ({
                subjects: state.subjects.filter((s) => s !== subject),
            })),
    },
}));
export const useCourses = () => useSchedulerStore((state) => state.courses);
export const useTeachers = () => useSchedulerStore((state) => state.teachers);
export const useRooms = () => useSchedulerStore((state) => state.rooms);
export const useSemesterConfig = () =>
    useSchedulerStore((state) => state.semester_config);
export const useDepartments = () =>
    useSchedulerStore((state) => state.departments);
export const useSchools = () => useSchedulerStore((state) => state.schools);
export const useSubjects = () => useSchedulerStore((state) => state.subjects);
export const useSchedulingActions = () =>
    useSchedulerStore((state) => state.actions);
export const useGAConfig = () => useSchedulerStore((state) => state.ga_config);
export default useSchedulerStore;
