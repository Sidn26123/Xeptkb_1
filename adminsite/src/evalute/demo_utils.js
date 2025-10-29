/**
 * demo_utils.js
 * Demo sử dụng các utilities helper
 *
 * Cách chạy: node demo_utils.js
 */

import { evaluatePreSchedule } from './preScheduleEvaluator.js';
import utils from './utils.js';
import fs from 'fs';

// ============================================================================
// DỮ LIỆU MẪU
// ============================================================================

const sampleData = {
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
    departments: [
        {
            id: 1,
            name: 'Khoa CNTT',
            classes: [
                { id: 1, name: 'T.Chang [10,11,12]', info: 'Lớp CNTT A', grades: [10, 11, 12] },
                { id: 2, name: 'C.Hiền [10,11,12]', info: 'Lớp CNTT B', grades: [10, 11, 12] },
            ]
        },
        {
            id: 2,
            name: 'Khoa KHTN',
            classes: [
                { id: 3, name: 'C.Thủy [10,11,12]', info: 'Lớp KHTN A', grades: [10, 11, 12] },
            ]
        }
    ],
    semester_config: { start_week: 1, end_week: 15, max_concurrent_courses: 4 }
};

console.log('='.repeat(80));
console.log('DEMO SỬ DỤNG UTILS HELPER');
console.log('='.repeat(80));
console.log();

// ============================================================================
// 1. VALIDATION
// ============================================================================

console.log('1️⃣  VALIDATION - Kiểm tra dữ liệu đầu vào');
console.log('-'.repeat(80));

const validation = utils.validateInputData(sampleData);
console.log(`✅ Dữ liệu hợp lệ: ${validation.isValid}`);
console.log(`⚠️  Số lỗi: ${validation.errors.length}`);
console.log(`ℹ️  Số cảnh báo: ${validation.warnings.length}`);

if (validation.errors.length > 0) {
    console.log('\nLỗi:');
    validation.errors.forEach((e, i) => console.log(`  ${i + 1}. ${e}`));
}

if (validation.warnings.length > 0) {
    console.log('\nCảnh báo:');
    validation.warnings.forEach((w, i) => console.log(`  ${i + 1}. ${w}`));
}

console.log();

// ============================================================================
// 2. EVALUATION
// ============================================================================

console.log('2️⃣  EVALUATION - Chạy đánh giá');
console.log('-'.repeat(80));

const result = evaluatePreSchedule(sampleData);
console.log('✅ Đánh giá hoàn tất\n');

// ============================================================================
// 3. QUALITY SCORE
// ============================================================================

console.log('3️⃣  QUALITY SCORE - Điểm chất lượng');
console.log('-'.repeat(80));

const qualityScore = utils.calculateQualityScore(result);
console.log(`Tổng điểm: ${qualityScore.total}/100 (Hạng ${qualityScore.grade})`);
console.log('\nChi tiết:');
console.log(`  • Khả thi:        ${qualityScore.breakdown.feasibility}/100`);
console.log(`  • Teacher:        ${qualityScore.breakdown.teacherCoverage}/100`);
console.log(`  • Phòng học:      ${qualityScore.breakdown.roomFit}/100`);
console.log(`  • Sử dụng:        ${qualityScore.breakdown.utilization}/100`);
console.log();

// ============================================================================
// 4. FIND CRITICAL ISSUES
// ============================================================================

console.log('4️⃣  CRITICAL ISSUES - Vấn đề nghiêm trọng');
console.log('-'.repeat(80));

const criticalCourses = utils.findCriticalCourses(result);
const overloadedTeachers = utils.findOverloadedTeachers(result);

console.log(`Courses nghiêm trọng: ${criticalCourses.length}`);
if (criticalCourses.length > 0) {
    criticalCourses.forEach(c => {
        console.log(`  • Course ${c.course_id}: ${c.feasibilityWarning}`);
    });
}

console.log(`\nTeachers quá tải: ${overloadedTeachers.length}`);
if (overloadedTeachers.length > 0) {
    overloadedTeachers.forEach(t => {
        console.log(`  • ${t.name}: ${t.estimatedWeeklyTeachingHours} giờ/tuần`);
    });
} else {
    console.log('  ✅ Không có giáo viên nào quá tải');
}
console.log();

// ============================================================================
// 5. SUMMARY REPORT
// ============================================================================

console.log('5️⃣  SUMMARY REPORT - Báo cáo tóm tắt');
console.log('-'.repeat(80));

const summaryReport = utils.generateSummaryReport(result);
console.log(summaryReport);

// ============================================================================
// 6. RECOMMENDATIONS
// ============================================================================

console.log('6️⃣  RECOMMENDATIONS - Khuyến nghị');
console.log('-'.repeat(80));

const recommendations = utils.generateRecommendations(result);
recommendations.forEach((rec, i) => {
    console.log(`${i + 1}. ${rec}`);
});
console.log();

// ============================================================================
// 7. EXPORT TO CSV
// ============================================================================

console.log('7️⃣  EXPORT TO CSV - Xuất dữ liệu');
console.log('-'.repeat(80));

const coursesCSV = utils.exportToCSV(result, 'courses');
const teachersCSV = utils.exportToCSV(result, 'teachers');
const roomsCSV = utils.exportToCSV(result, 'rooms');

fs.writeFileSync('export_courses.csv', coursesCSV, 'utf8');
fs.writeFileSync('export_teachers.csv', teachersCSV, 'utf8');
fs.writeFileSync('export_rooms.csv', roomsCSV, 'utf8');

console.log('✅ Đã export:');
console.log('  • export_courses.csv');
console.log('  • export_teachers.csv');
console.log('  • export_rooms.csv');
console.log();

// ============================================================================
// 8. EXPORT WARNINGS TO MARKDOWN
// ============================================================================

console.log('8️⃣  EXPORT WARNINGS - Xuất cảnh báo');
console.log('-'.repeat(80));

const warningsMD = utils.exportWarningsToMarkdown(result);
fs.writeFileSync('warnings.md', warningsMD, 'utf8');
console.log('✅ Đã export: warnings.md\n');

// ============================================================================
// 9. PREPARE CHART DATA
// ============================================================================

console.log('9️⃣  CHART DATA - Dữ liệu biểu đồ');
console.log('-'.repeat(80));

const utilizationChart = utils.prepareUtilizationChartData(result);
const workloadChart = utils.prepareTeacherWorkloadData(result);
const heatmapData = utils.prepareHeatmapVisualization(result);

console.log('✅ Đã chuẩn bị dữ liệu cho:');
console.log(`  • Utilization Chart: ${utilizationChart.labels.length} rooms`);
console.log(`  • Workload Chart: ${workloadChart.labels.length} teachers`);
console.log(`  • Heatmap: ${heatmapData.length} slots`);

// Save to JSON for visualization tools
fs.writeFileSync('chart_data.json', JSON.stringify({
    utilization: utilizationChart,
    workload: workloadChart,
    heatmap: heatmapData
}, null, 2), 'utf8');

console.log('✅ Đã lưu: chart_data.json\n');

// ============================================================================
// 10. COMPARISON
// ============================================================================

console.log('🔟 COMPARISON - So sánh kịch bản');
console.log('-'.repeat(80));

// Tạo kịch bản thứ 2 với ít tài nguyên hơn
const scenario2Data = {
    ...sampleData,
    teachers: sampleData.teachers.slice(0, 2), // Chỉ 2 giáo viên
    rooms: sampleData.rooms.slice(0, 2)       // Chỉ 2 phòng
};

const result2 = evaluatePreSchedule(scenario2Data);
const comparison = utils.compareResults(result, result2, 'Kịch bản đầy đủ', 'Kịch bản giảm tài nguyên');

console.log(comparison);

// ============================================================================
// 11. PROGRESS BAR DEMO
// ============================================================================

console.log('1️⃣1️⃣ PROGRESS BARS - Thanh tiến trình');
console.log('-'.repeat(80));

console.log('Utilization Ratio:');
console.log(utils.createProgressBar(result.overview.utilizationRatio));
console.log();

console.log('Feasibility Ratio:');
console.log(utils.createProgressBar(result.feasibility.hardFeasibilityRatio));
console.log();

console.log('Avg Teacher Coverage:');
console.log(utils.createProgressBar(result.feasibility.avgTeacherCoverage, 5));
console.log();

// ============================================================================
// SUMMARY
// ============================================================================

console.log('='.repeat(80));
console.log('✅ DEMO HOÀN TẤT');
console.log('='.repeat(80));
console.log('\n📁 Các file đã được tạo:');
console.log('  • export_courses.csv');
console.log('  • export_teachers.csv');
console.log('  • export_rooms.csv');
console.log('  • warnings.md');
console.log('  • chart_data.json');
console.log('\n💡 Tip: Sử dụng các hàm utils trong production code để phân tích và báo cáo\n');