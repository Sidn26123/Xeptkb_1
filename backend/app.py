"""
Flask API Server for Genetic Algorithm Scheduler
Chạy: python app.py
"""
import traceback
import json
import time
from flask import Flask, request, jsonify, Response, stream_with_context
from flask_cors import CORS

# Import genetic algorithm code
# from genetic_scheduler_semester_new import (
#     SemesterGeneticScheduler,
#     SemesterSchedule,
#     CourseSchedule
# )
from genetic import (
    SemesterGeneticScheduler,

    # Hard constraints
    TeacherConflictConstraint,
    RoomConflictConstraint,
    ClassConflictConstraint,
    RoomCapacityConstraint,
    TeacherBusySlotConstraint,
    OutOfBoundsConstraint,
    RoomEquipmentConstraint,
    TheoryBeforeLabConstraint,
    OutOfDailyPeriodsConstraint,
    TeacherDayOffConstraint,
    MeetingSlotBlockConstraint,
    InterCampusTravelConstraint,

    # Soft constraints
    ConcurrentCoursesConstraint,
    WeeklyBalanceConstraint,
    AvoidLunchBreakConstraint,
    AvoidEdgePeriodsConstraint,
    MinimizeStudentGapsConstraint,
    MinimizeTeacherGapsConstraint,
    CompressStudentScheduleConstraint,
    LimitContinuousPeriodsConstraint,
    PreferPrimeSlotsConstraint,
    ClusterSubjectsForTeacherConstraint,
)
import time
app = Flask(__name__)
CORS(app)  # Cho phép React gọi API từ localhost khác

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

# Map tên ràng buộc
CONSTRAINT_CLASS_MAP = {
    'HARD_CONFLICT_TEACHER': TeacherConflictConstraint,
    'HARD_CONFLICT_ROOM': RoomConflictConstraint,
    'HARD_CONFLICT_CLASS': ClassConflictConstraint,
    'HARD_ROOM_CAPACITY': RoomCapacityConstraint,
    'HARD_TEACHER_BUSY': TeacherBusySlotConstraint,
    'HARD_OUT_OF_BOUNDS': OutOfBoundsConstraint,
    'HARD_ROOM_EQUIPMENT': RoomEquipmentConstraint,
    'HARD_THEORY_BEFORE_LAB': TheoryBeforeLabConstraint,
    'HARD_OUT_OF_DAILY_PERIODS': OutOfDailyPeriodsConstraint,
    'HARD_TEACHER_DAY_OFF': TeacherDayOffConstraint,
    'HARD_MEETING_BLOCK': MeetingSlotBlockConstraint,
    'HARD_INTER_CAMPUS_TRAVEL': InterCampusTravelConstraint,
    'SOFT_CONCURRENT_OVERLOAD': ConcurrentCoursesConstraint,
    'SOFT_WEEKLY_IMBALANCE': WeeklyBalanceConstraint,
    'SOFT_AVOID_LUNCH': AvoidLunchBreakConstraint,
    'SOFT_AVOID_EDGE': AvoidEdgePeriodsConstraint,
    'SOFT_STUDENT_GAPS': MinimizeStudentGapsConstraint,
    'SOFT_TEACHER_GAPS': MinimizeTeacherGapsConstraint,
    'SOFT_STUDENT_DAYS': CompressStudentScheduleConstraint,
    'SOFT_LIMIT_CONTINUOUS': LimitContinuousPeriodsConstraint,
    'SOFT_PREFER_PRIME_SLOTS': PreferPrimeSlotsConstraint,
    'SOFT_TEACHER_SUBJECT_CLUSTER': ClusterSubjectsForTeacherConstraint,
}

STRUCTURE_CONSTRAINT_NAMES = {
    'HARD_CONFLICT_TEACHER', 'HARD_CONFLICT_ROOM', 'HARD_CONFLICT_CLASS',
    'HARD_ROOM_CAPACITY', 'HARD_TEACHER_BUSY', 'HARD_OUT_OF_BOUNDS',
    'HARD_ROOM_EQUIPMENT', 'HARD_THEORY_BEFORE_LAB', 'HARD_TEACHER_DAY_OFF',
    'HARD_MEETING_BLOCK', 'HARD_INTER_CAMPUS_TRAVEL', 'HARD_OUT_OF_DAILY_PERIODS',
    'SOFT_STUDENT_GAPS', 'SOFT_TEACHER_GAPS',
    'SOFT_STUDENT_DAYS', 'SOFT_TEACHER_SUBJECT_CLUSTER'
}

HARD_PENALTY_THRESHOLD = 1_000_000

def process_teachers_data(teachers):
    """Xử lý dữ liệu giáo viên: convert list busy_slots sang set"""
    processed = []
    for teacher in teachers:
        t = teacher.copy()
        # Xử lý busy_slots
        json_busy = t.get('busy_slots', [])
        t['busy_slots'] = {tuple(s) for s in json_busy} if json_busy else set()
        # Xử lý days_off
        json_off = t.get('days_off', [])
        t['days_off'] = set(json_off) if json_off else set()

        t['should_avoid_slots'] = set()
        t['want_slots'] = set()
        processed.append(t)
    return processed

def build_constraints(constraint_configs):
    """Tạo objects Constraint từ config"""
    constraints = []
    for conf in constraint_configs:
        name = conf.get('name')
        weight = conf.get('weight', 0)
        if name in CONSTRAINT_CLASS_MAP:
            constraints.append(CONSTRAINT_CLASS_MAP[name](weight=weight))
    return constraints

def format_schedule_response(result, total_time):
    """Format kết quả cuối cùng"""
    best = result['best_schedule']
    return {
        'success': result['success'],
        'total_time_seconds': total_time,
        'semester': {
            'start_week': best.semester_start_week,
            'end_week': best.semester_end_week,
            'max_concurrent': best.max_concurrent_courses
        },
        'final_fitness': result['fitness'],
        'penalty_breakdown': result['penalty_breakdown'],
        'schedule_summary': result['schedule_summary'],
        'courses': [
            {
                'course_id': c.course_id,
                'class_ids': c.class_ids,
                'teacher_id': c.teacher_id,
                'room_id': c.room_id,
                'start_week': c.start_week,
                'end_week': c.end_week,
                'weekly_slots': [{'day': s.day, 'period': s.period, 'duration': c.duration_per_slot} for s in c.weekly_slots]
            } for c in best.courses
        ]
    }
@app.route('/api/schedule', methods=['POST'])
def generate_schedule():
    """
    API endpoint để tạo thời khóa biểu với chiến lược 3 giai đoạn

    Giai đoạn 1: Feasibility - Tìm TKB hợp lệ (chỉ ràng buộc cứng)
    Giai đoạn 2: Structure - Tối ưu cấu trúc (ràng buộc cứng + cấu trúc)
    Giai đoạn 3: Refinement - Tinh chỉnh chất lượng (tất cả ràng buộc)
    """
    try:
        data = request.get_json()

        # ========================================
        # 1. VALIDATE INPUT CƠ BẢN
        # ========================================
        required_keys = ['courses', 'teachers', 'rooms', 'semester_config']
        if not all(k in data for k in required_keys):
            return jsonify({
                'success': False,
                'error': 'Thiếu các trường bắt buộc: courses, teachers, rooms, semester_config'
            }), 400

        # ========================================
        # 2. EXTRACT & VALIDATE DATA
        # ========================================
        courses = data['courses']
        teachers = data['teachers']
        rooms = data['rooms']
        semester_config = data['semester_config']

        # [MỚI] Nhận danh sách ràng buộc và trọng số từ client
        constraint_configs = data.get('constraints', [])
        equipment = data.get('equipment', [])

        # Validate courses - Yêu cầu các trường mới
        required_course_keys = [
            'id', 'course_id', 'teacher_id', 'student_count',
            'weeks_needed', 'sessions_per_week', 'duration_per_session',
            'class_ids', 'type'  # [MỚI] Yêu cầu trường 'type'
        ]
        for i, course in enumerate(courses):
            for key in required_course_keys:
                if key not in course:
                    return jsonify({
                        'success': False,
                        'error': f"Lớp học phần (courses[{i}]) thiếu trường '{key}'"
                    }), 400

            # Validate type
            if course['type'] not in ['theory', 'lab', 'practice']:
                return jsonify({
                    'success': False,
                    'error': f"courses[{i}] có type không hợp lệ: {course['type']}"
                }), 400

        # ========================================
        # 3. XỬ LÝ BUSY_SLOTS & TEACHER DATA
        # ========================================
        processed_teachers = []
        for teacher in teachers:
            processed_teacher = teacher.copy()

            # Chuyển đổi busy_slots từ List sang Set
            json_busy_slots = processed_teacher.get('busy_slots')
            if json_busy_slots and isinstance(json_busy_slots, list):
                try:
                    processed_teacher['busy_slots'] = {tuple(slot) for slot in json_busy_slots}
                except TypeError:
                    return jsonify({
                        'success': False,
                        'error': f"'busy_slots' của GV {teacher.get('id')} phải là [[day, period], ...]"
                    }), 400
            else:
                processed_teacher['busy_slots'] = set()

            # Xử lý các trường mới (nếu có)
            processed_teacher['should_avoid_slots'] = set()
            processed_teacher['want_slots'] = set()

            # Xử lý days_off
            json_days_off = processed_teacher.get('days_off')
            if json_days_off and isinstance(json_days_off, list):
                processed_teacher['days_off'] = set(json_days_off)
            else:
                processed_teacher['days_off'] = set()

            processed_teachers.append(processed_teacher)

        # ========================================
        # 4. XÂY DỰNG CÁC BỘ RÀNG BUỘC
        # ========================================

        # Định nghĩa ngưỡng phân biệt Hard/Soft
        HARD_PENALTY_THRESHOLD = 1_000_000

        # Map tên ràng buộc sang Class (cần import đầy đủ)
        CONSTRAINT_CLASS_MAP = {
            'HARD_CONFLICT_TEACHER': TeacherConflictConstraint,
            'HARD_CONFLICT_ROOM': RoomConflictConstraint,
            'HARD_CONFLICT_CLASS': ClassConflictConstraint,
            'HARD_ROOM_CAPACITY': RoomCapacityConstraint,
            'HARD_TEACHER_BUSY': TeacherBusySlotConstraint,
            'HARD_OUT_OF_BOUNDS': OutOfBoundsConstraint,
            'HARD_ROOM_EQUIPMENT': RoomEquipmentConstraint,
            'HARD_THEORY_BEFORE_LAB': TheoryBeforeLabConstraint,
            'HARD_OUT_OF_DAILY_PERIODS': OutOfDailyPeriodsConstraint,
            'HARD_TEACHER_DAY_OFF': TeacherDayOffConstraint,
            'HARD_MEETING_BLOCK': MeetingSlotBlockConstraint,
            'HARD_INTER_CAMPUS_TRAVEL': InterCampusTravelConstraint,

            'SOFT_CONCURRENT_OVERLOAD': ConcurrentCoursesConstraint,
            'SOFT_WEEKLY_IMBALANCE': WeeklyBalanceConstraint,
            'SOFT_AVOID_LUNCH': AvoidLunchBreakConstraint,
            'SOFT_AVOID_EDGE': AvoidEdgePeriodsConstraint,
            'SOFT_STUDENT_GAPS': MinimizeStudentGapsConstraint,
            'SOFT_TEACHER_GAPS': MinimizeTeacherGapsConstraint,
            'SOFT_STUDENT_DAYS': CompressStudentScheduleConstraint,
            'SOFT_LIMIT_CONTINUOUS': LimitContinuousPeriodsConstraint,
            'SOFT_PREFER_PRIME_SLOTS': PreferPrimeSlotsConstraint,
            'SOFT_TEACHER_SUBJECT_CLUSTER': ClusterSubjectsForTeacherConstraint,
        }

        # Danh sách ràng buộc "structure" (cứng + một số mềm quan trọng)
        STRUCTURE_CONSTRAINT_NAMES = {
            'HARD_CONFLICT_TEACHER', 'HARD_CONFLICT_ROOM', 'HARD_CONFLICT_CLASS',
            'HARD_ROOM_CAPACITY', 'HARD_TEACHER_BUSY', 'HARD_OUT_OF_BOUNDS',
            'HARD_ROOM_EQUIPMENT', 'HARD_THEORY_BEFORE_LAB', 'HARD_TEACHER_DAY_OFF',
            'HARD_MEETING_BLOCK', 'HARD_INTER_CAMPUS_TRAVEL', 'HARD_OUT_OF_DAILY_PERIODS',
            'SOFT_STUDENT_GAPS', 'SOFT_TEACHER_GAPS',
            'SOFT_STUDENT_DAYS', 'SOFT_TEACHER_SUBJECT_CLUSTER'
        }

        # Tạo tất cả ràng buộc từ config
        all_constraints = []
        for config in constraint_configs:
            name = config.get('name')
            weight = config.get('weight', 0)

            if name in CONSTRAINT_CLASS_MAP:
                constraint_class = CONSTRAINT_CLASS_MAP[name]
                all_constraints.append(constraint_class(weight=weight))
            else:
                print(f"⚠️ Cảnh báo: Ràng buộc '{name}' không được hỗ trợ, bỏ qua.")

        # Tách ra 3 bộ ràng buộc
        hard_constraints_only = [
            c for c in all_constraints
            if c.weight >= HARD_PENALTY_THRESHOLD
        ]

        structure_constraints = [
            c for c in all_constraints
            if c.name in STRUCTURE_CONSTRAINT_NAMES
        ]

        # all_constraints đã chứa đầy đủ

        # ========================================
        # 5. CẤU HÌNH GA CỐ ĐỊNH CHO 3 GIAI ĐOẠN
        # ========================================

        base_ga_config = {
            'population_size': 100,
            'crossover_rate': 0.85,
            'elite_size': 10,
            'tournament_size': 5,
            'seed_percentage': 0.3,
            'time_limit_seconds': 300,  # 5 phút/giai đoạn
            'target_fitness': 100,
            'generations_to_stop': 50,
        }

        # Giai đoạn 1: Feasibility (Tìm nhanh)
        ga_config_p1 = base_ga_config.copy()
        ga_config_p1.update({
            'generations': 300,
            'mutation_rate': 0.3,
            'adaptive_mutation_patience': 10,
            'adaptive_mutation_high_rate': 0.6,
            'adaptive_mutation_low_rate': 0.2,
        })

        # Giai đoạn 2: Structure (Tìm kỹ)
        ga_config_p2 = base_ga_config.copy()
        ga_config_p2.update({
            'generations': 600,
            'mutation_rate': 0.25,
            'adaptive_mutation_patience': 15,
            'adaptive_mutation_high_rate': 0.5,
            'adaptive_mutation_low_rate': 0.15,
            'local_search_iterations': 10
        })

        # Giai đoạn 3: Refinement (Tinh chỉnh)
        ga_config_p3 = base_ga_config.copy()
        ga_config_p3.update({
            'generations': 300,
            'mutation_rate': 0.15,
            'adaptive_mutation_patience': 20,
            'adaptive_mutation_high_rate': 0.25,
            'adaptive_mutation_low_rate': 0.05,
            'local_search_iterations': 20
        })

        # ========================================
        # 6. CHẠY 3 GIAI ĐOẠN
        # ========================================

        total_start_time = time.time()
        results = {
            'phase1': None,
            'phase2': None,
            'phase3': None
        }

        # --- GIAI ĐOẠN 1: FEASIBILITY ---
        print("=" * 60)
        print("🚀 GIAI ĐOẠN 1: FEASIBILITY RUN")
        print("=" * 60)

        start_time_p1 = time.time()

        scheduler_p1 = SemesterGeneticScheduler(
            courses_to_schedule=courses,
            teachers=processed_teachers,
            rooms=rooms,
            semester_config=semester_config,
            active_constraints=hard_constraints_only,
            ga_config=ga_config_p1,
            seed_schedule=None
        )

        result_p1 = scheduler_p1.evolve()
        results['phase1'] = result_p1

        print(f"⏱️ Giai đoạn 1 mất: {time.time() - start_time_p1:.2f} giây")

        if not result_p1['success']:
            print("❌ GIAI ĐOẠN 1 THẤT BẠI - Không thể tìm TKB hợp lệ")
            return jsonify({
                'success': False,
                'error': 'Không thể tạo TKB thỏa mãn ràng buộc cứng',
                'phase1_result': {
                    'fitness': result_p1['fitness'],
                    'generations_run': result_p1['generations_run'],
                    'penalty_breakdown': result_p1['penalty_breakdown']
                }
            }), 200

        print("✅ GIAI ĐOẠN 1 THÀNH CÔNG")
        valid_schedule = result_p1['best_schedule']

        # --- GIAI ĐOẠN 2: STRUCTURE OPTIMIZATION ---
        print("\n" + "=" * 60)
        print("✨ GIAI ĐOẠN 2: STRUCTURE OPTIMIZATION")
        print("=" * 60)

        start_time_p2 = time.time()

        scheduler_p2 = SemesterGeneticScheduler(
            courses_to_schedule=courses,
            teachers=processed_teachers,
            rooms=rooms,
            semester_config=semester_config,
            active_constraints=structure_constraints,
            ga_config=ga_config_p2,
            seed_schedule=valid_schedule
        )

        result_p2 = scheduler_p2.evolve()
        results['phase2'] = result_p2

        print(f"⏱️ Giai đoạn 2 mất: {time.time() - start_time_p2:.2f} giây")
        print("✅ GIAI ĐOẠN 2 HOÀN THÀNH")

        structured_schedule = result_p2['best_schedule']

        # --- GIAI ĐOẠN 3: REFINEMENT ---
        print("\n" + "=" * 60)
        print("💎 GIAI ĐOẠN 3: REFINEMENT RUN")
        print("=" * 60)

        start_time_p3 = time.time()

        scheduler_p3 = SemesterGeneticScheduler(
            courses_to_schedule=courses,
            teachers=processed_teachers,
            rooms=rooms,
            semester_config=semester_config,
            active_constraints=all_constraints,
            ga_config=ga_config_p3,
            seed_schedule=structured_schedule
        )

        result_p3 = scheduler_p3.evolve()
        results['phase3'] = result_p3

        print(f"⏱️ Giai đoạn 3 mất: {time.time() - start_time_p3:.2f} giây")

        total_time = time.time() - total_start_time
        print("\n" + "=" * 60)
        print(f"🏆 KẾT QUẢ CUỐI CÙNG - Tổng thời gian: {total_time:.2f}s")
        print("=" * 60)

        # ========================================
        # 7. TẠO RESPONSE
        # ========================================

        best_schedule = result_p3['best_schedule']

        response_data = {
            'success': result_p3['success'],
            'total_time_seconds': total_time,
            'semester': {
                'start_week': best_schedule.semester_start_week,
                'end_week': best_schedule.semester_end_week,
                'max_concurrent': best_schedule.max_concurrent_courses
            },
            'courses': [],
            'final_fitness': result_p3['fitness'],
            'penalty_breakdown': result_p3['penalty_breakdown'],
            'schedule_summary': result_p3['schedule_summary'],

            # Thông tin chi tiết từng giai đoạn
            'phase_results': {
                'phase1': {
                    'fitness': result_p1['fitness'],
                    'generations': result_p1['generations_run'],
                    'success': result_p1['success']
                },
                'phase2': {
                    'fitness': result_p2['fitness'],
                    'generations': result_p2['generations_run']
                },
                'phase3': {
                    'fitness': result_p3['fitness'],
                    'generations': result_p3['generations_run'],
                    'success': result_p3['success']
                }
            }
        }

        # Convert courses sang JSON
        for course in best_schedule.courses:
            course_data = {
                'course_id': course.course_id,
                'class_ids': course.class_ids,
                'teacher_id': course.teacher_id,
                'room_id': course.room_id,
                'start_week': course.start_week,
                'end_week': course.end_week,
                'weeks_needed': course.weeks_needed,
                'student_count': course.student_count,
                'type': getattr(course, 'type', 'theory'),
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

        print(f"✅ API Response ready with {len(response_data['courses'])} courses")
        return jsonify(response_data), 200

    except Exception as e:
        print(f"❌ Lỗi máy chủ: {str(e)}")
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': f"Lỗi máy chủ nội bộ: {str(e)}"
        }), 500
@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'ok'}), 200

@app.route('/api/schedule/stream', methods=['POST'])
def stream_schedule():
    """
    API Streaming sử dụng Server-Sent Events (SSE).
    Client sẽ nhận được tiến độ real-time.
    """
    data = request.get_json()

    # --- 1. Validate Input (Giữ nguyên logic của bạn) ---
    required_keys = ['courses', 'teachers', 'rooms', 'semester_config']
    if not all(k in data for k in required_keys):
        return jsonify({'error': 'Missing required fields'}), 400

    # --- 2. Chuẩn bị dữ liệu ---
    courses = data['courses']
    rooms = data['rooms']
    semester_config = data['semester_config']
    processed_teachers = process_teachers_data(data['teachers'])

    # Config constraints
    constraint_configs = data.get('constraints', [])
    all_constraints = build_constraints(constraint_configs)

    hard_constraints_only = [c for c in all_constraints if c.weight >= HARD_PENALTY_THRESHOLD]
    structure_constraints = [c for c in all_constraints if c.name in STRUCTURE_CONSTRAINT_NAMES]

    # Config GA
    base_ga_config = data.get('ga_config', {})
    # Set default values if not provided
    base_ga_config.setdefault('population_size', 100)
    base_ga_config.setdefault('time_limit_seconds', 300)

    # --- 3. Generator Function cho SSE ---
    def generate_process():
        total_start_time = time.time()

        # Helper để gửi SSE message
        def yield_progress(phase, percent, message, detail=None):
            msg = {
                'phase': phase,
                'percent': percent,
                'message': message,
                'detail': detail
            }
            return f"data: {json.dumps(msg)}\n\n"

        try:
            # === GIAI ĐOẠN 1 ===
            yield yield_progress("phase1", 0, "Bắt đầu Giai đoạn 1: Tìm kiếm khả thi...")

            ga_config_p1 = base_ga_config.copy()
            ga_config_p1.update({'generations': 300, 'mutation_rate': 0.3}) # Config riêng P1

            scheduler_p1 = SemesterGeneticScheduler(
                courses_to_schedule=courses,
                teachers=processed_teachers,
                rooms=rooms,
                semester_config=semester_config,
                active_constraints=hard_constraints_only,
                ga_config=ga_config_p1
            )

            # Lưu ý: Cần sửa hàm evolve trong class Scheduler để hỗ trợ yield hoặc callback
            # Ở đây giả định evolve chạy đồng bộ, ta chỉ báo cáo kết quả cuối phase
            result_p1 = scheduler_p1.evolve()

            if not result_p1['success']:
                yield f"event: error\ndata: {json.dumps({'message': 'Giai đoạn 1 thất bại: Không tìm thấy TKB hợp lệ'})}\n\n"
                return

            yield yield_progress("phase1", 30, "Giai đoạn 1 hoàn thành", {'fitness': result_p1['fitness']})
            valid_schedule = result_p1['best_schedule']

            # === GIAI ĐOẠN 2 ===
            yield yield_progress("phase2", 35, "Bắt đầu Giai đoạn 2: Tối ưu cấu trúc...")

            ga_config_p2 = base_ga_config.copy()
            ga_config_p2.update({'generations': 600, 'mutation_rate': 0.25, 'local_search_iterations': 10})

            scheduler_p2 = SemesterGeneticScheduler(
                courses_to_schedule=courses,
                teachers=processed_teachers,
                rooms=rooms,
                semester_config=semester_config,
                active_constraints=structure_constraints,
                ga_config=ga_config_p2,
                seed_schedule=valid_schedule
            )
            result_p2 = scheduler_p2.evolve()

            yield yield_progress("phase2", 65, "Giai đoạn 2 hoàn thành", {'fitness': result_p2['fitness']})
            structured_schedule = result_p2['best_schedule']

            # === GIAI ĐOẠN 3 ===
            yield yield_progress("phase3", 70, "Bắt đầu Giai đoạn 3: Tinh chỉnh cuối cùng...")

            ga_config_p3 = base_ga_config.copy()
            ga_config_p3.update({'generations': 300, 'mutation_rate': 0.15, 'local_search_iterations': 20})

            scheduler_p3 = SemesterGeneticScheduler(
                courses_to_schedule=courses,
                teachers=processed_teachers,
                rooms=rooms,
                semester_config=semester_config,
                active_constraints=all_constraints,
                ga_config=ga_config_p3,
                seed_schedule=structured_schedule
            )
            result_p3 = scheduler_p3.evolve()

            # === KẾT THÚC ===
            total_time = time.time() - total_start_time
            final_response = format_schedule_response(result_p3, total_time)

            # Gửi sự kiện 'result' chứa dữ liệu cuối cùng
            yield f"event: result\ndata: {json.dumps(final_response)}\n\n"

        except Exception as e:
            traceback.print_exc()
            yield f"event: error\ndata: {json.dumps({'message': str(e)})}\n\n"

    # Trả về Streaming Response
    return Response(stream_with_context(generate_process()), mimetype='text/event-stream')

if __name__ == '__main__':
    app.run(port=PORT, threaded=True)