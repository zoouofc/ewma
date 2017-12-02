module.exports.matchPaths = [
    '/', '/tos'
];
module.exports.name = 'index';
module.exports.type = 'GET';
module.exports.handle = function(r, c) {
    r.body = 'hi';
    c();
}
