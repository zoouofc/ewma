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
    request.stylesheets.push('movie', 'awards');
    request.scripts.push('movie');
    page.populateHeaders(request, () => {
        let id = request.pathname.split('/')[2];
        request.db.do(`
            SELECT *
            FROM movies m
                LEFT JOIN department d ON m.dept = d.abbr
                LEFT JOIN (
                    SELECT v.movie_id, COUNT(*) as viewcount
                    FROM viewcount v
                    GROUP BY v.movie_id
                ) vc ON vc.movie_id = m.id
            WHERE m.id = ?
                OR m.id = (
                    SELECT t.trailer from trailer t where t.parent = ?
                )
            ORDER BY m.id
            LIMIT 2
        `, [id, id, id], (err, rows) => {
            if (err) {
                throw err
            }

            let trailer, primary;
            if (rows.length > 1) {
                // trailers
                trailer = rows[0].id === id ? rows[0] : rows[1];
                primary = rows[0].id === id ? rows[1] : rows[0];
            } else if (rows.length) {
                primary = rows[0];
            } else {
                return code.errorPage(request, code.NOT_FOUND, cb);
            }

            request.db.do(`
                SELECT *
                FROM award a
                WHERE movie_id in (?)
            `, [[primary.id, trailer ? trailer.id : -1]], (err, rows) => {
                if (err) {
                    throw err;
                }
                primary.awards = [];
                for (let award of rows) {
                    if (award.movie_id === primary.id) {
                        primary.awards.push(award);
                    }
                }
                if (trailer) {
                    trailer.awards = [];
                    for (let award of rows) {
                        if (award.movie_id === trailer.id) {
                            trailer.awards.push(award);
                        }
                    }
                }

                template.get('movie.ejs', {
                    request: request,
                    trailer: trailer,
                    primary: primary
                }, (err, content) => {
                    if (err) {
                        throw err;
                    }
                    request.body = content;
                    cb();
                });
            });
        });
    });
};
