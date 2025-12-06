/**
 * Chuyển đổi chuỗi "2-1, 3-7" thành mảng [[2, 1], [3, 7]]
 */
export const parseBusySlots = (slotsString) => {
    if (!slotsString) return [];
    try {
        return slotsString
            .split(",")
            .map((part) => part.trim())
            .filter((part) => part.includes("-"))
            .map((part) => {
                const [day, slot] = part.split("-");
                return [parseInt(day.trim()), parseInt(slot.trim())];
            })
            .filter((arr) => !isNaN(arr[0]) && !isNaN(arr[1]));
    } catch (error) {
        console.error("Lỗi parse busy slots:", error);
        return [];
    }
};

/**
 * Hàm chính để format dữ liệu cho API
 */
// export const formatDataForApi = (state, data) => {
//     const {
//         selectedRoomIds,
//         selectedTeacherIds,
//         selectedCourseIds,
//         courseParams,
//         teacherBusySlots,
//         semesterConfig,
//     } = state;
//
//     const {allRooms, allTeachers, allCourses} = data;
//
//     // 1. Format Rooms
//     const rooms = allRooms
//         .filter((room) => selectedRoomIds.has(room.id))
//         .map((room) => ({
//             id: room.id,
//             name: room.name,
//             capacity: room.capacity_max, // Sử dụng capacity_max
//         }));
//
//     // 2. Format Teachers
//     const teachers = allTeachers
//         .filter((teacher) => selectedTeacherIds.has(teacher.id))
//         .map((teacher) => ({
//             id: teacher.id,
//             name: teacher.name,
//             busy_slots: parseBusySlots(teacherBusySlots[teacher.id]),
//         }));
//
//     // 3. Format Courses
//     const courses = allCourses
//         .filter((course) => selectedCourseIds.has(course.id))
//         .map((course) => {
//             const params = courseParams[course.id] || {};
//             return {
//                 id: course.id, // ID của chính lớp học phần
//                 course_id: course.subject_id, // ID của môn học (subject)
//                 teacher_id: course.teacher_id,
//                 class_ids: [course.class_id],
//                 student_count: parseInt(course.slot || 0),
//                 weeks_needed: parseInt(course.weeks_needed || 10),
//                 sessions_per_week: parseInt(course.session_per_week || 0),
//                 duration_per_session: parseInt(course.duration_per_session || 0),
//             };
//         });
//
//     // 4. Format Config (thêm start_date)
//     const finalSemesterConfig = {
//         start_date: semesterConfig.start_date,
//         start_week: parseInt(semesterConfig.start_week),
//         end_week: parseInt(semesterConfig.end_week),
//         max_concurrent_courses: parseInt(semesterConfig.max_concurrent_courses),
//     };
//
//     return {
//         rooms,
//         teachers,
//         courses,
//         semester_config: finalSemesterConfig,
//     };
// };
export const formatDataForApi = (state, data) => {
    const {
        selectedRoomIds,
        selectedTeacherIds,
        selectedCourseIds,
        courseParams,
        teacherBusySlots,
        semesterConfig,
    } = state;

    const {
        allRooms,
        allTeachers,
        allCourses,
        allSubjects,
        allSubjectRequirements,
        allEquipments
    } = data;

    // --- HELPER: Tạo Map để tra cứu nhanh ---
    const subjectMap = new Map(allSubjects.map(s => [s.id, s]));

    // Group requirements theo subject_id
    const subjectReqMap = new Map();
    allSubjectRequirements.forEach(req => {
        if (!subjectReqMap.has(req.subject_id)) {
            subjectReqMap.set(req.subject_id, []);
        }
        // Chỉ lấy những thiết bị bắt buộc (REQ) hoặc lấy hết tùy logic của bạn
        if (req.type === 'REQ') {
            subjectReqMap.get(req.subject_id).push(req.equipment_id);
        }
    });

    // 1. Format Equipments (Danh sách thiết bị master)
    // API cần danh sách này để biết tên thiết bị khi trả về kết quả
    const formattedEquipments = allEquipments.map(eq => ({
        id: eq.id,
        name: eq.name
    }));

    // 2. Format Rooms
    const rooms = allRooms
        .filter((room) => selectedRoomIds.has(room.id))
        .map((room) => {
            // Lấy danh sách ID thiết bị có trong phòng
            // Dữ liệu rooms mẫu có mảng 'equipments', trong đó mỗi item có 'id' (là equipment_id)
            // Cần check kỹ cấu trúc: item.id hay item.RoomEquipment.equipment_id?
            // Theo mẫu JSON bạn đưa: item.id trong mảng equipments chính là ID thiết bị (vd: id=1 là Máy chiếu)
            const equipmentIds = room.equipments ? room.equipments.map(e => e.id) : [];

            return {
                id: room.id,
                name: room.name,
                capacity: room.capacity_max, // Dùng sức chứa max
                equipment_ids: equipmentIds,
                building_id: room.buildings_id,
                campus_id: 1 // Default vì data gốc chưa có
            };
        });

    // 3. Format Teachers
    const teachers = allTeachers
        .filter((teacher) => selectedTeacherIds.has(teacher.id))
        .map((teacher) => ({
            id: teacher.id,
            name: teacher.name,
            busy_slots: teacherBusySlots[teacher.id] ? parseBusySlots(teacherBusySlots[teacher.id]) : [],
            should_avoid_slots: [], // Có thể mở rộng UI để nhập liệu sau
            want_slots: [],
            days_off: []
        }));

    // 4. Format Courses
    const courses = allCourses
        .filter((course) => selectedCourseIds.has(course.id))
        .map((course) => {
            const subject = subjectMap.get(course.subject_id) || {};
            const params = courseParams[course.id] || {}; // Lấy tham số override từ UI nếu có

            // Tính toán số tuần học (weeks_needed)
            // Nếu UI không nhập, tự tính: (Lý thuyết + Thực hành) / (Số tiết/buổi * Số buổi/tuần)
            let calculatedWeeks = 15; // Default
            const totalHours = (subject.theory_hours || 0) + (subject.practice_hours || 0);
            const weeklyHours = (course.duration_per_session || 0) * (course.session_per_week || 0);

            if (weeklyHours > 0 && totalHours > 0) {
                calculatedWeeks = Math.ceil(totalHours / weeklyHours);
            }

            // Xác định loại phòng (theory/lab)
            // Logic: Nếu môn học có nhiều giờ thực hành hơn lý thuyết, hoặc tên có chữ "Thực hành" -> Lab
            // (Bạn có thể điều chỉnh logic này tùy đặc thù dữ liệu)
            let courseType = "theory";
            if ((subject.practice_hours > 0 && subject.theory_hours === 0) ||
                (subject.name && subject.name.toLowerCase().includes("thực hành"))) {
                courseType = "lab";
            }

            // Lấy danh sách thiết bị yêu cầu từ bảng subjectrequireequipment
            const reqEquipments = subjectReqMap.get(course.subject_id) || [];

            return {
                id: course.id,
                course_id: course.subject_id, // Mapping subject_id sang course_id của API
                class_ids: [1], // TODO: Data gốc course thiếu class_id, tạm hardcode [1] hoặc lấy từ course.class_id nếu có
                teacher_id: course.teacher_id,
                student_count: parseInt(course.total_enrollment || course.slot || 0), // Ưu tiên total_enrollment
                weeks_needed: parseInt(params.weeks_needed || course.weeks_needed || calculatedWeeks),
                sessions_per_week: parseInt(course.session_per_week || 1),
                duration_per_session: parseInt(course.duration_per_session || 4),
                type: courseType,
                required_equipment_ids: reqEquipments,
                dependency_id: null // Chưa xử lý logic môn tiên quyết
            };
        });

    // 5. Format Config
    const finalSemesterConfig = {
        start_date: semesterConfig.start_date, // Format YYYY-MM-DD
        start_week: parseInt(semesterConfig.start_week || 1),
        end_week: parseInt(semesterConfig.end_week || 15),
        max_concurrent_courses: parseInt(semesterConfig.max_concurrent_courses || 3),
        blocked_slots: [], // Có thể thêm logic cấu hình slot cấm toàn trường
        prime_slots: []    // Có thể thêm logic cấu hình giờ vàng
    };

    return {
        courses,
        teachers,
        rooms,
        equipment: formattedEquipments, // Thêm mục này để API biết tên thiết bị
        semester_config: finalSemesterConfig,
    };
};

// Hàm phụ trợ (giữ nguyên logic cũ của bạn)
// const parseBusySlots = (slots) => {
//     if (!Array.isArray(slots)) return [];
//     // Giả sử slots dạng string "2-1", "2-2" hoặc object {day: 2, period: 1}
//     // Cần convert về dạng mảng số [[2, 1], [2, 2]]
//     return slots.map(slot => {
//         if (typeof slot === 'string') {
//             const [d, p] = slot.split('-').map(Number);
//             return [d, p];
//         }
//         if (Array.isArray(slot)) return slot;
//         return [slot.day, slot.period];
//     });
// };

export const convertConstraintsToAPI = (selectedConstraints) => {
    return selectedConstraints.map(constraint => ({
        name: constraint.code,
        weight: constraint.weight
    }));
};

export const formatToTestData = (
    selectedCourses,
    selectedRooms,
    selectedTeachers,
    semesterConfig,
    constraints
) => {
    // Helper parse busy slots (nếu lưu dạng string "2-1, 2-2")
    const parseBusy = (str) => {
        if (!str) return [];
        if (Array.isArray(str)) return str; // Nếu đã là array thì trả về luôn
        return str.split(',').map(s => {
            const [d, p] = s.trim().split('-');
            return [parseInt(d), parseInt(p)];
        });
    };

    return {
        courses: selectedCourses.map(c => ({
            id: c.id,
            course_id: c.subject_id, // Mapping subject_id sang course_id theo format cũ
            class_ids: [c.class_id],
            teacher_id: c.teacher_id,
            student_count: c.slot || 0, // Lưu ý: check lại field này trong DB của bạn là slot hay student_count
            weeks_needed: c.weeks_needed || 15, // Default nếu null
            sessions_per_week: c.session_per_week || 1,
            duration_per_session: c.duration_per_session || 2,
            type: c.type || "theory",
            required_equipment_ids: c.required_equipment_ids || [], // Cần bổ sung field này vào data nguồn
            dependency_id: c.dependency_id || null
        })),
        teachers: selectedTeachers.map(t => ({
            id: t.id,
            name: t.name,
            busy_slots: parseBusy(t.busy_slots),
            should_avoid_slots: [], // Có thể map thêm nếu có
            want_slots: [],
            days_off: t.days_off || []
        })),
        rooms: selectedRooms.map(r => ({
            id: r.id,
            name: r.name,
            capacity: r.capacity_max,
            equipment_ids: r.equipments ? r.equipments.map(e => e.id) : [],
            building_id: r.buildings_id,
            campus_id: 1 // Default hoặc lấy từ building
        })),
        semester_config: {
            start_week: parseInt(semesterConfig.start_week),
            end_week: parseInt(semesterConfig.end_week),
            max_concurrent_courses: parseInt(semesterConfig.max_concurrent_courses || 3),
            blocked_slots: parseBusy(semesterConfig.blocked_slots || ""),
            prime_slots: [] // Có thể cấu hình thêm
        },
        constraints: constraints.map(c => ({
            name: c.code || c.name,
            weight: c.weight
        }))
    };
};