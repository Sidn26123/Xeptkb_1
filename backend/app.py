"""
Flask API Server for Genetic Algorithm Scheduler
Chạy: python app.py
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import json

# Import genetic algorithm code
from genetic_scheduler_semester import (
    SemesterGeneticScheduler,
    SemesterSchedule,
    CourseSchedule
)

app = Flask(__name__)
CORS(app)  # Cho phép React gọi API từ localhost khác

@app.route('/api/schedule', methods=['POST'])
def generate_schedule():
    """
    API endpoint để tạo thời khóa biểu
    
    Request body:
    {
        "courses": [...],
        "teachers": [...],
        "rooms": [...],
        "semester_config": {...},
        "ga_config": {...}
    }
    """
    try:
        data = request.get_json()
        
        # Validate input
        if not all(k in data for k in ['courses', 'teachers', 'rooms', 'semester_config']):
            return jsonify({
                'success': False,
                'error': 'Missing required fields'
            }), 400
        
        # Extract data
        courses = data['courses']
        teachers = data['teachers']
        rooms = data['rooms']
        semester_config = data['semester_config']
        ga_config = data.get('ga_config', {})
        print("semester_config:", semester_config)
        # Run genetic algorithm
        print(f"🚀 Starting genetic algorithm with {len(courses)} courses...")
        
        scheduler = SemesterGeneticScheduler(
            courses_to_schedule=courses,
            teachers=teachers,
            rooms=rooms,
            semester_config=semester_config,
            ga_config=ga_config
        )
        
        result = scheduler.evolve()
        
        if result['success']:
            schedule = result['best_schedule']
            
            # Convert to JSON-serializable format
            response_data = {
                'success': True,
                'semester': {
                    'start_week': schedule.semester_start_week,
                    'end_week': schedule.semester_end_week,
                    'max_concurrent': schedule.max_concurrent_courses
                },
                'courses': [],
                'fitness': result['fitness'],
                'generations': result['generations_run'],
                'penalty_breakdown': result['penalty_breakdown'],
                'schedule_summary': result['schedule_summary']
            }
            
            # Convert courses
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
                response_data['courses'].append(course_data)
            print(response_data['semester'])
            print(f"✅ Successfully generated schedule!")
            return jsonify(response_data), 200
        else:
            return jsonify({
                'success': False,
                'error': result.get('error', 'Unknown error')
            }), 500
            
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': str(e)
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