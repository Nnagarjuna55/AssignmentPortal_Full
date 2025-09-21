const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Assignment = require('./models/Assignment');
require('dotenv').config();

const MONGO = process.env.MONGO_URI || 'mongodb://localhost:27017/assignment_portal_full';
mongoose.connect(MONGO, {useNewUrlParser:true, useUnifiedTopology:true})
  .then(async ()=> {
    console.log('Connected. Seeding...');
    await User.deleteMany({});
    await Assignment.deleteMany({});
    const salt = await bcrypt.genSalt(10);
    const teacherPass = await bcrypt.hash('teacher123', salt);
    const studentPass = await bcrypt.hash('student123', salt);
    const t = await User.create({ name:'Teacher One', email:'teacher@example.com', password:teacherPass, role:'teacher' });
    const s = await User.create({ name:'Student One', email:'student@example.com', password:studentPass, role:'student' });
    await Assignment.create({ title:'Sample Draft', description:'Draft assignment', createdBy: t._id });
    await Assignment.create({ title:'Published Assignment', description:'Please answer', dueDate: new Date(Date.now()+7*24*3600*1000), status:'Published', createdBy: t._id });
    console.log('Seed complete. Users: teacher@example.com/teacher123, student@example.com/student123');
    process.exit(0);
  }).catch(err => console.error(err));
