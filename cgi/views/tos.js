/**
 * Default view for first-time visitors to the site
 * @author Mitchell Sawatzky
 */

const template = require(`${__rootname}/util/template`);

module.exports.matchPaths = ['/tos'];
module.exports.name = 'tos';
module.exports.type = 'GET';

module.exports.handle = (request, cb) => {
    template.get('tos.ejs', {
        request: request,
        dest: request._originalPathname || ''
    }, (err, content) => {
        if (err) {
            throw err;
        }
        request.body = content;
        cb();
    });
};
