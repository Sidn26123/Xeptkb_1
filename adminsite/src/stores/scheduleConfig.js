import { create } from 'zustand';

const useScheduleConfigStore = create((set) => ({
    scheduleConfig: {},
    semesterConfig:{
        maxConcurrent: 4,
        sessionsPerDay: 14,
        sessionDuration: 4,
        daysPerWeek: 6
    }
}
));
