/**
 * Admin login
 * @author Mitchell Sawatzky
 */

const template = require(`${__rootname}/util/template`);
const code = require(`${__rootname}/util/code`);
const auth = require(`${__rootname}/util/auth`);
const redirection = require(`${__rootname}/util/redirection`);
const conf = require(`${__rootname}/conf.json`);

module.exports.matchPaths = ['/login'];
module.exports.name = 'login';
module.exports.type = ['GET', 'POST'];

function loginPage (request, cb) {
    request.scripts.push('login');
    // reuse the tos template because reasons
    template.get('tos.ejs', {
        request: request,
        dest: request._originalPathname || '',
        login: true
    }, (err, content) => {
        if (err) {
            throw err;
        }
        request.body = content;
        cb();
    });
}

function handleLoginAttempt(request, cb) {
    auth.validateUser(request, request.post.username, request.post.password, (err, valid) => {
        if (err) {
            throw err;
        }
        if (valid) {
            auth.grantSession(request, true, (err) => {
                if (err) {
                    throw err;
                }
                redirection.found(request, '/', cb);
                return;
            });
        } else {
            request.errorMessage = "You'd like that, wouldn't you?";
            request.headers['status'] = code.codeString(code.UNAUTHORIZED);
            loginPage(request, cb);
        }
    });
}

module.exports.handle = (request, cb) => {
    switch (request.method) {
        case 'GET':
            loginPage(request, cb);
            break;
        case 'POST':
            handleLoginAttempt(request, cb);
            break;
        default:
            code.errorPage(request, code.METHOD_NOT_ALLOWED, cb);
            return;
    }
};
