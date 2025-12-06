import {create} from 'zustand';

const useSchedulerStore = create((set) => ({
    // --- DATA ---
// courses: [
    //     {
    //         id: 1,
    //         course_id: 101,
    //         student_count: 50,
    //         weeks_needed: 4,
    //         sessions_per_week: 2,
    //         duration_per_session: 2,
    //     },
    //     {
    //         id: 2,
    //         course_id: 102,
    //         student_count: 40,
    //         weeks_needed: 3,
    //         sessions_per_week: 2,
    //         duration_per_session: 2,
    //     },
    //     {
    //         id: 3,
    //         course_id: 103,
    //         student_count: 60,
    //         weeks_needed: 5,
    //         sessions_per_week: 3,
    //         duration_per_session: 2,
    //     },
    //     {
    //         id: 4,
    //         course_id: 104,
    //         student_count: 45,
    //         weeks_needed: 4,
    //         sessions_per_week: 2,
    //         duration_per_session: 2,
    //     },
    //     {
    //         id: 5,
    //         course_id: 105,
    //         student_count: 50,
    //         weeks_needed: 3,
    //         sessions_per_week: 2,
    //         duration_per_session: 2,
    //     },
    //     {
    //         id: 6,
    //         course_id: 106,
    //         student_count: 35,
    //         weeks_needed: 4,
    //         sessions_per_week: 2,
    //         duration_per_session: 2,
    //     },
    //     {
    //         id: 7,
    //         course_id: 107,
    //         student_count: 55,
    //         weeks_needed: 5,
    //         sessions_per_week: 3,
    //         duration_per_session: 2,
    //     },
    // ],
    //
    // teachers: [
    //     { id: 1, name: 'Teacher A', can_teach_courses: [101, 102] },
    //     { id: 2, name: 'Teacher B', can_teach_courses: [102, 103, 104] },
    //     { id: 3, name: 'Teacher C', can_teach_courses: [104, 105, 106] },
    //     { id: 4, name: 'Teacher D', can_teach_courses: [106, 107] },
    // ],
    //
    // rooms: [
    //     { id: 1, name: 'Room 101', capacity: 60 },
    //     { id: 2, name: 'Room 102', capacity: 50 },
    //     { id: 3, name: 'Room 103', capacity: 40 },
    //     { id: 4, name: 'Room 201', capacity: 70 },
    // ],

    courses: [],
    teachers: [],
    rooms: [],
    equipments: [],
    days: [],
    timeslots: [],
    semesters: [],
    classes: [],
    buildings: [],
    faculties: [],
    constraints: [],
    roomEquipments: [],
    subjectRequiresEquipment: [],
    courseClasses: [],

    selected_courses: [], //ids of selected courses for scheduling
    selected_teachers: [],  //id of selected teacher for scheduling
    selected_rooms: [],
    selected_semester: null,
    schedules: {},

    selected_constraints: [],

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

    subjects: [],


    semester_config: {
        max_concurrent_courses: 4,
        start_week: 1,
        end_week: 15,
        sessions_per_day: 14,
        session_duration: 4,
        days_per_week: 6
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
                    c.id === id ? {...c, ...course} : c
                ),
            })),

        setCourses: (courses) =>
            set(() => ({
                courses: courses,
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
                    t.id === id ? {...t, ...teacher} : t
                ),
            })),

        setTeachers: (teachers) =>
            set(() => ({
                teachers: teachers,
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
                    r.id === id ? {...r, ...room} : r
                ),
            })),

        setRooms: (rooms) =>
            set(() => ({
                rooms: rooms,
            })),

        deleteRoom: (id) =>
            set((state) => ({
                rooms: state.rooms.filter((r) => r.id !== id),
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
        selectCourse: (course) => {
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

        setSchedules: (schedules) =>
            set(() => ({
                schedules: schedules,
            })),
        setSelectedSemester: (semester) =>
            set(() => ({
                selected_semester: semester,
            })),

        setSemesters: (semesters) =>
            set(() => ({
                semesters: semesters,
            })),

        //update field in semester_config
        updateSemesterConfig: (config) =>
            set((state) => ({
                semester_config: {
                    ...state.semester_config,
                    ...config,
                },
            })),

        addConstraint: (constraint) => {
            if (!constraint) return;

            set((state) => {
                // tránh trùng id
                const exists = state.selected_constraints.some(c => c.id === constraint.id);
                if (exists) return state;

                return {
                    selected_constraints: [...state.selected_constraints, constraint],
                };
            });
        },

        removeConstraint: (constraintId) => {
            set((state) => ({
                selected_constraints: state.selected_constraints.filter(
                    (c) => c.id !== constraintId
                ),
            }));
        },

        setSelectedConstraints: (constraints) =>
            set(() => ({
                selected_constraints: Array.isArray(constraints) ? constraints : [],
            })),


        setBuildings: (buildings) =>
            set(() => ({
                buildings: buildings,
            })),

        setFaculties: (faculties) =>
            set(() => ({
                faculties: faculties,
            })),

        setClasses: (classes) =>
            set(() => ({
                classes: classes,
            })),

        setDays: (days) =>
            set(() => ({
                days: days,
            })),

        setTimeslots: (timeslots) =>
            set(() => ({
                timeslots: timeslots,
            })),

        setEquipments: (equipments) =>
            set(() => ({
                equipments: equipments,
            })),

        setConstraints: (constraints) =>
            set(() => ({
                constraints: constraints,
            })),
        setSubjects: (subjects) =>
            set(() => ({
                subjects: subjects,
            })),

        setRoomEquipments: (roomEquipments) =>
            set(() => ({
                roomEquipments: roomEquipments,
            })),

        setSubjectRequiresEquipment: (subjectRequiresEquipment) =>
            set(() => ({
                subjectRequiresEquipment: subjectRequiresEquipment,
            })),

        setCourseClasses: (courseClasses) =>
            set(() => ({
                courseClasses: courseClasses,
            })),

    }

}));
export const useCourses = () => useSchedulerStore((state) => state.courses);
export const useTeachers = () => useSchedulerStore((state) => state.teachers);
export const useRooms = () => useSchedulerStore((state) => state.rooms);
export const useSelectedConstraints = () => useSchedulerStore((state) => state.selected_constraints);
export const useConstraints = () => useSchedulerStore((state) => state.constraints);
export const useSemesterConfig = () =>
    useSchedulerStore((state) => state.semester_config);
export const useSchedules = () => useSchedulerStore((state) => state.schedules);
export const useDepartments = () =>
    useSchedulerStore((state) => state.departments);
export const useSubjects = () => useSchedulerStore((state) => state.subjects);
export const useSemesters = () => useSchedulerStore((state) => state.semesters);
export const useGAConfig = () => useSchedulerStore((state) => state.ga_config);
export const useSelectedCourses = () => useSchedulerStore((state) => state.selected_courses);
export const useSelectedTeachers = () => useSchedulerStore((state) => state.selected_teachers);
export const useSelectedRooms = () => useSchedulerStore((state) => state.selected_rooms);
export const useSelectedSemester = () => useSchedulerStore((state) => state.selected_semester);
export const useEquipments = () => useSchedulerStore((state) => state.equipments);
export const useDays = () => useSchedulerStore((state) => state.days);
export const useTimeslots = () => useSchedulerStore((state) => state.timeslots);
export const useBuildings = () => useSchedulerStore((state) => state.buildings);
export const useFaculties = () => useSchedulerStore((state) => state.faculties);
export const useClasses = () => useSchedulerStore((state) => state.classes);
export const useRoomEquipments = () => useSchedulerStore((state) => state.roomEquipments);
export const useSubjectRequiresEquipment = () => useSchedulerStore((state) => state.subjectRequiresEquipment);
export const useCourseClasses = () => useSchedulerStore((state) => state.courseClasses);

export const useSchedulingActions = () =>
    useSchedulerStore((state) => state.actions);
export const setCourses = (courses) =>
    useSchedulerStore.getState().actions.setCourses(courses);
export const setTeachers = (teachers) =>
    useSchedulerStore.getState().actions.setTeachers(teachers);
export const setRooms = (rooms) =>
    useSchedulerStore.getState().actions.setRooms(rooms);
export default useSchedulerStore;
export const setSchedules = (schedules) =>
    useSchedulerStore.getState().actions.setSchedules(schedules);
export const setSelectedSemester = (semester) =>
    useSchedulerStore.getState().actions.setSelectedSemester(semester);
export const setSemesters = (semesters) =>
    useSchedulerStore.getState().actions.setSemesters(semesters);
export const updateSemesterConfig = (config) =>
    useSchedulerStore.getState().actions.updateSemesterConfig(config);
export const addConstraint = (constraint) =>
    useSchedulerStore.getState().actions.addConstraint(constraint);
export const removeConstraint = (constraintId) =>
    useSchedulerStore.getState().actions.removeConstraint(constraintId);
export const setSelectedConstraints = (constraints) =>
    useSchedulerStore.getState().actions.setSelectedConstraints(constraints);
export const setBuildings = (buildings) =>
    useSchedulerStore.getState().actions.setBuildings(buildings);
export const setFaculties = (faculties) =>
    useSchedulerStore.getState().actions.setFaculties(faculties);
export const setClasses = (classes) =>
    useSchedulerStore.getState().actions.setClasses(classes);
export const setDays = (days) =>
    useSchedulerStore.getState().actions.setDays(days);
export const setTimeslots = (timeslots) =>
    useSchedulerStore.getState().actions.setTimeslots(timeslots);
export const setEquipments = (equipments) =>
    useSchedulerStore.getState().actions.setEquipments(equipments);
export const setConstraints = (constraints) =>
    useSchedulerStore.getState().actions.setConstraints(constraints);
export const setSubjects = (subjects) =>
    useSchedulerStore.getState().actions.setSubjects(subjects);
export const setRoomEquipments = (roomEquipments) =>
    useSchedulerStore.getState().actions.setRoomEquipments(roomEquipments);
export const setSubjectRequiresEquipment = (subjectRequiresEquipment) =>
    useSchedulerStore.getState().actions.setSubjectRequiresEquipment(subjectRequiresEquipment);
export const setCourseClasses = (courseClasses) =>
    useSchedulerStore.getState().actions.setCourseClasses(courseClasses);