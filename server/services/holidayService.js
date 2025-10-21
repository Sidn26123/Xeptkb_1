const HolidayActual = require('../models/HolidayActual');
const HolidayRule = require('../models/HolidayRule');
const Semester = require('../models/Semesters');

/**
 * Chuyển đổi ngày Âm lịch sang Dương lịch
 * Note: Đây là hàm đơn giản, trong thực tế nên dùng thư viện như 'lunar-javascript'
 */
function lunarToSolar(year, lunarMonth, lunarDay) {
  // TODO: Implement lunar to solar conversion
  // Có thể dùng thư viện: npm install lunar-javascript
  // hoặc API: https://github.com/vanng822/amlich
  
  // Tạm thời return placeholder - CẦN CÀI ĐẶT THẬT
  return new Date(year, lunarMonth - 1, lunarDay);
}

/**
 * Tính toán ngày nghỉ thực tế từ HolidayRule cho một năm cụ thể
 */
function calculateActualDates(year, rule) {
  let startDate, endDate;

  if (rule.is_lunar) {
    // Nếu là lịch âm, cần chuyển đổi
    startDate = lunarToSolar(year, rule.month, rule.day_start);
    endDate = lunarToSolar(year, rule.month, rule.day_end);
  } else {
    // Nếu là dương lịch
    startDate = new Date(year, rule.month - 1, rule.day_start);
    endDate = new Date(year, rule.month - 1, rule.day_end);
  }

  // Xử lý trường hợp đặc biệt: 30/4 - 1/5
  if (rule.month === 4 && rule.day_start === 30 && rule.day_end === 1) {
    startDate = new Date(year, 3, 30); // Tháng 4
    endDate = new Date(year, 4, 1);    // Tháng 5
  }

  return { startDate, endDate };
}

/**
 * Tạo ngày nghỉ từ template cho một học kỳ
 */
async function generateHolidaysForSemester(semesterId, ruleIds, createdBy = null) {
  try {
    // Lấy thông tin học kỳ
    const semester = await Semester.findByPk(semesterId);
    if (!semester) {
      throw new Error('Không tìm thấy học kỳ');
    }

    // Lấy các rule
    const rules = await HolidayRule.findAll({
      where: { id: ruleIds }
    });

    if (rules.length === 0) {
      throw new Error('Không tìm thấy template ngày nghỉ');
    }

    const semesterStart = new Date(semester.start);
    const semesterEnd = new Date(semester.end);
    const year = semesterStart.getFullYear();

    const holidays = [];

    for (const rule of rules) {
      const { startDate, endDate } = calculateActualDates(year, rule);

      // Kiểm tra xem ngày nghỉ có nằm trong học kỳ không
      if (startDate >= semesterStart && endDate <= semesterEnd) {
        holidays.push({
          semester_id: semesterId,
          rule_id: rule.id,
          start_date: startDate.toISOString().split('T')[0],
          end_date: endDate.toISOString().split('T')[0],
          note: rule.name,
          created_by: createdBy
        });
      } else if (startDate >= semesterStart && startDate <= semesterEnd) {
        // Nếu ngày bắt đầu nằm trong học kỳ nhưng ngày kết thúc không
        holidays.push({
          semester_id: semesterId,
          rule_id: rule.id,
          start_date: startDate.toISOString().split('T')[0],
          end_date: endDate <= semesterEnd 
            ? endDate.toISOString().split('T')[0]
            : semesterEnd.toISOString().split('T')[0],
          note: rule.name,
          created_by: createdBy
        });
      }
    }

    // Tạo các bản ghi ngày nghỉ
    if (holidays.length > 0) {
      return await HolidayActual.bulkCreate(holidays);
    }

    return [];
  } catch (error) {
    throw error;
  }
}

/**
 * Lấy tất cả ngày nghỉ của một học kỳ
 */
async function getHolidaysBySemester(semesterId) {
  try {
    const holidays = await HolidayActual.findAll({
      where: { semester_id: semesterId },
      include: [{
        model: HolidayRule,
        as: 'rule',
        required: false
      }],
      order: [['start_date', 'ASC']]
    });

    return holidays;
  } catch (error) {
    throw error;
  }
}

/**
 * Kiểm tra xem một ngày có phải là ngày nghỉ không
 */
async function isHoliday(date, semesterId) {
  try {
    const holiday = await HolidayActual.findOne({
      where: {
        semester_id: semesterId,
        start_date: { [Op.lte]: date },
        end_date: { [Op.gte]: date }
      }
    });

    return holiday !== null;
  } catch (error) {
    throw error;
  }
}

/**
 * Xóa tất cả ngày nghỉ từ template của một học kỳ
 */
async function deleteTemplateHolidays(semesterId) {
  try {
    const result = await HolidayActual.destroy({
      where: {
        semester_id: semesterId,
        rule_id: { [Op.ne]: null } // Chỉ xóa ngày nghỉ từ template
      }
    });

    return result;
  } catch (error) {
    throw error;
  }
}

module.exports = {
  generateHolidaysForSemester,
  getHolidaysBySemester,
  isHoliday,
  deleteTemplateHolidays,
  calculateActualDates
};
