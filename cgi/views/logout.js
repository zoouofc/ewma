/**
 * Admin logout
 * @author Mitchell Sawatzky
 */

const page = require(`${__rootname}/util/page`);
const auth = require(`${__rootname}/util/auth`);
const redirection = require(`${__rootname}/util/redirection`);

module.exports.matchPaths = ['/logout'];
module.exports.name = 'logout';
module.exports.type = 'GET';

module.exports.handle = (request, cb) => {
    auth.removeSession(request, (err) => {
        if (err) {
            throw err;
        }
        redirection.found(request, '/', cb);
        return;
    });
};
