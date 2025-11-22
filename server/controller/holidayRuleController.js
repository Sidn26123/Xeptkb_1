const HolidayRule = require('../models/HolidayRule');
const { convertLunarToSolar, convertSolarToLunar } = require('../utils/lunisolarUtils');
const { SuccessResponse, ErrorResponse } = require('../utils/responseUtils');

// helper: parse 'dd/mm' or 'dd-mm' into { day, month }
const parseDayMonthString = (s) => {
  if (!s || typeof s !== 'string') return null;
  // accept separators '/' or '-'
  const parts = s.split(/[-\/]/).map(p => parseInt(p.trim(), 10));
  if (parts.length < 2 || parts.some(isNaN)) return null;
  // Assume format is day-month
  return { day: parts[0], month: parts[1] };
};

// Lấy tất cả quy tắc nghỉ
exports.getAllHolidayRules = async (req, res) => {
  try {
    const rules = await HolidayRule.findAll();
    // sort in-memory by month then day parsed from 'dd/mm' or 'dd-mm'
    rules.sort((a, b) => {
      const pa = parseDayMonthString(a.day_start) || { day: 0, month: 0 };
      const pb = parseDayMonthString(b.day_start) || { day: 0, month: 0 };
      if (pa.month !== pb.month) return pa.month - pb.month;
      return pa.day - pb.day;
    });
    res.status(200).json(new SuccessResponse(rules, 'Lấy danh sách quy tắc nghỉ thành công'));
  } catch (err) {
    res.status(500).json(new ErrorResponse(err.message, 500));
  }
};

// Lấy quy tắc nghỉ theo id
exports.getHolidayRuleById = async (req, res) => {
  try {
    const rule = await HolidayRule.findByPk(req.params.id);
    if (!rule) return res.status(404).json(new ErrorResponse('Không tìm thấy quy tắc nghỉ', 404));
    res.status(200).json(new SuccessResponse(rule, 'Lấy thông tin quy tắc nghỉ thành công'));
  } catch (err) {
    res.status(500).json(new ErrorResponse(err.message, 500));
  }
};

// Tạo quy tắc nghỉ mới
exports.createHolidayRule = async (req, res) => {
  try {
    const { name, month, day_start, day_end, is_lunar, recurring, description } = req.body;
    
    // Validate
    if (!name || !month || !day_start || !day_end) {
      return res.status(400).json(new ErrorResponse('Thiếu thông tin bắt buộc', 400));
    }

    if (day_start > day_end) {
      return res.status(400).json(new ErrorResponse('Ngày bắt đầu phải nhỏ hơn hoặc bằng ngày kết thúc', 400));
    }

    const newRule = await HolidayRule.create({ 
      name, 
      month,
      day_start, 
      day_end, 
      is_lunar: is_lunar || false,
      recurring: recurring !== undefined ? recurring : true,
      description 
    });
    
    res.status(201).json(new SuccessResponse(newRule, 'Tạo quy tắc nghỉ thành công', 201));
  } catch (err) {
    res.status(500).json(new ErrorResponse(err.message, 500));
  }
};

// Cập nhật quy tắc nghỉ
exports.updateHolidayRule = async (req, res) => {
  try {
    const { name, month, day_start, day_end, is_lunar, recurring, description } = req.body;
    const rule = await HolidayRule.findByPk(req.params.id);
    if (!rule) return res.status(404).json(new ErrorResponse('Không tìm thấy quy tắc nghỉ', 404));
    
    // Validate if updating dates
    const updateDayStart = day_start || rule.day_start;
    const updateDayEnd = day_end || rule.day_end;
    
    if (updateDayStart > updateDayEnd) {
      return res.status(400).json(new ErrorResponse('Ngày bắt đầu phải nhỏ hơn hoặc bằng ngày kết thúc', 400));
    }

    await rule.update({ 
      name: name || rule.name,
      month: month || rule.month,
      day_start: updateDayStart,
      day_end: updateDayEnd,
      is_lunar: is_lunar !== undefined ? is_lunar : rule.is_lunar,
      recurring: recurring !== undefined ? recurring : rule.recurring,
      description: description !== undefined ? description : rule.description
    });
    
    res.status(200).json(new SuccessResponse(rule, 'Cập nhật quy tắc nghỉ thành công'));
  } catch (err) {
    res.status(500).json(new ErrorResponse(err.message, 500));
  }
};

// Xóa quy tắc nghỉ
exports.deleteHolidayRule = async (req, res) => {
  try {
    const rule = await HolidayRule.findByPk(req.params.id);
    if (!rule) return res.status(404).json(new ErrorResponse('Không tìm thấy quy tắc nghỉ', 404));
    await rule.destroy();
    res.status(200).json(new SuccessResponse(null, 'Xóa quy tắc nghỉ thành công'));
  } catch (err) {
    res.status(500).json(new ErrorResponse(err.message, 500));
  }
};

// Lấy các mẫu quy tắc nghỉ trong khoảng ngày (dùng cho modal templates)
// Query params: ?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD
exports.getHolidayRuleTemplatesForRange = async (req, res) => {
  try {
    const { start_date, end_date } = req.query || {};
    console.log('[getHolidayRuleTemplatesForRange] query=', { start_date, end_date });
  const rules = await HolidayRule.findAll();
    // sort rules by parsed month/day (dùng parseDayMonthString hỗ trợ cả dd/mm và dd-mm)
    rules.sort((a, b) => {
      const pa = parseDayMonthString(a.day_start) || { day: 0, month: 0 };
      const pb = parseDayMonthString(b.day_start) || { day: 0, month: 0 };
      if (pa.month !== pb.month) return pa.month - pb.month;
      return pa.day - pb.day;
    });
    console.log(`[getHolidayRuleTemplatesForRange] loaded ${rules.length} rules`);

    // if no range provided, return all
    if (!start_date || !end_date) {
      return res.status(200).json(new SuccessResponse(rules, 'Lấy mẫu thành công'));
    }

    // Normalize semester start/end to Vietnam timezone (GMT+7) at local midnight.
    // This ensures comparisons with lunar->solar results (which are converted to GMT+7) are consistent.
    const toVietnamMidnight = (isoDateStr) => {
      // expecting 'YYYY-MM-DD'
      const parts = (isoDateStr || '').split('-').map(p => parseInt(p, 10));
      if (parts.length < 3 || parts.some(isNaN)) return null;
      const [y, m, d] = parts;
      // UTC midnight for that date, then shift +7h to represent Vietnam midnight in UTC epoch
      return new Date(Date.UTC(y, m - 1, d) + 7 * 60 * 60 * 1000);
    };

    const semStart = toVietnamMidnight(start_date);
    const semEnd = toVietnamMidnight(end_date);
    console.log('[getHolidayRuleTemplatesForRange] semStart, semEnd =', semStart, semEnd);

    const overlaps = (aStart, aEnd, bStart, bEnd) => !(aEnd < bStart || aStart > bEnd);

    // simple cache for lunar->solar conversions: key = `${year}|${month}|${day}|${isLeap}` -> Date
    const convCache = new Map();
    const convertLunarCached = (y, m, d, isLeap) => {
      const key = `${y}|${m}|${d}|${isLeap ? 1 : 0}`;
      if (convCache.has(key)) return convCache.get(key);
      try {
        // our util signature: convertLunarToSolar(lunarYear, lunarMonth, lunarDay, isLeap=false)
        const dt = convertLunarToSolar(y, m, d, !!isLeap);
        convCache.set(key, dt);
        return dt;
      } catch (e) {
        console.error(`[getHolidayRuleTemplatesForRange] convertLunarCached failed for key=${key}`, e && e.stack ? e.stack : e);
        convCache.set(key, null);
        return null;
      }
    };

    // Logic tối ưu: Với mỗi rule, thử tính ngày nghỉ theo năm của semester.
    // Học kỳ 1 (9-12): dùng yearStart
    // Học kỳ 2 (1-5): rule tháng 1-5 dùng yearStart, rule tháng 9-12 dùng yearStart-1
    const templates = [];
    const yearStart = semStart.getFullYear();

    for (const r of rules) {
      const ds = parseDayMonthString(r.day_start);
      const de = parseDayMonthString(r.day_end) || ds;

      // Nếu không parse được ngày, bỏ qua rule này
      if (!ds) {
        continue;
      }

      // Helper: tạo Date từ (year, month, day) và kiểm tra overlap với semester
      const tryYear = (year) => {
        let ruleStart, ruleEnd;

        if (r.is_lunar) {
          const isLeap = !!(r.is_leap_month || r.isLeapMonth);
          const sStart = convertLunarCached(year, ds.month, ds.day, isLeap);
          if (!sStart) return null;
          ruleStart = sStart;

          // Xử lý trường hợp day_end < day_start (VD: 30/12-02/01)
          let endYear = year;
          if (de.month < ds.month || (de.month === ds.month && de.day < ds.day)) {
            endYear = year + 1;
          }
          const sEnd = convertLunarCached(endYear, de.month, de.day, isLeap);
          if (!sEnd) return null;
          ruleEnd = sEnd;
        } else {
          // Solar rule - sử dụng UTC+7 (Vietnam timezone) để tránh lệch ngày
          // Tạo Date ở UTC midnight, sau đó cộng 7 giờ
          ruleStart = new Date(Date.UTC(year, ds.month - 1, ds.day) + 7 * 60 * 60 * 1000);
          
          // Xử lý trường hợp day_end < day_start (VD: 30/12-02/01 hoặc 30/04-01/05)
          let endYear = year;
          if (de.month < ds.month || (de.month === ds.month && de.day < ds.day)) {
            endYear = year + 1;
          }
          ruleEnd = new Date(Date.UTC(endYear, de.month - 1, de.day) + 7 * 60 * 60 * 1000);
        }

        // Kiểm tra overlap
        if (overlaps(ruleStart, ruleEnd, semStart, semEnd)) {
          return { ruleStart, ruleEnd };
        }
        return null;
      };

      // Thử yearStart trước
      let result = tryYear(yearStart);

      // Nếu không overlap, thử yearStart + 1 (cover holidays in next calendar year, e.g., 01/01 falls in next year for semester spanning new year)
      if (!result) {
        result = tryYear(yearStart + 1);
      }

      // Nếu vẫn không overlap, thử yearStart - 1 (cho trường hợp HK2 có rule tháng 9-12 năm trước)
      if (!result) {
        result = tryYear(yearStart - 1);
      }

      // Nếu vẫn không match, bỏ qua rule này
      if (!result) continue;

      const { ruleStart, ruleEnd } = result;
      const startIso = ruleStart.toISOString().split('T')[0];
      const endIso = ruleEnd.toISOString().split('T')[0];

      const plain = r.toJSON ? r.toJSON() : r;
      // Gán day_start/day_end thành ngày đầy đủ YYYY-MM-DD
      plain.day_start = startIso;
      plain.day_end = endIso;
      templates.push(Object.assign({}, plain, {
        start_date: startIso,
        end_date: endIso,
      }));
    }

    // Sort templates by start_date then end_date
    templates.sort((a, b) => {
      if (!a.start_date && !b.start_date) return 0;
      if (!a.start_date) return 1;
      if (!b.start_date) return -1;
      if (a.start_date !== b.start_date) return a.start_date < b.start_date ? -1 : 1;
      if (a.end_date !== b.end_date) return a.end_date < b.end_date ? -1 : 1;
      return 0;
    });

    res.status(200).json(new SuccessResponse(templates, 'Lấy mẫu theo khoảng ngày thành công'));
  } catch (err) {
    console.error('[getHolidayRuleTemplatesForRange] error (err):', err);
    if (err && err.parent) console.error('parent:', err.parent);
    if (err && err.original) console.error('original:', err.original);
    if (err && err.sql) console.error('sql:', err.sql);
    res.status(500).json(new ErrorResponse(err.message || 'Internal Server Error', 500));
  }
};
