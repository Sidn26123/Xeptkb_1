# Hệ thống xếp lịch

## Giới thiệu tổng quan

Dự án gồm 4 thành phần chính:

- **adminsite/**: Giao diện quản trị dành cho quản trị viên. Sử dụng React, Vite, TailwindCSS. Chứa các file cấu hình, mã nguồn, tài sản tĩnh và public.
- **studentsite/**: Giao diện dành cho sinh viên. Công nghệ và cấu trúc tương tự adminsite, tùy biến cho nhu cầu sinh viên.
- **teachersite/**: Giao diện dành cho giảng viên. Công nghệ và cấu trúc tương tự adminsite, tùy biến cho nhu cầu giảng viên.
- **server/**: Backend API, quản lý dữ liệu, xác thực và các chức năng nghiệp vụ. Sử dụng Node.js.

## Cấu trúc thư mục

- `adminsite/`, `studentsite/`, `teachersite/`: Mỗi folder gồm các file cấu hình (package.json, postcss.config.js, tailwind.config.js, vite.config.js), mã nguồn React trong src/, tài sản tĩnh trong assets/, file public cho frontend.
- `server/`: Chứa các file cấu hình, models, routes, và mã nguồn backend.

## Công nghệ sử dụng

- **Frontend**: React, Vite, TailwindCSS, ESLint, PostCSS.
- **Backend**: Node.js, Express, các module cấu hình và quản lý database.

## Mục đích từng phần

- **adminsite**: Quản lý hệ thống, người dùng, lịch học, phòng học, phân quyền.
- **studentsite**: Tra cứu lịch học, phòng học và xem thông tin cá nhân, ...
- **teachersite**: Xem thông tin lớp học, lịch giảng dạy, điểm danh, ...
- **server**: Xử lý nghiệp vụ, lưu trữ dữ liệu, cung cấp API cho các site, ...

## Cấu hình biến môi trường cho server

Tạo file `.env` trong thư mục `server/` dựa trên mẫu `.env.example` với các biến sau:

```
FRONTEND_ORIGIN=FRONTENDURL      # vd : http://localhost:5173,http://localhost:8080,http://localhost:8081 ( chuỗi các URL truy cập của các site )
PORT=PORTNUMBER                  # Cổng chạy server (ví dụ: 5000)
DB_HOST=LOCALHOST                # Địa chỉ database (thường là localhost)
DB_PORT=PORTNUMBER               # Cổng database (ví dụ: 3306 cho MySQL)
DB_USER=USERNAME                 # Tên đăng nhập database
DB_PASS=PASSWORD                 # Mật khẩu database
DB_NAME=DATABASENAME             # Tên database sử dụng
```

Sau khi cấu hình, khởi động server để các biến môi trường được áp dụng.

## Hướng dẫn sử dụng

1. Cài đặt các dependencies cho từng folder bằng lệnh `npm install`.
2. Chạy frontend bằng lệnh `npm run dev` trong từng folder giao diện.
3. Chạy backend bằng lệnh `node server/index.js` hoặc `npm start` trong folder server.

## Hướng dẫn verify endpoint & test API

### 1. Đăng ký tài khoản (POST /api/register)
- Body: `{ "username": "user", "password": "pass", "role": "admin|teacher|student" }`
- Kết quả: Tạo user mới, trả về thông báo thành công.

### 2. Đăng nhập (POST /api/login)
- Body: `{ "username": "user", "password": "pass" }`
- Kết quả: Trả về access token, refresh token.

### 3. Lấy access token mới (POST /api/refresh-token)
- Body: `{ "refreshToken": "..." }`
- Kết quả: Trả về access token mới nếu refresh token hợp lệ.

### 4. Truy cập route bảo vệ
- Gửi access token qua header: `Authorization: Bearer <token>`
- `/api/admin`: Chỉ user role 'admin' truy cập được.
- `/api/teacher`: Chỉ user role 'teacher' truy cập được.
- `/api/student`: Chỉ user role 'student' truy cập được.
- Nếu không có quyền, trả về lỗi 403 với thông báo rõ ràng.

### 5. Hướng dẫn test với Postman
- Đăng ký → Đăng nhập → Lấy token → Gửi token vào header để test các route.
- Nếu token hết hạn, dùng refresh token để lấy mới.
- Kiểm tra phản hồi lỗi khi truy cập sai quyền hoặc thiếu token.