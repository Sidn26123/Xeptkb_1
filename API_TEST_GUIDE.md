# Hướng dẫn kiểm thử API xác thực & phân quyền

## 1. Đăng ký tài khoản (POST /api/register)
- Body: `{ "username": "user", "password": "pass", "role": "admin|teacher|student" }`
- Kết quả: Tạo user mới, trả về thông báo thành công.

## 2. Đăng nhập (POST /api/login)
- Body: `{ "username": "user", "password": "pass" }`
- Kết quả: Trả về access token, refresh token.

## 3. Lấy access token mới (POST /api/refresh-token)
- Body: `{ "refreshToken": "..." }`
- Kết quả: Trả về access token mới nếu refresh token hợp lệ.

## 4. Truy cập route bảo vệ
- Gửi access token qua header: `Authorization: Bearer <token>`
- `/api/admin`: Chỉ user role 'admin' truy cập được.
- `/api/teacher`: Chỉ user role 'teacher' truy cập được.
- `/api/student`: Chỉ user role 'student' truy cập được.
- Nếu không có quyền, trả về lỗi 403 với thông báo rõ ràng.

## 5. Hướng dẫn test với Postman
- Đăng ký → Đăng nhập → Lấy token → Gửi token vào header để test các route.
- Nếu token hết hạn, dùng refresh token để lấy mới.
- Kiểm tra phản hồi lỗi khi truy cập sai quyền hoặc thiếu token.