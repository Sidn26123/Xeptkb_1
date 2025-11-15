import datetime
import random
import copy
from dataclasses import dataclass, field
from typing import List, Tuple, Optional, Set, Dict
import json
import time
from abc import ABC, abstractmethod # Thêm thư viện cho Giao diện

# ============================================================================
# DATA STRUCTURES - KHÔNG THAY ĐỔI NHIỀU
# ============================================================================

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
    """
    Lịch của một môn học trong học kỳ (Đây là 1 "Gene")
    teacher_id ở đây là CỐ ĐỊNH, lấy từ input.
    """
    course_id: int
    class_id: int  # ID của lớp học phần (ví dụ: 101_Nhóm 1)
    teacher_id: int # [CỐ ĐỊNH]
    student_count: int # [CỐ ĐỊNH]
    weeks_needed: int # [CỐ ĐỊNH]
    duration_per_slot: int # [CỐ ĐỊNH]
    sessions_per_week: int # [CỐ ĐỊNH]
    
    # === Các gen này sẽ bị đột biến (thay đổi) ===
    room_id: int
    start_week: int
    weekly_slots: List[TimeSlot]  # Các slot "khuôn mẫu" hàng tuần
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
            # Cộng cả duration vào
            for p in range(slot.period, slot.period + self.duration_per_slot):
                occupied.add((slot.day, p))
        return occupied

    def conflicts_with(self, other: 'CourseSchedule') -> Tuple[bool, bool, bool]:
        """
        [THAY ĐỔI] Kiểm tra xung đột tài nguyên nếu có trùng lặp về thời gian.
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
        class_conflict = (self.class_id == other.class_id) # Giả định class_id là 1 nhóm SV

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
    fitness_score: float = float('inf') # [THAY ĐỔI] Mặc định là vô cực
    penalty_breakdown: Dict = field(default_factory=dict)

    def __len__(self):
        return len(self.courses)

    def copy(self):
        """Deep copy"""
        # [THAY ĐỔI] Chỉ deepcopy list, các thuộc tính khác là hằng số
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


# ============================================================================
# [MỚI] MODULAR CONSTRAINTS (STRATEGY PATTERN)
# ============================================================================

@dataclass
class SchedulerData:
    """
    [MỚI] Lưu trữ dữ liệu 'tĩnh' (chỉ đọc) mà các ràng buộc cần để tra cứu.
    Nếu sau này bạn cần thêm 'student_preferences', 'lab_requirements',...
    bạn chỉ cần thêm vào đây.
    """
    room_map: Dict[int, dict]
    teacher_map: Dict[int, dict]
    semester_start: int
    semester_end: int
    max_concurrent: int

class BaseConstraint(ABC):
    """
    [MỚI] Giao diện (Interface) chung cho tất cả các ràng buộc.
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


# ============================================================================
# GENETIC ALGORITHM - [ĐÃ CẬP NHẬT ĐỂ DÙNG CONSTRAINTS]
# ============================================================================

class SemesterGeneticScheduler:
    """Genetic Algorithm for Semester Scheduling (Pure Scheduling)"""

    def __init__(self,
                 courses_to_schedule: List[dict],
                 teachers: List[dict],
                 rooms: List[dict],
                 semester_config: dict,
                 # [THAY ĐỔI LỚN] Nhận vào danh sách ràng buộc thay vì ga_config
                 active_constraints: List[BaseConstraint], 
                 ga_config: dict = None
                 ):
        """
        Args:
            courses_to_schedule: ...
            teachers: ...
            rooms: ...
            semester_config: ...
            active_constraints: [MỚI] List các đối tượng ràng buộc sẽ được áp dụng
            ga_config: Cấu hình GA (pop_size, generations...)
        """
        self.courses_info = courses_to_schedule # Dữ liệu gốc
        self.rooms = rooms
        self.teachers = teachers
        
        self.room_map = {r['id']: r for r in self.rooms}
        self.teacher_map = {t['id']: t for t in self.teachers}
        
        self.eligible_rooms_map = {}
        for course_info in self.courses_info:
            student_count = course_info['student_count']
            eligible_rooms = [
                r['id'] for r in self.rooms
                if r['capacity'] >= student_count
            ]
            if not eligible_rooms:
                print(f"Warning: No room large enough for course {course_info['id']} (count: {student_count})")
                eligible_rooms = [r['id'] for r in self.rooms]
                
            self.eligible_rooms_map[course_info['id']] = eligible_rooms

        self.semester_start = semester_config['start_week']
        self.semester_end = semester_config['end_week']
        self.max_concurrent = semester_config.get('max_concurrent_courses', 6)
        
        # [MỚI] Tạo đối tượng dữ liệu tĩnh
        self.scheduler_data = SchedulerData(
            room_map=self.room_map,
            teacher_map=self.teacher_map,
            semester_start=self.semester_start,
            semester_end=self.semester_end,
            max_concurrent=self.max_concurrent
        )
        
        # [MỚI] Danh sách ràng buộc được "tiêm" vào
        self.constraints = active_constraints
        print(f"✅ Scheduler initialized with {len(self.constraints)} active constraints:")
        for c in self.constraints:
            print(f"   - {c.name} (Weight: {c.weight})")
        
        # [THAY ĐỔI] Lấy mốc 'hard' penalty từ ràng buộc đầu tiên
        # (Giả định rằng ràng buộc cứng luôn có trọng số cao nhất và đứng đầu)
        if self.constraints:
             self.hard_penalty_threshold = self.constraints[0].weight
        else:
             self.hard_penalty_threshold = 1_000_000 # Giá trị dự phòng
        
        # GA Parameters
        self.config = ga_config or {}
        self.population_size = self.config.get('population_size', 100)
        self.generations = self.config.get('generations', 500)
        self.crossover_rate = self.config.get('crossover_rate', 0.8)
        self.mutation_rate = self.config.get('mutation_rate', 0.2)
        self.elite_size = self.config.get('elite_size', 10)
        self.tournament_size = self.config.get('tournament_size', 5)
        
        # [THAY ĐỔI] Bỏ 'self.penalty_weights' dict
        
        # Statistics
        self.best_fitness_history = []
        self.avg_fitness_history = []
    
    # ========================================================================
    # INITIALIZATION [Không đổi]
    # ========================================================================
    
    def generate_initial_population(self) -> List[SemesterSchedule]:
        """Tạo quần thể ban đầu - Nhanh và Ngẫu nhiên"""
        population = []
        print("🔄 Generating initial random population (Pure Scheduling)...")
        
        for _ in range(self.population_size):
            schedule = self._create_random_semester_schedule()
            population.append(schedule)
            
        print(f"✅ Generated {len(population)} random schedules.")
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
        """Tạo 1 gene (CourseSchedule) ngẫu nhiên"""
        
        class_id = course_info['id']
        weeks_needed = course_info['weeks_needed']
        duration = course_info['duration_per_session']
        sessions_per_week = course_info['sessions_per_week']
        
        # 1. Random Tuần bắt đầu
        max_start = self.semester_end - weeks_needed + 1
        if max_start < self.semester_start: max_start = self.semester_start
        start_week = random.randint(self.semester_start, max_start)
        
        # 2. Random Phòng học (từ danh sách hợp lệ)
        room_id = random.choice(self.eligible_rooms_map[class_id])
        
        # 3. Random các slot hàng tuần
        weekly_slots = []
        max_period = 12 - duration + 1
        if max_period < 1: max_period = 1
        
        for _ in range(sessions_per_week):
            slot = TimeSlot(
                day=random.randint(2, 7), # Thứ 2 - Thứ 7
                period=random.randint(1, max_period)
            )
            weekly_slots.append(slot)
            
        # 4. Tạo Gene
        course_schedule = CourseSchedule(
            course_id=course_info['course_id'],
            class_id=class_id,
            teacher_id=course_info['teacher_id'], # [CỐ ĐỊNH]
            student_count=course_info['student_count'], # [CỐ ĐỊNH]
            weeks_needed=weeks_needed, # [CỐ ĐỊNH]
            duration_per_slot=duration, # [CỐ ĐỊNH]
            sessions_per_week=sessions_per_week, # [CỐ ĐỊNH]
            
            room_id=room_id,         # [NGẪU NHIÊN]
            start_week=start_week,     # [NGẪU NHIÊN]
            weekly_slots=weekly_slots  # [NGẪU NHIÊN]
        )
        return course_schedule

    
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
        """Mutation operations"""
        
        for i in range(len(schedule.courses)):
            if random.random() < self.mutation_rate:
                course = schedule.courses[i] # Lấy gene
                
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
        
        return schedule
    
    
    # ========================================================================
    # MAIN EVOLUTION [Thay đổi nhỏ]
    # ========================================================================
    
    def evolve(self):
        """Main evolution loop"""
        print(f"\n🧬 Starting Semester Genetic Algorithm (Pure Scheduling)")
        print(f"   Semester: Week {self.semester_start} - {self.semester_end}")
        print(f"   Population: {self.population_size}, Generations: {self.generations}")
        print(f"   Mutation Rate: {self.mutation_rate}, Elite Size: {self.elite_size}\n")
        
        population = self.generate_initial_population()
        
        if len(population) == 0:
            return {'success': False, 'error': 'Could not generate any initial schedule'}
        
        # Tính fitness cho quần thể ban đầu
        fitness_scores = [self.fitness_function(s) for s in population]
        
        for generation in range(self.generations):
            
            best_fitness = min(fitness_scores)
            avg_fitness = sum(fitness_scores) / len(fitness_scores)
            
            self.best_fitness_history.append(best_fitness)
            self.avg_fitness_history.append(avg_fitness)
            
            if generation % 20 == 0 or generation == self.generations - 1:
                print(f"Gen {generation:4d} | Best Fitness: {best_fitness:12.0f} | Avg Fitness: {avg_fitness:12.0f}")
            
            # [THAY ĐỔI] Điều kiện hội tụ: khi không còn ràng buộc cứng nào
            # (Sử dụng ngưỡng hard_penalty_threshold đã lấy lúc khởi tạo)
            if best_fitness < self.hard_penalty_threshold:
                print(f"\n✅ Converged at generation {generation}! Found a valid schedule.")
                break
            
            # Selection and evolution
            new_population = []
            
            # Elitism
            sorted_idx = sorted(range(len(fitness_scores)), key=lambda i: fitness_scores[i])
            elite_count = min(self.elite_size, len(population))
            for i in range(elite_count):
                new_population.append(population[sorted_idx[i]].copy())
            
            # Create new generation
            while len(new_population) < self.population_size:
                p1 = self.tournament_selection(population, fitness_scores)
                p2 = self.tournament_selection(population, fitness_scores)
                
                c1, c2 = self.crossover(p1, p2)
                c1 = self.mutate(c1)
                c2 = self.mutate(c2)
                
                new_population.extend([c1, c2])
            
            population = new_population[:self.population_size]
            
            # Đánh giá fitness cho quần thể mới
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

# ============================================================================
# USAGE EXAMPLE [CẤU TRÚC LẠI HOÀN TOÀN]
# ============================================================================

# if __name__ == "__main__":
    
#     # --- 1. Dữ liệu đầu vào (Input Data) ---
#     teachers = [
#         {'id': 1, 'name': 'Teacher A', 'busy_slots': {(2, 1), (2, 2), (2, 3), (2, 4)}}, # Bận sáng T2
#         {'id': 2, 'name': 'Teacher B', 'busy_slots': {(3, 7), (3, 8)}}, # Bận chiều T3
#         {'id': 3, 'name': 'Teacher C', 'busy_slots': set()},
#         {'id': 4, 'name': 'Teacher D', 'busy_slots': {(6, 1), (6, 2)}}, # Bận sáng T6
#     ]
    
#     rooms = [
#         {'id': 1, 'name': 'Room 101', 'capacity': 60},
#         {'id': 2, 'name': 'Room 102', 'capacity': 50},
#         {'id': 3, 'name': 'Room 103', 'capacity': 40}, # Phòng nhỏ
#         {'id': 4, 'name': 'Room 201', 'capacity': 70},
#     ]

#     courses = [
#         {'id': 1, 'course_id': 101, 'teacher_id': 1, 'student_count': 50, 'weeks_needed': 4, 
#          'sessions_per_week': 2, 'duration_per_session': 2, 'class_id': 1},
#         {'id': 2, 'course_id': 102, 'teacher_id': 2, 'student_count': 50, 'weeks_needed': 3, 
#          'sessions_per_week': 2, 'duration_per_session': 2, 'class_id': 1},
#         {'id': 3, 'course_id': 103, 'teacher_id': 2, 'student_count': 60, 'weeks_needed': 5, 
#          'sessions_per_week': 3, 'duration_per_session': 2, 'class_id': 2},
#         {'id': 4, 'course_id': 104, 'teacher_id': 3, 'student_count': 45, 'weeks_needed': 4, 
#          'sessions_per_week': 2, 'duration_per_session': 2, 'class_id': 2},
#         {'id': 5, 'course_id': 105, 'teacher_id': 3, 'student_count': 35, 'weeks_needed': 3, 
#          'sessions_per_week': 2, 'duration_per_session': 2, 'class_id': 3},
#         {'id': 6, 'course_id': 106, 'teacher_id': 4, 'student_count': 35, 'weeks_needed': 4, 
#          'sessions_per_week': 2, 'duration_per_session': 2, 'class_id': 3}, 
#         {'id': 7, 'course_id': 107, 'teacher_id': 4, 'student_count': 55, 'weeks_needed': 5, 
#          'sessions_per_week': 3, 'duration_per_session': 2, 'class_id': 4},
#     ]
    
#     semester_config = {
#         'start_week': 1,
#         'end_week': 15,
#         'max_concurrent_courses': 3 
#     }
    
#     ga_config = {
#         'population_size': 100,
#         'generations': 500,
#         'crossover_rate': 0.85,
#         'mutation_rate': 0.25,
#         'elite_size': 10,
#         'tournament_size': 5
#     }

#     # --- 2. [MỚI] Định nghĩa trọng số và các ràng buộc ---
#     # Bạn có thể tải cái này từ file JSON hoặc DB
#     constraint_weights = {
#         'HARD_CONFLICT_TEACHER': 1_000_000,
#         'HARD_CONFLICT_ROOM': 1_000_000,
#         'HARD_CONFLICT_CLASS': 1_000_000,
#         'HARD_ROOM_CAPACITY': 1_000_000,
#         'HARD_TEACHER_BUSY': 1_000_000,
#         'HARD_OUT_OF_BOUNDS': 5_000_000,
        
#         'SOFT_CONCURRENT_OVERLOAD': 1000,
#         'SOFT_WEEKLY_IMBALANCE': 50,
#         'SOFT_NEW_CONSTRAINT': 10 # Ví dụ: thêm ràng buộc mới
#     }
    
#     # [MỚI] Đây là nơi bạn TÙY CHỈNH thuật toán
#     # Chỉ cần thêm/xóa hoặc thay đổi trọng số ở đây
    
#     active_constraints_list = [
#         # --- Hard Constraints (Ưu tiên) ---
#         TeacherConflictConstraint(weight=constraint_weights['HARD_CONFLICT_TEACHER']),
#         RoomConflictConstraint(weight=constraint_weights['HARD_CONFLICT_ROOM']),
#         ClassConflictConstraint(weight=constraint_weights['HARD_CONFLICT_CLASS']),
#         RoomCapacityConstraint(weight=constraint_weights['HARD_ROOM_CAPACITY']),
#         TeacherBusySlotConstraint(weight=constraint_weights['HARD_TEACHER_BUSY']),
#         OutOfBoundsConstraint(weight=constraint_weights['HARD_OUT_OF_BOUNDS']),
        
#         # --- Soft Constraints ---
#         ConcurrentCoursesConstraint(weight=constraint_weights['SOFT_CONCURRENT_OVERLOAD']),
#         WeeklyBalanceConstraint(weight=constraint_weights['SOFT_WEEKLY_IMBALANCE']),
        
#         # >> VÍ DỤ: Tắt một ràng buộc, chỉ cần comment nó đi:
#         # WeeklyBalanceConstraint(weight=0), # Hoặc set weight = 0
        
#         # >> VÍ DỤ: Thêm một ràng buộc mới (giả sử bạn đã tạo class)
#         # NewStudentPreferenceConstraint(weight=constraint_weights['SOFT_NEW_CONSTRAINT']),
#     ]
    
    
#     # --- 3. Chạy thuật toán ---
    
#     start_time = time.time()
    
#     scheduler = SemesterGeneticScheduler(
#         courses_to_schedule=courses,
#         teachers=teachers,
#         rooms=rooms,
#         semester_config=semester_config,
#         active_constraints=active_constraints_list, # [MỚI] Truyền vào đây
#         ga_config=ga_config
#     )
    
#     result = scheduler.evolve()
    
#     end_time = time.time()
    
#     print(f"\n⏱️ Total execution time: {end_time - start_time:.2f} seconds")
    
#     # --- 4. In kết quả (Giữ nguyên) ---
#     if result['best_schedule']:
#         print(f"\n✅ Scheduling Finished!")
#         print(f"   Valid Schedule Found: {result['success']}")
#         print(f"   Final Fitness (Penalty): {result['fitness']:.0f}")
#         print(f"   Generations: {result['generations_run']}")
        
#         print(f"\n📊 Schedule Summary:")
#         summary = result['schedule_summary']
#         print(f"   Total courses scheduled: {summary['total_courses']}")
        
#         print(f"\n   Concurrent load per week:")
#         if summary['concurrent_load']:
#              for week, load in sorted(summary['concurrent_load'].items()):
#                  print(f"         Week {week:2d}: {load} courses")
#         else:
#              print("     (No courses scheduled)")
        
#         print(f"\n📅 Detailed Course Schedule (Best Found):")
#         schedule = result['best_schedule']
        
#         teacher_names = {t['id']: t['name'] for t in teachers}
#         room_names = {r['id']: r['name'] for r in rooms}
#         room_caps = {r['id']: r['capacity'] for r in rooms} # Cần cho in ấn
#         day_names = {2: 'Mon', 3: 'Tue', 4: 'Wed', 5: 'Thu', 6: 'Fri', 7: 'Sat'}
        
#         for course in sorted(schedule.courses, key=lambda c: (c.start_week, c.class_id)):
#             print(f"\n   ClassID {course.class_id} - Course {course.course_id}:")
#             print(f"     Weeks: {course.start_week}-{course.end_week} ({course.weeks_needed} weeks)")
#             print(f"     Teacher: {teacher_names.get(course.teacher_id, 'N/A')}")
#             print(f"     Room: {room_names.get(course.room_id, 'N/A')} (Cap: {room_caps.get(course.room_id, 0)}, Need: {course.student_count})")
#             print(f"     Weekly schedule:")
#             for slot in course.weekly_slots:
#                 print(f"       - {day_names[slot.day]}: Period {slot.period}-" +
#                       f"{slot.period + course.duration_per_slot - 1}")
        
#         print(f"\n📏 Quality Metrics / Penalty Breakdown:")
#         if not result['penalty_breakdown']:
#               print("   NO PENALTIES. Perfect Schedule!")
#         for key, value in sorted(result['penalty_breakdown'].items()):
#             print(f"   - {key}: {value:.0f}")
            
#     else:
#         print(f"\n❌ Failed: {result.get('error', 'Unknown error')}")

# --- 1. Dữ liệu đầu vào (Input Data) ---
    # (Giữ nguyên: teachers, rooms, courses, semester_config, ga_config)
if __name__ == "__main__":
    teachers = [
        {'id': 1, 'name': 'Teacher A', 'busy_slots': {(2, 1), (2, 2), (2, 3), (2, 4)}}, 
        {'id': 2, 'name': 'Teacher B', 'busy_slots': {(3, 7), (3, 8)}},
        {'id': 3, 'name': 'Teacher C', 'busy_slots': set()},
        {'id': 4, 'name': 'Teacher D', 'busy_slots': {(6, 1), (6, 2)}}, 
    ]
    rooms = [
        {'id': 1, 'name': 'Room 101', 'capacity': 60}, {'id': 2, 'name': 'Room 102', 'capacity': 50},
        {'id': 3, 'name': 'Room 103', 'capacity': 40}, {'id': 4, 'name': 'Room 201', 'capacity': 70},
    ]
    courses = [
        {'id': 1, 'course_id': 101, 'teacher_id': 1, 'student_count': 50, 'weeks_needed': 4, 
         'sessions_per_week': 2, 'duration_per_session': 2, 'class_id': 1},
        {'id': 2, 'course_id': 102, 'teacher_id': 2, 'student_count': 50, 'weeks_needed': 3, 
         'sessions_per_week': 2, 'duration_per_session': 2, 'class_id': 1},
        {'id': 3, 'course_id': 103, 'teacher_id': 2, 'student_count': 60, 'weeks_needed': 5, 
         'sessions_per_week': 3, 'duration_per_session': 2, 'class_id': 2},
        # ... (thêm các course khác)
    ]
    semester_config = {
        'start_week': 1, 'end_week': 15, 'max_concurrent_courses': 3 
    }
    ga_config = {
        'population_size': 100, 'generations': 500, 'crossover_rate': 0.85,
        'mutation_rate': 0.25, 'elite_size': 10, 'tournament_size': 5
    }

    # --- 2. Định nghĩa trọng số và các ràng buộc ---
    
    constraint_weights = {
        'HARD_CONFLICT_TEACHER': 1_000_000,
        'HARD_CONFLICT_ROOM': 1_000_000,
        'HARD_CONFLICT_CLASS': 1_000_000,
        'HARD_ROOM_CAPACITY': 1_000_000,
        'HARD_TEACHER_BUSY': 1_000_000,
        'HARD_OUT_OF_BOUNDS': 5_000_000,
        
        'SOFT_CONCURRENT_OVERLOAD': 1000,
        'SOFT_WEEKLY_IMBALANCE': 50,
    }
    
    # [THAY ĐỔI] Đặt một ngưỡng cứng
    HARD_PENALTY_THRESHOLD = 1_000_000

    # [THAY ĐỔI] Đây là danh sách ĐẦY ĐỦ các ràng buộc (dùng cho Giai đoạn 2)
    all_constraints = [
        TeacherConflictConstraint(weight=constraint_weights['HARD_CONFLICT_TEACHER']),
        RoomConflictConstraint(weight=constraint_weights['HARD_CONFLICT_ROOM']),
        ClassConflictConstraint(weight=constraint_weights['HARD_CONFLICT_CLASS']),
        RoomCapacityConstraint(weight=constraint_weights['HARD_ROOM_CAPACITY']),
        TeacherBusySlotConstraint(weight=constraint_weights['HARD_TEACHER_BUSY']),
        OutOfBoundsConstraint(weight=constraint_weights['HARD_OUT_OF_BOUNDS']),
        
        ConcurrentCoursesConstraint(weight=constraint_weights['SOFT_CONCURRENT_OVERLOAD']),
        WeeklyBalanceConstraint(weight=constraint_weights['SOFT_WEEKLY_IMBALANCE']),
    ]
    
    # [MỚI] Tạo danh sách CHỈ CÓ ràng buộc cứng
    hard_constraints_only = [
        c for c in all_constraints 
        if c.weight >= HARD_PENALTY_THRESHOLD
    ]

    # --- 3. [MỚI] Chạy Giai đoạn 1: Validity Run ---
    
    print("======================================================")
    print("🚀 BẮT ĐẦU GIAI ĐOẠN 1: VALIDITY RUN (Kiểm tra hợp lệ)")
    print("======================================================")
    
    start_time_p1 = time.time()
    
    # Chỉ "tiêm" các ràng buộc cứng
    validity_scheduler = SemesterGeneticScheduler(
        courses_to_schedule=courses,
        teachers=teachers,
        rooms=rooms,
        semester_config=semester_config,
        active_constraints=hard_constraints_only, # <--- CHỈ DÙNG RÀNG BUỘC CỨNG
        ga_config=ga_config
    )
    
    validity_result = validity_scheduler.evolve()
    end_time_p1 = time.time()
    
    print(f"\n⏱️ Giai đoạn 1 mất: {end_time_p1 - start_time_p1:.2f} giây")

    valid_schedule = None
    
    # 4. [MỚI] Kiểm tra kết quả Giai đoạn 1
    
    # Kiểm tra xem best_fitness có < ngưỡng cứng không (tức là == 0)
    if not validity_result['success']:
        print("\n======================================================")
        print("❌ LỖI NGHIÊM TRỌNG: KHÔNG THỂ GIẢI BÀI TOÁN")
        print("   Không tìm thấy TKB nào thỏa mãn RÀNG BUỘC CỨNG.")
        print("   Vui lòng kiểm tra lại dữ liệu đầu vào (GV trùng lịch cố định, thiếu phòng...)")
        print("\n   Chi tiết vi phạm (của TKB 'tốt' nhất tìm được):")
        for key, value in sorted(validity_result['penalty_breakdown'].items()):
            print(f"   - {key}: {value:.0f}")
        print("======================================================")
        
        # Dừng chương trình ở đây vì không thể tiếp tục
        # exit() 
    else:
        print("\n======================================================")
        print("✅ GIAI ĐOẠN 1 THÀNH CÔNG: Đã tìm thấy TKB hợp lệ (Fitness = 0)")
        print("   TKB này thỏa mãn tất cả ràng buộc cứng.")
        print("======================================================")
        
        # Lưu lại TKB hợp lệ này để làm "mồi" cho Giai đoạn 2
        valid_schedule = validity_result['best_schedule']
        
        # (Chỗ này bạn sẽ tiếp tục code Giai đoạn 2)
        print("\n...Chuẩn bị Giai đoạn 2 (Tối ưu hóa)...")
        # ...
        # ... (Code cho Giai đoạn 2 sẽ bắt đầu từ đây)
        # ...
        
        # Tạm thời in kết quả của Giai đoạn 1
        print(f"\n📏 Chi tiết TKB Giai đoạn 1 (Chưa tối ưu):")
        print(f"   Fitness (Chỉ tính Hard): {validity_result['fitness']:.0f}")
        
        # (Bạn có thể bỏ phần in chi tiết này nếu muốn)
        print(f"   Generations: {validity_result['generations_run']}")
        if result['best_schedule']:
            print(f"\n✅ Scheduling Finished!")
            print(f"   Valid Schedule Found: {result['success']}")
            print(f"   Final Fitness (Penalty): {result['fitness']:.0f}")
            print(f"   Generations: {result['generations_run']}")
            
            print(f"\n📊 Schedule Summary:")
            summary = result['schedule_summary']
            print(f"   Total courses scheduled: {summary['total_courses']}")
            
            print(f"\n   Concurrent load per week:")
            if summary['concurrent_load']:
                for week, load in sorted(summary['concurrent_load'].items()):
                    print(f"         Week {week:2d}: {load} courses")
            else:
                print("     (No courses scheduled)")
            
            print(f"\n📅 Detailed Course Schedule (Best Found):")
            schedule = result['best_schedule']
            
            teacher_names = {t['id']: t['name'] for t in teachers}
            room_names = {r['id']: r['name'] for r in rooms}
            room_caps = {r['id']: r['capacity'] for r in rooms} # Cần cho in ấn
            day_names = {2: 'Mon', 3: 'Tue', 4: 'Wed', 5: 'Thu', 6: 'Fri', 7: 'Sat'}
            
            for course in sorted(schedule.courses, key=lambda c: (c.start_week, c.class_id)):
                print(f"\n   ClassID {course.class_id} - Course {course.course_id}:")
                print(f"     Weeks: {course.start_week}-{course.end_week} ({course.weeks_needed} weeks)")
                print(f"     Teacher: {teacher_names.get(course.teacher_id, 'N/A')}")
                print(f"     Room: {room_names.get(course.room_id, 'N/A')} (Cap: {room_caps.get(course.room_id, 0)}, Need: {course.student_count})")
                print(f"     Weekly schedule:")
                for slot in course.weekly_slots:
                    print(f"       - {day_names[slot.day]}: Period {slot.period}-" +
                        f"{slot.period + course.duration_per_slot - 1}")
            
            print(f"\n📏 Quality Metrics / Penalty Breakdown:")
            if not result['penalty_breakdown']:
                print("   NO PENALTIES. Perfect Schedule!")
            for key, value in sorted(result['penalty_breakdown'].items()):
                print(f"   - {key}: {value:.0f}")