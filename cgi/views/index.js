/**
 * Default view for first-time visitors to the site (after they have accepted ToS)
 * @author Mitchell Sawatzky
 */

const template = require(`${__rootname}/util/template`);
const page = require(`${__rootname}/util/page`);

module.exports.matchPaths = ['/', '/index', '/index.html'];
module.exports.name = 'index';
module.exports.type = 'GET';

module.exports.handle = (request, cb) => {
    page.populateHeaders(request, () => {
        template.get('index.ejs', {
            request: request
        }, (err, content) => {
            if (err) {
                throw err;
            }
            request.body = content;
            cb();
        });
    });
};
