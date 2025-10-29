/**
 * advanced_example.js
 * Ví dụ nâng cao với các edge cases và scenarios phức tạp
 */

import { evaluatePreSchedule } from './preScheduleEvaluator.js';

// ============================================================================
// SCENARIO 1: Overloaded System - Hệ thống quá tải
// ============================================================================

console.log('\n' + '='.repeat(80));
console.log('SCENARIO 1: HỆ THỐNG QUÁ TẢI');
console.log('='.repeat(80));

const overloadedData = {
    courses: [
        { id: 1, course_id: 101, student_count: 50, weeks_needed: 15, sessions_per_week: 5, duration_per_session: 3 },
        { id: 2, course_id: 102, student_count: 60, weeks_needed: 15, sessions_per_week: 5, duration_per_session: 3 },
        { id: 3, course_id: 103, student_count: 55, weeks_needed: 15, sessions_per_week: 4, duration_per_session: 3 },
        { id: 4, course_id: 104, student_count: 45, weeks_needed: 15, sessions_per_week: 4, duration_per_session: 3 },
        { id: 5, course_id: 105, student_count: 70, weeks_needed: 15, sessions_per_week: 5, duration_per_session: 3 },
    ],
    teachers: [
        { id: 1, name: 'Teacher A', can_teach_courses: [101, 102, 103] },
        { id: 2, name: 'Teacher B', can_teach_courses: [103, 104, 105] },
    ],
    rooms: [
        { id: 1, name: 'Room 101', capacity: 50 },
        { id: 2, name: 'Room 102', capacity: 60 },
    ],
    departments: [],
    semester_config: { start_week: 1, end_week: 15, max_concurrent_courses: 3 }
};

const result1 = evaluatePreSchedule(overloadedData);
console.log('\n📊 Overview:');
console.log(`  - Utilization Ratio: ${(result1.overview.utilizationRatio * 100).toFixed(1)}%`);
console.log(`  - Feasibility: ${(result1.feasibility.hardFeasibilityRatio * 100).toFixed(1)}%`);
console.log(`  - Status: ${result1.feasibility.feasibilitySummary.status}`);
console.log('\n⚠️  Warnings:');
result1.warnings.slice(0, 5).forEach(w => console.log(`  - ${w.message}`));

// ============================================================================
// SCENARIO 2: Under-resourced - Thiếu tài nguyên nghiêm trọng
// ============================================================================

console.log('\n' + '='.repeat(80));
console.log('SCENARIO 2: THIẾU TÀI NGUYÊN NGHIÊM TRỌNG');
console.log('='.repeat(80));

const underResourcedData = {
    courses: [
        { id: 1, course_id: 101, student_count: 100, weeks_needed: 10, sessions_per_week: 3, duration_per_session: 2 },
        { id: 2, course_id: 102, student_count: 90, weeks_needed: 10, sessions_per_week: 3, duration_per_session: 2 },
        { id: 3, course_id: 103, student_count: 80, weeks_needed: 10, sessions_per_week: 2, duration_per_session: 2 },
        { id: 4, course_id: 104, student_count: 70, weeks_needed: 10, sessions_per_week: 2, duration_per_session: 2 },
    ],
    teachers: [
        { id: 1, name: 'Teacher A', can_teach_courses: [101] },
        { id: 2, name: 'Teacher B', can_teach_courses: [102] },
        // Course 103 và 104 không có giáo viên!
    ],
    rooms: [
        { id: 1, name: 'Room Small', capacity: 30 }, // Quá nhỏ cho tất cả courses
        { id: 2, name: 'Room Tiny', capacity: 20 },
    ],
    departments: [],
    semester_config: { start_week: 1, end_week: 10, max_concurrent_courses: 2 }
};

const result2 = evaluatePreSchedule(underResourcedData);
console.log('\n📊 Overview:');
console.log(`  - Courses without teachers: ${result2.feasibility.courseWithNoTeacher.count}`);
console.log(`  - Courses without rooms: ${result2.feasibility.courseWithNoRoom.count}`);
console.log(`  - Feasibility: ${(result2.feasibility.hardFeasibilityRatio * 100).toFixed(1)}%`);
console.log('\n⚠️  Critical Issues:');
result2.warnings
    .filter(w => w.level === 'critical')
    .forEach(w => console.log(`  - ${w.message}`));

// ============================================================================
// SCENARIO 3: Optimal Setup - Cấu hình tối ưu
// ============================================================================

console.log('\n' + '='.repeat(80));
console.log('SCENARIO 3: CẤU HÌNH TỐI ƯU');
console.log('='.repeat(80));

const optimalData = {
    courses: [
        { id: 1, course_id: 101, student_count: 30, weeks_needed: 10, sessions_per_week: 2, duration_per_session: 2 },
        { id: 2, course_id: 102, student_count: 35, weeks_needed: 10, sessions_per_week: 2, duration_per_session: 2 },
        { id: 3, course_id: 103, student_count: 25, weeks_needed: 10, sessions_per_week: 2, duration_per_session: 2 },
    ],
    teachers: [
        { id: 1, name: 'Teacher A', can_teach_courses: [101, 102] },
        { id: 2, name: 'Teacher B', can_teach_courses: [102, 103] },
        { id: 3, name: 'Teacher C', can_teach_courses: [101, 103] },
        { id: 4, name: 'Teacher D', can_teach_courses: [101, 102, 103] },
    ],
    rooms: [
        { id: 1, name: 'Room A', capacity: 40 },
        { id: 2, name: 'Room B', capacity: 40 },
        { id: 3, name: 'Room C', capacity: 35 },
        { id: 4, name: 'Room D', capacity: 30 },
        { id: 5, name: 'Room E', capacity: 30 },
    ],
    departments: [
        {
            id: 1,
            name: 'Khoa Công Nghệ',
            classes: [
                { id: 1, name: 'IT-A1', grades: [10], student_count: 30 },
                { id: 2, name: 'IT-A2', grades: [10], student_count: 35 },
            ]
        }
    ],
    semester_config: { start_week: 1, end_week: 15, max_concurrent_courses: 5 }
};

const result3 = evaluatePreSchedule(optimalData);
console.log('\n📊 Overview:');
console.log(`  - Utilization Ratio: ${(result3.overview.utilizationRatio * 100).toFixed(1)}%`);
console.log(`  - Avg Teacher Coverage: ${result3.feasibility.avgTeacherCoverage.toFixed(2)}`);
console.log(`  - Avg Room Fit: ${result3.feasibility.avgRoomFit.toFixed(2)}`);
console.log(`  - Feasibility: ${(result3.feasibility.hardFeasibilityRatio * 100).toFixed(1)}%`);
console.log(`  - Status: ${result3.feasibility.feasibilitySummary.status}`);
console.log('\n✅ Advanced Metrics:');
console.log(`  - Teacher Coverage Entropy: ${result3.advancedMetrics.entropyScore.teacherCoverage.toFixed(3)}`);
console.log(`  - Constraint Tightness: ${result3.advancedMetrics.constraintTightness.count} courses`);
console.log(`  - Fragmentation Index: ${result3.advancedMetrics.fragmentationIndex.value.toFixed(3)}`);

// ============================================================================
// SCENARIO 4: Edge Cases - Các trường hợp biên
// ============================================================================

console.log('\n' + '='.repeat(80));
console.log('SCENARIO 4: CÁC TRƯỜNG HỢP BIÊN');
console.log('='.repeat(80));

// 4.1: Empty data
console.log('\n4.1: Empty Data');
const emptyResult = evaluatePreSchedule({
    courses: [],
    teachers: [],
    rooms: [],
    departments: [],
    semester_config: { start_week: 1, end_week: 15, max_concurrent_courses: 4 }
});
console.log(`  - Status: ${emptyResult.feasibility.feasibilitySummary.status}`);
console.log(`  - Warnings count: ${emptyResult.warnings.length}`);

// 4.2: Missing fields
console.log('\n4.2: Missing Optional Fields');
const incompleteResult = evaluatePreSchedule({
    courses: [
        { id: 1, course_id: 201 } // Missing many fields
    ],
    teachers: [
        { id: 1, name: 'Teacher X' } // Missing can_teach_courses
    ],
    rooms: [
        { id: 1, name: 'Room X' } // Missing capacity
    ]
});
console.log(`  - Processed successfully: ${incompleteResult.overview.totalCourses} course(s)`);
console.log(`  - Warnings count: ${incompleteResult.warnings.length}`);

// 4.3: Extreme values
console.log('\n4.3: Extreme Values');
const extremeResult = evaluatePreSchedule({
    courses: [
        { id: 1, course_id: 301, student_count: 1000, weeks_needed: 52, sessions_per_week: 10, duration_per_session: 5 }
    ],
    teachers: [
        { id: 1, name: 'Super Teacher', can_teach_courses: [301] }
    ],
    rooms: [
        { id: 1, name: 'Auditorium', capacity: 2000 }
    ],
    departments: [],
    semester_config: { start_week: 1, end_week: 15, max_concurrent_courses: 1 }
});
console.log(`  - Weekly hours needed: ${extremeResult.overview.totalWeeklyHoursNeeded}`);
console.log(`  - Utilization ratio: ${(extremeResult.overview.utilizationRatio * 100).toFixed(1)}%`);
console.log(`  - Has overload warning: ${extremeResult.warnings.some(w => w.category === 'course-workload')}`);

// ============================================================================
// SCENARIO 5: Real-world Complex Case
// ============================================================================

console.log('\n' + '='.repeat(80));
console.log('SCENARIO 5: TRƯỜNG HỢP PHỨC TẠP THỰC TẾ');
console.log('='.repeat(80));

const complexData = {
    courses: [
        // Khối 10
        { id: 1, course_id: 1001, student_count: 40, weeks_needed: 15, sessions_per_week: 3, duration_per_session: 2 }, // Toán
        { id: 2, course_id: 1002, student_count: 40, weeks_needed: 15, sessions_per_week: 2, duration_per_session: 2 }, // Văn
        { id: 3, course_id: 1003, student_count: 40, weeks_needed: 15, sessions_per_week: 2, duration_per_session: 2 }, // Anh
        // Khối 11
        { id: 4, course_id: 1101, student_count: 45, weeks_needed: 15, sessions_per_week: 3, duration_per_session: 2 }, // Toán
        { id: 5, course_id: 1102, student_count: 45, weeks_needed: 15, sessions_per_week: 2, duration_per_session: 2 }, // Văn
        { id: 6, course_id: 1103, student_count: 45, weeks_needed: 15, sessions_per_week: 2, duration_per_session: 2 }, // Anh
        // Khối 12
        { id: 7, course_id: 1201, student_count: 50, weeks_needed: 15, sessions_per_week: 4, duration_per_session: 2 }, // Toán (intensive)
        { id: 8, course_id: 1202, student_count: 50, weeks_needed: 15, sessions_per_week: 3, duration_per_session: 2 }, // Văn
        { id: 9, course_id: 1203, student_count: 50, weeks_needed: 15, sessions_per_week: 3, duration_per_session: 2 }, // Anh
        // Electives
        { id: 10, course_id: 2001, student_count: 25, weeks_needed: 10, sessions_per_week: 2, duration_per_session: 2 }, // Tin học
        { id: 11, course_id: 2002, student_count: 30, weeks_needed: 10, sessions_per_week: 2, duration_per_session: 2 }, // Thể dục
    ],
    teachers: [
        { id: 1, name: 'GV Toán 1', can_teach_courses: [1001, 1101] },
        { id: 2, name: 'GV Toán 2', can_teach_courses: [1101, 1201] },
        { id: 3, name: 'GV Văn 1', can_teach_courses: [1002, 1102, 1202] },
        { id: 4, name: 'GV Anh 1', can_teach_courses: [1003, 1103] },
        { id: 5, name: 'GV Anh 2', can_teach_courses: [1103, 1203] },
        { id: 6, name: 'GV Tin', can_teach_courses: [2001] },
        { id: 7, name: 'GV Thể dục', can_teach_courses: [2002] },
    ],
    rooms: [
        { id: 1, name: 'Phòng 301', capacity: 45 },
        { id: 2, name: 'Phòng 302', capacity: 45 },
        { id: 3, name: 'Phòng 303', capacity: 50 },
        { id: 4, name: 'Phòng 401', capacity: 55 },
        { id: 5, name: 'Lab Tin', capacity: 30 },
        { id: 6, name: 'Sân TD', capacity: 100 },
    ],
    departments: [
        {
            id: 1,
            name: 'Khoa Toán - Lý',
            classes: [
                { id: 1, name: '10A1', grades: [10], student_count: 40 },
                { id: 2, name: '11A1', grades: [11], student_count: 45 },
                { id: 3, name: '12A1', grades: [12], student_count: 50 },
            ]
        },
        {
            id: 2,
            name: 'Khoa Văn - Sử',
            classes: [
                { id: 4, name: '10A2', grades: [10], student_count: 40 },
                { id: 5, name: '11A2', grades: [11], student_count: 45 },
            ]
        }
    ],
    semester_config: { start_week: 1, end_week: 15, max_concurrent_courses: 6 }
};

const result5 = evaluatePreSchedule(complexData);

console.log('\n📊 System Overview:');
console.log(`  - Total Courses: ${result5.overview.totalCourses}`);
console.log(`  - Total Teachers: ${result5.overview.totalTeachers}`);
console.log(`  - Total Rooms: ${result5.overview.totalRooms}`);
console.log(`  - Weekly Hours Needed: ${result5.overview.totalWeeklyHoursNeeded}`);
console.log(`  - Utilization: ${(result5.overview.utilizationRatio * 100).toFixed(1)}%`);

console.log('\n✅ Feasibility Analysis:');
console.log(`  - Hard Feasibility: ${(result5.feasibility.hardFeasibilityRatio * 100).toFixed(1)}%`);
console.log(`  - Avg Teacher Coverage: ${result5.feasibility.avgTeacherCoverage.toFixed(2)}`);
console.log(`  - Avg Room Fit: ${result5.feasibility.avgRoomFit.toFixed(2)}`);
console.log(`  - Status: ${result5.feasibility.feasibilitySummary.status.toUpperCase()}`);
console.log(`  - Estimated Weeks: ${result5.feasibility.estimatedWeeksToComplete}`);

console.log('\n🎯 Bottlenecks:');
result5.feasibility.potentialBottlenecks.slice(0, 5).forEach((b, i) => {
    console.log(`  ${i + 1}. [${b.severity}] ${b.entity}: ${b.issue}`);
});

console.log('\n📈 Advanced Metrics:');
console.log(`  - Teacher Coverage Entropy: ${result5.advancedMetrics.entropyScore.teacherCoverage.toFixed(3)}`);
console.log(`  - Room Fit Entropy: ${result5.advancedMetrics.entropyScore.roomFit.toFixed(3)}`);
console.log(`  - Constraint Tightness: ${result5.advancedMetrics.constraintTightness.ratio.toFixed(3)}`);
console.log(`  - Fragmentation Index: ${result5.advancedMetrics.fragmentationIndex.value.toFixed(3)}`);

console.log('\n⚠️  Top Warnings:');
result5.warnings.slice(0, 8).forEach((w, i) => {
    console.log(`  ${i + 1}. [${w.level.toUpperCase()}] ${w.message}`);
});

console.log('\n' + '='.repeat(80));
console.log('✅ ALL SCENARIOS COMPLETED');
console.log('='.repeat(80));
console.log('\nℹ️  Tip: Chạy lại với các scenarios khác nhau để kiểm tra edge cases');
console.log('ℹ️  Tip: Xem sample_output.json để hiểu cấu trúc output đầy đủ\n');