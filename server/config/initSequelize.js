const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres', // Bắt buộc đổi từ mysql sang postgres
    logging: false,
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false // Cần thiết để kết nối tới Supabase từ bên ngoài (như Render)
        }
    },
});

module.exports = sequelize;