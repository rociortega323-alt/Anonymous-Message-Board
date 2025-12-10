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

    // app.use(function(req, res, next) {
    //   res.status(404)
    //     .type('text')
    //     .send('Not Found');
    // });

    // No need for this, already in server.js? The boilerplate usually has this logic.
    // Actually boilerplate puts specific route logic here or in separate file.
    // For now, I'll stick to minimum needed for the test runner to pick up server files if needed.
    // But standard boilerplate has this file.
};
