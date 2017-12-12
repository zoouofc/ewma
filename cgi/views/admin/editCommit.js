/**
 * Theme expirey
 * @author Mitchell Sawatzky
 */

const template = require(`${__rootname}/util/template`);
const page = require(`${__rootname}/util/page`);
const code = require(`${__rootname}/util/code`);

module.exports.matchPaths = [/^\/admin\/edit\/[0-9]+\/commit$/];
module.exports.name = 'commit';
module.exports.type = 'POST';

module.exports.handle = page.requireAdmin((request, cb) => {
    request.headers['content-type'] = 'application/json';
    request.body = request.post.payload;
    cb();
});
