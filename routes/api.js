'use strict';

const Thread = require('../models/Thread');

module.exports = function (app) {

    app.route('/api/threads/:board')
        .post(async function (req, res) {
            const { text, delete_password } = req.body;
            const board = req.params.board;

            const newThread = new Thread({
                text,
                delete_password,
                board
            });

            try {
                const savedThread = await newThread.save();
                res.json(savedThread);
            } catch (err) {
                console.error(err);
                res.status(500).send('Error saving thread');
            }
        })

        .get(async function (req, res) {
            const board = req.params.board;
            try {
                const threads = await Thread.find({ board: board })
                    .sort({ bumped_on: -1 })
                    .limit(10)
                    .lean();

                const response = threads.map(thread => {
                    const { delete_password, reported, ...threadView } = thread;
                    threadView.replycount = thread.replies.length;
                    threadView.replies = thread.replies.slice(-3).map(reply => {
                        const { delete_password, reported, ...replyView } = reply;
                        return replyView;
                    });
                    return threadView;
                });

                res.json(response);
            } catch (err) {
                console.error(err);
                res.status(500).send('Error fetching threads');
            }
        })

        .delete(async function (req, res) {
            const { thread_id, delete_password } = req.body;
            try {
                const thread = await Thread.findById(thread_id);
                if (!thread) {
                    return res.send('Thread not found');
                }
                if (thread.delete_password === delete_password) {
                    await Thread.findByIdAndDelete(thread_id);
                    res.send('success');
                } else {
                    res.send('incorrect password');
                }
            } catch (err) {
                console.error(err);
                res.status(500).send('Error deleting thread');
            }
        })

        .put(async function (req, res) {
            const { thread_id } = req.body;
            try {
                await Thread.findByIdAndUpdate(thread_id, { reported: true });
                res.send('reported');
            } catch (err) {
                console.error(err);
                res.status(500).send('Error reporting thread');
            }
        });

    app.route('/api/replies/:board')
        .post(async function (req, res) {
            const { text, delete_password, thread_id } = req.body;
            const board = req.params.board; // Not strictly needed for logic if thread_id is unique, but part of route

            try {
                const thread = await Thread.findById(thread_id);
                if (!thread) return res.send('Thread not found');

                const now = new Date();
                const newReply = {
                    text,
                    delete_password,
                    created_on: now,
                    reported: false
                };

                thread.replies.push(newReply);
                thread.bumped_on = now;

                await thread.save();

                res.json(thread);
            } catch (err) {
                console.error(err);
                res.status(500).send('Error adding reply');
            }
        })

        .get(async function (req, res) {
            const thread_id = req.query.thread_id;
            try {
                const thread = await Thread.findById(thread_id).lean();
                if (!thread) return res.json({});

                const { delete_password, reported, ...threadView } = thread;
                threadView.replies = thread.replies.map(reply => {
                    const { delete_password, reported, ...replyView } = reply;
                    return replyView;
                });

                res.json(threadView);
            } catch (err) {
                console.error(err);
                res.status(500).send('Error fetching thread');
            }
        })

        .delete(async function (req, res) {
            const { thread_id, reply_id, delete_password } = req.body;
            try {
                const thread = await Thread.findById(thread_id);
                if (!thread) return res.send('Thread not found');

                const reply = thread.replies.id(reply_id);
                if (!reply) return res.send('Reply not found');

                if (reply.delete_password === delete_password) {
                    reply.text = '[deleted]';
                    await thread.save();
                    res.send('success');
                } else {
                    res.send('incorrect password');
                }
            } catch (err) {
                console.error(err);
                res.status(500).send('Error deleting reply');
            }
        })

        .put(async function (req, res) {
            const { thread_id, reply_id } = req.body;
            try {
                const thread = await Thread.findById(thread_id);
                if (!thread) return res.send('Thread not found');

                const reply = thread.replies.id(reply_id);
                if (!reply) return res.send('Reply not found');

                reply.reported = true;
                await thread.save();

                res.send('reported');
            } catch (err) {
                console.error(err);
                res.status(500).send('Error reporting reply');
            }
        });

};
