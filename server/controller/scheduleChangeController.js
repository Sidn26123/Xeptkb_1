const { proposeOptions, proposeRoomAlternatives } = require('../services/scheduleHelper');
const db = require('../models');

async function proposeScheduleChange(req, res) {
  try {
    const userId = req.user && req.user.id;
    let teacherId = req.user && req.user.profileId; // profileId maps to Teachers.id when available
    const { date, courseClassId, prefer, maxCandidates, scheduleInstanceId } = req.body;
    if (process.env.DEBUG_SCHEDULE_CHANGE === '1') {
      console.log('[DEBUG] proposeScheduleChange received:', { date, courseClassId, scheduleInstanceId, userId, teacherId });
    }
    if (!userId) return res.status(403).json({ success: false, reason: 'unauthorized', message: 'Không có quyền truy cập' });
    // If profileId not present, try to resolve teacher record by user_id
    if (!teacherId) {
      try {
        const teacherRec = await db.Teacher.findOne({ where: { user_id: userId } });
        teacherId = teacherRec ? teacherRec.id : null;
      } catch (e) {
        teacherId = null;
      }
    }
    const isAdmin = req.user.role && req.user.role.toLowerCase() === 'admin';
    if (!isAdmin && !teacherId) {
      return res.status(403).json({ success: false, reason: 'unauthorized', message: 'Không có quyền truy cập' });
    }

    // Debug: optionally log request and user info
    if (process.env.DEBUG_SCHEDULE_CHANGE === '1') {
      console.log('[DEBUG] proposeScheduleChange called', { user: req.user, body: req.body });
    }

    // Get courseClass to extract semesterId and verify teacher authorization
    // Use correct alias names defined in models: CourseClass.belongsTo(models.Teacher, { as: 'teacher' })
    // and Teacher.belongsTo(models.User, { as: 'user' }) so include must specify `as`.
    const courseClass = await db.CourseClass.findByPk(courseClassId, {
      include: [
        {
          model: db.Teacher,
          as: 'teacher',
          include: [
            { model: db.User, as: 'user' }
          ]
        }
      ]
    });
    if (process.env.DEBUG_SCHEDULE_CHANGE === '1') {
      console.log('[DEBUG] courseClass loaded', courseClass ? { id: courseClass.id, teacher_id: courseClass.teacher_id, semester_id: courseClass.semester_id } : null);
      // Also check Teaching join if present
      try {
        const teachingLink = await db.Teaching.findOne({ where: { teacher_id: teacherId, course_class_id: courseClassId } });
        console.log('[DEBUG] teachingLink for user on courseClass:', teachingLink ? { id: teachingLink.id } : null);
      } catch (e) {
        console.log('[DEBUG] teachingLink lookup failed (maybe Teaching model missing):', e.message);
      }
    }
    if (!courseClass) return res.status(404).json({ success: false, reason: 'invalid_courseclass', message: 'Không tìm thấy học phần' });
    
    // Authorization: teacher can only change their own classes (admin can change any)
    if (process.env.DEBUG_SCHEDULE_CHANGE === '1') {
      console.log('[DEBUG] auth check', { isAdmin, courseClassTeacherId: courseClass.teacher_id, requestUserTeacherId: teacherId, requestUserId: userId, owns: courseClass.teacher_id === teacherId });
    }
    if (!isAdmin && courseClass.teacher_id !== teacherId) {
      return res.status(403).json({ success: false, reason: 'unauthorized', message: 'Bạn không có quyền thay đổi lớp này' });
    }
    
    // Get active generation for this semester
    const semesterId = courseClass.semester_id;
    const activeGeneration = await db.ScheduleGeneration.findOne({
      where: { semester_id: semesterId },
      order: [['generated_at', 'DESC']]
    });
    const generationId = activeGeneration ? activeGeneration.id : null;

    const result = await proposeOptions({ 
      date, 
      teacherId, 
      courseClassId, 
      prefer, 
      maxCandidates, 
      semesterId, 
      generationId,
      excludeInstanceId: scheduleInstanceId 
    });
    if (!result.success) {
      // Add Vietnamese error messages
      const messages = {
        'date_in_past': 'Ngày đã qua, không thể thay đổi',
        'date_is_holiday': `Ngày này là ngày nghỉ: ${result.holiday || ''}`,
        'sunday_not_allowed': 'Chủ nhật không có lịch học',
        'invalid_courseclass': 'Không tìm thấy học phần',
        'no_available_slots': 'Không tìm thấy phòng và giờ phù hợp'
      };
      return res.status(400).json({ ...result, message: messages[result.reason] || result.reason });
    }
    return res.json(result);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, reason: 'server_error', message: 'Lỗi hệ thống: ' + err.message });
  }
}

async function proposeRoomChange(req, res) {
  try {
    // Lấy giờ hiện tại của hệ thống theo dạng UTC
    const nowUTC = new Date().toISOString();
    if (process.env.DEBUG_SCHEDULE_CHANGE === '1') {
      console.log('[DEBUG] Current UTC time:', nowUTC);
    }
    const userId = req.user && req.user.id;
    let teacherId = req.user && req.user.profileId;
    const { date, courseClassId, fixedTimeSlotId, scheduleInstanceId, maxCandidates } = req.body;
    if (!userId) return res.status(403).json({ success: false, reason: 'unauthorized', message: 'Không có quyền truy cập' });
    if (!teacherId) {
      try {
        const teacherRec = await db.Teacher.findOne({ where: { user_id: userId } });
        teacherId = teacherRec ? teacherRec.id : null;
      } catch (e) {
        teacherId = null;
      }
    }
    const isAdmin = req.user.role && req.user.role.toLowerCase() === 'admin';
    if (!isAdmin && !teacherId) return res.status(403).json({ success: false, reason: 'unauthorized', message: 'Không có quyền truy cập' });

    // Get courseClass and authorize
    const courseClass = await db.CourseClass.findByPk(courseClassId);
    if (!courseClass) return res.status(404).json({ success: false, reason: 'invalid_courseclass', message: 'Không tìm thấy học phần' });
    if (!isAdmin && courseClass.teacher_id !== teacherId) return res.status(403).json({ success: false, reason: 'unauthorized', message: 'Bạn không có quyền thay đổi lớp này' });

    // determine semester/generation if useful
    const semesterId = courseClass.semester_id;

    // Build params for service
    const params = {
      date,
      teacherId,
      courseClassId,
      fixedTimeSlotId: fixedTimeSlotId || null,
      excludeInstanceId: scheduleInstanceId || null,
      excludeRoomId: null,
      maxCandidates: maxCandidates || null,
      semesterId
    };

    const result = await proposeRoomAlternatives(params);
    if (!result.success) {
      const messages = {
        'date_in_past': 'Ngày đã qua, không thể thay đổi',
        'date_is_holiday': `Ngày này là ngày nghỉ: ${result.holiday || ''}`,
        'sunday_not_allowed': 'Chủ nhật không có lịch học',
        'invalid_courseclass': 'Không tìm thấy học phần',
        'no_available_rooms_at_this_time': 'Không có phòng trống vào thời điểm này',
        'invalid_timeslot': 'Tiết không hợp lệ'
      };
      return res.status(400).json({ ...result, message: messages[result.reason] || result.reason });
    }
    return res.json(result);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, reason: 'server_error', message: 'Lỗi hệ thống: ' + err.message });
  }
}

async function proposeTimeChange(req, res) {
  // thin wrapper that preserves existing behavior of proposeScheduleChange
  return proposeScheduleChange(req, res);
}

async function applyScheduleChange(req, res) {
  const t = await db.sequelize.transaction();
  try {
    const userId = req.user && req.user.id;
    let teacherId = req.user && req.user.profileId;
    const { date, courseClassId, selectedRoomId, selectedStartSlot, reason, scheduleInstanceId } = req.body;
    if (!userId) {
      await t.rollback();
      return res.status(403).json({ success: false, reason: 'unauthorized', message: 'Không có quyền truy cập' });
    }
    if (!teacherId) {
      try {
        const teacherRec = await db.Teacher.findOne({ where: { user_id: userId }, transaction: t });
        teacherId = teacherRec ? teacherRec.id : null;
      } catch (e) {
        teacherId = null;
      }
    }
    const isAdmin = req.user.role && req.user.role.toLowerCase() === 'admin';
    if (!isAdmin && !teacherId) {
      await t.rollback();
      return res.status(403).json({ success: false, reason: 'unauthorized', message: 'Không có quyền truy cập' });
    }

    if (process.env.DEBUG_SCHEDULE_CHANGE === '1') {
      console.log('[DEBUG] applyScheduleChange called', { user: req.user, body: req.body });
    }

    // Get courseClass and verify authorization
    const courseClass = await db.CourseClass.findByPk(courseClassId, { transaction: t });
    if (process.env.DEBUG_SCHEDULE_CHANGE === '1') {
      console.log('[DEBUG] courseClass loaded (apply)', courseClass ? { id: courseClass.id, teacher_id: courseClass.teacher_id, semester_id: courseClass.semester_id } : null);
      try {
        const teachingLink = await db.Teaching.findOne({ where: { teacher_id: teacherId, course_class_id: courseClassId }, transaction: t });
        console.log('[DEBUG] teachingLink (apply):', teachingLink ? { id: teachingLink.id } : null);
      } catch (e) {
        console.log('[DEBUG] teachingLink lookup failed (apply):', e.message);
      }
    }
    if (!courseClass) {
      await t.rollback();
      return res.status(404).json({ success: false, reason: 'invalid_courseclass', message: 'Không tìm thấy học phần' });
    }
    
    // Authorization: teacher can only change their own classes (admin can change any)
    if (process.env.DEBUG_SCHEDULE_CHANGE === '1') {
      console.log('[DEBUG] auth check (apply)', { isAdmin, courseClassTeacherId: courseClass.teacher_id, requestUserTeacherId: teacherId, requestUserId: userId, owns: courseClass.teacher_id === teacherId });
    }
    if (!isAdmin && courseClass.teacher_id !== teacherId) {
      await t.rollback();
      return res.status(403).json({ success: false, reason: 'unauthorized', message: 'Bạn không có quyền thay đổi lớp này' });
    }

    // Validate selected proposal before attempting update
    const proposalsRes = await proposeOptions({ date, teacherId, courseClassId, semesterId: courseClass.semester_id });
    if (!proposalsRes.success) {
      await t.rollback();
      return res.status(400).json({ success: false, reason: 'no_available_slots', message: 'Không còn phương án khả thi' });
    }

    const found = proposalsRes.proposals.find(p => p.room_id === selectedRoomId && p.start_slot === selectedStartSlot);
    if (!found) {
      await t.rollback();
      return res.status(400).json({ success: false, reason: 'proposal_no_longer_valid', message: 'Phương án đã chọn không còn hợp lệ' });
    }

    // Require an explicit scheduleInstanceId to update. If not provided, reject.
    if (!scheduleInstanceId) {
      await t.rollback();
      return res.status(400).json({ success: false, reason: 'missing_instance_id', message: 'Thiếu scheduleInstanceId để cập nhật' });
    }

    if (process.env.DEBUG_SCHEDULE_CHANGE === '1') {
      console.log('[DEBUG] looking for instance', { scheduleInstanceId, date, courseClassId });
    }

    // Find the specific instance requested and ensure it belongs to the courseClass
    const oldInstance = await db.ScheduleInstance.findOne({
      where: { id: scheduleInstanceId },
      include: [{ model: db.Schedule, as: 'schedule', required: true, where: { course_class_id: courseClassId } }],
      transaction: t,
      lock: t.LOCK.UPDATE
    });

    if (!oldInstance) {
      await t.rollback();
      return res.status(404).json({ success: false, reason: 'instance_not_found', message: 'Không tìm thấy ScheduleInstance tương ứng' });
    }

    // Validate that the room and timeslot exist
    const [roomExists, timeSlotExists] = await Promise.all([
      db.Room.findByPk(selectedRoomId, { transaction: t }),
      db.TimeSlot.findByPk(selectedStartSlot, { transaction: t })
    ]);
    
    if (!roomExists) {
      await t.rollback();
      return res.status(400).json({ success: false, reason: 'invalid_room', message: 'Phòng không tồn tại' });
    }
    
    if (!timeSlotExists) {
      await t.rollback();
      return res.status(400).json({ success: false, reason: 'invalid_timeslot', message: 'Tiết học không tồn tại' });
    }

    // Update (override) the found instance
    // Apply all requested changes: date, time slot, room, teacher, origin
    oldInstance.date = date;
    oldInstance.time_slot_id = selectedStartSlot;
    oldInstance.room_id = selectedRoomId;
    oldInstance.teacher_id = teacherId;
    oldInstance.origin = oldInstance.origin || 'manual';

    await oldInstance.save({ transaction: t });
    await t.commit();
    if (process.env.DEBUG_SCHEDULE_CHANGE === '1') {
      console.log('[DEBUG] instance updated successfully', { id: oldInstance.id, newTimeSlot: selectedStartSlot, newRoom: selectedRoomId });
    }
    return res.json({ success: true, appliedInstanceId: oldInstance.id, message: 'Đã cập nhật buổi học thành công' });
  } catch (err) {
    await t.rollback();
    console.error(err);
    return res.status(500).json({ success: false, reason: 'server_error', message: 'Lỗi hệ thống: ' + err.message });
  }
}

module.exports = { proposeScheduleChange, proposeRoomChange, proposeTimeChange, applyScheduleChange };
