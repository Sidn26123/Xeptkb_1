/**
 * test.js
 * File test để demo module preScheduleEvaluator.js
 *
 * Cách chạy: node test.js
 */

import { evaluatePreSchedule } from './preScheduleEvaluator.js';

// ============================================================================
// DỮ LIỆU MẪU
// ============================================================================

const inputData = {
    courses: [
        { id: 1, course_id: 101, student_count: 50, weeks_needed: 4, sessions_per_week: 2, duration_per_session: 2 },
        { id: 2, course_id: 102, student_count: 40, weeks_needed: 3, sessions_per_week: 2, duration_per_session: 2 },
        { id: 3, course_id: 103, student_count: 60, weeks_needed: 5, sessions_per_week: 3, duration_per_session: 2 },
        { id: 4, course_id: 104, student_count: 45, weeks_needed: 4, sessions_per_week: 2, duration_per_session: 2 },
        { id: 5, course_id: 105, student_count: 50, weeks_needed: 3, sessions_per_week: 2, duration_per_session: 2 },
        { id: 6, course_id: 106, student_count: 35, weeks_needed: 4, sessions_per_week: 2, duration_per_session: 2 },
        { id: 7, course_id: 107, student_count: 55, weeks_needed: 5, sessions_per_week: 3, duration_per_session: 2 },
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
    selected_courses: [],
    selected_teachers: [],
    selected_rooms: [],
    departments: [
        {
            id: 1,
            name: 'Khoa CNTT',
            classes: [
                { id: 1, name: 'T.Chang [10,11,12]', info: 'Lớp CNTT A', grades: [10, 11, 12] },
                { id: 2, name: 'C.Hiền [10,11,12]', info: 'Lớp CNTT B', grades: [10, 11, 12] },
                { id: 3, name: 'Cô Dịu [10,11,12]', info: 'Lớp CNTT C', grades: [10, 11, 12] },
            ]
        },
        {
            id: 2,
            name: 'Khoa KHTN',
            classes: [
                { id: 4, name: 'C.Thủy [10,11,12]', info: 'Lớp KHTN A', grades: [10, 11, 12] },
                { id: 5, name: 'C.Minh [11,12]', info: 'Lớp KHTN B', grades: [11, 12] },
                { id: 6, name: 'C.Dung [10,11,12]', info: 'Lớp KHTN C', grades: [10, 11, 12] },
            ]
        },
    ],
    schools: ['THCS Nghĩa Dân', 'THPT Lê Quý Đôn', 'THCS Trần Phú'],
    subjects: ['Chào cờ', 'Tiếng Anh', 'Sinh hoạt', 'Toán', 'Ngữ văn', 'Vật lý', 'Hóa học'],
    semester_config: {
        start_week: 1,
        end_week: 15,
        max_concurrent_courses: 4
    },
    ga_config: {
        population_size: 50,
        generations: 300,
        crossover_rate: 0.8,
        mutation_rate: 0.2,
        elite_size: 5,
        tournament_size: 3
    }
};

// ============================================================================
// CHẠY ĐÁNH GIÁ
// ============================================================================

console.log('='.repeat(80));
console.log('ĐÁNH GIÁ TIỀN XẾP LỊCH - PRE-SCHEDULE EVALUATION');
console.log('='.repeat(80));
console.log();

try {
    const result = evaluatePreSchedule(inputData);

    // Hiển thị kết quả
    console.log('📊 TỔNG QUAN HỆ THỐNG');
    console.log('-'.repeat(80));
    console.log(JSON.stringify(result.overview, null, 2));
    console.log();

    console.log('📚 PHÂN TÍCH THEO KHÓA HỌC (3 khóa đầu tiên)');
    console.log('-'.repeat(80));
    console.log(JSON.stringify(result.byCourse.slice(0, 3), null, 2));
    console.log();

    console.log('👨‍🏫 PHÂN TÍCH THEO GIÁO VIÊN');
    console.log('-'.repeat(80));
    console.log(JSON.stringify(result.byTeacher, null, 2));
    console.log();

    console.log('🏫 PHÂN TÍCH THEO PHÒNG HỌC');
    console.log('-'.repeat(80));
    console.log(JSON.stringify(result.byRoom, null, 2));
    console.log();

    console.log('🎓 PHÂN TÍCH THEO KHOA');
    console.log('-'.repeat(80));
    console.log(JSON.stringify(result.byDepartment, null, 2));
    console.log();

    console.log('✅ CHỈ SỐ KHẢ THI');
    console.log('-'.repeat(80));
    console.log(JSON.stringify(result.feasibility, null, 2));
    console.log();

    console.log('📈 CHỈ SỐ NÂNG CAO');
    console.log('-'.repeat(80));
    console.log('Entropy Score:', result.advancedMetrics.entropyScore);
    console.log('Constraint Tightness:', result.advancedMetrics.constraintTightness);
    console.log('Fragmentation Index:', result.advancedMetrics.fragmentationIndex);
    console.log('Heatmap sample (Thứ 2, 3 tiết đầu):');
    console.log(JSON.stringify(result.advancedMetrics.heatmapData['Thứ 2'].slice(0, 3), null, 2));
    console.log();

    console.log('⚠️  CẢNH BÁO VÀ KHUYẾN NGHỊ');
    console.log('-'.repeat(80));
    result.warnings.forEach((warning, index) => {
        console.log(`${index + 1}. [${warning.level.toUpperCase()}] ${warning.message}`);
    });
    console.log();

    console.log('💾 LƯU KẾT QUẢ ĐẦY ĐỦ');
    console.log('-'.repeat(80));

    // Lưu kết quả vào file JSON
    const fs = await import('fs');
    fs.writeFileSync('evaluation_result.json', JSON.stringify(result, null, 2), 'utf8');
    console.log('✓ Đã lưu kết quả đầy đủ vào file: evaluation_result.json');
    console.log();

    // Tóm tắt cuối cùng
    console.log('📋 TÓM TẮT');
    console.log('-'.repeat(80));
    console.log(`Tổng số khóa học: ${result.overview.totalCourses}`);
    console.log(`Tổng số giáo viên: ${result.overview.totalTeachers}`);
    console.log(`Tổng số phòng: ${result.overview.totalRooms}`);
    console.log(`Tỷ lệ sử dụng: ${(result.overview.utilizationRatio * 100).toFixed(1)}%`);
    console.log(`Tỷ lệ khả thi: ${(result.feasibility.hardFeasibilityRatio * 100).toFixed(1)}%`);
    console.log(`Trạng thái: ${result.feasibility.feasibilitySummary.status.toUpperCase()}`);
    console.log(`Số cảnh báo nghiêm trọng: ${result.feasibility.feasibilitySummary.criticalIssues}`);
    console.log(`Số cảnh báo cao: ${result.feasibility.feasibilitySummary.highIssues}`);
    console.log(`Số cảnh báo trung bình: ${result.feasibility.feasibilitySummary.mediumIssues}`);
    console.log();

    console.log('='.repeat(80));
    console.log('✅ ĐÁNH GIÁ HOÀN TẤT');
    console.log('='.repeat(80));

} catch (error) {
    console.error('❌ LỖI KHI ĐÁNH GIÁ:', error.message);
    console.error(error.stack);
}