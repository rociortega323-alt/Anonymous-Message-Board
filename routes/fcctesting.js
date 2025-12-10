/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

const cors = require('cors');
const fs = require('fs');
const runner = require('../test-runner');

module.exports = function (app) {

    app.route('/_api/server.js')
        .get(function (req, res, next) {
            console.log('requested');
            fs.readFile(__dirname + '/../server.js', function (err, data) {
                if (err) return next(err);
                res.send(data.toString());
            });
        });

    app.route('/_api/routes/api.js')
        .get(function (req, res, next) {
            console.log('requested');
            fs.readFile(__dirname + '/../routes/api.js', function (err, data) {
                if (err) return next(err);
                res.type('txt').send(data.toString());
            });
        });

    app.route('/_api/controllers/convertHandler.js')
        .get(function (req, res, next) {
            console.log('requested');
            fs.readFile(__dirname + '/../controllers/convertHandler.js', function (err, data) {
                if (err) return next(err);
                res.type('txt').send(data.toString());
            });
        });

    var error;
    app.get('/_api/get-tests', cors(), function (req, res, next) {
        console.log(req.query);
        if (process.env.NODE_ENV === 'test') {
            var json = [];
            if (!runner.report) return res.json([]);

            runner.report.forEach(function (test) {
                json.push({
                    title: test.title,
                    context: test.context,
                    state: test.state,
                    assertions: test.assertions
                });
            });

            res.json(json);
        }
    });

    app.get('/_api/app-info', function (req, res) {
        var hs = Object.keys(res.getHeaders())
            .filter(h => !h.match(/^access-control-\w+/));
        var hObj = {};
        hs.forEach(h => { hObj[h] = res.getHeader(h) });
        delete res._headers['strict-transport-security'];
        res.json({ headers: hObj });
    });

};

function testFilter(tests, type, n) {
    var out;
    switch (type) {
        case 'unit':
            out = tests.filter(t => t.context.match('Unit Tests'));
            break;
        case 'functional':
            out = tests.filter(t => t.context.match('Functional Tests'));
            break;
        default:
            out = tests;
    }
    if (n !== undefined) {
        return out[n] || out;
    }
    return out;
}
