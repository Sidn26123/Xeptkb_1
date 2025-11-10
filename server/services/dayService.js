// const TimeSlot = require('../models/TimeSlot');
//
// async function getTimeSlotById(id) {
//     return await TimeSlot.findByPk(id);
// }
//
// async function getAllTimeSlots() {
//     return await TimeSlot.findAll();
// }
//
// async function createTimeSlot(data) {
//     return await TimeSlot.create(data);
// }
//
// async function updateTimeSlot(id, data) {
//     return await TimeSlot.update(data, {where: {id}});
// }
//
// async function deleteTimeSlot(id) {
//     return await TimeSlot.destroy({where: {id}});
// }
//
// module.exports = {
//     getTimeSlotById,
//     getAllTimeSlots,
//     createTimeSlot,
//     updateTimeSlot,
//     deleteTimeSlot
// };

const Day = require('../models/Days');

async function getDayById(id) {
    return await Day.findByPk(id);
}

async function getAllDays() {
    return await Day.findAll();
}

async function createDay(data) {
    return await Day.create(data);
}

async function updateDay(id, data) {
    return await Day.update(data, {where: {id}});
}

async function deleteDay(id) {
    return await Day.destroy({where: {id}});

}

module.exports = {
    getDayById,
    getAllDays,
    createDay,
    updateDay,
    deleteDay
}