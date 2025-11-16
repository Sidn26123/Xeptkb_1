"""
Flask API Server for Genetic Algorithm Scheduler
Chạy: python app.py
"""

import traceback
from flask import Flask, request, jsonify
from flask_cors import CORS
import json

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

# @app.route('/api/schedule', methods=['POST'])
# def generate_schedule():
#     """
#     API endpoint để tạo thời khóa biểu
    
#     Request body:
#     {
#         "courses": [...],
#         "teachers": [...],
#         "rooms": [...],
#         "semester_config": {...},
#         "ga_config": {...}
#     }
#     """
#     try:
#         data = request.get_json()
#         print(data)
#         # Validate input
#         if not all(k in data for k in ['courses', 'teachers', 'rooms', 'semester_config']):
#             return jsonify({
#                 'success': False,
#                 'error': 'Missing required fields'
#             }), 400
        
#         # Extract data
#         courses = data['courses']
#         teachers = data['teachers']
#         rooms = data['rooms']
#         semester_config = data['semester_config']
#         ga_config = data.get('ga_config', {})
#         print("semester_config:", semester_config)
#         # Run genetic algorithm
#         print(f"🚀 Starting genetic algorithm with {len(courses)} courses...")
        
#         scheduler = SemesterGeneticScheduler(
#             courses_to_schedule=courses,
#             teachers=teachers,
#             rooms=rooms,
#             semester_config=semester_config,
#             ga_config=ga_config
#         )
        
#         result = scheduler.evolve()
        
#         if result['success']:
#             schedule = result['best_schedule']
            
#             # Convert to JSON-serializable format
#             response_data = {
#                 'success': True,
#                 'semester': {
#                     'start_week': schedule.semester_start_week,
#                     'end_week': schedule.semester_end_week,
#                     'max_concurrent': schedule.max_concurrent_courses
#                 },
#                 'courses': [],
#                 'fitness': result['fitness'],
#                 'generations': result['generations_run'],
#                 'penalty_breakdown': result['penalty_breakdown'],
#                 'schedule_summary': result['schedule_summary']
#             }
            
#             # Convert courses
#             for course in schedule.courses:
#                 course_data = {
#                     'course_id': course.course_id,
#                     'class_id': course.class_id,
#                     'teacher_id': course.teacher_id,
#                     'room_id': course.room_id,
#                     'start_week': course.start_week,
#                     'end_week': course.end_week,
#                     'duration': course.end_week - course.start_week + 1,
#                     'student_count': course.student_count,
#                     'weekly_slots': [
#                         {
#                             'day': slot.day,
#                             'period': slot.period,
#                             'duration': course.duration_per_slot
#                         }
#                         for slot in course.weekly_slots
#                     ]
#                 }
#                 response_data['courses'].append(course_data)
#             print(response_data['semester'])
#             print(f"✅ Successfully generated schedule!")
#             return jsonify(response_data), 200
#         else:
#             return jsonify({
#                 'success': False,
#                 'error': result.get('error', 'Unknown error')
#             }), 500
            
#     except Exception as e:
#         print(f"❌ Error: {str(e)}")
#         import traceback
#         traceback.print_exc()
#         return jsonify({
#             'success': False,
#             'error': str(e)
#         }), 500
# @app.route('/api/schedule', methods=['POST'])
# def generate_schedule():
#     """
#     API endpoint để tạo thời khóa biểu (ĐÃ CẬP NHẬT)
#     - Yêu cầu 'teacher_id' trong mỗi course.
#     - Xử lý 'busy_slots' từ JSON list sang Python set.
#     """
#     try:
#         data = request.get_json()
        
#         # 1. Validate input cơ bản
#         required_keys = ['courses', 'teachers', 'rooms', 'semester_config']
#         if not all(k in data for k in required_keys):
#             return jsonify({
#                 'success': False,
#                 'error': 'Thiếu các trường bắt buộc: courses, teachers, rooms, semester_config'
#             }), 400
        
#         # 2. Extract data
#         courses = data['courses']
#         teachers = data['teachers']
#         rooms = data['rooms']
#         semester_config = data['semester_config']
#         ga_config = data.get('ga_config', {})

#         # --- [CẬP NHẬT 1] Validate 'teacher_id' và các trường cố định trong 'courses' ---
#         required_course_keys = [
#             'id', 'course_id', 'teacher_id', 'student_count', 
#             'weeks_needed', 'sessions_per_week', 'duration_per_session', 'class_id'
#         ]
#         for i, course in enumerate(courses):
#             for key in required_course_keys:
#                 if key not in course:
#                     return jsonify({
#                         'success': False,
#                         'error': f"Lỗi dữ liệu: Lớp học phần (courses[{i}]) thiếu trường bắt buộc '{key}'"
#                     }), 400

#         # --- [CẬP NHẬT 2] Xử lý 'busy_slots' từ JSON List sang Python Set ---
#         # Client sẽ gửi: "busy_slots": [[2, 1], [2, 2]] (List[List[int]])
#         # Class Python cần: "busy_slots": {(2, 1), (2, 2)} (Set[Tuple[int, int]])
#         processed_teachers = []
#         for teacher in teachers:
#             # Tạo bản sao để xử lý
#             processed_teacher = teacher.copy()
            
#             # Lấy danh sách busy_slots từ JSON (nếu có)
#             json_busy_slots = processed_teacher.get('busy_slots')
            
#             if json_busy_slots and isinstance(json_busy_slots, list):
#                 try:
#                     # Chuyển đổi List[List] thành Set[Tuple]
#                     processed_teacher['busy_slots'] = {tuple(slot) for slot in json_busy_slots}
#                 except TypeError:
#                     return jsonify({
#                         'success': False,
#                         'error': f"Lỗi dữ liệu: 'busy_slots' của GV {teacher.get('id')} phải là một danh sách các cặp [day, period]"
#                     }), 400
#             else:
#                 # Đảm bảo luôn là một set, dù client không gửi hoặc gửi null
#                 processed_teacher['busy_slots'] = set()
                
#             processed_teachers.append(processed_teacher)
        
#         # 3. Run genetic algorithm
#         print(f"🚀 Starting genetic algorithm (Pure Scheduling) với {len(courses)} lớp học phần...")
        
#         scheduler = SemesterGeneticScheduler(
#             courses_to_schedule=courses,
#             teachers=processed_teachers,  # <-- Dùng danh sách GV đã được xử lý
#             rooms=rooms,
#             semester_config=semester_config,
#             ga_config=ga_config
#         )
        
#         result = scheduler.evolve()
        
#         # 4. Xử lý kết quả
#         # Lấy TKB tốt nhất ngay cả khi nó không hợp lệ (để debug)
#         best_schedule = result.get('best_schedule')
#         if not best_schedule:
#              return jsonify({
#                 'success': False,
#                 'error': result.get('error', 'Không thể tạo quần thể ban đầu')
#             }), 500

#         # --- [CẬP NHẬT 3] Định dạng JSON trả về ---
#         response_data = {
#             'success': result['success'], # True nếu fitness < 1,000,000
#             'semester': {
#                 'start_week': best_schedule.semester_start_week,
#                 'end_week': best_schedule.semester_end_week,
#                 'max_concurrent': best_schedule.max_concurrent_courses
#             },
#             'courses': [],
#             'fitness': result['fitness'],
#             'generations': result['generations_run'],
#             'penalty_breakdown': result['penalty_breakdown'],
#             'schedule_summary': result['schedule_summary']
#         }
        
#         # Convert courses
#         for course in best_schedule.courses:
#             course_data = {
#                 'course_id': course.course_id,
#                 'class_id': course.class_id,
#                 'teacher_id': course.teacher_id,
#                 'room_id': course.room_id,
#                 'start_week': course.start_week,
#                 'end_week': course.end_week, # Thuộc tính @property vẫn hoạt động
#                 'weeks_needed': course.weeks_needed, # [THAY ĐỔI] Dùng trường cố định
#                 'student_count': course.student_count,
#                 'weekly_slots': [
#                     {
#                         'day': slot.day,
#                         'period': slot.period,
#                         'duration': course.duration_per_slot
#                     }
#                     for slot in course.weekly_slots
#                 ]
#             }
#             response_data['courses'].append(course_data)
        
#         print(f"✅ Successfully finished GA. Valid schedule found: {result['success']}")
#         return jsonify(response_data), 200
            
#     except Exception as e:
#         print(f"❌ Error: {str(e)}")
#         traceback.print_exc()
#         return jsonify({
#             'success': False,
#             'error': f"Lỗi máy chủ nội bộ: {str(e)}"
#         }), 500
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
            'class_id', 'type'  # [MỚI] Yêu cầu trường 'type'
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
                'class_id': course.class_id,
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

if __name__ == '__main__':
    print("🌐 Starting Flask API Server...")
    print("📍 Server running at: http://localhost:5001")
    print("📝 API endpoint: POST http://localhost:5001/api/schedule")
    app.run(debug=True, port=5001)