"""
Genetic Algorithm for Semester Timetable Scheduling
Thuật toán di truyền xếp thời khóa biểu theo học kỳ

New Features:
- Xếp lịch theo tuần (week-based scheduling)
- Môn học kéo dài nhiều tuần liên tiếp
- Giới hạn số môn đồng thời (concurrent courses limit)
- Tự động đẩy môn về sau khi slot đầy
"""

import datetime
import random
import copy
from dataclasses import dataclass, field
from typing import List, Tuple, Optional, Set, Dict
import json

from Doantotnghiep.backend.soft_constraint.constraints import RoomDiversityConstraint, TeacherConflictConstraint, WeeklyBalanceConstraint

# ============================================================================
# DATA STRUCTURES - EXTENDED FOR SEMESTER
# ============================================================================

@dataclass
class TimeSlot:
    """Một khung giờ cụ thể trong tuần"""
    week: int  # Tuần thứ mấy trong học kỳ (1-based)
    day: int   # 2-7 (Monday-Saturday)
    period: int  # 1-12

    def __hash__(self):
        return hash((self.week, self.day, self.period))
    
    def __eq__(self, other):
        return (self.week == other.week and 
                self.day == other.day and 
                self.period == other.period)

@dataclass
class CourseSchedule:
    """Lịch của một môn học trong học kỳ"""
    course_id: int
    class_id: int
    teacher_id: int
    room_id: int
    start_week: int  # Tuần bắt đầu
    end_week: int    # Tuần kết thúc
    weekly_slots: List[TimeSlot]  # Các slot trong 1 tuần (lặp lại mỗi tuần)
    duration_per_slot: int = 2  # Số tiết mỗi buổi
    student_count: int = 0
    
    def get_all_time_slots(self) -> List[TimeSlot]:
        """Lấy tất cả time slots từ start_week đến end_week"""
        all_slots = []
        for week in range(self.start_week, self.end_week + 1):
            for slot_template in self.weekly_slots:
                slot = TimeSlot(
                    week=week,
                    day=slot_template.day,
                    period=slot_template.period
                )
                all_slots.append(slot)
        return all_slots
    
    def conflicts_with(self, other, check_time_overlap=True) -> bool:
        """Kiểm tra xung đột với course khác"""
        # Check week overlap
        if self.end_week < other.start_week or other.end_week < self.start_week:
            return False
        
        if not check_time_overlap:
            return False
        
        # Check if same teacher or room in overlapping weeks
        overlap_weeks = set(range(self.start_week, self.end_week + 1)) & \
                       set(range(other.start_week, other.end_week + 1))
        
        if not overlap_weeks:
            return False
        
        # Check time slot conflicts
        for week in overlap_weeks:
            for my_slot in self.weekly_slots:
                for other_slot in other.weekly_slots:
                    if my_slot.day == other_slot.day:
                        # Check period overlap
                        my_periods = set(range(my_slot.period, 
                                              my_slot.period + self.duration_per_slot))
                        other_periods = set(range(other_slot.period, 
                                                 other_slot.period + other.duration_per_slot))
                        
                        if my_periods & other_periods:
                            # Conflict if same teacher or room
                            if (self.teacher_id == other.teacher_id or 
                                self.room_id == other.room_id):
                                return True
        
        return False

@dataclass
class SemesterSchedule:
    """Thời khóa biểu cả học kỳ"""
    courses: List[CourseSchedule] = field(default_factory=list)
    semester_start_week: int = 1
    semester_end_week: int = 15
    max_concurrent_courses: int = 6  # Giới hạn số môn đồng thời
    fitness_score: Optional[float] = None
    penalty_breakdown: Dict = field(default_factory=dict)
    
    def __len__(self):
        return len(self.courses)
    
    def copy(self):
        """Deep copy"""
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
    
    def get_available_start_week(self, course_weeks_needed: int) -> int:
        """
        Tìm tuần bắt đầu phù hợp cho môn học mới
        Đảm bảo không vượt quá max_concurrent_courses
        """
        for week in range(self.semester_start_week, 
                         self.semester_end_week - course_weeks_needed + 2):
            # Check if all weeks in range have space
            can_fit = True
            for w in range(week, week + course_weeks_needed):
                concurrent = self.get_concurrent_courses_at_week(w)
                if len(concurrent) >= self.max_concurrent_courses:
                    can_fit = False
                    break
            
            if can_fit:
                return week
        
        # Nếu không tìm được, trả về tuần cuối (sẽ bị penalty)
        return self.semester_end_week - course_weeks_needed + 1
    
    def is_valid_hard_constraints(self) -> Tuple[bool, str]:
        """Kiểm tra hard constraints"""
        # 1. Check conflicts between courses
        for i, course1 in enumerate(self.courses):
            for course2 in self.courses[i+1:]:
                if course1.conflicts_with(course2):
                    return False, f"Conflict: Course {course1.course_id} vs {course2.course_id}"
        
        # 2. Check each course validity
        for course in self.courses:
            # Check weeks are valid
            if not (self.semester_start_week <= course.start_week <= self.semester_end_week):
                return False, f"Invalid start_week: {course.start_week}"
            if not (self.semester_start_week <= course.end_week <= self.semester_end_week):
                return False, f"Invalid end_week: {course.end_week}"
            if course.start_week > course.end_week:
                return False, f"start_week > end_week"
            
            # Check time slots
            for slot in course.weekly_slots:
                if not (2 <= slot.day <= 7):
                    return False, f"Invalid day: {slot.day}"
                if not (1 <= slot.period <= 12):
                    return False, f"Invalid period: {slot.period}"
                if slot.period + course.duration_per_slot > 13:
                    return False, f"Duration exceeds daily limit"
        
        return True, "Valid"

# ============================================================================
# GENETIC ALGORITHM - SEMESTER VERSION
# ============================================================================

class SemesterGeneticScheduler:
    """Genetic Algorithm for Semester Scheduling"""
    
    def __init__(self,
                 courses_to_schedule: List[dict],
                 teachers: List[dict],
                 rooms: List[dict],
                 semester_config: dict,
                 ga_config: dict = None,
                 enabled_constraints: List[str] = None
                 ):
        """
        Args:
            courses_to_schedule: [
                {
                    'id': int,
                    'course_id': int,
                    'student_count': int,
                    'weeks_needed': int,  # Số tuần cần học
                    'sessions_per_week': int,  # Số buổi/tuần
                    'duration_per_session': int  # Số tiết/buổi
                }
            ]
            semester_config: {
                'start_week': int,
                'end_week': int,
                'max_concurrent_courses': int
            }
        """
        self.courses = courses_to_schedule
        self.teachers = teachers
        self.rooms = rooms
        
        self.semester_start = semester_config['start_week']
        self.semester_end = semester_config['end_week']
        self.max_concurrent = semester_config.get('max_concurrent_courses', 6)
        
        # GA Parameters
        self.config = ga_config or {}
        self.population_size = self.config.get('population_size', 100)
        self.generations = self.config.get('generations', 500)
        self.crossover_rate = self.config.get('crossover_rate', 0.8)
        self.mutation_rate = self.config.get('mutation_rate', 0.15)
        self.elite_size = self.config.get('elite_size', 10)
        self.tournament_size = self.config.get('tournament_size', 5)
        
        self.available_constraints = {
            "balance": WeeklyBalanceConstraint(),
            "soft_conflicts": TeacherConflictConstraint(),
            "room_diversity": RoomDiversityConstraint(),
        }

        self.soft_constraints = [
            self.available_constraints[name]
            for name in (enabled_constraints or self.available_constraints.keys())
            if name in self.available_constraints
        ]
        
        
        # Statistics
        self.best_fitness_history = []
        self.avg_fitness_history = []
        
        
    
    # ========================================================================
    # INITIALIZATION
    # ========================================================================
    
    def generate_initial_population(self) -> List[SemesterSchedule]:
        """Tạo quần thể ban đầu"""
        population = []
        attempts = 0
        max_attempts = self.population_size * 20
        
        print("🔄 Generating initial semester schedules...")
        
        while len(population) < self.population_size and attempts < max_attempts:
            schedule = self._create_random_semester_schedule()
            
            is_valid, error = schedule.is_valid_hard_constraints()
            if is_valid:
                population.append(schedule)
                if len(population) % 10 == 0:
                    print(f"   Generated {len(population)}/{self.population_size}")
            
            attempts += 1
        
        if len(population) < self.population_size:
            print(f"⚠️  Warning: Only generated {len(population)} valid schedules")
        
        return population
    
    def _create_random_semester_schedule(self) -> SemesterSchedule:
        """Tạo lịch học kỳ ngẫu nhiên"""
        schedule = SemesterSchedule(
            semester_start_week=self.semester_start,
            semester_end_week=self.semester_end,
            max_concurrent_courses=self.max_concurrent
        )
        
        # Shuffle courses để random thứ tự xếp
        shuffled_courses = random.sample(self.courses, len(self.courses))
        
        for course_info in shuffled_courses:
            # Find available start week
            weeks_needed = course_info['weeks_needed']
            start_week = schedule.get_available_start_week(weeks_needed)
            end_week = min(start_week + weeks_needed - 1, self.semester_end)
            
            # Random teacher
            eligible_teachers = [
                t for t in self.teachers
                if course_info['course_id'] in t.get('can_teach_courses', [])
            ]
            if not eligible_teachers:
                eligible_teachers = self.teachers
            teacher = random.choice(eligible_teachers)
            
            # Random room
            eligible_rooms = [
                r for r in self.rooms
                if r['capacity'] >= course_info['student_count']
            ]
            if not eligible_rooms:
                eligible_rooms = self.rooms
            room = random.choice(eligible_rooms)
            
            # Random weekly time slots
            sessions_per_week = course_info['sessions_per_week']
            weekly_slots = []
            
            for _ in range(sessions_per_week):
                slot = TimeSlot(
                    week=0,  # Template, sẽ lặp lại mỗi tuần
                    day=random.randint(2, 7),
                    period=random.randint(1, 10)
                )
                weekly_slots.append(slot)
            
            # Create course schedule
            course_schedule = CourseSchedule(
                course_id=course_info['course_id'],
                class_id=course_info['id'],
                teacher_id=teacher['id'],
                room_id=room['id'],
                start_week=start_week,
                end_week=end_week,
                weekly_slots=weekly_slots,
                duration_per_slot=course_info['duration_per_session'],
                student_count=course_info['student_count']
            )
            
            schedule.courses.append(course_schedule)
        
        return schedule
    
    # ========================================================================
    # FITNESS EVALUATION
    # ========================================================================
    
    def fitness_function(self, schedule: SemesterSchedule) -> float:
        """
        Hàm fitness - càng THẤP càng TỐT
        """
        # 1. Check hard constraints
        is_valid, error = schedule.is_valid_hard_constraints()
        if not is_valid:
            return float('inf')
        
        penalty = 0
        breakdown = {}
        
        # 2. Penalty cho việc vượt quá max_concurrent_courses
        for week in range(schedule.semester_start_week, schedule.semester_end_week + 1):
            concurrent = schedule.get_concurrent_courses_at_week(week)
            if len(concurrent) > schedule.max_concurrent_courses:
                excess = len(concurrent) - schedule.max_concurrent_courses
                week_penalty = excess * 100  # Heavy penalty
                penalty += week_penalty
                breakdown[f'week_{week}_overload'] = week_penalty
        
        # 3. Penalty cho việc bắt đầu quá muộn (môn bị đẩy ra cuối kỳ)
        for course in schedule.courses:
            course_info = next(c for c in self.courses if c['id'] == course.class_id)
            ideal_duration = course_info['weeks_needed']
            actual_duration = course.end_week - course.start_week + 1
            
            if actual_duration < ideal_duration:
                duration_penalty = (ideal_duration - actual_duration) * 50
                penalty += duration_penalty
                breakdown[f'course_{course.course_id}_short_duration'] = duration_penalty
        
        # 4. Penalty cho phân bổ không đều trong tuần
        for course in schedule.courses:
            balance_penalty = self._calculate_weekly_balance_penalty(course)
            penalty += balance_penalty
            if balance_penalty > 0:
                breakdown[f'course_{course.course_id}_imbalance'] = balance_penalty
        
        # 5. Penalty cho việc dùng nhiều phòng khác nhau
        unique_rooms = len(set(c.room_id for c in schedule.courses))
        room_penalty = unique_rooms * 2
        penalty += room_penalty
        breakdown['room_diversity'] = room_penalty
        
        # 6. Penalty cho conflicts (soft)
        conflict_penalty = self._calculate_soft_conflicts(schedule)
        penalty += conflict_penalty
        if conflict_penalty > 0:
            breakdown['soft_conflicts'] = conflict_penalty
        
        schedule.fitness_score = penalty
        schedule.penalty_breakdown = breakdown
        
        return penalty
    
    def _calculate_weekly_balance_penalty(self, course: CourseSchedule) -> float:
        """Penalty nếu các buổi học trong tuần không phân bổ đều"""
        if len(course.weekly_slots) <= 1:
            return 0
        
        days = sorted([slot.day for slot in course.weekly_slots])
        
        # Tính khoảng cách giữa các buổi
        gaps = []
        for i in range(len(days) - 1):
            gaps.append(days[i+1] - days[i])
        
        if not gaps:
            return 0
        
        # Penalty nếu có buổi quá gần nhau (cùng ngày hoặc ngày liền kề)
        penalty = 0
        for gap in gaps:
            if gap <= 1:
                penalty += 10
        
        return penalty
    
    def _calculate_soft_conflicts(self, schedule: SemesterSchedule) -> float:
        """Tính penalty cho các soft conflicts"""
        penalty = 0
        
        # Penalty nếu nhiều môn của cùng giảng viên chồng lấn về thời gian
        teacher_courses = {}
        for course in schedule.courses:
            if course.teacher_id not in teacher_courses:
                teacher_courses[course.teacher_id] = []
            teacher_courses[course.teacher_id].append(course)
        
        for teacher_id, courses in teacher_courses.items():
            if len(courses) > 1:
                # Check overlap
                for i, c1 in enumerate(courses):
                    for c2 in courses[i+1:]:
                        # Penalty nếu 2 môn overlap về tuần
                        weeks_overlap = set(range(c1.start_week, c1.end_week + 1)) & \
                                       set(range(c2.start_week, c2.end_week + 1))
                        if weeks_overlap:
                            penalty += len(weeks_overlap) * 2
        
        return penalty
    
    # ========================================================================
    # SELECTION, CROSSOVER, MUTATION (Adapted for Semester)
    # ========================================================================
    
    def tournament_selection(self, population, fitness_scores):
        """Tournament selection"""
        tournament_indices = random.sample(range(len(population)), 
                                          min(self.tournament_size, len(population)))
        best_idx = min(tournament_indices, key=lambda i: fitness_scores[i])
        return population[best_idx]
    
    def crossover(self, parent1: SemesterSchedule, parent2: SemesterSchedule):
        """Single-point crossover"""
        if random.random() > self.crossover_rate:
            return parent1.copy(), parent2.copy()
        
        min_len = min(len(parent1), len(parent2))
        if min_len <= 1:
            return parent1.copy(), parent2.copy()
        
        point = random.randint(1, min_len - 1)
        
        child1 = parent1.copy()
        child2 = parent2.copy()
        
        child1.courses = parent1.courses[:point] + parent2.courses[point:]
        child2.courses = parent2.courses[:point] + parent1.courses[point:]
        
        # Repair conflicts
        child1 = self._repair_schedule(child1)
        child2 = self._repair_schedule(child2)
        
        return child1, child2
    
    def mutate(self, schedule: SemesterSchedule):
        """Mutation operations"""
        schedule = schedule.copy()
        
        for i in range(len(schedule.courses)):
            if random.random() < self.mutation_rate:
                mutation_type = random.choice([
                    'shift_weeks',
                    'change_time_slots',
                    'swap_courses',
                    'change_room'
                ])
                
                if mutation_type == 'shift_weeks':
                    # Dịch chuyển tuần bắt đầu
                    course = schedule.courses[i]
                    weeks_needed = course.end_week - course.start_week + 1
                    new_start = schedule.get_available_start_week(weeks_needed)
                    schedule.courses[i].start_week = new_start
                    schedule.courses[i].end_week = new_start + weeks_needed - 1
                
                elif mutation_type == 'change_time_slots':
                    # Thay đổi slot trong tuần
                    for j in range(len(schedule.courses[i].weekly_slots)):
                        if random.random() < 0.5:
                            schedule.courses[i].weekly_slots[j] = TimeSlot(
                                week=0,
                                day=random.randint(2, 7),
                                period=random.randint(1, 10)
                            )
                
                elif mutation_type == 'swap_courses' and i < len(schedule.courses) - 1:
                    # Hoán đổi vị trí 2 môn
                    j = random.randint(i+1, len(schedule.courses) - 1)
                    schedule.courses[i], schedule.courses[j] = \
                        schedule.courses[j], schedule.courses[i]
                
                elif mutation_type == 'change_room':
                    # Đổi phòng
                    course = schedule.courses[i]
                    eligible_rooms = [
                        r for r in self.rooms
                        if r['capacity'] >= course.student_count
                    ]
                    if eligible_rooms:
                        schedule.courses[i].room_id = random.choice(eligible_rooms)['id']
        
        schedule = self._repair_schedule(schedule)
        return schedule
    
    def _repair_schedule(self, schedule: SemesterSchedule):
        """Sửa lịch bị conflict"""
        max_repairs = 50
        repairs = 0
        
        while repairs < max_repairs:
            is_valid, _ = schedule.is_valid_hard_constraints()
            if is_valid:
                break
            
            # Tìm và sửa conflicts
            for i, course in enumerate(schedule.courses):
                for j, other in enumerate(schedule.courses[i+1:], start=i+1):
                    if course.conflicts_with(other):
                        # Random sửa một trong hai
                        if random.random() < 0.5:
                            # Shift course to later weeks
                            weeks_needed = course.end_week - course.start_week + 1
                            new_start = schedule.get_available_start_week(weeks_needed)
                            schedule.courses[i].start_week = new_start
                            schedule.courses[i].end_week = new_start + weeks_needed - 1
                        else:
                            # Change time slots
                            schedule.courses[i].weekly_slots = [
                                TimeSlot(week=0, day=random.randint(2, 7), 
                                        period=random.randint(1, 10))
                                for _ in schedule.courses[i].weekly_slots
                            ]
            
            repairs += 1
        
        return schedule
    
    # ========================================================================
    # MAIN EVOLUTION
    # ========================================================================
    
    def evolve(self):
        """Main evolution loop"""
        print(f"\n🧬 Starting Semester Genetic Algorithm")
        print(f"   Semester: Week {self.semester_start} - {self.semester_end}")
        print(f"   Max concurrent courses: {self.max_concurrent}")
        print(f"   Population: {self.population_size}")
        print(f"   Generations: {self.generations}\n")
        
        population = self.generate_initial_population()
        
        if len(population) == 0:
            return {'success': False, 'error': 'Could not generate valid schedule'}
        
        for generation in range(self.generations):
            fitness_scores = [self.fitness_function(s) for s in population]
            
            best_fitness = min(fitness_scores)
            valid_scores = [f for f in fitness_scores if f != float('inf')]
            avg_fitness = sum(valid_scores) / len(valid_scores) if valid_scores else float('inf')
            
            self.best_fitness_history.append(best_fitness)
            self.avg_fitness_history.append(avg_fitness)
            
            if generation % 50 == 0 or generation == self.generations - 1:
                print(f"Gen {generation:4d} | Best: {best_fitness:8.2f} | Avg: {avg_fitness:8.2f}")
            
            if best_fitness < 20:
                print(f"\n✅ Converged at generation {generation}!")
                break
            
            # Selection and evolution
            new_population = []
            
            # Elitism
            sorted_idx = sorted(range(len(fitness_scores)), 
                              key=lambda i: fitness_scores[i])
            elite = [population[i].copy() for i in sorted_idx[:self.elite_size]]
            new_population.extend(elite)
            
            # Create new generation
            while len(new_population) < self.population_size:
                p1 = self.tournament_selection(population, fitness_scores)
                p2 = self.tournament_selection(population, fitness_scores)
                
                c1, c2 = self.crossover(p1, p2)
                c1 = self.mutate(c1)
                c2 = self.mutate(c2)
                
                new_population.extend([c1, c2])
            
            population = new_population[:self.population_size]
        
        # Final result
        fitness_scores = [self.fitness_function(s) for s in population]
        best_idx = fitness_scores.index(min(fitness_scores))
        best_schedule = population[best_idx]
        
        return {
            'success': True,
            'best_schedule': best_schedule,
            'fitness': fitness_scores[best_idx],
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
                summary['weeks_used'].append(week)
                summary['concurrent_load'][week] = len(concurrent)
        
        return summary

# ============================================================================
# USAGE EXAMPLE
# ============================================================================

if __name__ == "__main__":
    # Courses to schedule
    courses = [
        {'id': 1, 'course_id': 101, 'student_count': 50, 'weeks_needed': 4, 
         'sessions_per_week': 2, 'duration_per_session': 2},
        {'id': 2, 'course_id': 102, 'student_count': 40, 'weeks_needed': 3, 
         'sessions_per_week': 2, 'duration_per_session': 2},
        {'id': 3, 'course_id': 103, 'student_count': 60, 'weeks_needed': 5, 
         'sessions_per_week': 3, 'duration_per_session': 2},
        {'id': 4, 'course_id': 104, 'student_count': 45, 'weeks_needed': 4, 
         'sessions_per_week': 2, 'duration_per_session': 2},
        {'id': 5, 'course_id': 105, 'student_count': 50, 'weeks_needed': 3, 
         'sessions_per_week': 2, 'duration_per_session': 2},
        {'id': 6, 'course_id': 106, 'student_count': 35, 'weeks_needed': 4, 
         'sessions_per_week': 2, 'duration_per_session': 2},
        {'id': 7, 'course_id': 107, 'student_count': 55, 'weeks_needed': 5, 
         'sessions_per_week': 3, 'duration_per_session': 2},
    ]
    
    teachers = [
        {'id': 1, 'name': 'Teacher A', 'can_teach_courses': [101, 102]},
        {'id': 2, 'name': 'Teacher B', 'can_teach_courses': [102, 103, 104]},
        {'id': 3, 'name': 'Teacher C', 'can_teach_courses': [104, 105, 106]},
        {'id': 4, 'name': 'Teacher D', 'can_teach_courses': [106, 107]},
    ]
    
    rooms = [
        {'id': 1, 'name': 'Room 101', 'capacity': 60},
        {'id': 2, 'name': 'Room 102', 'capacity': 50},
        {'id': 3, 'name': 'Room 103', 'capacity': 40},
        {'id': 4, 'name': 'Room 201', 'capacity': 70},
    ]
    
    semester_config = {
        'start_week': 1,
        'end_week': 15,
        'max_concurrent_courses': 4  # Tối đa 4 môn đồng thời
    }
    
    ga_config = {
        'population_size': 50,
        'generations': 300,
        'crossover_rate': 0.8,
        'mutation_rate': 0.2,
        'elite_size': 5,
        'tournament_size': 3
    }
    
    start_time = datetime.now()
    
    # Run scheduler
    scheduler = SemesterGeneticScheduler(
        courses_to_schedule=courses,
        teachers=teachers,
        rooms=rooms,
        semester_config=semester_config,
        ga_config=ga_config
    )
    
    result = scheduler.evolve()
    
    end_time = datetime.now()
    if result['success']:
        print(f"\n✅ Scheduling Success!")
        print(f"   Fitness: {result['fitness']}")
        print(f"   Generations: {result['generations_run']}")
        print(f"\n📊 Schedule Summary:")
        summary = result['schedule_summary']
        print(f"   Total courses: {summary['total_courses']}")
        print(f"   Weeks used: {len(summary['weeks_used'])}")
        print(f"\n   Concurrent load per week:")
        for week, load in sorted(summary['concurrent_load'].items()):
            print(f"      Week {week:2d}: {load} courses")
        
        print(f"\n📅 Detailed Course Schedule:")
        schedule = result['best_schedule']
        for course in sorted(schedule.courses, key=lambda c: c.start_week):
            print(f"\n   Course {course.course_id} (Class {course.class_id}):")
            print(f"      Weeks: {course.start_week}-{course.end_week} " +
                  f"({course.end_week - course.start_week + 1} weeks)")
            print(f"      Teacher: {course.teacher_id}, Room: {course.room_id}")
            print(f"      Weekly schedule:")
            for slot in course.weekly_slots:
                day_names = {2: 'Mon', 3: 'Tue', 4: 'Wed', 5: 'Thu', 6: 'Fri', 7: 'Sat'}
                print(f"         {day_names[slot.day]}: Period {slot.period}-" +
                      f"{slot.period + course.duration_per_slot - 1}")
        
        # Visualize timeline
        print(f"\n📈 Timeline Visualization:")
        print(f"   Week | Courses Active")
        print(f"   -----|" + "-" * 50)
        for week in range(semester_config['start_week'], semester_config['end_week'] + 1):
            active = schedule.get_concurrent_courses_at_week(week)
            course_ids = [f"C{c.course_id}" for c in active]
            bar = "█" * len(active)
            print(f"   {week:4d} | {bar} {', '.join(course_ids)}")
        
        # Export to JSON
        def export_to_json(schedule, filename='semester_schedule.json'):
            """Export schedule to JSON format"""
            data = {
                'semester': {
                    'start_week': schedule.semester_start_week,
                    'end_week': schedule.semester_end_week,
                    'max_concurrent': schedule.max_concurrent_courses
                },
                'courses': [],
                'started_at': start_time.isoformat(),
                'finished_at': end_time.isoformat()
            }
            
            for course in schedule.courses:
                course_data = {
                    'course_id': course.course_id,
                    'class_id': course.class_id,
                    'teacher_id': course.teacher_id,
                    'room_id': course.room_id,
                    'start_week': course.start_week,
                    'end_week': course.end_week,
                    'duration': course.end_week - course.start_week + 1,
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
                data['courses'].append(course_data)
            
            with open(filename, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
            
            return filename
        
        # Export
        filename = export_to_json(schedule)
        print(f"\n💾 Schedule exported to: {filename}")
        
        # Quality metrics
        print(f"\n📏 Quality Metrics:")
        print(f"   Penalty Breakdown:")
        for key, value in result['penalty_breakdown'].items():
            print(f"      {key}: {value}")
    else:
        print(f"\n❌ Failed: {result['error']}")