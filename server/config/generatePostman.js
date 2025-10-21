/**
 * Auto-generate Postman collection from Express routers
 * Author: ChatGPT (fixed & complete)
 */
const fs = require('fs');
const path = require('path');

const ROUTES_DIR = "D:\\Intelij IDEA\\Project\\Xeptkb\\server\\routes" // thư mục chứa các router
const OUTPUT_DIR = path.join(__dirname, 'postman'); // nơi lưu file Postman
const ENV_FILE = path.join(OUTPUT_DIR, 'postman_environment.json');

// ==== CONFIG ====
const DEFAULT_BASE = 'http://localhost:5000/api/v1'; // base mặc định
// Ví dụ bạn có thể cấu hình variable mapping như sau:
const BASE_VARIABLES = {
    "academicYear": DEFAULT_BASE  + "/academic-year",
    "admin": DEFAULT_BASE  + "/admin",
    "auth": DEFAULT_BASE  + "/auth",
    "building": DEFAULT_BASE  + "/building",
    "campus": DEFAULT_BASE  + "/campus",
    "class": DEFAULT_BASE  + "/class",
    "courseClass": DEFAULT_BASE  + "/course-class",
    "equipment": DEFAULT_BASE  + "/equipment",
    "faculty": DEFAULT_BASE  + "/faculty",
    "holidayActual": DEFAULT_BASE  + "/holiday-actual",
    "holidayRule": DEFAULT_BASE  + "/holiday-rule",
    "room": DEFAULT_BASE  + "/room",
    "roomEquipment": DEFAULT_BASE  + "/room-equipment",
    "schedule": DEFAULT_BASE  + "/schedule",
    "semester": DEFAULT_BASE  + "/semester",
    "softContraist": DEFAULT_BASE  + "/soft-contraist",
    "student": DEFAULT_BASE  + "/student",
    "subject": DEFAULT_BASE  + "/subject",
    "subjectRequiresEquipment": DEFAULT_BASE  + "/subject-requires-equipment",
    "teacher": DEFAULT_BASE  + "/teacher",
    "teaching": DEFAULT_BASE  + "/teaching",
    "trainingType": DEFAULT_BASE  + "/training-type"
};

// ===========================
if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });
const methods = ['get', 'post', 'put', 'delete', 'patch'];

/** Parse endpoints from one router file */
function parseEndpointsFromFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const endpoints = [];

    methods.forEach(method => {
        const regex = new RegExp(`router\\.${method}\\(['"\`](.*?)['"\`]`, 'g');
        let match;
        while ((match = regex.exec(content)) !== null) {
            const rawPath = match[1];
            const normalized = rawPath.startsWith('/') ? rawPath : '/' + rawPath;
            endpoints.push({
                method: method.toUpperCase(),
                rawPath: normalized
            });
        }
    });

    return endpoints;
}

/** Helper: parse path into path segments and query array */
function splitPathAndQuery(rawPath) {
    const [pathOnly, queryString] = rawPath.split('?');
    const segments = pathOnly
        .replace(/^\//, '')
        .split('/')
        .filter(Boolean);
    const query = [];
    if (queryString) {
        queryString.split('&').forEach(pair => {
            const [k, v] = pair.split('=');
            query.push({
                key: decodeURIComponent(k || ''),
                value: decodeURIComponent(v || ''),
                disabled: false
            });
        });
    }
    return { segments, query, pathOnly };
}

/** Generate Postman folder (per router) */
function generateFolder(fileKey, endpoints) {
    const baseVar = `{{${fileKey}}}`; // variable name used in environment

    const folderItems = endpoints.map(e => {
        const { segments, query, pathOnly } = splitPathAndQuery(e.rawPath);

        // Postman url object
        const urlObj = {
            raw: `${baseVar}${pathOnly}`,
            host: [baseVar],
            path: segments
        };

        if (query.length > 0) {
            urlObj.query = query;
        }

        return {
            name: `${e.method} ${e.rawPath}`,
            request: {
                method: e.method,
                header: [],
                url: urlObj
            }
        };
    });

    const folder = {
        name: fileKey,
        item: folderItems
    };

    // Ghi riêng từng file JSON (1 folder = 1 file)
    const folderPath = path.join(OUTPUT_DIR, fileKey);
    if (!fs.existsSync(folderPath)) fs.mkdirSync(folderPath, { recursive: true });

    fs.writeFileSync(
        path.join(folderPath, `${fileKey}.json`),
        JSON.stringify(folder, null, 2)
    );

    return folder;
}

/** Generate Postman environment variables */
function generateEnvironment() {
    const variables = Object.entries(BASE_VARIABLES).map(([key, value]) => ({
        key,
        value,
        enabled: true
    }));

    // ensure there's at least a default variable for files not in BASE_VARIABLES
    const env = {
        name: "Local Environment",
        values: variables
    };

    fs.writeFileSync(ENV_FILE, JSON.stringify(env, null, 2));
    console.log(`✅ Đã tạo ${ENV_FILE}`);
}

/** Generate full collection */
function generateCollection(folders) {
    const collection = {
        info: {
            name: "Auto Generated Express API",
            schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
        },
        item: folders
    };

    const outPath = path.join(OUTPUT_DIR, 'postman_collection.json');
    fs.writeFileSync(outPath, JSON.stringify(collection, null, 2));
    console.log(`✅ Đã tạo ${outPath}`);
}

// ==================== MAIN ====================
const folders = [];

// Read route files (non-recursive). Nếu muốn recursive, thay đổi logic ở đây.
if (!fs.existsSync(ROUTES_DIR)) {
    console.error(`⚠️ Thư mục routes không tồn tại: ${ROUTES_DIR}`);
    process.exit(1);
}

fs.readdirSync(ROUTES_DIR).forEach(file => {
    const filePath = path.join(ROUTES_DIR, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
        // Nếu thư mục con chứa các file router (ví dụ routes/admin/*.js),
        // ta cũng quét các file .js trong đó và đặt fileKey là <subdir>_<filename>
        fs.readdirSync(filePath).forEach(subfile => {
            if (!subfile.endsWith('.js')) return;
            const subfilePath = path.join(filePath, subfile);
            const fileKey = `${path.basename(file)}_${path.basename(subfile, '.js')}`;
            const endpoints = parseEndpointsFromFile(subfilePath);
            if (endpoints.length > 0) {
                const folder = generateFolder(fileKey, endpoints);
                folders.push(folder);
                console.log(`📁 Đã quét ${fileKey} (${endpoints.length} endpoints)`);
            }
        });
        return;
    }

    if (!file.endsWith('.js')) return;

    const fileKey = path.basename(file, '.js'); // ví dụ: auth.js → auth
    const endpoints = parseEndpointsFromFile(filePath);

    if (endpoints.length > 0) {
        const folder = generateFolder(fileKey, endpoints);
        folders.push(folder);
        console.log(`📁 Đã quét ${fileKey}.js (${endpoints.length} endpoints)`);
    }
});

if (folders.length > 0) {
    generateCollection(folders);
    generateEnvironment();
    console.log('\n✨ Hoàn tất! Import cả 2 file sau vào Postman:');
    console.log(` - ${path.join(OUTPUT_DIR, 'postman_collection.json')}`);
    console.log(` - ${ENV_FILE}`);
    console.log('\n📌 Lưu ý: đảm bảo trong postman_environment.json có key tương ứng với tên file (ví dụ "rating")');
} else {
    console.log('⚠️ Không tìm thấy endpoint nào.');
}
