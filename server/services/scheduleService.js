const { Schedule, CourseClass, Room, Day, TimeSlot, Teacher, Subject } = require('../models');
async function getScheduleById(id) {
  return await Schedule.findByPk(id);
}

async function getAllSchedules() {
  return await Schedule.findAll();
}

async function createSchedule(data) {
  return await Schedule.create(data);
}

async function getSchedulesFiltered(filters = {}) {
  const {
    generation_id,
    course_class_id,
    day_id,
    room_id,
    time_slot_id,
    scheduler,
  } = filters;

  const whereClause = {};

  if (generation_id) whereClause.generation_id = generation_id;
  if (course_class_id) whereClause.course_class_id = course_class_id;
  if (day_id) whereClause.day_id = day_id;
  if (room_id) whereClause.room_id = room_id;
  if (time_slot_id) whereClause.time_slot_id = time_slot_id;
  if (scheduler) whereClause.scheduler = scheduler;

  return await Schedule.findAll({
    where: whereClause,
    order: [['id', 'ASC']],
  });
}




// exports.getFormattedSchedules = async (req, res) => {
//   try {
//     const schedules = await Schedule.findAll({
//       include: [
//         {
//           model: CourseClass,
//           include: [
//             { model: Teacher, attributes: ['name', 'title'] },
//             { model: Subject, attributes: ['name', 'code'] }
//           ]
//         },
//         { model: Room, attributes: ['name', 'building'] },
//         { model: TimeSlot, attributes: ['start_hour', 'start_min', 'end_hour', 'end_min'] },
//         { model: Day, attributes: ['idx'] } // thứ 2 = 0
//       ]
//     });
//
//     // Lấy thứ 2 của tuần hiện tại
//     const monday = startOfWeek(new Date(), { weekStartsOn: 1 });
//
//     const formatted = schedules.map(s => {
//       const dayOffset = s.Day.idx; // 0 = Monday
//       const start = setMinutes(
//           setHours(
//               addDays(monday, dayOffset),
//               s.TimeSlot.start_hour
//           ),
//           s.TimeSlot.start_min
//       );
//
//       const end = setMinutes(
//           setHours(
//               addDays(monday, dayOffset),
//               s.TimeSlot.end_hour
//           ),
//           s.TimeSlot.end_min
//       );
//
//       return {
//         id: s.id,
//         title: s.CourseClass.Subject.name,
//         start,
//         end,
//         teacher: `${s.CourseClass.Teacher.title}. ${s.CourseClass.Teacher.name}`,
//         room: `${s.Room.name} - ${s.Room.building}`,
//         type: s.CourseClass.type ?? 'lecture',
//         subject: s.CourseClass.Subject.code
//       };
//     });
//
//     return res.json({
//       success: true,
//       message: "Formatted schedules",
//       data: formatted
//     });
//
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// };


module.exports = {
  getScheduleById,
  getAllSchedules,
  createSchedule,
  getSchedulesFiltered,
};