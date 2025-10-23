from .base import SoftConstraint

class WeeklyBalanceConstraint(SoftConstraint):
    name = "balance"

    def evaluate(self, schedule):
        total_penalty = 0
        for course in schedule.courses:
            if len(course.weekly_slots) <= 1:
                continue
            
            days = sorted([slot.day for slot in course.weekly_slots])
            for i in range(len(days) - 1):
                if days[i+1] - days[i] <= 1:  # cách nhau <=1 ngày
                    total_penalty += 10
        return total_penalty
    

class TeacherConflictConstraint(SoftConstraint):
    name = "soft_conflicts"

    def evaluate(self, schedule):
        penalty = 0
        teacher_courses = {}
        for c in schedule.courses:
            teacher_courses.setdefault(c.teacher_id, []).append(c)

        for teacher_id, courses in teacher_courses.items():
            for i, c1 in enumerate(courses):
                for c2 in courses[i+1:]:
                    overlap = set(range(c1.start_week, c1.end_week + 1)) & \
                              set(range(c2.start_week, c2.end_week + 1))
                    if overlap:
                        penalty += len(overlap) * 2
        return penalty
    

class RoomDiversityConstraint(SoftConstraint):
    name = "room_diversity"

    def evaluate(self, schedule):
        unique_rooms = len(set(c.room_id for c in schedule.courses))
        return unique_rooms * 2