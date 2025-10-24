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
    selected_courses: [], //ids of selected courses for scheduling
    selected_teachers: [],  //id of selected teacher for scheduling
    selected_rooms: [],



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



    semester_config: {
        start_week: 1,
        end_week: 15,
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
        // ====== SELECTED COURSES ACTIONS ======
        /**
         * Thêm một khóa học vào danh sách được chọn.
         * @param {Object} course - Object khóa học (phải có id).
         */
        selectCourse: (course) =>{
            console.log("Selecting course:", course);
            set((state) => {
                if (!state.selected_courses.some((c) => c.id === course.id)) {
                    return {
                        selected_courses: [...state.selected_courses, course],
                    };
                }
                return state; // Không thay đổi nếu đã tồn tại
            })
        },

        /**
         * Xóa một khóa học khỏi danh sách được chọn.
         * @param {number} courseId - ID của khóa học.
         */
        unselectCourse: (courseId) =>
            set((state) => ({
                selected_courses: state.selected_courses.filter(
                    (course) => course.id !== courseId
                ),
            })),

        /**
         * Đặt lại danh sách các khóa học được chọn thành rỗng.
         */
        clearSelectedCourses: () =>
            set(() => ({
                selected_courses: [],
            })),

// ====== SELECTED TEACHERS ACTIONS ======
        /**
         * Thêm một giáo viên vào danh sách được chọn.
         * @param {Object} teacher - Object giáo viên (phải có id).
         */
        selectTeacher: (teacher) =>
            set((state) => {
                if (!state.selected_teachers.some((t) => t.id === teacher.id)) {
                    return {
                        selected_teachers: [...state.selected_teachers, teacher],
                    };
                }
                return state;
            }),

        /**
         * Xóa một giáo viên khỏi danh sách được chọn.
         * @param {number} teacherId - ID của giáo viên.
         */
        unselectTeacher: (teacherId) =>
            set((state) => ({
                selected_teachers: state.selected_teachers.filter(
                    (teacher) => teacher.id !== teacherId
                ),
            })),

        /**
         * Đặt lại danh sách các giáo viên được chọn thành rỗng.
         */
        clearSelectedTeachers: () =>
            set(() => ({
                selected_teachers: [],
            })),

// ====== SELECTED ROOMS ACTIONS ======
        /**
         * Thêm một phòng học vào danh sách được chọn.
         * @param {Object} room - Object phòng học (phải có id).
         */
        selectRoom: (room) =>
            set((state) => {
                if (!state.selected_rooms.some((r) => r.id === room.id)) {
                    return {
                        selected_rooms: [...state.selected_rooms, room],
                    };
                }
                return state;
            }),

        /**
         * Xóa một phòng học khỏi danh sách được chọn.
         * @param {number} roomId - ID của phòng học.
         */
        unselectRoom: (roomId) =>
            set((state) => ({
                selected_rooms: state.selected_rooms.filter(
                    (room) => room.id !== roomId
                ),
            })),

        /**
         * Đặt lại danh sách các phòng học được chọn thành rỗng.
         */
        clearSelectedRooms: () =>
            set(() => ({
                selected_rooms: [],
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

export const useGAConfig = () => useSchedulerStore((state) => state.ga_config);
export const useSelectedCourses = () => useSchedulerStore((state) => state.selected_courses);
export const useSelectedTeachers = () => useSchedulerStore((state) => state.selected_teachers);
export const useSelectedRooms = () => useSchedulerStore((state) => state.selected_rooms);


export const useSchedulingActions = () =>
    useSchedulerStore((state) => state.actions);

export default useSchedulerStore;
