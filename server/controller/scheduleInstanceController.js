const { Op, QueryTypes } = require('sequelize');
const Schedule = require('../models/Schedules');
const CourseClass = require('../models/CourseClasses');
const Semester = require('../models/Semesters');
const HolidayActual = require('../models/HolidayActual');
const InstructorUnavailableTime = require('../models/InstructorUnavailableTime');
const TimeSlot = require('../models/TimeSlot');
const ScheduleInstance = require('../models/ScheduleInstances');
const { SuccessResponse, ErrorResponse } = require('../utils/responseUtils');

// Helper: convert Date (YYYY-MM-DD) string to Date object (local)
function parseDate(dateStr) {
  return new Date(dateStr + 'T00:00:00');
}

function formatDate(d) {
  return d.toISOString().slice(0, 10);
}

function addDays(date, days) {
  const r = new Date(date);
  r.setDate(r.getDate() + days);
  return r;
}

function isoWeekday(date) {
  // ISO weekday: Monday=1 .. Sunday=7
  const jsDay = date.getDay(); // 0 (Sun) .. 6 (Sat)
  return jsDay === 0 ? 7 : jsDay;
}

// Check if a date is within any holidayactual ranges
function isHoliday(dateStr, holidays) {
  for (const h of holidays) {
    if (dateStr >= h.start_date && dateStr <= h.end_date) return true;
  }
  return false;
}

// POST /api/schedule-instances/generate
exports.generateInstances = async (req, res) => {
  try {
    const { semester_id, start, end, persist = false, scheduler = 'auto-gen' } = req.body;

    let rangeStart, rangeEnd;
    if (semester_id) {
      const sem = await Semester.findByPk(semester_id);
      if (!sem) return res.status(404).json(new ErrorResponse('Không tìm thấy semester', 404));
      rangeStart = sem.start;
      rangeEnd = sem.end;
    } else if (start && end) {
      rangeStart = start;
      rangeEnd = end;
    } else {
      return res.status(400).json(new ErrorResponse('Cần truyền semester_id hoặc start và end', 400));
    }

    // load holidays for semester if semester_id provided (else none)
    let holidays = [];
    if (semester_id) {
      holidays = await HolidayActual.findAll({ where: { semester_id } });
      // map to plain ranges
      holidays = holidays.map(h => ({ start_date: h.start_date, end_date: h.end_date }));
    }

    // load all courseclasses in semester (if semester_id) or all courseclasses
    let courseClassWhere = {};
    if (semester_id) courseClassWhere.semester_id = semester_id;
    const courseClasses = await CourseClass.findAll({ where: courseClassWhere });
    const courseClassMap = {};
    courseClasses.forEach(cc => { courseClassMap[cc.id] = cc; });
    const courseClassIds = courseClasses.map(cc => cc.id);

    // load schedules for these courseclasses
    const scheduleWhere = {};
    if (courseClassIds.length > 0) scheduleWhere.course_class_id = { [Op.in]: courseClassIds };
    const schedules = await Schedule.findAll({ where: scheduleWhere });

    // load instructor unavailable times for quick check
    const unavailable = await InstructorUnavailableTime.findAll();
    const unavailableSet = new Set();
    unavailable.forEach(u => {
      unavailableSet.add(`${u.teacher_id}::${u.day_id}::${u.time_slot_id}`);
    });

    // load timeslot idx map
    const timeslots = await TimeSlot.findAll();
    const tsIdx = {};
    timeslots.forEach(t => { tsIdx[t.id] = t.idx; });

    // generate instances in memory
    const instances = [];
    const sDate = parseDate(rangeStart);
    const eDate = parseDate(rangeEnd);

    for (const sched of schedules) {
      const cc = courseClassMap[sched.course_class_id];
      if (!cc) continue; // safety

      // determine teacher_id from courseclass if present
      const teacherId = cc.teacher_id || null;

      // start from first date >= sDate with weekday = sched.day_id
      let current = new Date(sDate);
      // advance until matches weekday
      const targetDay = sched.day_id; // assume 1=Mon..7=Sun
      while (isoWeekday(current) !== targetDay) {
        current = addDays(current, 1);
        if (current > eDate) break;
      }
      while (current <= eDate) {
        const dateStr = formatDate(current);
        // skip holidays
        if (!isHoliday(dateStr, holidays)) {
          // check instructor unavailable
          let status = 'scheduled';
          if (teacherId && sched.time_slot_id && unavailableSet.has(`${teacherId}::${sched.day_id}::${sched.time_slot_id}`)) {
            status = 'skipped';
          }

          instances.push({
            schedule_id: sched.id,
            course_class_id: sched.course_class_id,
            date: dateStr,
            day_id: sched.day_id,
            time_slot_id: sched.time_slot_id,
            time_slot_idx: tsIdx[sched.time_slot_id] || null,
            num_of_period: sched.num_of_period || 1,
            room_id: null,
            teacher_id: teacherId,
            status,
            origin: 'auto',
            scheduler,
            metadata: null,
          });
        }
        current = addDays(current, 7);
      }
    }

    if (persist && instances.length > 0) {
      // bulk insert (do not create duplicates naively) -- simple approach: insert all
      const created = await ScheduleInstance.bulkCreate(instances, { ignoreDuplicates: true });
      return res.status(201).json(new SuccessResponse(created, `Tạo ${created.length} schedule instances`, 201));
    }

    // return generated instances (not persisted)
    res.status(200).json(new SuccessResponse(instances, `Sinh được ${instances.length} schedule instances (preview)`));

  } catch (err) {
    console.error(err);
    res.status(500).json(new ErrorResponse(err.message, 500));
  }
};

// GET /api/v1/schedule-instances
exports.getInstances = async (req, res) => {
  try {
    const {
      start,
      end,
      class_id,
      course_class_id,
      teacher_id,
      room_id,
      status,
      page = 1,
      pageSize = 50,
    } = req.query;

    const where = ['1=1'];
    const replacements = {};

    if (start && end) {
      where.push('si.date BETWEEN :start AND :end');
      replacements.start = start;
      replacements.end = end;
    } else if (start) {
      where.push('si.date >= :start');
      replacements.start = start;
    } else if (end) {
      where.push('si.date <= :end');
      replacements.end = end;
    }

    if (course_class_id) {
      where.push('si.course_class_id = :course_class_id');
      replacements.course_class_id = course_class_id;
    }

    if (class_id) {
      where.push('cc.class_id = :class_id');
      replacements.class_id = class_id;
    }

    if (teacher_id) {
      where.push('si.teacher_id = :teacher_id');
      replacements.teacher_id = teacher_id;
    }

    if (room_id) {
      where.push('si.room_id = :room_id');
      replacements.room_id = room_id;
    }

    if (status) {
      where.push('si.status = :status');
      replacements.status = status;
    }

    const offset = (Math.max(parseInt(page, 10), 1) - 1) * parseInt(pageSize, 10);
    const limit = parseInt(pageSize, 10);

    const baseJoin = `
      FROM schedule_instances si
      LEFT JOIN timeslots ts ON si.time_slot_id = ts.id
      LEFT JOIN courseclasses cc ON si.course_class_id = cc.id
      LEFT JOIN subjects s ON cc.subject_id = s.id
      LEFT JOIN classes c ON cc.class_id = c.id
      LEFT JOIN teachers t ON si.teacher_id = t.id
      LEFT JOIN rooms r ON si.room_id = r.id
    `;

    const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const countQuery = `SELECT COUNT(DISTINCT si.id) as count ${baseJoin} ${whereClause}`;
    const countResult = await Schedule.sequelize.query(countQuery, {
      replacements,
      type: QueryTypes.SELECT,
    });
    const total = countResult && countResult[0] ? countResult[0].count : 0;

    const dataQuery = `
      SELECT si.*,
             ts.name as time_slot_name,
             ts.idx as time_slot_idx,
             cc.name as course_class_name,
             s.name as subject_name,
             c.name as class_name,
             t.name as teacher_name,
             r.code as room_code
      ${baseJoin}
      ${whereClause}
      ORDER BY si.date ASC, ts.idx ASC, si.id ASC
      LIMIT :limit OFFSET :offset
    `;

    replacements.limit = limit;
    replacements.offset = offset;

    const rows = await Schedule.sequelize.query(dataQuery, {
      replacements,
      type: QueryTypes.SELECT,
    });

    return res.status(200).json({
      success: true,
      data: rows,
      pagination: { total, page: parseInt(page, 10), pageSize: limit },
    });
  } catch (error) {
    console.error('getInstances error', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
