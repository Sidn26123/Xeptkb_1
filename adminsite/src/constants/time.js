const SLOT_DURATION = 45; // phút
const TIME_SLOTS_PER_DAY = 14; // Số khung giờ mỗi ngày
const START_HOUR = 7; // Giờ bắt đầu đầu tiên trong ngày

// Hàm tính thời gian bắt đầu và kết thúc của một khung giờ dựa trên chỉ số của nó
function calculateTimeSlot(slotIndex) {
    const startMinutes = START_HOUR * 60 + slotIndex * SLOT_DURATION;
    const endMinutes = startMinutes + SLOT_DURATION;

    const startHour = Math.floor(startMinutes / 60);
    const startMin = startMinutes % 60;
    const endHour = Math.floor(endMinutes / 60);
    const endMin = endMinutes % 60;

    const formatTime = (hour, min) => {
        return `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
    };

    return {
        start: formatTime(startHour, startMin),
        end: formatTime(endHour, endMin)
    };
}
module.exports = {
    SLOT_DURATION,
    TIME_SLOTS_PER_DAY,
    START_HOUR,
    calculateTimeSlot
};