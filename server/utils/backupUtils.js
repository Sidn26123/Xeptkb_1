const mysqldump = require('mysqldump');
const path = require('path');
require('dotenv').config(); // Load biến môi trường

const exportDatabase = async () => {
    try {
        // Đường dẫn file output
        const filePath = path.join(__dirname, `../backups/backup-${Date.now()}.sql`);

        await mysqldump({
            connection: {
                host: process.env.DB_HOST || 'localhost',
                user: process.env.DB_USER || 'root',
                password: process.env.DB_PASSWORD || 'password',
                database: process.env.DB_NAME || 'school_db',
                port: process.env.DB_PORT || 3306,
            },
            dumpToFile: filePath,
            // Các tùy chọn nén (nếu muốn)
            compressFile: false,
        });

        console.log('✅ Export thành công tại:', filePath);
        return filePath;
    } catch (e) {
        console.error('❌ Lỗi export:', e);
        throw e;
    }
};

// Test thử
exportDatabase();

module.exports = exportDatabase;