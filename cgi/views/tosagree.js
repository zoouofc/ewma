/**
 * Hit when a user aggrees to the ToS. Redirect them to the main page and set a cookie
 * @author Mitchell Sawatzky
 */

const redirection = require(`${__rootname}/util/redirection`);
const auth = require(`${__rootname}/util/auth`);

module.exports.matchPaths = ['/tosagree'];
module.exports.name = 'tosagree';
module.exports.type = 'POST';

module.exports.handle = (request, cb) => {
    auth.grantSession(request, false, (err) => {
        if (err) {
            throw err;
        }
        let url = '/';
        if (request.postDataType === 'application/json' && 'dest' in request.post) {
            url = request.post.dest.toString().replace(/\n/gm, '').trim();
            if (url.length < 1) {
                url = '/';
            }
        }

        redirection.found(request, url, cb);
    });
};
