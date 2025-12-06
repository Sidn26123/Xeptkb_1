// controllers/backupController.js
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const db = require('../config/db'); // Kết nối DB của bạn

// CẤU HÌNH ĐƯỜNG DẪN
const BACKUP_DIR = path.join(__dirname, '../backups');

// Đảm bảo thư mục tồn tại
if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

// --- PHẦN 1: CÁC HÀM XỬ LÝ CỐT LÕI (CORE) ---

// Hàm lấy config DB (Tách ra để tái sử dụng)
const getDbConfig = () => ({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

// --- PHẦN 2: API HANDLERS ---

// 1. Tạo Backup (Local)
exports.createBackup = async (req, res) => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `backup_${timestamp}.sql`;
    const filePath = path.join(BACKUP_DIR, fileName);
    const dbConfig = getDbConfig();

    // Lệnh mysqldump
    // Lưu ý: Thêm đường dẫn tuyệt đối vào mysqldump nếu biến môi trường chưa có
    const command = `mysqldump -h ${dbConfig.host} -u ${dbConfig.user} -p${dbConfig.password} --column-statistics=0 ${dbConfig.database} > "${filePath}"`;

    console.log(`Dang tao backup tai: ${filePath}`);

    exec(command, async (error, stdout, stderr) => {
        if (error) {
            console.error('Backup Error:', error);
            return res.status(500).json({ message: "Lỗi tạo file backup", error: error.message });
        }

        try {
            // Lấy kích thước file
            const stats = fs.statSync(filePath);
            const fileSize = (stats.size / 1024 / 1024).toFixed(2) + ' MB';

            // Lưu thông tin vào DB
            // SAU NÀY: Nếu dùng Cloud, đoạn này sẽ gọi hàm uploadCloudinary() rồi mới lưu URL
            const sql = 'INSERT INTO system_backups (filename, filepath, file_size, storage_type) VALUES (?, ?, ?, ?)';
            await db.promise().query(sql, [fileName, filePath, fileSize, 'local']);

            res.json({ message: "Sao lưu thành công (Local)", filename: fileName });
        } catch (dbError) {
            res.status(500).json({ message: "Lỗi lưu DB", error: dbError.message });
        }
    });
};

// 2. Lấy danh sách
exports.getBackups = async (req, res) => {
    try {
        const [rows] = await db.promise().query("SELECT * FROM system_backups ORDER BY created_at DESC");
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: "Lỗi lấy dữ liệu" });
    }
};

// 3. Tải file về máy (Download Local File)
exports.downloadBackup = (req, res) => {
    const { filename } = req.params;
    const filePath = path.join(BACKUP_DIR, filename);

    if (fs.existsSync(filePath)) {
        res.download(filePath); // Express tự xử lý việc stream file xuống client
    } else {
        res.status(404).json({ message: "File không tồn tại trên server" });
    }
};

// 4. Khôi phục (Restore)
exports.restoreBackup = async (req, res) => {
    const { filename } = req.body;
    const filePath = path.join(BACKUP_DIR, filename);

    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ message: "File backup không tìm thấy" });
    }

    const dbConfig = getDbConfig();

    // Lệnh restore: mysql < file.sql
    const command = `mysql -h ${dbConfig.host} -u ${dbConfig.user} -p${dbConfig.password} ${dbConfig.database} < "${filePath}"`;

    console.log(`Dang restore tu: ${filePath}`);

    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error('Restore Error:', error);
            return res.status(500).json({ message: "Lỗi restore database", error: error.message });
        }
        res.json({ message: "Khôi phục dữ liệu thành công!" });
    });
};

// 5. Xóa Backup
exports.deleteBackup = async (req, res) => {
    const { id, filename } = req.body;
    const filePath = path.join(BACKUP_DIR, filename);

    try {
        // 1. Xóa file vật lý
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        // 2. Xóa trong DB
        await db.promise().query("DELETE FROM system_backups WHERE id = ?", [id]);

        res.json({ message: "Đã xóa bản backup" });
    } catch (error) {
        res.status(500).json({ message: "Lỗi xóa backup", error: error.message });
    }
};