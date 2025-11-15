const sequelize = require('../config/initSequelize');
const { Teacher, User } = require('../models');

const identifier = process.argv[2];
if (!identifier) {
  console.error('Usage: node scripts/checkTeacher.js <TEACHER_IDENTIFIER>');
  process.exit(1);
}

(async () => {
  try {
    await sequelize.authenticate();
    console.log('DB connected');

    const teacher = await Teacher.findOne({ where: { teacher_identifier: identifier } });
    const teacherTrim = await Teacher.findOne({ where: sequelize.where(sequelize.fn('TRIM', sequelize.col('teacher_identifier')), identifier) });
    const teacherLower = await Teacher.findOne({ where: sequelize.where(sequelize.fn('LOWER', sequelize.col('teacher_identifier')), identifier.toLowerCase()) });

    console.log('\nSearch by exact teacher_identifier:');
    console.log(teacher ? teacher.toJSON() : 'Not found');

    console.log('\nSearch by TRIM(teacher_identifier):');
    console.log(teacherTrim ? teacherTrim.toJSON() : 'Not found');

    console.log('\nSearch by LOWER(teacher_identifier):');
    console.log(teacherLower ? teacherLower.toJSON() : 'Not found');

    const email = `${String(identifier).toLowerCase()}@teacher.example.edu.vn`;
    const user = await User.findOne({ where: { username: email } });
    console.log(`\nSearch User by username = ${email}:`);
    console.log(user ? user.toJSON() : 'Not found');

    await sequelize.close();
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(2);
  }
})();
