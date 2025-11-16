import datetime
import random
import copy
from dataclasses import dataclass, field
from typing import List, Tuple, Optional, Set, Dict
import json
import time
from abc import ABC, abstractmethod # Thêm thư viện cho Giao diện
from collections import defaultdict


@dataclass
class TimeSlot:
    """
    [THAY ĐỔI] Một "khuôn mẫu" khung giờ trong tuần. Bỏ 'week'.
    'week' sẽ được quản lý bởi CourseSchedule.start_week/end_week.
    """
    day: int  # 2-7 (Monday-Saturday)
    period: int  # 1-12

    def __hash__(self):
        return hash((self.day, self.period))

    def __eq__(self, other):
        if not isinstance(other, TimeSlot):
            return False
        return (self.day == other.day and
                self.period == other.period)

@dataclass
class CourseSchedule:
    course_id: int
    class_id: int 
    teacher_id: int 
    student_count: int 
    weeks_needed: int 
    duration_per_slot: int 
    sessions_per_week: int

    # Các gen bị đột biến 
    room_id: int
    start_week: int
    weekly_slots: List[TimeSlot]

    # Các field mới
    required_equipment_ids: Set[int] = field(default_factory=set)
    course_type: str = "theory"
    dependency_id: Optional[int] = None
    # ============================================

    @property
    def end_week(self) -> int:
        """Tuần kết thúc được tính tự động"""
        return self.start_week + self.weeks_needed - 1

    def get_occupied_periods_at_week(self, week: int) -> Set[Tuple[int, int]]:
        """
        Lấy các tiết học (day, period) mà course này chiếm trong tuần 'week'
        """
        if not (self.start_week <= week <= self.end_week):
            return set()

        occupied = set()
        for slot in self.weekly_slots:
            # Cộng duration
            for p in range(slot.period, slot.period + self.duration_per_slot):
                occupied.add((slot.day, p))
        return occupied

    def conflicts_with(self, other: 'CourseSchedule') -> Tuple[bool, bool, bool]:
        """
        Kiểm tra xung đột tài nguyên nếu có trùng lặp về thời gian.
        Trả về (teacher_conflict, room_conflict, class_conflict)
        """
        # 1. Check week overlap
        if self.end_week < other.start_week or other.end_week < self.start_week:
            return (False, False, False)

        # 2. Check time (day, period) overlap
        my_periods = self.get_occupied_periods_at_week(self.start_week)
        other_periods = other.get_occupied_periods_at_week(other.start_week)
        
        time_overlap = my_periods.intersection(other_periods)

        if not time_overlap:
            return (False, False, False)

        # 3. Nếu có trùng lặp về THỜI GIAN, kiểm tra trùng lặp TÀI NGUYÊN
        teacher_conflict = (self.teacher_id == other.teacher_id)
        room_conflict = (self.room_id == other.room_id)
        class_conflict = (self.class_id == other.class_id)

        return (teacher_conflict, room_conflict, class_conflict)

@dataclass
class SemesterSchedule:
    """
    Thời khóa biểu cả học kỳ (Đây là 1 "Chromosome" / "Individual")
    """
    courses: List[CourseSchedule] = field(default_factory=list)
    semester_start_week: int = 1
    semester_end_week: int = 15
    max_concurrent_courses: int = 6
    fitness_score: float = float('inf') # Mặc định là vô cực
    penalty_breakdown: Dict = field(default_factory=dict)

    def __len__(self):
        return len(self.courses)

    def copy(self):
        """Deep copy"""
        # Chỉ deepcopy list, các thuộc tính khác là hằng số
        return SemesterSchedule(
            courses=[copy.deepcopy(c) for c in self.courses],
            semester_start_week=self.semester_start_week,
            semester_end_week=self.semester_end_week,
            max_concurrent_courses=self.max_concurrent_courses
        )

    def get_concurrent_courses_at_week(self, week: int) -> List[CourseSchedule]:
        """Lấy danh sách các môn đang diễn ra tại tuần này"""
        return [c for c in self.courses
                if c.start_week <= week <= c.end_week]



@dataclass
class SchedulerData:
    """
    [CẬP NHẬT] Lưu trữ dữ liệu 'tĩnh' (chỉ đọc)
    room_map giờ chứa cả equipment_ids đã được chuyển thành Set
    """
    room_map: Dict[int, dict] # <--- room_map[id]['equipment_ids'] sẽ là một Set
    teacher_map: Dict[int, dict]
    semester_start: int
    semester_end: int
    max_concurrent: int
    blocked_slots: Set[Tuple[int, int]] = field(default_factory=set)
    prime_slots: Set[Tuple[int, int]] = field(default_factory=set)

class BaseConstraint(ABC):
    """
    Giao diện (Interface) chung cho tất cả các ràng buộc.
    Mỗi ràng buộc là một "Strategy" riêng biệt.
    """
    def __init__(self, name: str, weight: float):
        self.name = name
        self.weight = weight

    @abstractmethod
    def calculate_penalty(self, schedule: SemesterSchedule, data: SchedulerData) -> float:
        """
        Tính toán tổng điểm phạt cho ràng buộc này.
        Trả về tổng số vi phạm (hàm sẽ tự nhân với trọng số).
        """
        pass
    
    def evaluate(self, schedule: SemesterSchedule, data: SchedulerData) -> float:
        """Hàm wrapper để tính điểm phạt cuối cùng (đã nhân trọng số)"""
        if self.weight == 0:
            return 0
        violations = self.calculate_penalty(schedule, data)
        return violations * self.weight

# --- CÁC RÀNG BUỘC CỨNG ---

class TeacherConflictConstraint(BaseConstraint):
    def __init__(self, weight: float):
        super().__init__('HARD_CONFLICT_TEACHER', weight)

    def calculate_penalty(self, schedule: SemesterSchedule, data: SchedulerData) -> float:
        violations = 0
        for i, course1 in enumerate(schedule.courses):
            for course2 in schedule.courses[i+1:]:
                t_conflict, _, _ = course1.conflicts_with(course2)
                if t_conflict:
                    violations += 1
        return violations

class RoomConflictConstraint(BaseConstraint):
    def __init__(self, weight: float):
        super().__init__('HARD_CONFLICT_ROOM', weight)

    def calculate_penalty(self, schedule: SemesterSchedule, data: SchedulerData) -> float:
        violations = 0
        for i, course1 in enumerate(schedule.courses):
            for course2 in schedule.courses[i+1:]:
                _, r_conflict, _ = course1.conflicts_with(course2)
                if r_conflict:
                    violations += 1
        return violations

class ClassConflictConstraint(BaseConstraint):
    def __init__(self, weight: float):
        super().__init__('HARD_CONFLICT_CLASS', weight)

    def calculate_penalty(self, schedule: SemesterSchedule, data: SchedulerData) -> float:
        violations = 0
        for i, course1 in enumerate(schedule.courses):
            for course2 in schedule.courses[i+1:]:
                _, _, c_conflict = course1.conflicts_with(course2)
                if c_conflict:
                    violations += 1
        return violations

class RoomCapacityConstraint(BaseConstraint):
    def __init__(self, weight: float):
        super().__init__('HARD_ROOM_CAPACITY', weight)

    def calculate_penalty(self, schedule: SemesterSchedule, data: SchedulerData) -> float:
        violations = 0
        for course in schedule.courses:
            room_capacity = data.room_map[course.room_id]['capacity']
            if course.student_count > room_capacity:
                violations += 1
        return violations
        
class OutOfBoundsConstraint(BaseConstraint):
    def __init__(self, weight: float):
        super().__init__('HARD_OUT_OF_BOUNDS', weight)

    def calculate_penalty(self, schedule: SemesterSchedule, data: SchedulerData) -> float:
        violations = 0
        for course in schedule.courses:
            if course.end_week > data.semester_end:
                violations += (course.end_week - data.semester_end) # Phạt nặng hơn nếu tràn nhiều
        return violations

class OutOfDailyPeriodsConstraint(BaseConstraint):
    def __init__(self, weight: float, max_periods_per_day: int = 12):
        super().__init__('HARD_OUT_OF_DAILY_PERIODS', weight)
        self.max_periods_per_day = max_periods_per_day
    #Periods trong ngày từ 1 đến max_periods_per_day
    def calculate_penalty(self, schedule: SemesterSchedule, data: SchedulerData) -> float:
        violations = 0
        for course in schedule.courses:
            for slot in course.weekly_slots:
                if slot.period < 1 or slot.period + course.duration_per_slot - 1 > self.max_periods_per_day:
                    violations += 1
        return violations

class TeacherBusySlotConstraint(BaseConstraint):
    def __init__(self, weight: float):
        super().__init__('HARD_TEACHER_BUSY', weight)

    def calculate_penalty(self, schedule: SemesterSchedule, data: SchedulerData) -> float:
        violations = 0
        for course in schedule.courses:
            teacher = data.teacher_map[course.teacher_id]
            teacher_busy_slots = teacher.get('busy_slots', set())
            
            if teacher_busy_slots:
                course_periods = course.get_occupied_periods_at_week(course.start_week)
                overlap = course_periods.intersection(teacher_busy_slots)
                violations += len(overlap)
        return violations

class TeacherAvoidSlotConstraint1(BaseConstraint):
    def __init__(self, weight: float):
        super().__init__('SOFT_TEACHER_AVOID', weight)

    def calculate_penalty(self, schedule: SemesterSchedule, data: SchedulerData) -> float:
        violations = 0
        for course in schedule.courses:
            teacher = data.teacher_map[course.teacher_id]
            avoid_slots = teacher.get('should_avoid_slots', set())
            
            if avoid_slots:
                course_periods = course.get_occupied_periods_at_week(course.start_week)
                overlap = course_periods.intersection(avoid_slots)
                violations += len(overlap)
        return violations

class TeacherAvoidSlotConstraint(BaseConstraint):
    """
    Soft constraint: Giảng viên tránh các slot không mong muốn,
    nhưng có cơ chế đền bù, giới hạn tối đa, và cân bằng giữa các giảng viên.
    """

    def __init__(self, weight: float, max_penalty_per_teacher: float = 3.0, balance_weight: float = 0.5):
        """
        Args:
            weight: Hệ số phạt cơ bản
            max_penalty_per_teacher: Giới hạn phạt tối đa mỗi giảng viên
            balance_weight: Trọng số cho penalty cân bằng giữa các giảng viên
        """
        super().__init__('SOFT_TEACHER_AVOID_BALANCED', weight)
        self.max_penalty_per_teacher = max_penalty_per_teacher
        self.balance_weight = balance_weight

    def calculate_penalty(self, schedule, data) -> float:
        """
        Tính penalty tổng thể cho toàn bộ lịch
        """
        teacher_violations = defaultdict(float)

        # 1. Tính penalty từng giảng viên
        for course in schedule.courses:
            teacher = data.teacher_map[course.teacher_id]
            avoid_slots = teacher.get('should_avoid_slots', set())
            good_slots = teacher.get('good_slots', 0)  # slot “đền bù” / ưu tiên

            if avoid_slots:
                course_periods = course.get_occupied_periods_at_week(course.start_week)
                overlap = course_periods.intersection(avoid_slots)

                # penalty cơ bản
                penalty = len(overlap)

                # giảm penalty nếu giảng viên có slot tốt
                penalty = max(0, penalty - good_slots)

                # giới hạn tối đa penalty mỗi giảng viên
                penalty = min(penalty, self.max_penalty_per_teacher)

                teacher_violations[course.teacher_id] += penalty

        # 2. Tính penalty cân bằng (balance) giữa các giảng viên
        if teacher_violations:
            avg_violation = sum(teacher_violations.values()) / len(teacher_violations)
            balance_penalty = sum(abs(v - avg_violation) for v in teacher_violations.values())
        else:
            balance_penalty = 0

        # 3. Tổng penalty (có nhân weight)
        total_penalty = sum(teacher_violations.values()) * self.weight
        total_penalty += balance_penalty * self.weight * self.balance_weight

        return total_penalty

class AvoidLunchBreakConstraint(BaseConstraint):
    """
    Ràng buộc mềm: Phạt nếu xếp lịch vào giờ nghỉ trưa.
    Giả định: Tiết 6, 7 là giờ nghỉ trưa.
    """
    def __init__(self, weight: float, lunch_periods: Set[int] = {5, 5}):
        super().__init__('SOFT_AVOID_LUNCH', weight)
        self.lunch_periods = lunch_periods

    def calculate_penalty(self, schedule: SemesterSchedule, data: SchedulerData) -> float:
        violations = 0
        if not self.lunch_periods:
            return 0
            
        min_lunch = min(self.lunch_periods)
        max_lunch = max(self.lunch_periods)

        for course in schedule.courses:
            for slot in course.weekly_slots:
                start_p = slot.period
                end_p = slot.period + course.duration_per_slot - 1
                
                # Kiểm tra xem khoảng [start_p, end_p] có đè lên [min_lunch, max_lunch] không
                if max(start_p, min_lunch) <= min(end_p, max_lunch):
                    violations += 1 # Phạt 1 điểm cho mỗi slot vi phạm
        
        return violations

class RoomEquipmentConstraint(BaseConstraint):
    """
    [MỚI] Ràng buộc cứng: Kiểm tra phòng học phải có đủ thiết bị.
    """
    def __init__(self, weight: float):
        super().__init__('HARD_ROOM_EQUIPMENT', weight)

    def calculate_penalty(self, schedule: SemesterSchedule, data: SchedulerData) -> float:
        violations = 0
        for course in schedule.courses:
            if not course.required_equipment_ids:
                continue # Môn này không yêu cầu thiết bị
            
            # Lấy set thiết bị của phòng từ room_map
            room_equipment = data.room_map[course.room_id].get('equipment_ids', set())
            
            # Kiểm tra xem các thiết bị YÊU CẦU có phải là tập con của các TB PHÒNG CÓ
            if not course.required_equipment_ids.issubset(room_equipment):
                violations += 1
                
        return violations

class TheoryBeforeLabConstraint(BaseConstraint):
    """
    [MỚI] Ràng buộc cứng: Lý thuyết phải học TRƯỚC Thực hành.
    Giả định: Môn Lab sẽ có dependency_id trỏ đến ID của môn Theory.
    """
    def __init__(self, weight: float):
        super().__init__('HARD_THEORY_BEFORE_LAB', weight)

    def calculate_penalty(self, schedule: SemesterSchedule, data: SchedulerData) -> float:
        violations = 0
        
        # Tạo map để tra cứu nhanh các course trong TKB này
        course_map = {c.class_id: c for c in schedule.courses}

        for course in schedule.courses:
            # Chỉ xét các môn Lab CÓ phụ thuộc
            if course.course_type == 'lab' and course.dependency_id is not None:
                
                lab_class = course
                theory_class = course_map.get(lab_class.dependency_id)
                
                if theory_class is None:
                    # Lỗi dữ liệu (ví dụ: lớp LT không được xếp)
                    # Bỏ qua hoặc phạt nặng tùy logic
                    continue 
                
                # RÀNG BUỘC: Tuần bắt đầu của LAB phải >= tuần KẾT THÚC của THEORY
                if lab_class.start_week <= theory_class.end_week:
                    violations += 1
                    
        return violations

class TeacherDayOffConstraint(BaseConstraint):
    """
    Ràng buộc cứng: Đảm bảo ngày nghỉ cố định của giảng viên.
    """
    def __init__(self, weight: float):
        super().__init__('HARD_TEACHER_DAY_OFF', weight)

    def calculate_penalty(self, schedule: SemesterSchedule, data: SchedulerData) -> float:
        violations = 0
        for course in schedule.courses:
            teacher = data.teacher_map.get(course.teacher_id)
            if not teacher:
                continue
                
            day_off = teacher.get('day_off')
            if day_off is None:
                continue # Giảng viên này không đăng ký ngày nghỉ

            for slot in course.weekly_slots:
                if slot.day == day_off:
                    violations += 1 # Vi phạm cho mỗi slot
        
        return violations

class MeetingSlotBlockConstraint(BaseConstraint):
    """
    Ràng buộc cứng: Khóa một số slot cố định cho các hoạt động chung (họp).
    """
    def __init__(self, weight: float):
        super().__init__('HARD_MEETING_BLOCK', weight)

    def calculate_penalty(self, schedule: SemesterSchedule, data: SchedulerData) -> float:
        violations = 0
        if not data.blocked_slots:
            return 0

        for course in schedule.courses:
            # Lấy các tiết học của môn (chỉ cần 1 tuần mẫu)
            course_periods = course.get_occupied_periods_at_week(course.start_week)
            
            # Tìm các tiết bị trùng
            overlap = course_periods.intersection(data.blocked_slots)
            violations += len(overlap)
        
        return violations

class InterCampusTravelConstraint(BaseConstraint):
    """
    Ràng buộc cứng: Tránh di chuyển giữa các cơ sở khi học 2 ca liền kề.
    """
    def __init__(self, weight: float):
        super().__init__('HARD_INTER_CAMPUS_TRAVEL', weight)

    def _check_travel_for_group(self, courses: List[CourseSchedule], data: SchedulerData) -> float:
        violations = 0
        # Xây dựng lịch theo ngày: { day: List[Tuple[start, end, campus_id]] }
        daily_sessions = defaultdict(list)
        for course in courses:
            campus_id = data.room_map.get(course.room_id, {}).get('campus_id')
            if campus_id is None:
                continue # Bỏ qua nếu phòng không có thông tin cơ sở
                
            for slot in course.weekly_slots:
                start_p = slot.period
                end_p = slot.period + course.duration_per_slot - 1
                daily_sessions[slot.day].append((start_p, end_p, campus_id))
        
        # Phân tích từng ngày
        for day, sessions in daily_sessions.items():
            if len(sessions) < 2:
                continue
            
            # Sắp xếp các buổi học theo tiết bắt đầu
            sorted_sessions = sorted(sessions, key=lambda x: x[0])
            
            for i in range(len(sorted_sessions) - 1):
                session_1 = sorted_sessions[i]
                session_2 = sorted_sessions[i+1]
                
                s1_end = session_1[1]
                s2_start = session_2[0]
                
                # Kiểm tra 2 ca có "nối đuôi" nhau (cách 0 hoặc 1 tiết)
                if (s2_start == s1_end + 1): # Vừa hết ca 1 là sang ca 2
                    campus_1 = session_1[2]
                    campus_2 = session_2[2]
                    
                    if campus_1 != campus_2:
                        violations += 1 # Vi phạm di chuyển
        return violations

    def calculate_penalty(self, schedule: SemesterSchedule, data: SchedulerData) -> float:
        total_violations = 0
        
        for week in range(data.semester_start, data.semester_end + 1):
            concurrent_courses = schedule.get_concurrent_courses_at_week(week)
            if not concurrent_courses:
                continue
            
            # 1. Kiểm tra cho Sinh viên (gom theo class_id)
            schedules_by_class = defaultdict(list)
            for c in concurrent_courses:
                schedules_by_class[c.class_id].append(c)
            
            for class_id, courses in schedules_by_class.items():
                total_violations += self._check_travel_for_group(courses, data)

            # 2. Kiểm tra cho Giảng viên (gom theo teacher_id)
            schedules_by_teacher = defaultdict(list)
            for c in concurrent_courses:
                schedules_by_teacher[c.teacher_id].append(c)
                
            for teacher_id, courses in schedules_by_teacher.items():
                total_violations += self._check_travel_for_group(courses, data)
                
        return total_violations

# --- CÁC RÀNG BUỘC MỀM ---

class ConcurrentCoursesConstraint(BaseConstraint):
    def __init__(self, weight: float):
        super().__init__('SOFT_CONCURRENT_OVERLOAD', weight)

    def calculate_penalty(self, schedule: SemesterSchedule, data: SchedulerData) -> float:
        violations = 0
        for week in range(data.semester_start, data.semester_end + 1):
            concurrent = schedule.get_concurrent_courses_at_week(week)
            if len(concurrent) > data.max_concurrent:
                excess = len(concurrent) - data.max_concurrent
                violations += excess
        return violations


#Cần tối ưu lại
class MinimizeStudentGapsConstraint(BaseConstraint):
    """
    Ràng buộc mềm: Phạt nếu sinh viên (class_id) có tiết học trống.
    Phạt nặng cho "lỗ" 1 tiết, nhẹ hơn cho "lỗ" 2 tiết.
    
    """
    def __init__(self, weight: float, gap_1_penalty: float = 3.0, gap_2_penalty: float = 1.0):
        super().__init__('SOFT_STUDENT_GAPS', weight)
        self.gap_1_penalty = gap_1_penalty
        self.gap_2_penalty = gap_2_penalty

    def calculate_penalty(self, schedule: SemesterSchedule, data: SchedulerData) -> float:
        total_penalty = 0

        # Phải lặp qua từng tuần, vì lịch học thay đổi
        for week in range(data.semester_start, data.semester_end + 1):
            
            # 1. Lấy TKB của tuần này
            concurrent_courses = schedule.get_concurrent_courses_at_week(week)
            if not concurrent_courses:
                continue
                
            # 2. Gom nhóm các môn học theo class_id
            schedules_by_class = defaultdict(list)
            for course in concurrent_courses:
                schedules_by_class[course.class_id].append(course)

            # 3. Phân tích từng lớp
            for class_id, courses in schedules_by_class.items():
                
                # 4. Xây dựng lịch theo ngày cho lớp này
                daily_periods = defaultdict(set)
                for course in courses:
                    periods_this_week = course.get_occupied_periods_at_week(week)
                    for (day, period) in periods_this_week:
                        daily_periods[day].add(period)
                
                # 5. Phân tích "lỗ" (gap) cho từng ngày
                for day, periods in daily_periods.items():
                    if len(periods) < 2:
                        continue # Không thể có lỗ nếu chỉ có 1 buổi
                    
                    sorted_periods = sorted(list(periods))
                    
                    for i in range(len(sorted_periods) - 1):
                        # gap_size = số tiết trống ở giữa
                        gap_size = sorted_periods[i+1] - sorted_periods[i] - 1
                        
                        if gap_size == 1:
                            total_penalty += self.gap_1_penalty
                        elif gap_size == 2:
                            total_penalty += self.gap_2_penalty
                        # Lỗ > 2 coi như là nghỉ (không phạt)
        
        return total_penalty

class WeeklyBalanceConstraint(BaseConstraint):
    def __init__(self, weight: float):
        super().__init__('SOFT_WEEKLY_IMBALANCE', weight)

    def calculate_penalty(self, schedule: SemesterSchedule, data: SchedulerData) -> float:
        total_penalty = 0
        for course in schedule.courses:
            total_penalty += self._calculate_penalty_for_course(course)
        return total_penalty

    def _calculate_penalty_for_course(self, course: CourseSchedule) -> float:
        """Logic này được chuyển từ hàm _calculate_weekly_balance_penalty cũ"""
        if course.sessions_per_week <= 1:
            return 0
        
        days = sorted([slot.day for slot in course.weekly_slots])
        penalty = 0
        
        # Phạt nếu 2 buổi trùng ngày (trừ khi có 3+ buổi)
        if len(days) == 2 and days[0] == days[1]:
            penalty += 1 # 1 vi phạm
            
        # Phạt nếu các buổi quá gần nhau (cùng ngày hoặc ngày liền kề)
        gaps = []
        for i in range(len(days) - 1):
            gaps.append(days[i+1] - days[i])
        
        for gap in gaps:
            if gap <= 1: # Học hôm nay và mai
                penalty += 0.5 # 0.5 vi phạm
        
        return penalty

class AvoidEdgePeriodsConstraint(BaseConstraint):
    """
    Ràng buộc mềm: Phạt nếu xếp lịch vào các tiết "rìa" (quá sớm hoặc quá muộn).
    Giả định: Tiết 1, 11, 12 là các tiết rìa.
    """
    def __init__(self, weight: float, edge_periods: Set[int] = {1, 11, 12}):
        super().__init__('SOFT_AVOID_EDGE', weight)
        self.edge_periods = edge_periods

    def calculate_penalty(self, schedule: SemesterSchedule, data: SchedulerData) -> float:
        violations = 0
        if not self.edge_periods:
            return 0

        for course in schedule.courses:
            # Lấy set các (day, period) mà course này chiếm
            occupied_periods = course.get_occupied_periods_at_week(course.start_week)
            
            # Chỉ lấy các số tiết (period)
            periods_only = {p for (d, p) in occupied_periods}
            
            # Tìm các tiết vi phạm
            overlap = periods_only.intersection(self.edge_periods)
            violations += len(overlap)
            
        return violations

class MinimizeTeacherGapsConstraint(BaseConstraint):
    """
    Ràng buộc mềm: "Gom lịch" cho Giảng viên.
    Logic là tối thiểu hóa tiết trống (gap) của giảng viên.
    """
    def __init__(self, weight: float, gap_1_penalty: float = 3.0, gap_2_penalty: float = 1.0):
        super().__init__('SOFT_TEACHER_GAPS', weight)
        self.gap_1_penalty = gap_1_penalty
        self.gap_2_penalty = gap_2_penalty

    def calculate_penalty(self, schedule: SemesterSchedule, data: SchedulerData) -> float:
        total_penalty = 0

        for week in range(data.semester_start, data.semester_end + 1):
            
            concurrent_courses = schedule.get_concurrent_courses_at_week(week)
            if not concurrent_courses:
                continue
                
            # 2. [THAY ĐỔI] Gom nhóm các môn học theo teacher_id
            schedules_by_teacher = defaultdict(list)
            for course in concurrent_courses:
                schedules_by_teacher[course.teacher_id].append(course)

            # 3. Phân tích từng giảng viên
            for teacher_id, courses in schedules_by_teacher.items():
                
                # 4. Xây dựng lịch theo ngày cho GV này
                daily_periods = defaultdict(set)
                for course in courses:
                    periods_this_week = course.get_occupied_periods_at_week(week)
                    for (day, period) in periods_this_week:
                        daily_periods[day].add(period)
                
                # 5. Phân tích "lỗ" (gap) cho từng ngày (logic y hệt)
                for day, periods in daily_periods.items():
                    if len(periods) < 2:
                        continue 
                    
                    sorted_periods = sorted(list(periods))
                    
                    for i in range(len(sorted_periods) - 1):
                        gap_size = sorted_periods[i+1] - sorted_periods[i] - 1
                        
                        if gap_size == 1:
                            total_penalty += self.gap_1_penalty
                        elif gap_size == 2:
                            total_penalty += self.gap_2_penalty
        
        return total_penalty
    
class CompressStudentScheduleConstraint(BaseConstraint):
    """
    Ràng buộc mềm: "Nén" lịch học của sinh viên.
    Phạt nếu sinh viên (class_id) phải đi học quá 4 ngày/tuần.
    """
    def __init__(self, weight: float, ideal_max_days: int = 4):
        super().__init__('SOFT_STUDENT_DAYS', weight)
        self.ideal_max_days = ideal_max_days

    def calculate_penalty(self, schedule: SemesterSchedule, data: SchedulerData) -> float:
        total_penalty = 0

        for week in range(data.semester_start, data.semester_end + 1):
            
            concurrent_courses = schedule.get_concurrent_courses_at_week(week)
            if not concurrent_courses:
                continue
                
            # 1. Gom nhóm các môn học theo class_id
            schedules_by_class = defaultdict(list)
            for course in concurrent_courses:
                schedules_by_class[course.class_id].append(course)

            # 2. Phân tích từng lớp
            for class_id, courses in schedules_by_class.items():
                
                # 3. Tìm xem lớp này phải đi học bao nhiêu ngày
                days_on_campus = set()
                for course in courses:
                    periods_this_week = course.get_occupied_periods_at_week(week)
                    for (day, period) in periods_this_week:
                        days_on_campus.add(day)
                
                # 4. Tính phạt
                num_days = len(days_on_campus)
                if num_days > self.ideal_max_days:
                    # Phạt 1 điểm cho 5 ngày, 2 điểm cho 6 ngày...
                    total_penalty += (num_days - self.ideal_max_days)
        
        return total_penalty

class LimitContinuousPeriodsConstraint(BaseConstraint):
    """
    Ràng buộc mềm: Phạt nếu học/dạy quá N tiết liên tục.
    """
    def __init__(self, weight: float, max_continuous: int = 4):
        super().__init__('SOFT_LIMIT_CONTINUOUS', weight)
        self.max_continuous = max_continuous

    def _check_continuous_for_group(self, courses: List[CourseSchedule]) -> float:
        violations = 0
        daily_periods = defaultdict(set)
        
        # Lấy tất cả các tiết có học
        for course in courses:
            periods_this_week = course.get_occupied_periods_at_week(course.start_week)
            for (day, period) in periods_this_week:
                daily_periods[day].add(period)
        
        # Phân tích từng ngày
        for day, periods in daily_periods.items():
            if not periods:
                continue
            
            sorted_periods = sorted(list(periods))
            
            current_streak = 0
            last_period = -1
            
            for period in sorted_periods:
                if period == last_period + 1:
                    current_streak += 1
                else:
                    # Ghi nhận streak cũ
                    if current_streak > self.max_continuous:
                        violations += (current_streak - self.max_continuous)
                    # Bắt đầu streak mới
                    current_streak = 1
                
                last_period = period
            
            # Kiểm tra streak cuối cùng của ngày
            if current_streak > self.max_continuous:
                violations += (current_streak - self.max_continuous)
                
        return violations

    def calculate_penalty(self, schedule: SemesterSchedule, data: SchedulerData) -> float:
        total_violations = 0
        for week in range(data.semester_start, data.semester_end + 1):
            concurrent_courses = schedule.get_concurrent_courses_at_week(week)
            if not concurrent_courses: continue
            
            # 1. Kiểm tra cho Sinh viên
            schedules_by_class = defaultdict(list)
            for c in concurrent_courses: schedules_by_class[c.class_id].append(c)
            for courses in schedules_by_class.values():
                total_violations += self._check_continuous_for_group(courses)

            # 2. Kiểm tra cho Giảng viên
            schedules_by_teacher = defaultdict(list)
            for c in concurrent_courses: schedules_by_teacher[c.teacher_id].append(c)
            for courses in schedules_by_teacher.values():
                total_violations += self._check_continuous_for_group(courses)
                
        return total_violations
    
class PreferPrimeSlotsConstraint(BaseConstraint):
    """
    Ràng buộc mềm: Khuyến khích xếp lịch vào các "giờ đẹp".
    """
    def __init__(self, weight: float):
        super().__init__('SOFT_PREFER_PRIME_SLOTS', weight)

    def calculate_penalty(self, schedule: SemesterSchedule, data: SchedulerData) -> float:
        violations = 0
        if not data.prime_slots:
            return 0 # Không định nghĩa giờ đẹp

        for course in schedule.courses:
            course_periods = course.get_occupied_periods_at_week(course.start_week)
            
            for period_tuple in course_periods:
                if period_tuple not in data.prime_slots:
                    violations += 1 # Phạt 1 điểm cho mỗi tiết không "đẹp"
        
        return violations
    
class ClusterSubjectsForTeacherConstraint(BaseConstraint):
    """
    Ràng buộc mềm: Khuyến khích GV dạy các lớp của CÙNG 1 MÔN HỌC 
    vào càng ít ngày càng tốt.
    """
    def __init__(self, weight: float):
        super().__init__('SOFT_TEACHER_SUBJECT_CLUSTER', weight)

    def calculate_penalty(self, schedule: SemesterSchedule, data: SchedulerData) -> float:
        total_violations = 0
        
        for week in range(data.semester_start, data.semester_end + 1):
            concurrent_courses = schedule.get_concurrent_courses_at_week(week)
            if not concurrent_courses:
                continue

            # 1. Gom theo Giảng viên
            schedules_by_teacher = defaultdict(list)
            for c in concurrent_courses:
                schedules_by_teacher[c.teacher_id].append(c)

            # 2. Phân tích từng Giảng viên
            for teacher_id, courses in schedules_by_teacher.items():
                
                # 3. Gom các lớp của GV này theo Môn học (course_id)
                subjects_by_course_id = defaultdict(list)
                for c in courses:
                    subjects_by_course_id[c.course_id].append(c)
                
                # 4. Phân tích từng môn học
                for course_id, subject_courses in subjects_by_course_id.items():
                    if len(subject_courses) < 2:
                        continue # Chỉ có 1 lớp, không cần gom
                    
                    # Đếm xem môn này bị rải ra bao nhiêu ngày
                    days_teaching_this_subject = set()
                    for c in subject_courses:
                        for slot in c.weekly_slots:
                            days_teaching_this_subject.add(slot.day)
                    
                    num_days = len(days_teaching_this_subject)
                    if num_days > 1:
                        # Phạt bằng số ngày bị rải (trừ 1 ngày "chuẩn")
                        total_violations += (num_days - 1)
                        
        return total_violations

# ============================================================================
# GENETIC ALGORITHM - [ĐÃ CẬP NHẬT ĐỂ DÙNG CONSTRAINTS]
# ============================================================================

class SemesterGeneticScheduler:

    def __init__(self,
                 courses_to_schedule: List[dict], # <--- Đây là danh sách 'classes_to_schedule' (lớp học phần)
                 teachers: List[dict],
                 rooms: List[dict], # <--- Đây là 'rooms' (mới)
                 semester_config: dict,
                 active_constraints: List[BaseConstraint], 
                 ga_config: dict = None,
                 seed_schedule: SemesterSchedule = None 
                 ):
        
        self.courses_info = courses_to_schedule 
        self.rooms = rooms
        self.teachers = teachers
        
        # [CẬP NHẬT] Chuyển 'equipment_ids' của phòng thành Set để tra cứu nhanh
        self.room_map = {}
        for r in self.rooms:
            new_r = r.copy()
            # Chuyển list ID thành Set để dùng hàm .issubset()
            new_r['equipment_ids'] = set(r.get('equipment_ids', []))
            self.room_map[r['id']] = new_r
            
        self.teacher_map = {t['id']: t for t in self.teachers}
        
        # [CẬP NHẬT LỚN] 'eligible_rooms_map' giờ phải lọc theo CẢ SỨC CHỨA và THIẾT BỊ
        print("Pre-calculating eligible rooms (by capacity AND equipment)...")
        self.eligible_rooms_map = {}
        for course_info in self.courses_info:
            student_count = course_info['student_count']
            
            # Lấy Set thiết bị yêu cầu từ input
            required_equip_set = set(course_info.get('required_equipment_ids', []))
            
            eligible_rooms = []
            for room in self.room_map.values():
                
                # Điều kiện 1: Sức chứa
                has_capacity = room['capacity'] >= student_count
                
                # Điều kiện 2: Thiết bị
                has_equipment = True # Mặc định là True
                if required_equip_set: # Chỉ kiểm tra nếu môn này có yêu cầu
                    has_equipment = required_equip_set.issubset(room['equipment_ids'])
                
                if has_capacity and has_equipment:
                    eligible_rooms.append(room['id'])

            if not eligible_rooms:
                print(f"CRITICAL Warning: No eligible room found for course {course_info['id']} (count: {student_count}, equip: {required_equip_set})")
                # Nếu không có phòng nào, GA sẽ không thể chạy
                # Tạm thời thêm TẤT CẢ phòng để GA chạy và bị phạt
                self.eligible_rooms_map[course_info['id']] = [r['id'] for r in self.rooms]
            else:
                self.eligible_rooms_map[course_info['id']] = eligible_rooms

        self.semester_start = semester_config['start_week']
        self.semester_end = semester_config['end_week']
        self.max_concurrent = semester_config.get('max_concurrent_courses', 6)
        
        # [CẬP NHẬT] Truyền room_map (đã có equipment_ids dạng Set) vào SchedulerData
        self.scheduler_data = SchedulerData(
            room_map=self.room_map,
            teacher_map=self.teacher_map,
            semester_start=self.semester_start,
            semester_end=self.semester_end,
            max_concurrent=self.max_concurrent
        )
        
        self.constraints = active_constraints
        print(f"✅ Scheduler initialized with {len(self.constraints)} active constraints:")
        for c in self.constraints:
            print(f"   - {c.name} (Weight: {c.weight})")
        
        if self.constraints:
             # Lấy ngưỡng dựa trên trọng số cao nhất
             all_weights = [c.weight for c in self.constraints if c.weight > 0]
             if all_weights:
                 self.hard_penalty_threshold = max(all_weights) / 2
             else:
                 self.hard_penalty_threshold = 1_000_000
        else:
             self.hard_penalty_threshold = 1_000_000
        
        # GA Parameters
        self.config = ga_config or {}
        self.population_size = self.config.get('population_size', 100)
        self.generations = self.config.get('generations', 500)
        self.crossover_rate = self.config.get('crossover_rate', 0.8)
        self.mutation_rate = self.config.get('mutation_rate', 0.2)
        self.elite_size = self.config.get('elite_size', 10)
        self.tournament_size = self.config.get('tournament_size', 5)
        self.local_search_iterations = self.config.get('local_search_iterations', 10)
        # [MỚI] Đọc tham số Đột biến Thích ứng
        self.base_mutation_rate = self.config.get('mutation_rate', 0.2)
        self.current_mutation_rate = self.base_mutation_rate # Sẽ thay đổi
        self.adaptive_mutation_patience = self.config.get('adaptive_mutation_patience', 15)
        self.adaptive_mutation_high_rate = self.config.get('adaptive_mutation_high_rate', 0.5)
        self.adaptive_mutation_low_rate = self.config.get('adaptive_mutation_low_rate', 0.15)
        
        # [MỚI] Đọc tham số Điều kiện Dừng
        self.time_limit_seconds = self.config.get('time_limit_seconds', 300)
        self.target_fitness = self.config.get('target_fitness', 100)
        self.generations_to_stop = self.config.get('generations_to_stop', 50)
        
        
        self.seed_schedule = seed_schedule
        self.seed_percentage = self.config.get('seed_percentage', 0.2) # Mặc định gieo 20%
        
        if self.seed_schedule:
            print(f"   🌱 Seeding initial population with a valid schedule (approx {self.seed_percentage * 100}%)")
        
        self.best_fitness_history = []
        self.avg_fitness_history = []
    
    # [MỚI] Tách logic đột biến 1 gen ra
    def _apply_random_mutation_to_gene(self, course: CourseSchedule):
        """Áp dụng 1 đột biến ngẫu nhiên cho 1 gene (CourseSchedule)"""
        mutation_type = random.choice([
            'shift_weeks',
            'change_time_slots',
            'change_room'
        ])
        
        if mutation_type == 'shift_weeks':
            max_start = self.semester_end - course.weeks_needed + 1
            if max_start < self.semester_start: max_start = self.semester_start
            course.start_week = random.randint(self.semester_start, max_start)
        
        elif mutation_type == 'change_time_slots':
            if course.weekly_slots:
                slot_to_change = random.choice(course.weekly_slots)
                max_period = 12 - course.duration_per_slot + 1
                if max_period < 1: max_period = 1
                
                slot_to_change.day = random.randint(2, 7)
                slot_to_change.period = random.randint(1, max_period)
        
        elif mutation_type == 'change_room':
            course.room_id = random.choice(self.eligible_rooms_map[course.class_id])
    
    # [MỚI] Hàm tạo biến thể mồi (cho Diversified Seeding)
    def _create_seeded_variant(self, seed_schedule: SemesterSchedule, strategy: str) -> SemesterSchedule:
        """Tạo một biến thể mới từ TKB mồi"""
        variant = seed_schedule.copy()
        
        if strategy == 'light_mutate':
            # Đột biến nhẹ: chỉ 10% số gen
            for course in variant.courses:
                if random.random() < 0.1: # Tỷ lệ đột biến cố định 10%
                    self._apply_random_mutation_to_gene(course)
                    
        elif strategy == 'heavy_mutate':
            # Đột biến nặng: 40% số gen
            for course in variant.courses:
                if random.random() < 0.4: # Tỷ lệ đột biến cố định 40%
                    self._apply_random_mutation_to_gene(course)
                    
        elif strategy == 'swap_genes':
            # Đột biến cấu trúc: Đổi chỗ 2 gen ngẫu nhiên
            if len(variant.courses) >= 2:
                idx1, idx2 = random.sample(range(len(variant.courses)), 2)
                variant.courses[idx1], variant.courses[idx2] = variant.courses[idx2], variant.courses[idx1]
        
        # Mặc định (nếu strategy không khớp) trả về bản copy
        return variant
    
    # ========================================================================
    # INITIALIZATION [CẬP NHẬT]
    # ========================================================================
    
    # [CẬP NHẬT LỚN] generate_initial_population
    def generate_initial_population(self) -> List[SemesterSchedule]:
        """
        [CẬP NHẬT] Tạo quần thể ban đầu.
        Áp dụng Diversified Seeding nếu có self.seed_schedule.
        """
        population = []
        print("🔄 Generating initial population...")
        
        seed_count = 0
        
        if self.seed_schedule:
            seed_count = int(self.population_size * self.seed_percentage)
            if seed_count < 1 and self.population_size > 0:
                seed_count = 1
            
            print(f"   🌱 Applying Diversified Seeding for {seed_count} individuals...")
            
            for i in range(seed_count):
                # [CẬP NHẬT] Tạo các biến thể khác nhau
                if i % 3 == 0:
                    variant = self._create_seeded_variant(self.seed_schedule, 'light_mutate')
                elif i % 3 == 1:
                    variant = self._create_seeded_variant(self.seed_schedule, 'heavy_mutate')
                else:
                    variant = self._create_seeded_variant(self.seed_schedule, 'swap_genes')
                
                population.append(variant)

        # Tạo phần còn lại của quần thể (ngẫu nhiên)
        remaining_count = self.population_size - seed_count
        for _ in range(remaining_count):
            schedule = self._create_random_semester_schedule()
            population.append(schedule)
            
        print(f"✅ Generated {len(population)} schedules ({seed_count} seeded, {remaining_count} random).")
        return population
    
    def _create_random_semester_schedule(self) -> SemesterSchedule:
        """Tạo lịch học kỳ ngẫu nhiên - Không cần kiểm tra conflict"""
        schedule = SemesterSchedule(
            semester_start_week=self.semester_start,
            semester_end_week=self.semester_end,
            max_concurrent_courses=self.max_concurrent
        )
        
        for course_info in self.courses_info:
            # Tạo một "Gene" ngẫu nhiên
            gene = self._create_random_gene(course_info)
            schedule.courses.append(gene)
            
        return schedule

    def _create_random_gene(self, course_info: dict) -> CourseSchedule:
        """
        [CẬP NHẬT] Tạo 1 gene ngẫu nhiên, thêm các trường dữ liệu mới
        """
        
        class_id = course_info['id'] # Đây là ID lớp học phần
        weeks_needed = course_info['weeks_needed']
        duration = course_info['duration_per_session']
        sessions_per_week = course_info['sessions_per_week']
        
        # ... (Random Tuần bắt đầu - giữ nguyên) ...
        max_start = self.semester_end - weeks_needed + 1
        if max_start < self.semester_start: max_start = self.semester_start
        start_week = random.randint(self.semester_start, max_start)
        
        # [CẬP NHẬT] Random Phòng học (từ danh sách ĐÃ LỌC SẴN)
        room_id = random.choice(self.eligible_rooms_map[class_id])
        
        # ... (Random các slot hàng tuần - giữ nguyên) ...
        weekly_slots = []
        # max_period = 12 - duration + 1
        max_period = 10
        if max_period < 1: max_period = 1
        
        for _ in range(sessions_per_week):
            slot = TimeSlot(
                day=random.randint(2, 7), 
                period=random.randint(1, max_period)
            )
            weekly_slots.append(slot)
            
        # 4. [CẬP NHẬT] Tạo Gene với các trường mới
        course_schedule = CourseSchedule(
            course_id=course_info['course_id'],
            class_id=class_id, # ID lớp học phần
            teacher_id=course_info['teacher_id'],
            student_count=course_info['student_count'],
            weeks_needed=weeks_needed,
            duration_per_slot=duration,
            sessions_per_week=sessions_per_week,
            
            # [MỚI] Pass các trường mới vào Gene
            required_equipment_ids=set(course_info.get('required_equipment_ids', [])),
            course_type=course_info.get('type', 'theory'),
            dependency_id=course_info.get('dependency_id', None),
            
            room_id=room_id,         
            start_week=start_week,     
            weekly_slots=weekly_slots  
        )
        return course_schedule
    
    # [MỚI] Hàm Local Search (Hill Climbing)
    def _apply_hill_climbing(self, schedule: SemesterSchedule) -> SemesterSchedule:
        """
        Áp dụng local search (leo đồi) cho một cá thể.
        Thử N đột biến nhẹ và chỉ chấp nhận nếu chúng cải thiện fitness.
        """
        # Bắt đầu bằng cách tính fitness gốc
        # Quan trọng: Phải .copy() để không sửa đổi cá thể elite gốc
        current_best = schedule.copy() 
        current_best_fitness = self.fitness_function(current_best)

        for _ in range(self.local_search_iterations):
            # 1. Tạo một "hàng xóm" (neighbor) bằng 1 đột biến nhẹ
            neighbor = current_best.copy()
            
            # Chọn 1 gen ngẫu nhiên để "tweak"
            if not neighbor.courses: continue
            gene_to_tweak = random.choice(neighbor.courses)
            
            # Áp dụng 1 đột biến ngẫu nhiên
            self._apply_random_mutation_to_gene(gene_to_tweak)
            
            # 2. Đánh giá "hàng xóm"
            neighbor_fitness = self.fitness_function(neighbor)
            
            # 3. Chấp nhận nếu tốt hơn
            if neighbor_fitness < current_best_fitness:
                current_best = neighbor # "Leo" lên vị trí mới
                current_best_fitness = neighbor_fitness
                # (Chúng ta tiếp tục leo từ vị trí mới này)
        
        # Sau khi thử N lần, trả về cá thể tốt nhất tìm được
        return current_best
    # ========================================================================
    # FITNESS EVALUATION [CẤU TRÚC LẠI HOÀN TOÀN]
    # ========================================================================
    
    def fitness_function(self, schedule: SemesterSchedule) -> float:
        """
        [CẤU TRÚC LẠI] Hàm fitness - càng THẤP càng TỐT
        Hàm này giờ chỉ lặp qua các 'strategies' (ràng buộc) đã đăng ký
        và cộng dồn điểm phạt.
        """
        total_penalty = 0
        breakdown = {}
        
        # Lặp qua tất cả các ràng buộc đã được "tiêm" vào
        for constraint in self.constraints:
            
            # Hàm evaluate() đã bao gồm việc nhân với trọng số
            penalty_value = constraint.evaluate(schedule, self.scheduler_data)
            
            if penalty_value > 0:
                total_penalty += penalty_value
                # Dùng breakdown.get() để cộng dồn nếu có nhiều ràng buộc
                # cùng tên (mặc dù hiện tại chúng ta đặt tên riêng)
                breakdown[constraint.name] = breakdown.get(constraint.name, 0) + penalty_value

        schedule.fitness_score = total_penalty
        schedule.penalty_breakdown = breakdown
        return total_penalty

    # [XÓA] Hàm _calculate_weekly_balance_penalty (đã chuyển vào class)

    # ========================================================================
    # SELECTION, CROSSOVER, MUTATION [Không đổi]
    # ========================================================================
    
    def tournament_selection(self, population: List[SemesterSchedule], fitness_scores: List[float]) -> SemesterSchedule:
        """Tournament selection"""
        actual_tournament_size = min(self.tournament_size, len(population))
        tournament_indices = random.sample(range(len(population)), actual_tournament_size)
        best_idx = min(tournament_indices, key=lambda i: fitness_scores[i])
        return population[best_idx]
    
    def crossover(self, parent1: SemesterSchedule, parent2: SemesterSchedule) -> Tuple[SemesterSchedule, SemesterSchedule]:
        """Single-point crossover"""
        if random.random() > self.crossover_rate:
            return parent1.copy(), parent2.copy()
        
        min_len = min(len(parent1), len(parent2))
        if min_len <= 1:
            return parent1.copy(), parent2.copy()
        
        point = random.randint(1, min_len - 1)
        
        child1_courses = parent1.courses[:point] + parent2.courses[point:]
        child2_courses = parent2.courses[:point] + parent1.courses[point:]
        
        child1 = parent1.copy()
        child1.courses = child1_courses
        
        child2 = parent2.copy()
        child2.courses = child2_courses
        
        return child1, child2
    
    def mutate(self, schedule: SemesterSchedule) -> SemesterSchedule:
        """
        [CẬP NHẬT] Hàm đột biến chính (gọi bởi evolve).
        Sử dụng current_mutation_rate.
        """
        for i in range(len(schedule.courses)):
            if random.random() < self.current_mutation_rate:
                self._apply_random_mutation_to_gene(schedule.courses[i])
        
        return schedule
    
    # ========================================================================
    # MAIN EVOLUTION [Thay đổi nhỏ]
    # ========================================================================
    
    def evolve(self):
        """[CẬP NHẬT] Main loop - Thêm Local Search cho Elitism (Memetic)"""
        print(f"\n🧬 Starting Semester Genetic Algorithm")
        print(f"   Max Generations: {self.generations}, Pop Size: {self.population_size}")
        print(f"   Stop conditions: Time < {self.time_limit_seconds}s, Fitness < {self.target_fitness}, or No improvement for {self.generations_to_stop} gens")
        print(f"   Adaptive Mutation: Base={self.base_mutation_rate}, Low={self.adaptive_mutation_low_rate}, High={self.adaptive_mutation_high_rate}\n")
        
        population = self.generate_initial_population()
        
        if len(population) == 0:
            return {'success': False, 'error': 'Could not generate any initial schedule'}
        
        fitness_scores = [self.fitness_function(s) for s in population]
        
        # [MỚI] Biến theo dõi cho logic mới
        start_time = time.time()
        self.current_mutation_rate = self.base_mutation_rate # Reset
        best_fitness_so_far = min(fitness_scores)
        generations_no_improvement = 0
        
        for generation in range(self.generations):
            
            best_fitness_in_gen = min(fitness_scores)
            avg_fitness = sum(fitness_scores) / len(fitness_scores)
            
            self.best_fitness_history.append(best_fitness_in_gen)
            self.avg_fitness_history.append(avg_fitness)
            
            # [MỚI] Cập nhật theo dõi Đột biến Thích ứng
            if best_fitness_in_gen < best_fitness_so_far:
                best_fitness_so_far = best_fitness_in_gen
                generations_no_improvement = 0
                # Đang cải thiện tốt, giảm đột biến để tinh chỉnh
                self.current_mutation_rate = self.adaptive_mutation_low_rate
            else:
                generations_no_improvement += 1
                
            if generations_no_improvement > self.adaptive_mutation_patience:
                # Bị kẹt, tăng đột biến để "thoát"
                self.current_mutation_rate = self.adaptive_mutation_high_rate
            elif generations_no_improvement > 2: # Nếu chững lại 1 chút
                self.current_mutation_rate = self.base_mutation_rate # Quay về cơ sở
            
            # In log (có thể thêm % đột biến hiện tại)
            if generation % 20 == 0 or generation == self.generations - 1:
                print(f"Gen {generation:4d} | Best Fitness: {best_fitness_so_far:12.0f} | Avg Fitness: {avg_fitness:12.0f} | MutRate: {self.current_mutation_rate:.2f}")
            
            # [MỚI] Logic Điều kiện Dừng Thông minh
            
            # 1. Đạt target fitness (kể cả khi chưa hết ràng buộc cứng)
            if best_fitness_so_far <= self.hard_penalty_threshold:
                 # Đã hợp lệ, kiểm tra target fitness (cho ràng buộc mềm)
                 if best_fitness_so_far <= self.target_fitness:
                      print(f"\nDừng sớm tại thế hệ {generation}: Đã đạt target fitness ({self.target_fitness})!")
                      break
            
            # 2. Hội tụ (Không cải thiện)
            if generations_no_improvement >= self.generations_to_stop:
                print(f"\nDừng sớm tại thế hệ {generation}: Fitness không cải thiện sau {self.generations_to_stop} thế hệ.")
                break
            
            # 3. Hết thời gian
            if (time.time() - start_time) > self.time_limit_seconds:
                print(f"\nDừng sớm tại thế hệ {generation}: Hết thời gian ({self.time_limit_seconds} giây).")
                break
            
            # --- Selection and evolution (Giữ nguyên) ---
            new_population = []
            
            # Elitism
            sorted_idx = sorted(range(len(fitness_scores)), key=lambda i: fitness_scores[i])
            elite_count = min(self.elite_size, len(population))
            # [CẬP NHẬT LỚN] ÁP DỤNG MEMETIC ALGORITHM
            if self.local_search_iterations > 0:
                # Nếu bật Local Search, chạy nó trên các cá thể elite
                for i in range(elite_count):
                    elite_individual = population[sorted_idx[i]]
                    
                    # Tinh chỉnh cá thể elite bằng "leo đồi"
                    optimized_elite = self._apply_hill_climbing(elite_individual)
                    
                    new_population.append(optimized_elite)
            else:
                # Nếu không, chỉ giữ lại elite (như cũ)
                for i in range(elite_count):
                    new_population.append(population[sorted_idx[i]].copy())
            
            # Tạo phần còn lại của quần thể
            while len(new_population) < self.population_size:
                p1 = self.tournament_selection(population, fitness_scores)
                p2 = self.tournament_selection(population, fitness_scores)
                
                c1, c2 = self.crossover(p1, p2)
                c1 = self.mutate(c1) 
                c2 = self.mutate(c2)
                
                new_population.extend([c1, c2])
                if len(new_population) >= self.population_size:
                    break
            
            population = new_population[:self.population_size]
            # [SỬA LỖI NHỎ] Tính lại fitness_scores cho quần thể MỚI
            # (Một số cá thể elite có thể đã thay đổi)
            fitness_scores = [self.fitness_function(s) for s in population]        
        # Final result
        best_idx = fitness_scores.index(min(fitness_scores))
        best_schedule = population[best_idx]
        best_final_fitness = fitness_scores[best_idx]
        
        success = best_final_fitness < self.hard_penalty_threshold
        print(f"\n--- Evolution Finished ---")
        print(f"   Best Fitness: {best_final_fitness:.0f}")
        print(f"   Schedule is Valid (No Hard Conflicts): {success}")
        
        return {
            'success': success,
            'best_schedule': best_schedule,
            'fitness': best_final_fitness,
            'penalty_breakdown': best_schedule.penalty_breakdown,
            'fitness_history': self.best_fitness_history,
            'generations_run': len(self.best_fitness_history),
            'schedule_summary': self._create_schedule_summary(best_schedule)
        }
    
    def _create_schedule_summary(self, schedule: SemesterSchedule):
        """Tạo summary của schedule"""
        summary = {
            'total_courses': len(schedule.courses),
            'weeks_used': [],
            'concurrent_load': {}
        }
        
        for week in range(schedule.semester_start_week, schedule.semester_end_week + 1):
            concurrent = schedule.get_concurrent_courses_at_week(week)
            if concurrent:
                if week not in summary['weeks_used']:
                    summary['weeks_used'].append(week)
                summary['concurrent_load'][week] = len(concurrent)
        
        return summary


def semester_schedule_to_json(best_schedule, result):
    response_data = {
        'success': result['success'],
        'semester': {
            'start_week': best_schedule.semester_start_week,
            'end_week': best_schedule.semester_end_week,
            'max_concurrent': best_schedule.max_concurrent_courses
        },
        'courses': [],
        'fitness': result['fitness'],
        'generations': result['generations_run'],
        'penalty_breakdown': result['penalty_breakdown'],
        'schedule_summary': result['schedule_summary']
    }

    # Convert mỗi course
    for course in best_schedule.courses:
        course_data = {
            'course_id': course.course_id,
            'class_id': course.class_id,
            'teacher_id': course.teacher_id,
            'room_id': course.room_id,
            'start_week': course.start_week,
            'end_week': course.end_week,
            'weeks_needed': course.weeks_needed,
            'student_count': course.student_count,
            'weekly_slots': [
                {
                    'day': slot.day,
                    'period': slot.period,
                    'duration': course.duration_per_slot
                }
                for slot in course.weekly_slots
            ]
        }

        response_data['courses'].append(course_data)

    return response_data
    
if __name__ == "__main__":
    
    # --- 1. Dữ liệu đầu vào (Input Data) ---
    # (Giữ nguyên: teachers, rooms, courses, semester_config)
    teachers = [
        {'id': 1, 'name': 'Teacher A', 'busy_slots': {(2, 1), (2, 2), (2, 3), (2, 4)}, 'should_avoid_slots': set(), 'want_slots': set(), 'days_off': set({6})}, # Bận sáng T2
        {'id': 2, 'name': 'Teacher B', 'busy_slots': {(3, 7), (3, 8)}, 'should_avoid_slots': set(), 'want_slots': set(), 'days_off': set()},
        {'id': 3, 'name': 'Teacher C', 'busy_slots': set(), 'should_avoid_slots': set(), 'want_slots': set(), 'days_off': set()},
        {'id': 4, 'name': 'Teacher D', 'busy_slots': {(6, 1), (6, 2)}, 'should_avoid_slots': set(), 'want_slots': set(), 'days_off': set()},
    ]
    equipment = [
        {"id": 1, "name": "Projector"}, {"id": 2, "name": "Computer"},
        {"id": 3, "name": "Whiteboard"}, {"id": 4, "name": "Sound System"},
        {"id": 5, "name": "Lab Equipment"}, {"id": 6, "name": "Smart Board"}
    ]
    rooms = [
        {"id": 1, "name": "Room 101", "capacity": 60, "equipment_ids": [1, 2, 3, 4], "buiding_id": 1, "campus_id": 1},
        {"id": 2, "name": "Room 102", "capacity": 50, "equipment_ids": [1, 3], "buiding_id": 1, "campus_id": 1},
        {"id": 3, "name": "Room 103", "capacity": 40, "equipment_ids": [3], "buiding_id": 1, "campus_id": 1},
        {"id": 4, "name": "Lab 1", "capacity": 35, "equipment_ids": [2, 3, 5], "buiding_id": 1, "campus_id": 1},
        {"id": 5, "name": "Lab 2", "capacity": 35, "equipment_ids": [2, 3, 5], "buiding_id": 1, "campus_id": 1},
        {"id": 6, "name": "Room 201", "capacity": 70, "equipment_ids": [1, 2, 3, 4, 6], "buiding_id": 2, "campus_id": 1},
    ]
    classes_to_schedule = [
        {
            "id": 1, # ID của lớp học phần LT
            "course_id": 101, "class_id": 1, "teacher_id": 1, "student_count": 50,
            "weeks_needed": 3, "sessions_per_week": 1, "duration_per_session": 4,
            "required_equipment_ids": [1, 3], # Yêu cầu máy chiếu, bảng
            "type": "theory",
            "dependency_id": 21 # Báo cho GA biết Lab 21 phụ thuộc vào nó
        },
        {
            "id": 21, # ID của lớp học phần TH
            "course_id": 101, "class_id": 1, "teacher_id": 2, "student_count": 25, # Chia lớp
            "weeks_needed": 4, "sessions_per_week": 1, "duration_per_session": 4,
            "required_equipment_ids": [2, 3, 5], # Yêu cầu máy tính, lab
            "type": "lab",
            "dependency_id": 1 # Báo cho GA biết nó phụ thuộc vào Theory 1
        },
        {
            "id": 2,
            "course_id": 102, "class_id": 2, "teacher_id": 3, "student_count": 40,
            "weeks_needed": 5, "sessions_per_week": 1, "duration_per_session": 4,
            "required_equipment_ids": [1, 2], # Yêu cầu máy chiếu, máy tính
            "type": "theory",
            "dependency_id": None
        },
    ]
    courses = [
        {'id': 1, 'course_id': 101, 'teacher_id': 1, 'student_count': 50, 'weeks_needed': 4, 
         'sessions_per_week': 2, 'duration_per_session': 2, 'class_id': 1},
        {'id': 2, 'course_id': 102, 'teacher_id': 2, 'student_count': 50, 'weeks_needed': 3, 
         'sessions_per_week': 2, 'duration_per_session': 2, 'class_id': 1},
        {'id': 3, 'course_id': 103, 'teacher_id': 2, 'student_count': 60, 'weeks_needed': 5, 
         'sessions_per_week': 3, 'duration_per_session': 2, 'class_id': 2},
        {'id': 4, 'course_id': 104, 'teacher_id': 3, 'student_count': 45, 'weeks_needed': 4, 
         'sessions_per_week': 2, 'duration_per_session': 2, 'class_id': 2},
        {'id': 5, 'course_id': 105, 'teacher_id': 3, 'student_count': 35, 'weeks_needed': 3, 
         'sessions_per_week': 2, 'duration_per_session': 2, 'class_id': 3},
        {'id': 6, 'course_id': 106, 'teacher_id': 4, 'student_count': 35, 'weeks_needed': 4, 
         'sessions_per_week': 2, 'duration_per_session': 2, 'class_id': 3}
        # {'id': 7, 'course_id': 107, 'teacher_id': 4, 'student_count': 55, 'weeks_needed': 5, 
        #  'sessions_per_week': 3, 'duration_per_session': 2, 'class_id': 4},
    ]
    semester_config = {
        'start_week': 1, 'end_week': 15, 'max_concurrent_courses': 3,
        "blocked_slots": [[2, 1], [2, 2]], 'prime_slots': [[2, 2], [2, 3], [2, 4], [2, 8]]
    }
    
    # [CẬP NHẬT] Từ 1 -> 3 GAConfig khác nhau cho 3 giai đoạn
    
    # Config chung
    base_ga_config = {
        'population_size': 100,
        'crossover_rate': 0.85,
        'elite_size': 10,
        'tournament_size': 5,
        'seed_percentage': 0.3, # Gieo mồi 30% cho Giai đoạn 2 & 3
        
        # Điều kiện dừng thông minh (dùng chung)
        'time_limit_seconds': 300,  # 5 phút TỐI ĐA cho 1 giai đoạn
        'target_fitness': 100,
        'generations_to_stop': 50,
    }
    
    # Config Giai đoạn 1: Feasibility (Tìm nhanh, đột biến cao)
    ga_config_p1 = base_ga_config.copy()
    ga_config_p1.update({
        'generations': 300, # Tối đa 300
        'mutation_rate': 0.3, # Cao
        'adaptive_mutation_patience': 10,
        'adaptive_mutation_high_rate': 0.6,
        'adaptive_mutation_low_rate': 0.2,
    })
    
    # Config Giai đoạn 2: Structure (Tìm kỹ, đột biến vừa)
    ga_config_p2 = base_ga_config.copy()
    ga_config_p2.update({
        'generations': 600, # Chạy lâu hơn để tối ưu cấu trúc
        'mutation_rate': 0.25, # Vừa
        'adaptive_mutation_patience': 15,
        'adaptive_mutation_high_rate': 0.5,
        'adaptive_mutation_low_rate': 0.15,
        'local_search_iterations': 10 # Tinh chỉnh elite 10 bước
    })

    # Config Giai đoạn 3: Refinement (Tinh chỉnh, đột biến thấp)
    ga_config_p3 = base_ga_config.copy()
    ga_config_p3.update({
        'generations': 300, # Chạy vừa phải
        'mutation_rate': 0.15, # Thấp
        'adaptive_mutation_patience': 20, # Kiên nhẫn hơn
        'adaptive_mutation_high_rate': 0.25, # Tăng nhẹ
        'adaptive_mutation_low_rate': 0.05, # Rất thấp
        'local_search_iterations': 20 # Tinh chỉnh elite 20 bước
    })


    structure_constraint_names = {
        # Tên các ràng buộc cứng (tự động thêm)
        'HARD_CONFLICT_TEACHER', 'HARD_CONFLICT_ROOM', 'HARD_CONFLICT_CLASS',
        'HARD_ROOM_CAPACITY', 'HARD_TEACHER_BUSY', 'HARD_OUT_OF_BOUNDS',
        'HARD_ROOM_EQUIPMENT', 'HARD_THEORY_BEFORE_LAB', 'HARD_TEACHER_DAY_OFF',
        'HARD_MEETING_BLOCK', 'HARD_INTER_CAMPUS_TRAVEL',
        
        # Tên các ràng buộc mềm "cấu trúc"
        'SOFT_STUDENT_GAPS',             # Tối ưu lỗ hổng SV
        'SOFT_TEACHER_GAPS',             # Tối ưu lỗ hổng GV
        'SOFT_STUDENT_DAYS',             # Nén lịch SV
        'SOFT_TEACHER_SUBJECT_CLUSTER',  # Gom môn GV
    }
    # --- 2. Định nghĩa trọng số và các ràng buộc ---
    
    constraint_weights = {
        'HARD_CONFLICT_TEACHER': 1_000_000,
        'HARD_CONFLICT_ROOM': 1_000_000,
        'HARD_CONFLICT_CLASS': 1_000_000,
        'HARD_ROOM_CAPACITY': 1_000_000,
        'HARD_TEACHER_BUSY': 1_000_000,
        'HARD_OUT_OF_BOUNDS': 5_000_000,
        'SOFT_AVOID_LUNCH': 1_000_000,      
        'HARD_ROOM_EQUIPMENT': 2_000_000,
        'HARD_THEORY_BEFORE_LAB': 1_000_000,
        'HARD_OUT_OF_DAILY_PERIODS': 1_000_000,
        'HARD_TEACHER_DAY_OFF': 1_000_000,
        'HARD_MEETING_BLOCK': 5_000_000,
        'HARD_INTER_CAMPUS_TRAVEL': 1_000_000,
    
        
        'SOFT_CONCURRENT_OVERLOAD': 1_000,
        'SOFT_WEEKLY_IMBALANCE': 50,
        'SOFT_AVOID_EDGE': 25,       # Phạt nhẹ tiết rìa
        'SOFT_STUDENT_GAPS': 75,     # Phạt nặng tiết trống SV
        'SOFT_TEACHER_GAPS': 50,     # Phạt tiết trống GV
        'SOFT_STUDENT_DAYS': 100,      # Phạt nặng nếu TKB bị rải
        'SOFT_LIMIT_CONTINUOUS': 50,
        'SOFT_PREFER_PRIME_SLOTS': 20, # Phạt nhẹ
        'SOFT_TEACHER_SUBJECT_CLUSTER': 70,
    }
    
    HARD_PENALTY_THRESHOLD = 1_000_000

    all_constraints = [
        TeacherConflictConstraint(weight=constraint_weights['HARD_CONFLICT_TEACHER']),
        RoomConflictConstraint(weight=constraint_weights['HARD_CONFLICT_ROOM']),
        ClassConflictConstraint(weight=constraint_weights['HARD_CONFLICT_CLASS']),
        RoomCapacityConstraint(weight=constraint_weights['HARD_ROOM_CAPACITY']),
        TeacherBusySlotConstraint(weight=constraint_weights['HARD_TEACHER_BUSY']),
        OutOfBoundsConstraint(weight=constraint_weights['HARD_OUT_OF_BOUNDS']),
        ConcurrentCoursesConstraint(weight=constraint_weights['SOFT_CONCURRENT_OVERLOAD']),
        RoomEquipmentConstraint(weight=constraint_weights['HARD_ROOM_EQUIPMENT']),
        TheoryBeforeLabConstraint(weight=constraint_weights['HARD_THEORY_BEFORE_LAB']),
        OutOfDailyPeriodsConstraint(weight=constraint_weights['HARD_OUT_OF_DAILY_PERIODS']),
        TeacherDayOffConstraint(weight=constraint_weights['HARD_TEACHER_DAY_OFF']),
        MeetingSlotBlockConstraint(weight=constraint_weights['HARD_MEETING_BLOCK']),
        InterCampusTravelConstraint(weight=constraint_weights['HARD_INTER_CAMPUS_TRAVEL']),
        
        WeeklyBalanceConstraint(weight=constraint_weights['SOFT_WEEKLY_IMBALANCE']),
        AvoidLunchBreakConstraint(weight=constraint_weights['SOFT_AVOID_LUNCH']),
        AvoidEdgePeriodsConstraint(weight=constraint_weights['SOFT_AVOID_EDGE']),
        MinimizeStudentGapsConstraint(weight=constraint_weights['SOFT_STUDENT_GAPS']),
        MinimizeTeacherGapsConstraint(weight=constraint_weights['SOFT_TEACHER_GAPS']),
        CompressStudentScheduleConstraint(weight=constraint_weights['SOFT_STUDENT_DAYS']),
        LimitContinuousPeriodsConstraint(weight=constraint_weights['SOFT_LIMIT_CONTINUOUS']),
        PreferPrimeSlotsConstraint(weight=constraint_weights['SOFT_PREFER_PRIME_SLOTS']),
        ClusterSubjectsForTeacherConstraint(weight=constraint_weights['SOFT_TEACHER_SUBJECT_CLUSTER']),
    ]
    
    structure_constraints = [
        c for c in all_constraints
        if c.name in structure_constraint_names
    ]
    
    hard_constraints_only = [
        c for c in all_constraints 
        if c.weight >= HARD_PENALTY_THRESHOLD
    ]

    # --- 3. Chạy Giai đoạn 1: Validity Run ---
    # --- 3. [CẬP NHẬT] CHẠY 3 GIAI ĐOẠN ---
    
    total_start_time = time.time()
    valid_schedule = None
    
    # ======================================================
    print("======================================================")
    print("🚀 BẮT ĐẦU GIAI ĐOẠN 1: FEASIBILITY RUN (Kiểm tra hợp lệ)")
    print("======================================================")
    
    start_time_p1 = time.time()
    
    validity_scheduler = SemesterGeneticScheduler(
        courses_to_schedule=classes_to_schedule,
        teachers=teachers,
        rooms=rooms,
        semester_config=semester_config,
        active_constraints=hard_constraints_only,
        ga_config=ga_config_p1, # <-- Dùng config P1
        seed_schedule=None
    )
    
    validity_result = validity_scheduler.evolve()
    print(f"\n⏱️ Giai đoạn 1 mất: {time.time() - start_time_p1:.2f} giây")

    if not validity_result['success']:
        print("\n======================================================")
        print("❌ LỖI NGHIÊM TRỌNG: KHÔNG THỂ GIẢI BÀI TOÁN (GĐ 1)")
        print("   Không tìm thấy TKB thỏa mãn RÀNG BUỘC CỨNG.")
    else:
        print("\n✅ GIAI ĐOẠN 1 THÀNH CÔNG: Đã tìm thấy TKB hợp lệ.")
        valid_schedule = validity_result['best_schedule'] # Lấy mồi

    # ======================================================
    if valid_schedule: # Chỉ chạy GĐ 2 nếu GĐ 1 thành công
        print("\n======================================================")
        print("✨ BẮT ĐẦU GIAI ĐOẠN 2: STRUCTURE OPTIMIZATION (Tối ưu cấu trúc)")
        print("======================================================")
        
        start_time_p2 = time.time()
        
        structure_scheduler = SemesterGeneticScheduler(
            courses_to_schedule=classes_to_schedule,
            teachers=teachers,
            rooms=rooms,
            semester_config=semester_config,
            active_constraints=structure_constraints, # <-- Dùng ràng buộc cấu trúc
            ga_config=ga_config_p2,                 # <-- Dùng config P2
            seed_schedule=valid_schedule            # <-- Dùng mồi GĐ 1
        )
        
        structure_result = structure_scheduler.evolve()
        print(f"\n⏱️ Giai đoạn 2 mất: {time.time() - start_time_p2:.2f} giây")
        
        structured_schedule = structure_result['best_schedule'] # Lấy mồi cho GĐ 3

        # ======================================================
        print("\n======================================================")
        print("💎 BẮT ĐẦU GIAI ĐOẠN 3: REFINEMENT RUN (Tinh chỉnh chất lượng)")
        print("======================================================")
        
        start_time_p3 = time.time()
        
        refinement_scheduler = SemesterGeneticScheduler(
            courses_to_schedule=classes_to_schedule,
            teachers=teachers,
            rooms=rooms,
            semester_config=semester_config,
            active_constraints=all_constraints,     # <-- Dùng TẤT CẢ ràng buộc
            ga_config=ga_config_p3,                 # <-- Dùng config P3
            seed_schedule=structured_schedule       # <-- Dùng mồi GĐ 2
        )
        
        final_result = refinement_scheduler.evolve()
        print(f"\n⏱️ Giai đoạn 3 mất: {time.time() - start_time_p3:.2f} giây")
        
        print("\n======================================================")
        print("🏆 KẾT QUẢ CUỐI CÙNG (SAU 3 GIAI ĐOẠN)")
        print(f"⏱️ Tổng thời gian: {time.time() - total_start_time:.2f} giây")
        print("======================================================")
        
        # In kết quả cuối cùng
        result = final_result
        if result['best_schedule']:
            print(f"\n   Valid Schedule Found: {result['success']}")
            print(f"   Final Fitness (Penalty): {result['fitness']:.0f}")
            print(f"   Generations Run (Total): "
                  f"{len(validity_result['fitness_history']) + 
                   len(structure_result['fitness_history']) + 
                   len(final_result['fitness_history'])}")
            
            print(f"\n📏 Quality Metrics / Penalty Breakdown (Cuối cùng):")
            if not result['penalty_breakdown']:
                  print("   NO PENALTIES. Perfect Schedule!")
            for key, value in sorted(result['penalty_breakdown'].items()):
                print(f"   - {key}: {value:.0f}")
            json_data = semester_schedule_to_json(result['best_schedule'], result)
            print(json.dumps(json_data, indent=4))
            print(f"\n📅 Detailed Course Schedule (Best Found):")
            schedule = result['best_schedule']
            teacher_names = {t['id']: t['name'] for t in teachers}
            room_names = {r['id']: r['name'] for r in rooms}
            room_caps = {r['id']: r['capacity'] for r in rooms} 
            day_names = {2: 'Mon', 3: 'Tue', 4: 'Wed', 5: 'Thu', 6: 'Fri', 7: 'Sat'}
            for course in sorted(schedule.courses, key=lambda c: (c.start_week, c.class_id)):
                # ... (in chi tiết) ...
                print(f"\n   ClassID {course.class_id} - Course {course.course_id}:")
                print(f"     Weeks: {course.start_week}-{course.end_week} ({course.weeks_needed} weeks)")
                print(f"     Teacher: {teacher_names.get(course.teacher_id, 'N/A')}")
                print(f"     Room: {room_names.get(course.room_id, 'N/A')} (Cap: {room_caps.get(course.room_id, 0)}, Need: {course.student_count})")
            
            print(f"\n📏 Quality Metrics / Penalty Breakdown (Sau Giai đoạn 2):")
            if not result['penalty_breakdown']:
                  print("   NO PENALTIES. Perfect Schedule!")
            for key, value in sorted(result['penalty_breakdown'].items()):
                print(f"   - {key}: {value:.0f}") 
               
    else:
        print("\n❌ Không thể chạy Giai đoạn 2 & 3 vì Giai đoạn 1 thất bại.")
        
        