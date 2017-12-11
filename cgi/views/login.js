/**
 * Admin login
 * @author Mitchell Sawatzky
 */

const template = require(`${__rootname}/util/template`);
const code = require(`${__rootname}/util/code`);

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
    request.errorMessage = "You'd like that, wouldn't you?";
    request.headers['status'] = code.codeString(code.UNAUTHORIZED);

    loginPage(request, cb);
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
