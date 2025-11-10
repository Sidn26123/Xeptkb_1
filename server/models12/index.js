const fs = require('fs');
const path = require('path');
const sequelize = require('../config/initSequelize');
const basename = path.basename(__filename);
const db = {};

// Tự động load tất cả file model (trừ index.js)
fs.readdirSync(__dirname)
    .filter(file =>
        file.indexOf('.') !== 0 &&
        file !== basename &&
        file.slice(-3) === '.js'
    )
    .forEach(file => {
        const model = require(path.join(__dirname, file));
        db[model.name] = model;
    });

// Nếu các model có associations (quan hệ), khai báo ở đây
Object.keys(db).forEach(modelName => {
    if (db[modelName].associate) {
        db[modelName].associate(db);
    }
});

db.sequelize = sequelize;
db.Sequelize = require('sequelize');

module.exports = db;
