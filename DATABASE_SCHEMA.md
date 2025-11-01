# Database Schema - Hệ thống xếp lịch

## Subjects
```sql
CREATE TABLE subjects (
  id INT PRIMARY KEY AUTO_INCREMENT,
  subject_code VARCHAR(20) UNIQUE NOT NULL,
  subject_name VARCHAR(255) NOT NULL,
  training_type_id INT,
  
  theory BOOLEAN DEFAULT FALSE,
  practice BOOLEAN DEFAULT FALSE,
  self_study BOOLEAN DEFAULT FALSE,
  
  total_hours INT NOT NULL,
  credits INT NOT NULL,
  description TEXT,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (training_type_id) REFERENCES training_types(id),
  INDEX idx_training_type (training_type_id)
);
```

## Subject Components
```sql
CREATE TABLE subject_components (
  id INT PRIMARY KEY AUTO_INCREMENT,
  subject_id INT NOT NULL,
  component_type ENUM('theory', 'practice', 'self_study', 'lab', 'physical', 'online') NOT NULL,
  
  hours_study INT NOT NULL,
  room_type_require VARCHAR(50),
  notes TEXT,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
  INDEX idx_subject_type (subject_id, component_type)
);
```

## Subject Component Equipment
```sql
CREATE TABLE subject_component_equipment (
  id INT PRIMARY KEY AUTO_INCREMENT,
  subject_component_id INT NOT NULL,
  equipment_id INT NOT NULL,
  quantity_per_student DECIMAL(5,2) DEFAULT 0,
  is_required BOOLEAN DEFAULT TRUE,
  notes TEXT,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (subject_component_id) REFERENCES subject_components(id) ON DELETE CASCADE,
  FOREIGN KEY (equipment_id) REFERENCES equipments(id),
  UNIQUE KEY unique_component_equipment (subject_component_id, equipment_id),
  INDEX idx_component (subject_component_id)
);
```

## Rooms
```sql
CREATE TABLE rooms (
  id INT PRIMARY KEY AUTO_INCREMENT,
  room_code VARCHAR(20) UNIQUE NOT NULL,
  room_name VARCHAR(255),
  room_type VARCHAR(50) NOT NULL,
  
  building_id INT NOT NULL,
  floor_number INT,
  
  capacity_max INT NOT NULL,
  capacity_optimal INT,
  
  is_available BOOLEAN DEFAULT TRUE,
  notes TEXT,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (building_id) REFERENCES buildings(id),
  FOREIGN KEY (campus_id) REFERENCES campus(id),
  INDEX idx_room_type (room_type),
  INDEX idx_building (building_id)
);
```

## Room Equipment
```sql
CREATE TABLE room_equipment (
  id INT PRIMARY KEY AUTO_INCREMENT,
  room_id INT NOT NULL,
  equipment_id INT NOT NULL,
  
  total_quantity INT NOT NULL,
  available_quantity INT NOT NULL,
  
  status ENUM('active', 'maintenance', 'damaged', 'retired') DEFAULT 'active',
  notes TEXT,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
  FOREIGN KEY (equipment_id) REFERENCES equipments(id),
  UNIQUE KEY unique_room_equipment (room_id, equipment_id),
  INDEX idx_room (room_id)
);
```

## Equipments
```sql
CREATE TABLE equipments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  equipment_code VARCHAR(50) UNIQUE NOT NULL,
  equipment_name VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  
  unit VARCHAR(50) DEFAULT 'cái',
  description TEXT,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_category (category)
);
```

## Entity Relationships

```
subjects (1) ──────< (N) subject_components
                              │
                              │
                              ├────< (N) subject_component_equipment ────> (1) equipments
                              
rooms (1) ──────< (N) room_equipment ────> (1) equipments

buildings (1) ──────< (N) rooms

campus (1) ──────< (N) buildings

training_types (1) ──────< (N) subjects
```

## Enums

### component_type
- `theory` - Lý thuyết
- `practice` - Thực hành
- `self_study` - Tự học
- `lab` - Phòng thí nghiệm
- `physical` - Thể dục
- `online` - Học online

### room_type
- `classroom` - Phòng học thường
- `chemistry_lab` - Phòng lab hóa
- `physics_lab` - Phòng lab lý
- `biology_lab` - Phòng lab sinh
- `computer_lab` - Phòng máy tính
- `gym` - Phòng tập gym
- `sports_hall` - Nhà thi đấu
- `outdoor_field` - Sân ngoài trời
- `virtual_room` - Phòng ảo (online)

### status (room_equipment)
- `active` - Đang hoạt động
- `maintenance` - Đang bảo trì
- `damaged` - Hỏng
- `retired` - Ngừng sử dụng
