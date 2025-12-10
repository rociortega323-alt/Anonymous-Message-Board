const mongoose = require('mongoose');
const db = mongoose.connect(process.env.DB)
    .then(() => console.log('Database connected successfully'))
    .catch(err => console.error('Database connection error:', err));

module.exports = db;
