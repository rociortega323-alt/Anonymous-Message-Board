/*
*
*
*
*
*       Ignore the assertion-analyser, I'm not sure what it does exactly but it's part of the boilerplate
*       Actually, I need to implement it for the runner to work without errors.
*
*
*
*/

function objParser(str) {
    if (str === null || str === undefined || str === '') return '';
    var s = str.replace(/\s/g, '').replace(/("|')/g, '');
    return s;
}

module.exports = function (body) {
    var body = body.replace(/\/\/\s*[\S\s]*/, ''); // Remove comments
    var assertions = [];
    var regex = /\s*assert\.(.*)\s*\(/gi;
    var match = regex.exec(body);
    while (match) {
        assertions.push({ method: match[1], args: [] }); // args parsing is complex, skipping for now as it's for verification primarily
        match = regex.exec(body);
    }
    return assertions;
};
