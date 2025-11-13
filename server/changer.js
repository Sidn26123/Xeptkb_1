const fs = require('fs');
const path = require('path');

const inputFolder = path.join(__dirname, 'models');
const outputFolder = path.join(__dirname, 'models_new');

if (!fs.existsSync(outputFolder)) {
    fs.mkdirSync(outputFolder);
}

fs.readdirSync(inputFolder).forEach(file => {
    if (file.endsWith('.js')) {
        const inputPath = path.join(inputFolder, file);
        let content = fs.readFileSync(inputPath, 'utf-8');

        // Lấy tên bảng từ sequelize.define
        const tableNameMatch = content.match(/sequelize\.define\(['"`](\w+)['"`],/);
        if (!tableNameMatch) return;

        const tableName = tableNameMatch[1];

        // Tạo tên biến PascalCase
        const modelName = tableName
            .split(/_| /)
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join('');

        // **FIX CHÍNH Ở ĐÂY:**
        // Kiểm tra xem file đã có `const ${modelName} =` chưa
        const alreadyHasConst = content.includes(`const ${modelName} =`);

        if (alreadyHasConst) {
            // Nếu đã có rồi thì chỉ cần fix export
            content = content.replace(/module\.exports\s*=\s*\w+;?/, `module.exports = ${modelName};`);
        } else {
            // Nếu chưa có thì thêm const và fix export
            content = content
                .replace(/module\.exports\s*=\s*\w+;?/, '')
                .replace(/sequelize\.define\(['"`]\w+['"`],/, `const ${modelName} = sequelize.define('${tableName}',`);

            content += `\n\nmodule.exports = ${modelName};\n`;
        }

        const outputPath = path.join(outputFolder, file);
        fs.writeFileSync(outputPath, content, 'utf-8');
        console.log(`✅ Converted ${file}`);
    }
});