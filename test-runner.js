/*
*
*
*
*
*       IS NOT COMPLETE
*
*
*
*
*/

var analyser = require('./assertion-analyser');
var EventEmitter = require('events').EventEmitter;

var Mocha = require('mocha');
var fs = require('fs');
var path = require('path');

var mocha = new Mocha();
var testDir = './tests'



// Add each .js file to the mocha instance
fs.readdirSync(testDir).filter(function (file) {
    // Only keep the .js files
    return file.substr(-3) === '.js';

}).forEach(function (file) {
    mocha.addFile(
        path.join(testDir, file)
    );
});

var emitter = new EventEmitter();
emitter.run = function () {

    var tests = [];
    var context = "";
    var separator = ' -> ';
    // Run the tests.
    try {
        var runner = mocha.run(function (failures) {
            process.on('exit', function () {
                process.exit(failures);  // exit with non-zero status if there were failures
            });
        });

        runner.on('suite', function (s) {
            context = (s.title + separator + context).replace(/^ -> /, '');
        });

        runner.on('test end', function (t) {
            context = context.replace(separator + t.title, '');
            context = context.replace(t.title, '');
        });

        runner.on('pass', function (e) {
            tests.push({
                title: e.title,
                context: context,
                state: 'passed',
                assertions: analyser(e.body)
            });
        });

        runner.on('fail', function (e, err) {
            tests.push({
                title: e.title,
                context: context,
                state: 'failed',
                error: err,
                assertions: analyser(e.body)
            });
        });

        runner.on('end', function () {
            emitter.report = tests;
            emitter.emit('done', tests);
        });
    } catch (e) {
        throw (e);
    }
};

module.exports = emitter;

/*
 * Mocha.runner Events:
 * can be used to build a better custom report
 *
 *   - `start`  execution started
 *   - `end`  execution complete
 *   - `suite`  (suite) test suite execution started
 *   - `suite end`  (suite) all tests (and sub-suites) have finished
 *   - `test`  (test) test execution started
 *   - `test end`  (test) test completed
 *   - `hook`  (hook) hook execution started
 *   - `hook end`  (hook) hook complete
 *   - `pass`  (test) test passed
 *   - `fail`  (test, err) test failed
 *   - `pending`  (test) test pending
 */
