"""
Flask API Server for Genetic Algorithm Scheduler
Chạy: python app.py
"""

import traceback
from flask import Flask, request, jsonify
from flask_cors import CORS
import json

# Import genetic algorithm code
from genetic_scheduler_semester_new import (
    SemesterGeneticScheduler,
    SemesterSchedule,
    CourseSchedule
)

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
@app.route('/api/schedule', methods=['POST'])
def generate_schedule():
    """
    API endpoint để tạo thời khóa biểu (ĐÃ CẬP NHẬT)
    - Yêu cầu 'teacher_id' trong mỗi course.
    - Xử lý 'busy_slots' từ JSON list sang Python set.
    """
    try:
        data = request.get_json()
        
        # 1. Validate input cơ bản
        required_keys = ['courses', 'teachers', 'rooms', 'semester_config']
        if not all(k in data for k in required_keys):
            return jsonify({
                'success': False,
                'error': 'Thiếu các trường bắt buộc: courses, teachers, rooms, semester_config'
            }), 400
        
        # 2. Extract data
        courses = data['courses']
        teachers = data['teachers']
        rooms = data['rooms']
        semester_config = data['semester_config']
        ga_config = data.get('ga_config', {})

        # --- [CẬP NHẬT 1] Validate 'teacher_id' và các trường cố định trong 'courses' ---
        required_course_keys = [
            'id', 'course_id', 'teacher_id', 'student_count', 
            'weeks_needed', 'sessions_per_week', 'duration_per_session', 'class_id'
        ]
        for i, course in enumerate(courses):
            for key in required_course_keys:
                if key not in course:
                    return jsonify({
                        'success': False,
                        'error': f"Lỗi dữ liệu: Lớp học phần (courses[{i}]) thiếu trường bắt buộc '{key}'"
                    }), 400

        # --- [CẬP NHẬT 2] Xử lý 'busy_slots' từ JSON List sang Python Set ---
        # Client sẽ gửi: "busy_slots": [[2, 1], [2, 2]] (List[List[int]])
        # Class Python cần: "busy_slots": {(2, 1), (2, 2)} (Set[Tuple[int, int]])
        processed_teachers = []
        for teacher in teachers:
            # Tạo bản sao để xử lý
            processed_teacher = teacher.copy()
            
            # Lấy danh sách busy_slots từ JSON (nếu có)
            json_busy_slots = processed_teacher.get('busy_slots')
            
            if json_busy_slots and isinstance(json_busy_slots, list):
                try:
                    # Chuyển đổi List[List] thành Set[Tuple]
                    processed_teacher['busy_slots'] = {tuple(slot) for slot in json_busy_slots}
                except TypeError:
                    return jsonify({
                        'success': False,
                        'error': f"Lỗi dữ liệu: 'busy_slots' của GV {teacher.get('id')} phải là một danh sách các cặp [day, period]"
                    }), 400
            else:
                # Đảm bảo luôn là một set, dù client không gửi hoặc gửi null
                processed_teacher['busy_slots'] = set()
                
            processed_teachers.append(processed_teacher)
        
        # 3. Run genetic algorithm
        print(f"🚀 Starting genetic algorithm (Pure Scheduling) với {len(courses)} lớp học phần...")
        
        scheduler = SemesterGeneticScheduler(
            courses_to_schedule=courses,
            teachers=processed_teachers,  # <-- Dùng danh sách GV đã được xử lý
            rooms=rooms,
            semester_config=semester_config,
            ga_config=ga_config
        )
        
        result = scheduler.evolve()
        
        # 4. Xử lý kết quả
        # Lấy TKB tốt nhất ngay cả khi nó không hợp lệ (để debug)
        best_schedule = result.get('best_schedule')
        if not best_schedule:
             return jsonify({
                'success': False,
                'error': result.get('error', 'Không thể tạo quần thể ban đầu')
            }), 500

        # --- [CẬP NHẬT 3] Định dạng JSON trả về ---
        response_data = {
            'success': result['success'], # True nếu fitness < 1,000,000
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
        
        # Convert courses
        for course in best_schedule.courses:
            course_data = {
                'course_id': course.course_id,
                'class_id': course.class_id,
                'teacher_id': course.teacher_id,
                'room_id': course.room_id,
                'start_week': course.start_week,
                'end_week': course.end_week, # Thuộc tính @property vẫn hoạt động
                'weeks_needed': course.weeks_needed, # [THAY ĐỔI] Dùng trường cố định
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
        
        print(f"✅ Successfully finished GA. Valid schedule found: {result['success']}")
        return jsonify(response_data), 200
            
    except Exception as e:
        print(f"❌ Error: {str(e)}")
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