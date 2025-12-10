const mongoose = require('mongoose');
const { Schema } = mongoose;

const ReplySchema = new Schema({
    text: { type: String, required: true },
    created_on: { type: Date, required: true, default: Date.now },
    delete_password: { type: String, required: true },
    reported: { type: Boolean, required: true, default: false }
});

const ThreadSchema = new Schema({
    text: { type: String, required: true },
    created_on: { type: Date, required: true, default: Date.now },
    bumped_on: { type: Date, required: true, default: Date.now },
    reported: { type: Boolean, required: true, default: false },
    delete_password: { type: String, required: true },
    replies: [ReplySchema],
    board: { type: String, required: true }
});

const Thread = mongoose.model('Thread', ThreadSchema);

module.exports = Thread;
