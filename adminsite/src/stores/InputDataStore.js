import { create } from 'zustand';

const useInputStore = create((set) => ({
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
        end_week: 15,
        max_concurrent_courses: 4,
    },

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

    updateSemesterConfig: (config) => set({ semester_config: config }),
}));

export default useInputStore;

// import { create } from 'zustand';
//
// // Store chính
// const timetableStore = create((set) => ({
//     // --- STATE ---
//     courses: [
//         {
//             id: 1,
//             course_id: 101,
//             student_count: 50,
//             weeks_needed: 4,
//             sessions_per_week: 2,
//             duration_per_session: 2,
//         },
//         {
//             id: 2,
//             course_id: 102,
//             student_count: 40,
//             weeks_needed: 3,
//             sessions_per_week: 2,
//             duration_per_session: 2,
//         },
//         {
//             id: 3,
//             course_id: 103,
//             student_count: 60,
//             weeks_needed: 5,
//             sessions_per_week: 3,
//             duration_per_session: 2,
//         },
//         {
//             id: 4,
//             course_id: 104,
//             student_count: 45,
//             weeks_needed: 4,
//             sessions_per_week: 2,
//             duration_per_session: 2,
//         },
//         {
//             id: 5,
//             course_id: 105,
//             student_count: 50,
//             weeks_needed: 3,
//             sessions_per_week: 2,
//             duration_per_session: 2,
//         },
//         {
//             id: 6,
//             course_id: 106,
//             student_count: 35,
//             weeks_needed: 4,
//             sessions_per_week: 2,
//             duration_per_session: 2,
//         },
//         {
//             id: 7,
//             course_id: 107,
//             student_count: 55,
//             weeks_needed: 5,
//             sessions_per_week: 3,
//             duration_per_session: 2,
//         },
//     ],
//
//     teachers: [
//         { id: 1, name: 'Teacher A', can_teach_courses: [101, 102] },
//         { id: 2, name: 'Teacher B', can_teach_courses: [102, 103, 104] },
//         { id: 3, name: 'Teacher C', can_teach_courses: [104, 105, 106] },
//         { id: 4, name: 'Teacher D', can_teach_courses: [106, 107] },
//     ],
//
//     rooms: [
//         { id: 1, name: 'Room 101', capacity: 60 },
//         { id: 2, name: 'Room 102', capacity: 50 },
//         { id: 3, name: 'Room 103', capacity: 40 },
//         { id: 4, name: 'Room 201', capacity: 70 },
//     ],
//
//     semester_config: {
//         start_week: 1,
//         end_week: 15,
//         max_concurrent_courses: 4,
//     },
//
//     // --- ACTIONS ---
//     actions: {
//         // ====== COURSES ======
//         addCourse: (course) =>
//             set((state) => ({
//                 courses: [
//                     ...state.courses,
//                     {
//                         ...course,
//                         id: Math.max(...state.courses.map((c) => c.id), 0) + 1,
//                     },
//                 ],
//             })),
//
//         updateCourse: (id, course) =>
//             set((state) => ({
//                 courses: state.courses.map((c) =>
//                     c.id === id ? { ...c, ...course } : c
//                 ),
//             })),
//
//         deleteCourse: (id) =>
//             set((state) => ({
//                 courses: state.courses.filter((c) => c.id !== id),
//             })),
//
//         // ====== TEACHERS ======
//         addTeacher: (teacher) =>
//             set((state) => ({
//                 teachers: [
//                     ...state.teachers,
//                     {
//                         ...teacher,
//                         id: Math.max(...state.teachers.map((t) => t.id), 0) + 1,
//                     },
//                 ],
//             })),
//
//         updateTeacher: (id, teacher) =>
//             set((state) => ({
//                 teachers: state.teachers.map((t) =>
//                     t.id === id ? { ...t, ...teacher } : t
//                 ),
//             })),
//
//         deleteTeacher: (id) =>
//             set((state) => ({
//                 teachers: state.teachers.filter((t) => t.id !== id),
//             })),
//
//         // ====== ROOMS ======
//         addRoom: (room) =>
//             set((state) => ({
//                 rooms: [
//                     ...state.rooms,
//                     {
//                         ...room,
//                         id: Math.max(...state.rooms.map((r) => r.id), 0) + 1,
//                     },
//                 ],
//             })),
//
//         updateRoom: (id, room) =>
//             set((state) => ({
//                 rooms: state.rooms.map((r) =>
//                     r.id === id ? { ...r, ...room } : r
//                 ),
//             })),
//
//         deleteRoom: (id) =>
//             set((state) => ({
//                 rooms: state.rooms.filter((r) => r.id !== id),
//             })),
//
//         // ====== SEMESTER CONFIG ======
//         updateSemesterConfig: (config) => set({ semester_config: config }),
//
//         // ====== RESET STORE ======
//         resetStore: () =>
//             set({
//                 courses: [],
//                 teachers: [],
//                 rooms: [],
//                 semester_config: {
//                     start_week: 1,
//                     end_week: 15,
//                     max_concurrent_courses: 4,
//                 },
//             }),
//     },
// }));
//
// // --- Export hooks riêng ---
// export const useCourses = () => timetableStore((state) => state.courses);
// export const useTeachers = () => timetableStore((state) => state.teachers);
// export const useRooms = () => timetableStore((state) => state.rooms);
// export const useSemesterConfig = () =>
//     timetableStore((state) => state.semester_config);
// export const useTimetableActions = () =>
//     timetableStore((state) => state.actions);
//
// export default timetableStore;
