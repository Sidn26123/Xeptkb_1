const HolidayActual = require('../models/HolidayActual');
const HolidayRule = require('../models/HolidayRule');
const Semester = require('../models/Semesters');
const { SuccessResponse, ErrorResponse } = require('../utils/responseUtils');

// Helper: convert instance to plain object without querying related tables
function toPlain(holiday) {
  return holiday.toJSON ? holiday.toJSON() : holiday;
}

// Parse a rule day string (examples: '01-05', '01/05', '30-04') into an ISO date
// that falls within the provided semester range. Returns 'YYYY-MM-DD' or null.
function parseRuleDayToIso(dayStr, semesterStartIso, semesterEndIso) {
  if (!dayStr) return null;
  const norm = String(dayStr).trim().replace(/\//g, '-');
  const parts = norm.split('-').map(p => parseInt(p.trim(), 10));
  if (parts.length < 2 || parts.some(isNaN)) return null;
  const [a, b] = parts;

  const sDate = new Date(semesterStartIso);
  const eDate = new Date(semesterEndIso);
  const years = [];
  if (!isNaN(sDate.getTime())) years.push(sDate.getFullYear());
  if (!isNaN(eDate.getTime()) && eDate.getFullYear() !== years[0]) years.push(eDate.getFullYear());

  const tryMake = (d, m, y) => {
    const dt = new Date(y, m - 1, d);
    if (isNaN(dt.getTime())) return null;
    return dt.toISOString().split('T')[0];
  };

  const attempts = [ [a, b], [b, a] ];
  for (const [d, m] of attempts) {
    if (!d || !m) continue;
    for (const y of years) {
      const iso = tryMake(d, m, y);
      if (!iso) continue;
      const cand = new Date(iso + 'T00:00:00');
      if ((!isNaN(sDate.getTime()) ? cand >= sDate : true) && (!isNaN(eDate.getTime()) ? cand <= eDate : true)) {
        return iso;
      }
    }
  }

  // fallback: return first valid interpretation in first semester year
  if (years.length > 0) {
    const iso = tryMake(a, b, years[0]) || tryMake(b, a, years[0]);
    return iso;
  }

  return null;
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
    const { semester_id, rule_id, rule_ids, start_date, end_date, name, description } = req.body;

    // Validate semester exists
    const semester = await Semester.findByPk(semester_id);
    if (!semester) {
      return res.status(404).json(new ErrorResponse('Không tìm thấy học kỳ', 404));
    }

    const ids = Array.isArray(rule_ids) ? rule_ids : (rule_id ? [rule_id] : []);

    // Validate start/end dates presence
    if (!start_date || !end_date) {
      return res.status(400).json(new ErrorResponse('Thiếu ngày bắt đầu hoặc kết thúc', 400));
    }

    const s = new Date(start_date);
    const e = new Date(end_date);
    if (isNaN(s.getTime()) || isNaN(e.getTime())) {
      return res.status(400).json(new ErrorResponse('Định dạng ngày không hợp lệ (YYYY-MM-DD)', 400));
    }
    if (s > e) {
      return res.status(400).json(new ErrorResponse('Ngày bắt đầu phải trước ngày kết thúc', 400));
    }

    // Helper function to check if two date ranges overlap
    const checkOverlap = (start1, end1, start2, end2) => {
      return start1 <= end2 && start2 <= end1;
    };

    // Get all existing holidays in this semester
    const existingHolidays = await HolidayActual.findAll({
      where: { semester_id },
      order: [['start_date', 'ASC']]
    });

    // If rule ids provided, create one entry per rule using provided dates (no lookup required)
    if (ids.length > 0) {
      // Template KHÔNG được chồng lấn với BẤT KỲ ngày nghỉ nào (template + thủ công)
      const startIsoCheck = s.toISOString().split('T')[0];
      const endIsoCheck = e.toISOString().split('T')[0];
      
      for (const existing of existingHolidays) {
        if (checkOverlap(
          new Date(startIsoCheck),
          new Date(endIsoCheck),
          new Date(existing.start_date),
          new Date(existing.end_date)
        )) {
          const existingType = existing.rule_id !== null ? 'template' : 'thủ công';
          return res.status(400).json(new ErrorResponse(
            `Ngày nghỉ từ template KHÔNG được chồng lấn với ngày nghỉ ${existingType} đã tồn tại: "${existing.name}" (${existing.start_date} - ${existing.end_date}). Vui lòng chọn khoảng thời gian khác.`,
            400
          ));
        }
      }

      const createdItems = [];
      for (const rid of ids) {
        // Determine if the holiday range contains a Sunday; if so, extend end date by 1 day (compensatory day)
        let startIso = s.toISOString().split('T')[0];
        let endIso = e.toISOString().split('T')[0];

        // check each date in range for Sunday (getDay() === 0)
        const containsSunday = (() => {
          const cur = new Date(s);
          while (cur <= e) {
            if (cur.getDay() === 0) return true;
            cur.setDate(cur.getDate() + 1);
          }
          return false;
        })();

        let finalEnd = new Date(e);
        if (containsSunday) {
          finalEnd.setDate(finalEnd.getDate() + 1);
          endIso = finalEnd.toISOString().split('T')[0];
        }

        const created = await HolidayActual.create({
          semester_id,
          rule_id: rid,
          start_date: startIso,
          end_date: endIso,
          name: name || null,
          description: description || null,
        });
        createdItems.push(toPlain(created));
      }
      return res.status(201).json(new SuccessResponse(createdItems, 'Tạo ngày nghỉ từ template thành công', 201));
    }

    // If no rule_id provided, create manual holiday
    if (!name) {
      return res.status(400).json(new ErrorResponse('Tên ngày nghỉ là bắt buộc', 400));
    }

    const startIso = s.toISOString().split('T')[0];
    const endIso = e.toISOString().split('T')[0];

    // Thủ công KHÔNG được chồng lấn với BẤT KỲ ngày nghỉ nào (template + thủ công khác)
    for (const existing of existingHolidays) {
      if (checkOverlap(
        new Date(startIso),
        new Date(endIso),
        new Date(existing.start_date),
        new Date(existing.end_date)
      )) {
        const existingType = existing.rule_id !== null ? 'template' : 'thủ công';
        return res.status(400).json(new ErrorResponse(
          `Ngày nghỉ thủ công KHÔNG được chồng lấn với ngày nghỉ ${existingType} đã tồn tại: "${existing.name}" (${existing.start_date} - ${existing.end_date}). Vui lòng chọn khoảng thời gian trước hoặc sau khoảng này.`,
          400
        ));
      }
    }

    // Tạo record
    const created = await HolidayActual.create({
      semester_id,
      rule_id: null,
      start_date: startIso,
      end_date: endIso,
      name,
      description: description || null,
    });

    return res.status(201).json(new SuccessResponse(toPlain(created), 'Tạo ngày nghỉ thủ công thành công', 201));
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
