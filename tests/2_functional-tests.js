const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function () {

    let testThreadId;
    let testReplyId;

    suite('API ROUTING FOR /api/threads/:board', function () {

        test('POST a new thread', function (done) {
            chai.request(server)
                .post('/api/threads/test_board')
                .send({ text: 'test thread', delete_password: 'pass' })
                .end(function (err, res) {
                    assert.equal(res.status, 200);
                    assert.property(res.body, '_id');
                    assert.equal(res.body.text, 'test thread');
                    assert.property(res.body, 'created_on');
                    assert.property(res.body, 'bumped_on');
                    assert.equal(res.body.delete_password, 'pass');
                    testThreadId = res.body._id; // Save for later tests
                    done();
                });
        });

        test('GET the 10 most recent threads with 3 replies each', function (done) {
            chai.request(server)
                .get('/api/threads/test_board')
                .end(function (err, res) {
                    assert.equal(res.status, 200);
                    assert.isArray(res.body);
                    assert.isBelow(res.body.length, 11);
                    assert.property(res.body[0], '_id');
                    assert.property(res.body[0], 'replycount');
                    assert.property(res.body[0], 'replies');
                    assert.notProperty(res.body[0], 'delete_password');
                    assert.notProperty(res.body[0], 'reported');
                    done();
                });
        });

        test('DELETE thread with bad password', function (done) {
            chai.request(server)
                .delete('/api/threads/test_board')
                .send({ thread_id: testThreadId, delete_password: 'wrong_pass' })
                .end(function (err, res) {
                    assert.equal(res.status, 200);
                    assert.equal(res.text, 'incorrect password');
                    done();
                });
        });

        test('PUT thread (report)', function (done) {
            chai.request(server)
                .put('/api/threads/test_board')
                .send({ thread_id: testThreadId })
                .end(function (err, res) {
                    assert.equal(res.status, 200);
                    assert.equal(res.text, 'reported');
                    done();
                });
        });

    });

    suite('API ROUTING FOR /api/replies/:board', function () {

        test('POST a new reply', function (done) {
            chai.request(server)
                .post('/api/replies/test_board')
                .send({ text: 'test reply', delete_password: 'pass', thread_id: testThreadId })
                .end(function (err, res) {
                    assert.equal(res.status, 200);
                    // Assuming the API returns the updated thread object or we can check the thread again
                    // The previous code returns the updated thread json
                    assert.equal(res.body._id, testThreadId);
                    assert.isNotEmpty(res.body.replies);
                    const reply = res.body.replies[res.body.replies.length - 1];
                    assert.equal(reply.text, 'test reply');
                    testReplyId = reply._id;
                    done();
                });
        });

        test('GET a single thread with all replies', function (done) {
            chai.request(server)
                .get('/api/replies/test_board')
                .query({ thread_id: testThreadId })
                .end(function (err, res) {
                    assert.equal(res.status, 200);
                    assert.equal(res.body._id, testThreadId);
                    assert.property(res.body, 'replies');
                    assert.isArray(res.body.replies);
                    assert.notProperty(res.body, 'delete_password');
                    assert.notProperty(res.body, 'reported');
                    assert.equal(res.body.replies[0].text, 'test reply');
                    assert.notProperty(res.body.replies[0], 'delete_password');
                    assert.notProperty(res.body.replies[0], 'reported');
                    done();
                });
        });

        test('DELETE reply with bad password', function (done) {
            chai.request(server)
                .delete('/api/replies/test_board')
                .send({ thread_id: testThreadId, reply_id: testReplyId, delete_password: 'wrong_pass' })
                .end(function (err, res) {
                    assert.equal(res.status, 200);
                    assert.equal(res.text, 'incorrect password');
                    done();
                });
        });

        test('PUT reply (report)', function (done) {
            chai.request(server)
                .put('/api/replies/test_board')
                .send({ thread_id: testThreadId, reply_id: testReplyId })
                .end(function (err, res) {
                    assert.equal(res.status, 200);
                    assert.equal(res.text, 'reported');
                    done();
                });
        });

        test('DELETE reply with valid password', function (done) {
            chai.request(server)
                .delete('/api/replies/test_board')
                .send({ thread_id: testThreadId, reply_id: testReplyId, delete_password: 'pass' })
                .end(function (err, res) {
                    assert.equal(res.status, 200);
                    assert.equal(res.text, 'success');
                    done();
                });
        });

        test('DELETE thread with valid password', function (done) { // Moved to end to cleanup
            chai.request(server)
                .delete('/api/threads/test_board')
                .send({ thread_id: testThreadId, delete_password: 'pass' })
                .end(function (err, res) {
                    assert.equal(res.status, 200);
                    assert.equal(res.text, 'success');
                    done();
                });
        });

    });

});
