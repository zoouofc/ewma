/**
 * View count
 * @author Mitchell Sawatzky
 */

const template = require(`${__rootname}/util/template`);
const code = require(`${__rootname}/util/code`);

module.exports.matchPaths = [/^\/viewcount\/[0-9]+\/?$/];
module.exports.name = 'viewcount';
module.exports.type = ['POST'];


module.exports.handle = (request, cb) => {
    request.headers['content-type'] = 'application/json';
    let id = request.pathname.split('/')[2];
    request.db.do(`
        INSERT INTO viewcount (movie_id, session)
            VALUES (?, ?)
    `, [id, request.cookie.session], (err) => {
        request.body = JSON.stringify({
            session: request.cookie.session,
            movie: id,
            message: err ? 'Rejected: Already seen' : 'Accepted'
        });
        cb();
    });
};
