/**
 * utils.js
 * Helper utilities để xử lý và format kết quả từ preScheduleEvaluator
 */

// ============================================================================
// FORMATTING UTILITIES
// ============================================================================

/**
 * Format số thành percentage với số chữ số thập phân
 */
export function formatPercentage(value, decimals = 1) {
    return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * Format số với dấu phẩy ngăn cách hàng nghìn
 */
export function formatNumber(value) {
    return value.toLocaleString('vi-VN');
}

/**
 * Tạo progress bar text
 */
export function createProgressBar(value, max = 1, length = 20) {
    const ratio = Math.min(value / max, 1);
    const filled = Math.round(ratio * length);
    const empty = length - filled;
    return `[${'█'.repeat(filled)}${' '.repeat(empty)}] ${formatPercentage(ratio)}`;
}

// ============================================================================
// ANALYSIS UTILITIES
// ============================================================================

/**
 * Tìm các courses có vấn đề nghiêm trọng nhất
 */
export function findCriticalCourses(result) {
    return result.byCourse.filter(course =>
        course.teacherCoverage === 0 || course.roomFitCount === 0
    );
}

/**
 * Tìm các teachers bị overload
 */
export function findOverloadedTeachers(result) {
    return result.byTeacher.filter(teacher => teacher.overloadRisk);
}

/**
 * Tính điểm chất lượng tổng thể (0-100)
 */
export function calculateQualityScore(result) {
    const weights = {
        feasibility: 0.4,
        teacherCoverage: 0.2,
        roomFit: 0.2,
        utilization: 0.2
    };

    const feasibilityScore = result.feasibility.hardFeasibilityRatio * 100;

    // Teacher coverage score: normalize to 0-100 (assume 3+ is optimal)
    const avgTeacherCoverage = Math.min(result.feasibility.avgTeacherCoverage / 3, 1);
    const teacherScore = avgTeacherCoverage * 100;

    // Room fit score: normalize to 0-100 (assume 4+ rooms is optimal)
    const avgRoomFit = Math.min(result.feasibility.avgRoomFit / 4, 1);
    const roomScore = avgRoomFit * 100;

    // Utilization score: optimal range 40-70%
    const utilization = result.overview.utilizationRatio;
    const utilizationScore = utilization < 0.4
        ? (utilization / 0.4) * 100
        : utilization > 0.7
            ? (1 - (utilization - 0.7) / 0.3) * 100
            : 100;

    const totalScore =
        weights.feasibility * feasibilityScore +
        weights.teacherCoverage * teacherScore +
        weights.roomFit * roomScore +
        weights.utilization * utilizationScore;

    return {
        total: Math.round(totalScore * 10) / 10,
        breakdown: {
            feasibility: Math.round(feasibilityScore * 10) / 10,
            teacherCoverage: Math.round(teacherScore * 10) / 10,
            roomFit: Math.round(roomScore * 10) / 10,
            utilization: Math.round(utilizationScore * 10) / 10
        },
        grade: totalScore >= 90 ? 'A' :
            totalScore >= 80 ? 'B' :
                totalScore >= 70 ? 'C' :
                    totalScore >= 60 ? 'D' : 'F'
    };
}

// ============================================================================
// REPORT GENERATION
// ============================================================================

/**
 * Tạo báo cáo tóm tắt dạng text
 */
export function generateSummaryReport(result) {
    const qualityScore = calculateQualityScore(result);
    const criticalCourses = findCriticalCourses(result);
    const overloadedTeachers = findOverloadedTeachers(result);

    return `
╔════════════════════════════════════════════════════════════════════════════╗
║                     BÁO CÁO ĐÁNH GIÁ LỊCH HỌC                             ║
╚════════════════════════════════════════════════════════════════════════════╝

📊 TỔNG QUAN HỆ THỐNG
${'-'.repeat(80)}
  Khóa học:         ${result.overview.totalCourses} khóa
  Giáo viên:        ${result.overview.totalTeachers} người
  Phòng học:        ${result.overview.totalRooms} phòng
  Giờ học/tuần:     ${result.overview.totalWeeklyHoursNeeded} giờ
  Tỷ lệ sử dụng:    ${createProgressBar(result.overview.utilizationRatio)}

📈 ĐIỂM CHẤT LƯỢNG
${'-'.repeat(80)}
  Tổng điểm:        ${qualityScore.total}/100 (${qualityScore.grade})
  - Khả thi:        ${qualityScore.breakdown.feasibility}/100
  - Teacher:        ${qualityScore.breakdown.teacherCoverage}/100
  - Phòng học:      ${qualityScore.breakdown.roomFit}/100
  - Sử dụng:        ${qualityScore.breakdown.utilization}/100

✅ KHẢ NĂNG THỰC HIỆN
${'-'.repeat(80)}
  Tỷ lệ khả thi:    ${formatPercentage(result.feasibility.hardFeasibilityRatio)}
  Trạng thái:       ${result.feasibility.feasibilitySummary.status.toUpperCase()}
  Ước tính hoàn thành: ${result.feasibility.estimatedWeeksToComplete} tuần

⚠️  VẤN ĐỀ NGHIÊM TRỌNG
${'-'.repeat(80)}
  Critical:         ${result.feasibility.feasibilitySummary.criticalIssues} vấn đề
  High:             ${result.feasibility.feasibilitySummary.highIssues} vấn đề
  Medium:           ${result.feasibility.feasibilitySummary.mediumIssues} vấn đề

${criticalCourses.length > 0 ? `
🚨 KHÓA HỌC CẦN CHÚ Ý
${'-'.repeat(80)}
${criticalCourses.map(c => `  • Course ${c.course_id}: ${c.feasibilityWarning}`).join('\n')}
` : ''}

${overloadedTeachers.length > 0 ? `
👨‍🏫 GIÁO VIÊN QUÁ TẢI
${'-'.repeat(80)}
${overloadedTeachers.map(t => `  • ${t.name}: ${t.estimatedWeeklyTeachingHours} giờ/tuần`).join('\n')}
` : ''}

📋 KHUYẾN NGHỊ
${'-'.repeat(80)}
${generateRecommendations(result).map((r, i) => `  ${i + 1}. ${r}`).join('\n')}

╚════════════════════════════════════════════════════════════════════════════╝
`;
}

/**
 * Tạo các khuyến nghị dựa trên kết quả phân tích
 */
export function generateRecommendations(result) {
    const recommendations = [];

    // Check utilization
    if (result.overview.utilizationRatio > 0.8) {
        recommendations.push('⚠️ Hệ thống quá tải - cần thêm phòng học hoặc giảm số khóa học');
    } else if (result.overview.utilizationRatio < 0.3) {
        recommendations.push('ℹ️ Tài nguyên dư thừa - có thể tối ưu hóa hoặc tăng số khóa học');
    }

    // Check feasibility
    if (result.feasibility.hardFeasibilityRatio < 0.7) {
        recommendations.push('🚨 Khả thi thấp - cần xem xét lại phân bổ giáo viên và phòng học');
    }

    // Check teacher coverage
    if (result.feasibility.avgTeacherCoverage < 1.5) {
        recommendations.push('👨‍🏫 Độ bao phủ giáo viên thấp - cần tuyển thêm hoặc đào tạo giáo viên');
    }

    // Check room capacity
    if (result.feasibility.avgRoomFit < 2) {
        recommendations.push('🏫 Thiếu phòng học phù hợp - cần thêm phòng hoặc giảm quy mô lớp');
    }

    // Check overloaded teachers
    const overloadedCount = result.byTeacher.filter(t => t.overloadRisk).length;
    if (overloadedCount > 0) {
        recommendations.push(`⚠️ Có ${overloadedCount} giáo viên có nguy cơ quá tải - cần cân bằng lại khối lượng công việc`);
    }

    // Check critical courses
    const criticalCount = result.feasibility.courseWithNoTeacher.count +
        result.feasibility.courseWithNoRoom.count;
    if (criticalCount > 0) {
        recommendations.push(`🚨 Có ${criticalCount} khóa học không thể xếp lịch - cần giải quyết ngay`);
    }

    // Check constraint tightness
    if (result.advancedMetrics.constraintTightness.ratio > 0.5) {
        recommendations.push('⚠️ Nhiều khóa học có ràng buộc chặt - lịch sẽ khó xếp và dễ xung đột');
    }

    // Check fragmentation
    if (result.advancedMetrics.fragmentationIndex.value > 0.5) {
        recommendations.push('📅 Lịch học phân mảnh cao - nên tối ưu để giảm số ngày phải đi học');
    }

    // Check entropy
    if (result.advancedMetrics.entropyScore.teacherCoverage < 1.0) {
        recommendations.push('📊 Phân bố giáo viên không đều - một số giáo viên quá nhiều khóa, số khác quá ít');
    }

    // Default recommendation
    if (recommendations.length === 0) {
        recommendations.push('✅ Hệ thống cân bằng tốt - có thể tiến hành xếp lịch');
    }

    return recommendations;
}

// ============================================================================
// COMPARISON UTILITIES
// ============================================================================

/**
 * So sánh hai kết quả đánh giá
 */
export function compareResults(result1, result2, label1 = 'Scenario 1', label2 = 'Scenario 2') {
    const score1 = calculateQualityScore(result1);
    const score2 = calculateQualityScore(result2);

    return `
╔════════════════════════════════════════════════════════════════════════════╗
║                        SO SÁNH HAI KỊCH BẢN                               ║
╚════════════════════════════════════════════════════════════════════════════╝

                          ${label1.padEnd(25)} ${label2.padEnd(25)}
${'-'.repeat(80)}
Điểm chất lượng           ${String(score1.total).padEnd(25)} ${String(score2.total).padEnd(25)}
Hạng                      ${score1.grade.padEnd(25)} ${score2.grade.padEnd(25)}
Tỷ lệ khả thi            ${formatPercentage(result1.feasibility.hardFeasibilityRatio).padEnd(25)} ${formatPercentage(result2.feasibility.hardFeasibilityRatio).padEnd(25)}
Tỷ lệ sử dụng            ${formatPercentage(result1.overview.utilizationRatio).padEnd(25)} ${formatPercentage(result2.overview.utilizationRatio).padEnd(25)}
Courses critical          ${String(result1.feasibility.courseWithNoTeacher.count + result1.feasibility.courseWithNoRoom.count).padEnd(25)} ${String(result2.feasibility.courseWithNoTeacher.count + result2.feasibility.courseWithNoRoom.count).padEnd(25)}
Teachers overloaded       ${String(result1.byTeacher.filter(t => t.overloadRisk).length).padEnd(25)} ${String(result2.byTeacher.filter(t => t.overloadRisk).length).padEnd(25)}
Warnings                  ${String(result1.warnings.length).padEnd(25)} ${String(result2.warnings.length).padEnd(25)}

📊 ĐÁNH GIÁ
${'-'.repeat(80)}
${score1.total > score2.total
        ? `✅ ${label1} tốt hơn (${(score1.total - score2.total).toFixed(1)} điểm)`
        : score2.total > score1.total
            ? `✅ ${label2} tốt hơn (${(score2.total - score1.total).toFixed(1)} điểm)`
            : '⚖️ Hai kịch bản tương đương nhau'}

╚════════════════════════════════════════════════════════════════════════════╝
`;
}

// ============================================================================
// EXPORT UTILITIES
// ============================================================================

/**
 * Export kết quả sang CSV format
 */
export function exportToCSV(result, type = 'courses') {
    const headers = [];
    const rows = [];

    if (type === 'courses') {
        headers.push('ID', 'Course ID', 'Students', 'Weeks', 'Sessions/Week', 'Duration',
            'Weekly Hours', 'Teacher Coverage', 'Room Fit', 'Feasibility');

        result.byCourse.forEach(course => {
            rows.push([
                course.id,
                course.course_id,
                course.student_count,
                course.weeks_needed,
                course.sessions_per_week,
                course.duration_per_session,
                course.weeklyHours,
                course.teacherCoverage,
                course.roomFitCount,
                course.feasibilityWarning || 'OK'
            ].join(','));
        });
    } else if (type === 'teachers') {
        headers.push('ID', 'Name', 'Can Teach', 'Weekly Hours', 'Sessions', 'Overload Risk');

        result.byTeacher.forEach(teacher => {
            rows.push([
                teacher.id,
                `"${teacher.name}"`,
                teacher.canTeachCoursesCount,
                teacher.estimatedWeeklyTeachingHours,
                teacher.estimatedWeeklySessions,
                teacher.overloadRisk ? 'YES' : 'NO'
            ].join(','));
        });
    } else if (type === 'rooms') {
        headers.push('ID', 'Name', 'Capacity', 'Suitable Courses', 'Utilization %');

        result.byRoom.forEach(room => {
            rows.push([
                room.id,
                `"${room.name}"`,
                room.capacity,
                room.suitableForCoursesCount,
                room.percentageCoverage
            ].join(','));
        });
    }

    return [headers.join(','), ...rows].join('\n');
}

/**
 * Export warnings sang Markdown format
 */
export function exportWarningsToMarkdown(result) {
    const warnings = result.warnings;

    let md = '# Cảnh Báo Đánh Giá Lịch Học\n\n';
    md += `**Ngày tạo:** ${new Date(result.timestamp).toLocaleString('vi-VN')}\n\n`;

    const critical = warnings.filter(w => w.level === 'critical');
    const high = warnings.filter(w => w.level === 'high');
    const medium = warnings.filter(w => w.level === 'medium');
    const low = warnings.filter(w => w.level === 'low');

    if (critical.length > 0) {
        md += '## 🚨 Critical Issues\n\n';
        critical.forEach((w, i) => {
            md += `${i + 1}. ${w.message}\n`;
        });
        md += '\n';
    }

    if (high.length > 0) {
        md += '## ⚠️ High Priority\n\n';
        high.forEach((w, i) => {
            md += `${i + 1}. ${w.message}\n`;
        });
        md += '\n';
    }

    if (medium.length > 0) {
        md += '## ⚡ Medium Priority\n\n';
        medium.forEach((w, i) => {
            md += `${i + 1}. ${w.message}\n`;
        });
        md += '\n';
    }

    if (low.length > 0) {
        md += '## ℹ️ Low Priority\n\n';
        low.forEach((w, i) => {
            md += `${i + 1}. ${w.message}\n`;
        });
        md += '\n';
    }

    return md;
}

// ============================================================================
// VISUALIZATION DATA PREPARATION
// ============================================================================

/**
 * Chuẩn bị dữ liệu cho biểu đồ utilization
 */
export function prepareUtilizationChartData(result) {
    return {
        labels: result.byRoom.map(room => room.name),
        datasets: [{
            label: 'Utilization Potential',
            data: result.byRoom.map(room => room.utilizationPotential * 100),
            backgroundColor: result.byRoom.map(room =>
                room.utilizationPotential > 0.8 ? '#10b981' :
                    room.utilizationPotential > 0.5 ? '#f59e0b' : '#ef4444'
            )
        }]
    };
}

/**
 * Chuẩn bị dữ liệu cho biểu đồ teacher workload
 */
export function prepareTeacherWorkloadData(result) {
    return {
        labels: result.byTeacher.map(t => t.name),
        datasets: [{
            label: 'Weekly Teaching Hours',
            data: result.byTeacher.map(t => t.estimatedWeeklyTeachingHours),
            backgroundColor: result.byTeacher.map(t =>
                t.overloadRisk ? '#ef4444' : '#10b981'
            )
        }]
    };
}

/**
 * Chuẩn bị dữ liệu heatmap cho visualization
 */
export function prepareHeatmapVisualization(result) {
    const heatmap = result.advancedMetrics.heatmapData;
    const data = [];

    Object.keys(heatmap).forEach((day, dayIndex) => {
        heatmap[day].forEach(slot => {
            data.push({
                day: dayIndex,
                period: slot.period,
                pressure: slot.pressure,
                demand: slot.demand,
                supply: slot.supply
            });
        });
    });

    return data;
}

// ============================================================================
// VALIDATION UTILITIES
// ============================================================================

/**
 * Kiểm tra tính hợp lệ của input data
 */
export function validateInputData(data) {
    const errors = [];
    const warnings = [];

    // Check required fields
    if (!data.courses || data.courses.length === 0) {
        errors.push('Thiếu dữ liệu courses hoặc danh sách rỗng');
    }

    if (!data.teachers || data.teachers.length === 0) {
        warnings.push('Không có giáo viên nào - sẽ không thể xếp lịch');
    }

    if (!data.rooms || data.rooms.length === 0) {
        warnings.push('Không có phòng học nào - sẽ không thể xếp lịch');
    }

    // Check courses data integrity
    if (data.courses) {
        data.courses.forEach((course, index) => {
            if (!course.course_id) {
                errors.push(`Course tại index ${index} thiếu course_id`);
            }
            if (!course.student_count || course.student_count <= 0) {
                warnings.push(`Course ${course.course_id} có student_count không hợp lệ`);
            }
            if (!course.sessions_per_week || course.sessions_per_week <= 0) {
                warnings.push(`Course ${course.course_id} có sessions_per_week không hợp lệ`);
            }
        });
    }

    // Check teachers data
    if (data.teachers) {
        data.teachers.forEach((teacher, index) => {
            if (!teacher.name) {
                warnings.push(`Teacher tại index ${index} thiếu name`);
            }
            if (!teacher.can_teach_courses || teacher.can_teach_courses.length === 0) {
                warnings.push(`Teacher ${teacher.name || index} không thể dạy khóa học nào`);
            }
        });
    }

    // Check rooms data
    if (data.rooms) {
        data.rooms.forEach((room, index) => {
            if (!room.name) {
                warnings.push(`Room tại index ${index} thiếu name`);
            }
            if (!room.capacity || room.capacity <= 0) {
                warnings.push(`Room ${room.name || index} có capacity không hợp lệ`);
            }
        });
    }

    return {
        isValid: errors.length === 0,
        errors,
        warnings
    };
}

// ============================================================================
// EXPORT ALL
// ============================================================================

export default {
    formatPercentage,
    formatNumber,
    createProgressBar,
    findCriticalCourses,
    findOverloadedTeachers,
    calculateQualityScore,
    generateSummaryReport,
    generateRecommendations,
    compareResults,
    exportToCSV,
    exportWarningsToMarkdown,
    prepareUtilizationChartData,
    prepareTeacherWorkloadData,
    prepareHeatmapVisualization,
    validateInputData
};