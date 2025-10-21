const HolidayActual = require('../models/HolidayActual');
const HolidayRule = require('../models/HolidayRule');
const Semester = require('../models/Semesters');
const { SuccessResponse, ErrorResponse } = require('../utils/responseUtils');

// Helper: convert instance to plain object without querying related tables
function toPlain(holiday) {
  return holiday.toJSON ? holiday.toJSON() : holiday;
}

// Lấy tất cả ngày nghỉ thực tế
exports.getAllHolidayActuals = async (req, res) => {
  try {
  const holidays = await HolidayActual.findAll({ order: [['start_date', 'ASC']] });
  const result = holidays.map(h => toPlain(h));
    res.status(200).json(new SuccessResponse(result, 'Lấy danh sách ngày nghỉ thực tế thành công'));
  } catch (err) {
    res.status(500).json(new ErrorResponse(err.message, 500));
  }
};

// Lấy ngày nghỉ theo học kỳ
exports.getHolidaysBySemester = async (req, res) => {
  try {
    const { semesterId } = req.params;
  const holidays = await HolidayActual.findAll({ where: { semester_id: semesterId }, order: [['start_date', 'ASC']] });
  const result = holidays.map(h => toPlain(h));
    res.status(200).json(new SuccessResponse(result, 'Lấy danh sách ngày nghỉ theo học kỳ thành công'));
  } catch (err) {
    res.status(500).json(new ErrorResponse(err.message, 500));
  }
};

// Lấy ngày nghỉ thực tế theo id
exports.getHolidayActualById = async (req, res) => {
  try {
  const holiday = await HolidayActual.findByPk(req.params.id);
  if (!holiday) return res.status(404).json(new ErrorResponse('Không tìm thấy ngày nghỉ thực tế', 404));
  const result = toPlain(holiday);
    res.status(200).json(new SuccessResponse(result, 'Lấy thông tin ngày nghỉ thực tế thành công'));
  } catch (err) {
    res.status(500).json(new ErrorResponse(err.message, 500));
  }
};

/**
 * Tạo ngày nghỉ thực tế (đột xuất hoặc từ template HolidayRule)
 * Nếu có rule_id/rule_ids thì tạo từ template, nếu không thì tạo đột xuất.
 */
exports.createHolidayActual = async (req, res) => {
  try {
    const { semester_id, rule_id, rule_ids, start_date, end_date, name, description, created_by } = req.body;

    // Validate semester exists
    const semester = await Semester.findByPk(semester_id);
    if (!semester) {
      return res.status(404).json(new ErrorResponse('Không tìm thấy học kỳ', 404));
    }

    // Nếu có rule_id hoặc rule_ids: tạo từ template
    const ids = Array.isArray(rule_ids) ? rule_ids : (rule_id ? [rule_id] : []);
    if (ids.length > 0) {
      const createdItems = [];
      for (const rid of ids) {
        const rule = await HolidayRule.findByPk(rid);
        if (!rule) continue;

        // Ưu tiên lấy start_date/end_date từ body, nếu không có thì lấy từ rule
        let s = start_date;
        let e = end_date;
        if (!s) s = rule.day_start;
        if (!e) e = rule.day_end;
        if (!s || !e) continue;

        if (new Date(s) > new Date(e)) continue;

        const created = await HolidayActual.create({
          semester_id,
          rule_id: rid,
          start_date: s,
          end_date: e,
          name: name || rule.name,
          description: description || rule.description || null,
          created_by
        });
        createdItems.push(toPlain(created));
      }
      return res.status(201).json(new SuccessResponse(createdItems, 'Tạo ngày nghỉ từ template thành công', 201));
    }

    // Nếu không có rule_id/rule_ids: tạo đột xuất
    if (!start_date || !end_date) {
      return res.status(400).json(new ErrorResponse('Thiếu ngày bắt đầu hoặc kết thúc', 400));
    }
    if (new Date(start_date) > new Date(end_date)) {
      return res.status(400).json(new ErrorResponse('Ngày bắt đầu phải trước ngày kết thúc', 400));
    }

    const newHoliday = await HolidayActual.create({
      semester_id,
      rule_id: null,
      start_date,
      end_date,
      name: name || null,
      description: description || null,
      created_by
    });
    const result = toPlain(newHoliday);
    res.status(201).json(new SuccessResponse(result, 'Tạo ngày nghỉ thực tế thành công', 201));
  } catch (err) {
    res.status(500).json(new ErrorResponse(err.message, 500));
  }
};

// Cập nhật ngày nghỉ thực tế
exports.updateHolidayActual = async (req, res) => {
  try {
    const { semester_id, rule_id, start_date, end_date, note } = req.body;
  const holiday = await HolidayActual.findByPk(req.params.id);
  if (!holiday) return res.status(404).json(new ErrorResponse('Không tìm thấy ngày nghỉ thực tế', 404));

    // Validate dates if provided
    const updateStartDate = start_date || holiday.start_date;
    const updateEndDate = end_date || holiday.end_date;
    
    if (new Date(updateStartDate) > new Date(updateEndDate)) {
      return res.status(400).json(new ErrorResponse('Ngày bắt đầu phải trước ngày kết thúc', 400));
    }

    await holiday.update({ 
      semester_id: semester_id || holiday.semester_id,
      rule_id: rule_id !== undefined ? rule_id : holiday.rule_id,
      start_date: updateStartDate,
      end_date: updateEndDate,
      name: req.body.name !== undefined ? req.body.name : holiday.name,
      description: req.body.description !== undefined ? req.body.description : holiday.description,
      note: note !== undefined ? note : holiday.note
    });
    const result = toPlain(holiday);
    res.status(200).json(new SuccessResponse(result, 'Cập nhật ngày nghỉ thực tế thành công'));
  } catch (err) {
    res.status(500).json(new ErrorResponse(err.message, 500));
  }
};

// Xóa ngày nghỉ thực tế
exports.deleteHolidayActual = async (req, res) => {
  try {
    const holiday = await HolidayActual.findByPk(req.params.id);
    if (!holiday) return res.status(404).json(new ErrorResponse('Không tìm thấy ngày nghỉ thực tế', 404));
    await holiday.destroy();
    res.status(200).json(new SuccessResponse(null, 'Xóa ngày nghỉ thực tế thành công'));
  } catch (err) {
    res.status(500).json(new ErrorResponse(err.message, 500));
  }
};
