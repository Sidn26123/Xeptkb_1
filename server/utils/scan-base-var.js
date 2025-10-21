#!/usr/bin/env node
/**
 * scan-and-generate.js
 *
 * Usage:
 *   DEFAULT_BASE=/api node scan-and-generate.js <folder-to-scan> [output-file]
 *
 * Example:
 *   DEFAULT_BASE=/api node scan-and-generate.js ./routes result.json
 *
 * Behaviour:
 * - Quét đệ quy thư mục cung cấp (bỏ qua node_modules và thư mục bắt đầu bằng '.')
 * - Với mỗi file .js sẽ lấy tên file (không có .js), chuyển sang kebab-case
 * - Tạo object BASE_VARIABLES với key = tên-file-kebab và value = `${DEFAULT_BASE}/${tên-file-kebab}`
 * - Ghi object ra output JSON
 */

const fs = require('fs');
const path = require('path');

const DEFAULT_BASE = "http://localhost:5000/api"
const IGNORED_DIRS = new Set(['node_modules']);

function toKebabCase(str) {
    // Convert "myFileName.js" or "My File" or "my_file" => "my-file"
    return str
        .replace(/([a-z0-9])([A-Z])/g, '$1-$2') // camelCase -> dash
        .replace(/[_\s]+/g, '-')               // underscores/spaces -> dash
        .replace(/-+/g, '-')                   // collapse multiple dashes
        .toLowerCase();
}

function walkDir(dir, fileList = []) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const ent of entries) {
        // skip hidden and ignored directories
        if (ent.name.startsWith('.') || IGNORED_DIRS.has(ent.name)) continue;

        const full = path.join(dir, ent.name);
        if (ent.isDirectory()) {
            walkDir(full, fileList);
        } else if (ent.isFile() && path.extname(ent.name).toLowerCase() === '.js') {
            fileList.push(full);
        }
    }
    return fileList;
}

function buildBaseVariables(jsFiles, base = DEFAULT_BASE) {
    const result = {};
    for (const filePath of jsFiles) {
        const name = path.basename(filePath, '.js'); // filename without .js
        const key = toKebabCase(name);
        // avoid collisions: if key exists, append index
        let finalKey = key;
        let idx = 1;
        while (Object.prototype.hasOwnProperty.call(result, finalKey)) {
            finalKey = `${key}-${idx++}`;
        }
        // value - follow the pattern DEFAULT_BASE + '/...'
        result[finalKey] = `${base}/${finalKey}`;
    }
    return result;
}

// ---- main ----
function main() {
    const args = process.argv.slice(2);
    if (args.length < 1) {
        console.error('Usage: DEFAULT_BASE=/api node scan-and-generate.js <folder-to-scan> [output-file]');
        process.exit(2);
    }

    const folderToScan = path.resolve(process.cwd(), args[0]);
    const outputFile = args[1] ? path.resolve(process.cwd(), args[1]) : path.resolve(process.cwd(), 'result.json');

    if (!fs.existsSync(folderToScan) || !fs.statSync(folderToScan).isDirectory()) {
        console.error('Error: folder-to-scan không tồn tại hoặc không phải thư mục:', folderToScan);
        process.exit(3);
    }

    try {
        const jsFiles = walkDir(folderToScan);
        const baseVars = buildBaseVariables(jsFiles, DEFAULT_BASE);

        // If you already have an existing result file and want to merge, uncomment below:
        // let existing = {};
        // if (fs.existsSync(outputFile)) {
        //   existing = JSON.parse(fs.readFileSync(outputFile, 'utf8') || '{}');
        // }
        // const merged = { ...existing, ...baseVars };
        // fs.writeFileSync(outputFile, JSON.stringify(merged, null, 2), 'utf8');

        // Default: overwrite with generated object
        fs.writeFileSync(outputFile, JSON.stringify(baseVars, null, 2), 'utf8');

        console.log(`Scanned ${jsFiles.length} .js files.`);
        console.log(`Result written to ${outputFile}`);
    } catch (err) {
        console.error('Lỗi khi quét hoặc ghi file:', err);
        process.exit(1);
    }
}

if (require.main === module) main();
