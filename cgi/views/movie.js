/**
 * Movie ID to source
 * @author Mitchell Sawatzky
 */

const template = require(`${__rootname}/util/template`);
const code = require(`${__rootname}/util/code`);
const redirection = require(`${__rootname}/util/redirection`);
const page = require(`${__rootname}/util/page`);

module.exports.matchPaths = [/\/movies\/[0-9]+\/?$/];
module.exports.name = 'movie';
module.exports.type = 'GET';

module.exports.handle = (request, cb) => {
    request.db.do('SELECT src FROM movies WHERE id = ?', [request.pathname.split('/')[2]], (err, rows) => {
        if (err) {
            throw err
        }
        if (rows[0]) {
            redirection.found(request, `/static/movie_sources/${rows[0].src}`, cb);
        } else {
            code.errorPage(request, code.NOT_FOUND, cb);
        }
    });
};
