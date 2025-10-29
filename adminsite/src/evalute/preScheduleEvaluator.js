/**
 * preScheduleEvaluator.js
 * Module phân tích và đánh giá khả thi trước khi xếp thời khóa biểu
 * Pure Node.js - Không cần database
 *
 * @author: Advanced Node.js Architect
 * @version: 1.0.0
 */

// ============================================================================
// CONSTANTS & CONFIGURATION
// ============================================================================

const DAYS = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'CN'];
const PERIODS = 12; // Số tiết trong 1 ngày
const TOTAL_SLOTS_PER_WEEK = DAYS.length * PERIODS;

// Ngưỡng heuristic cho các cảnh báo
const OVERLOAD_THRESHOLD = 0.6; // 60% tổng slots
const HIGH_WEEKLY_HOURS = 6; // Giờ/tuần cao bất thường
const MIN_COVERAGE = 2; // Độ bao phủ tối thiểu an toàn

// ============================================================================
// MAIN EVALUATION FUNCTION
// ============================================================================

/**
 * Hàm chính đánh giá toàn bộ dữ liệu đầu vào
 * @param {Object} data - Dữ liệu đầu vào với courses, teachers, rooms, departments
 * @returns {Object} - JSON cấu trúc với tất cả chỉ số phân tích
 */
export function evaluatePreSchedule(data) {
    // Defensive programming: kiểm tra dữ liệu đầu vào
    const courses = data.courses || [];
    const teachers = data.teachers || [];
    const rooms = data.rooms || [];
    const departments = data.departments || [];
    const semesterConfig = data.semester_config || { start_week: 1, end_week: 15, max_concurrent_courses: 4 };

    // Tính toán từng phần
    const overview = calculateOverview(courses, teachers, rooms, departments, semesterConfig);
    const byCourse = analyzeCourses(courses, teachers, rooms);
    const byTeacher = analyzeTeachers(teachers, courses);
    const byRoom = analyzeRooms(rooms, courses);
    const byDepartment = analyzeDepartments(departments);
    const feasibility = computeFeasibility(courses, teachers, rooms, byCourse, byTeacher, semesterConfig);
    const advancedMetrics = computeAdvancedMetrics(courses, teachers, rooms, byCourse, byTeacher);
    const warnings = generateWarnings(byCourse, byTeacher, byRoom, feasibility);

    return {
        timestamp: new Date().toISOString(),
        overview,
        byCourse,
        byTeacher,
        byRoom,
        byDepartment,
        feasibility,
        advancedMetrics,
        warnings,
        metadata: {
            note: 'Phân tích dựa trên dữ liệu tĩnh không có ràng buộc availability cụ thể',
            assumptions: [
                'Giả định phân bố đều các sessions trong tuần',
                'Không có ràng buộc cứng về thời gian cụ thể',
                'Room capacity là ràng buộc duy nhất cho phòng học',
                'Teacher availability giả định là toàn thời gian'
            ]
        }
    };
}

// ============================================================================
// OVERVIEW CALCULATION
// ============================================================================

/**
 * Tính toán tổng quan hệ thống
 */
function calculateOverview(courses, teachers, rooms, departments, semesterConfig) {
    const totalCourses = courses.length;
    const totalTeachers = teachers.length;
    const totalRooms = rooms.length;
    const totalDepartments = departments.length;

    // Tổng số lớp từ tất cả departments
    const totalClasses = departments.reduce((sum, dept) =>
        sum + (dept.classes ? dept.classes.length : 0), 0);

    // Tổng giờ học hàng tuần cần thiết
    // Formula: Σ (sessions_per_week × duration_per_session)
    const totalWeeklyHoursNeeded = courses.reduce((sum, course) =>
        sum + (course.sessions_per_week || 0) * (course.duration_per_session || 0), 0);

    // Tổng số sessions hàng tuần
    const totalWeeklySessionsNeeded = courses.reduce((sum, course) =>
        sum + (course.sessions_per_week || 0), 0);

    // Tỷ lệ sử dụng = giờ cần / tổng slots có sẵn
    const utilizationRatio = totalWeeklyHoursNeeded / TOTAL_SLOTS_PER_WEEK;

    // Trung bình sinh viên mỗi khóa học
    const avgStudentsPerCourse = totalCourses > 0
        ? courses.reduce((sum, c) => sum + (c.student_count || 0), 0) / totalCourses
        : 0;

    return {
        totalCourses,
        totalTeachers,
        totalRooms,
        totalDepartments,
        totalClasses,
        totalWeeklyHoursNeeded: Math.round(totalWeeklyHoursNeeded * 100) / 100,
        totalWeeklySessionsNeeded,
        totalSlotsPerWeek: TOTAL_SLOTS_PER_WEEK,
        utilizationRatio: Math.round(utilizationRatio * 1000) / 1000,
        avgStudentsPerCourse: Math.round(avgStudentsPerCourse * 10) / 10,
        semesterWeeks: semesterConfig.end_week - semesterConfig.start_week + 1,
        maxConcurrentCourses: semesterConfig.max_concurrent_courses
    };
}

// ============================================================================
// COURSE ANALYSIS
// ============================================================================

/**
 * Phân tích chi tiết từng khóa học
 */
function analyzeCourses(courses, teachers, rooms) {
    return courses.map(course => {
        const {
            id,
            course_id,
            student_count = 0,
            weeks_needed = 0,
            sessions_per_week = 0,
            duration_per_session = 0
        } = course;

        // Tính giờ học hàng tuần
        const weeklyHours = sessions_per_week * duration_per_session;

        // Tổng giờ học trong học kỳ
        const totalHoursAcrossSemester = weeklyHours * weeks_needed;

        // Tìm giáo viên có thể dạy khóa học này
        const possibleTeachers = teachers.filter(teacher =>
            teacher.can_teach_courses && teacher.can_teach_courses.includes(course_id)
        );
        const teacherCoverage = possibleTeachers.length;

        // Tìm phòng phù hợp (capacity >= student_count)
        const roomFitCount = rooms.filter(room =>
            (room.capacity || 0) >= student_count
        ).length;

        // Số slots cần cho mỗi tuần
        const sessionSlotsNeeded = sessions_per_week;

        // Cảnh báo khả thi
        const feasibilityWarning =
            teacherCoverage === 0 ? 'Không có giáo viên có thể dạy' :
                roomFitCount === 0 ? 'Không có phòng đủ sức chứa' :
                    weeklyHours > HIGH_WEEKLY_HOURS ? 'Số giờ hàng tuần quá cao' :
                        null;

        return {
            id,
            course_id,
            student_count,
            weeks_needed,
            sessions_per_week,
            duration_per_session,
            weeklyHours,
            totalHoursAcrossSemester,
            possibleTeachers: possibleTeachers.map(t => ({ id: t.id, name: t.name })),
            teacherCoverage,
            roomFitCount,
            sessionSlotsNeeded,
            feasibilityWarning
        };
    });
}

// ============================================================================
// TEACHER ANALYSIS
// ============================================================================

/**
 * Phân tích khối lượng công việc của từng giáo viên
 */
function analyzeTeachers(teachers, courses) {
    return teachers.map(teacher => {
        const { id, name, can_teach_courses = [] } = teacher;

        // Tìm các khóa học giáo viên có thể dạy
        const teachableCourses = courses.filter(course =>
            can_teach_courses.includes(course.course_id)
        );

        // Ước tính giờ dạy hàng tuần (upper bound nếu dạy tất cả)
        // Formula: Σ (sessions_per_week × duration_per_session) cho các khóa có thể dạy
        const estimatedWeeklyTeachingHours = teachableCourses.reduce((sum, course) =>
            sum + (course.sessions_per_week || 0) * (course.duration_per_session || 0), 0);

        // Ước tính số sessions hàng tuần
        const estimatedWeeklySessions = teachableCourses.reduce((sum, course) =>
            sum + (course.sessions_per_week || 0), 0);

        // Ngưỡng quá tải: > 60% tổng slots có sẵn
        const maxCapacity = TOTAL_SLOTS_PER_WEEK * OVERLOAD_THRESHOLD;
        const overloadRisk = estimatedWeeklyTeachingHours > maxCapacity;

        return {
            id,
            name,
            canTeachCourses: can_teach_courses,
            canTeachCoursesCount: can_teach_courses.length,
            estimatedWeeklyTeachingHours: Math.round(estimatedWeeklyTeachingHours * 100) / 100,
            estimatedWeeklySessions,
            maxCapacity: Math.round(maxCapacity * 100) / 100,
            overloadRisk,
            utilizationRate: estimatedWeeklyTeachingHours / TOTAL_SLOTS_PER_WEEK
        };
    });
}

// ============================================================================
// ROOM ANALYSIS
// ============================================================================

/**
 * Phân tích tiềm năng sử dụng từng phòng học
 */
function analyzeRooms(rooms, courses) {
    return rooms.map(room => {
        const { id, name, capacity = 0 } = room;

        // Đếm số khóa học phòng này có thể phục vụ
        const suitableForCoursesCount = courses.filter(course =>
            (course.student_count || 0) <= capacity
        ).length;

        // Tiềm năng sử dụng
        const utilizationPotential = courses.length > 0
            ? suitableForCoursesCount / courses.length
            : 0;

        return {
            id,
            name,
            capacity,
            suitableForCoursesCount,
            utilizationPotential: Math.round(utilizationPotential * 1000) / 1000,
            percentageCoverage: Math.round(utilizationPotential * 100 * 10) / 10
        };
    });
}

// ============================================================================
// DEPARTMENT ANALYSIS
// ============================================================================

/**
 * Phân tích theo khoa/phòng ban và nhóm lớp
 */
function analyzeDepartments(departments) {
    return departments.map(dept => {
        const { id, name, classes = [] } = dept;

        // Tổng số lớp trong khoa
        const totalClasses = classes.length;

        // Ước tính tổng sinh viên (giả định mỗi lớp ~40 sv nếu không có data)
        const totalStudents = classes.reduce((sum, cls) => {
            // Nếu có student_count thì dùng, không thì ước tính 40
            return sum + (cls.student_count || 40);
        }, 0);

        // Trung bình môn học mỗi lớp (giả định 8-10 môn nếu không có mapping)
        const avgSubjectsPerClass = 9; // heuristic

        // Ước tính giờ học hàng tuần mỗi lớp (giả định mỗi môn 2-3 buổi, mỗi buổi 2 tiết)
        const expectedWeeklyHoursPerClass = avgSubjectsPerClass * 2.5 * 2; // ~45 tiết/tuần

        return {
            id,
            name,
            totalClasses,
            totalStudents,
            avgSubjectsPerClass,
            expectedWeeklyHoursPerClass: Math.round(expectedWeeklyHoursPerClass),
            classes: classes.map(cls => ({
                id: cls.id,
                name: cls.name,
                grades: cls.grades,
                info: cls.info
            }))
        };
    });
}

// ============================================================================
// FEASIBILITY COMPUTATION
// ============================================================================

/**
 * Tính toán các chỉ số khả thi tổng hợp
 */
function computeFeasibility(courses, teachers, rooms, byCourse, byTeacher, semesterConfig) {
    // Các khóa học không có giáo viên
    const courseWithNoTeacher = byCourse.filter(c => c.teacherCoverage === 0);

    // Các khóa học không có phòng phù hợp
    const courseWithNoRoom = byCourse.filter(c => c.roomFitCount === 0);

    // Tỷ lệ khả thi cứng = (tổng khóa - không có gv - không có phòng) / tổng khóa
    const hardFeasibilityRatio = courses.length > 0
        ? (courses.length - courseWithNoTeacher.length - courseWithNoRoom.length) / courses.length
        : 1;

    // Độ bao phủ giáo viên trung bình
    const avgTeacherCoverage = byCourse.length > 0
        ? byCourse.reduce((sum, c) => sum + c.teacherCoverage, 0) / byCourse.length
        : 0;

    // Số phòng phù hợp trung bình
    const avgRoomFit = byCourse.length > 0
        ? byCourse.reduce((sum, c) => sum + c.roomFitCount, 0) / byCourse.length
        : 0;

    // Ước tính số sessions đồng thời tối đa
    // = min(số phòng, số slots) - giả định mỗi session dùng 1 phòng và 1 block thời gian
    const estimatedMaxConcurrentSessions = Math.min(rooms.length, TOTAL_SLOTS_PER_WEEK);

    // Ước tính số tuần cần để hoàn thành
    // Formula: ceil(tổng sessions cần / (số phòng × max_concurrent_courses))
    const totalWeeklySessionsNeeded = byCourse.reduce((sum, c) => sum + c.sessionSlotsNeeded, 0);
    const sessionCapacityPerWeek = rooms.length * (semesterConfig.max_concurrent_courses || 4);
    const estimatedWeeksToComplete = sessionCapacityPerWeek > 0
        ? Math.ceil(totalWeeklySessionsNeeded / sessionCapacityPerWeek)
        : Infinity;

    // Xác định các bottlenecks tiềm năng
    const potentialBottlenecks = [];

    // Bottleneck từ courses
    byCourse.forEach(c => {
        if (c.teacherCoverage <= 1) {
            potentialBottlenecks.push({
                type: 'course-teacher',
                entity: `Course ${c.course_id}`,
                issue: `Chỉ có ${c.teacherCoverage} giáo viên có thể dạy`,
                severity: c.teacherCoverage === 0 ? 'critical' : 'high'
            });
        }
        if (c.roomFitCount <= 1) {
            potentialBottlenecks.push({
                type: 'course-room',
                entity: `Course ${c.course_id}`,
                issue: `Chỉ có ${c.roomFitCount} phòng đủ sức chứa`,
                severity: c.roomFitCount === 0 ? 'critical' : 'high'
            });
        }
    });

    // Bottleneck từ teachers
    byTeacher.forEach(t => {
        if (t.overloadRisk) {
            potentialBottlenecks.push({
                type: 'teacher-overload',
                entity: t.name,
                issue: `Ước tính ${t.estimatedWeeklyTeachingHours} giờ/tuần (vượt ngưỡng)`,
                severity: 'medium'
            });
        }
    });

    return {
        courseWithNoTeacher: {
            count: courseWithNoTeacher.length,
            list: courseWithNoTeacher.map(c => ({ id: c.id, course_id: c.course_id }))
        },
        courseWithNoRoom: {
            count: courseWithNoRoom.length,
            list: courseWithNoRoom.map(c => ({ id: c.id, course_id: c.course_id }))
        },
        hardFeasibilityRatio: Math.round(hardFeasibilityRatio * 1000) / 1000,
        avgTeacherCoverage: Math.round(avgTeacherCoverage * 100) / 100,
        avgRoomFit: Math.round(avgRoomFit * 100) / 100,
        estimatedMaxConcurrentSessions,
        estimatedWeeksToComplete,
        potentialBottlenecks,
        feasibilitySummary: {
            status: hardFeasibilityRatio >= 0.9 ? 'good' : hardFeasibilityRatio >= 0.7 ? 'fair' : 'poor',
            criticalIssues: potentialBottlenecks.filter(b => b.severity === 'critical').length,
            highIssues: potentialBottlenecks.filter(b => b.severity === 'high').length,
            mediumIssues: potentialBottlenecks.filter(b => b.severity === 'medium').length
        }
    };
}

// ============================================================================
// ADVANCED METRICS
// ============================================================================

/**
 * Tính toán các chỉ số nâng cao
 */
function computeAdvancedMetrics(courses, teachers, rooms, byCourse, byTeacher) {
    // 1. Entropy Score - đo độ phân tán của teacher coverage và room fit
    const teacherCoverageEntropy = calculateEntropy(
        byCourse.map(c => c.teacherCoverage)
    );
    const roomFitEntropy = calculateEntropy(
        byCourse.map(c => c.roomFitCount)
    );

    // 2. Constraint Tightness - số khóa học có ràng buộc chặt
    const constraintTightness = byCourse.filter(c =>
        c.teacherCoverage <= 1 || c.roomFitCount <= 1
    ).length;

    // 3. Heatmap Data - phân bố ước tính demand/supply theo slot
    const heatmapData = generateHeatmap(courses, rooms, byCourse);

    // 4. Fragmentation Index - độ phân mảnh lịch học
    const fragmentationIndex = calculateFragmentationIndex(byCourse);

    return {
        entropyScore: {
            teacherCoverage: Math.round(teacherCoverageEntropy * 1000) / 1000,
            roomFit: Math.round(roomFitEntropy * 1000) / 1000,
            interpretation: 'Entropy cao = phân bố đều hơn; thấp = tập trung (có thể là bottleneck)'
        },
        constraintTightness: {
            count: constraintTightness,
            ratio: courses.length > 0 ? Math.round((constraintTightness / courses.length) * 1000) / 1000 : 0,
            interpretation: 'Tỷ lệ khóa học có ít lựa chọn (teacherCoverage ≤1 hoặc roomFit ≤1)'
        },
        heatmapData,
        fragmentationIndex: {
            value: Math.round(fragmentationIndex * 1000) / 1000,
            interpretation: 'Chỉ số 0-1; cao = lịch phân mảnh nhiều ngày; thấp = tập trung'
        }
    };
}

/**
 * Tính entropy Shannon cho một mảng giá trị
 * Entropy = -Σ(p(x) * log2(p(x)))
 */
function calculateEntropy(values) {
    if (values.length === 0) return 0;

    // Đếm tần suất của mỗi giá trị
    const frequency = {};
    values.forEach(val => {
        frequency[val] = (frequency[val] || 0) + 1;
    });

    // Tính xác suất và entropy
    const total = values.length;
    let entropy = 0;

    Object.values(frequency).forEach(count => {
        const probability = count / total;
        if (probability > 0) {
            entropy -= probability * Math.log2(probability);
        }
    });

    return entropy;
}

/**
 * Tạo heatmap ước tính demand/supply theo từng slot
 * Vì không có dữ liệu availability cụ thể, ta phân bố đều
 */
function generateHeatmap(courses, rooms, byCourse) {
    const heatmap = {};

    DAYS.forEach(day => {
        heatmap[day] = [];

        for (let period = 1; period <= PERIODS; period++) {
            // Supply = số phòng có sẵn (giả định tất cả phòng available mọi slot)
            const supply = rooms.length;

            // Demand = ước tính số sessions có thể xếp vào slot này
            // Heuristic: phân bố đều tổng sessions trong tuần
            const totalSessions = byCourse.reduce((sum, c) => sum + c.sessionSlotsNeeded, 0);
            const avgDemandPerSlot = totalSessions / TOTAL_SLOTS_PER_WEEK;

            // Thêm random variation nhỏ để mô phỏng thực tế
            const demand = Math.max(0, Math.round((avgDemandPerSlot + (Math.random() - 0.5)) * 100) / 100);

            heatmap[day].push({
                period,
                demand,
                supply,
                pressure: supply > 0 ? Math.round((demand / supply) * 100) / 100 : 0
            });
        }
    });

    return heatmap;
}

/**
 * Tính chỉ số phân mảnh - đo lường mức độ lịch học bị rải rác
 */
function calculateFragmentationIndex(byCourse) {
    if (byCourse.length === 0) return 0;

    // Cho mỗi khóa học, tính số ngày tối thiểu cần để phân bổ sessions
    // Formula: min(sessions_per_week, DAYS.length) / DAYS.length
    const fragmentationScores = byCourse.map(course => {
        const daysNeeded = Math.min(course.sessions_per_week, DAYS.length);
        return daysNeeded / DAYS.length;
    });

    // Trung bình của tất cả scores
    const avgFragmentation = fragmentationScores.reduce((sum, score) => sum + score, 0) / fragmentationScores.length;

    return avgFragmentation;
}

// ============================================================================
// WARNING GENERATION
// ============================================================================

/**
 * Tạo danh sách cảnh báo dạng text cho người dùng
 */
function generateWarnings(byCourse, byTeacher, byRoom, feasibility) {
    const warnings = [];

    // Cảnh báo về courses
    byCourse.forEach(course => {
        if (course.teacherCoverage === 0) {
            warnings.push({
                level: 'critical',
                category: 'course-teacher',
                message: `⚠️ Course ${course.course_id} không có giáo viên nào có thể dạy`
            });
        }

        if (course.roomFitCount === 0) {
            warnings.push({
                level: 'critical',
                category: 'course-room',
                message: `⚠️ Course ${course.course_id} (sinh viên: ${course.student_count}) không có phòng nào đủ sức chứa`
            });
        }

        if (course.teacherCoverage === 1) {
            warnings.push({
                level: 'high',
                category: 'course-teacher',
                message: `⚠️ Course ${course.course_id} chỉ có 1 giáo viên có thể dạy - rủi ro cao nếu giáo viên bận`
            });
        }

        if (course.roomFitCount === 1) {
            warnings.push({
                level: 'high',
                category: 'course-room',
                message: `⚠️ Course ${course.course_id} chỉ có 1 phòng đủ sức chứa - rủi ro cao về xung đột phòng`
            });
        }

        if (course.weeklyHours > HIGH_WEEKLY_HOURS) {
            warnings.push({
                level: 'medium',
                category: 'course-workload',
                message: `⚠️ Course ${course.course_id} có ${course.weeklyHours} giờ/tuần - cao bất thường`
            });
        }
    });

    // Cảnh báo về teachers
    byTeacher.forEach(teacher => {
        if (teacher.overloadRisk) {
            warnings.push({
                level: 'high',
                category: 'teacher-overload',
                message: `⚠️ ${teacher.name} ước tính ${teacher.estimatedWeeklyTeachingHours} giờ/tuần - nguy cơ quá tải cao`
            });
        }

        if (teacher.canTeachCoursesCount === 0) {
            warnings.push({
                level: 'low',
                category: 'teacher-idle',
                message: `ℹ️ ${teacher.name} không được phân công dạy khóa học nào`
            });
        }
    });

    // Cảnh báo về rooms
    byRoom.forEach(room => {
        if (room.suitableForCoursesCount === 0) {
            warnings.push({
                level: 'medium',
                category: 'room-unused',
                message: `⚠️ ${room.name} (capacity: ${room.capacity}) không phù hợp với bất kỳ khóa học nào`
            });
        }
    });

    // Cảnh báo về feasibility tổng thể
    if (feasibility.hardFeasibilityRatio < 0.7) {
        warnings.push({
            level: 'critical',
            category: 'feasibility',
            message: `⚠️ Tỷ lệ khả thi chỉ ${Math.round(feasibility.hardFeasibilityRatio * 100)}% - cần xem xét lại dữ liệu đầu vào`
        });
    }

    if (feasibility.estimatedWeeksToComplete === Infinity) {
        warnings.push({
            level: 'critical',
            category: 'feasibility',
            message: `⚠️ Không thể ước tính thời gian hoàn thành - thiếu tài nguyên nghiêm trọng`
        });
    }

    // Sắp xếp warnings theo mức độ nghiêm trọng
    const levelOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    warnings.sort((a, b) => levelOrder[a.level] - levelOrder[b.level]);

    return warnings;
}

// ============================================================================
// EXPORT
// ============================================================================

export default evaluatePreSchedule;