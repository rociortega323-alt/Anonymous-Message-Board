/*
*
*
*
*
*       Fill out and verify the assertion-analyser.js
*       This file is required for the FCC test runner to verify that tests are written correctly.
*
*
*/

function objParser(str) {
    if (str === null || str === undefined || str === '') return '';
    var s = str.replace(/\s/g, '').replace(/("|')/g, '');
    return s;
}

module.exports = function (body) {
    var body = body.replace(/\/\/.*$/gm, ''); // Remove single-line comments
    body = body.replace(/\/\*[\s\S]*?\*\//g, ''); // Remove multi-line comments
    var assertions = [];
    var regex = /assert\.\w+/g; // Match any assert.method
    var match = body.match(regex);
    if (match) {
        match.forEach(function (m) {
            var method = m.split('.')[1];
            assertions.push({ method: method, args: [] });
        });
    }
    return assertions;
};
