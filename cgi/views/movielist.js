/**
 * Movie List
 * @author Mitchell Sawatzky
 */

const template = require(`${__rootname}/util/template`);
const code = require(`${__rootname}/util/code`);
const page = require(`${__rootname}/util/page`);

module.exports.matchPaths = ['/movies/list'];
module.exports.name = 'movielist';
module.exports.type = 'GET';

module.exports.handle = (request, cb) => {
    request.stylesheets.push('movielist');

    page.populateHeaders(request, () => {
        request.db.do(`
            SELECT
                m.title,
                m.rating,
                m.year,
                m.id,
                m.dept,
                d.display,
                m.src,
                m.mime
            FROM movies m
                INNER JOIN department d
                    ON m.dept = d.abbr;`, (err, rows) => {
            if (err) {
                throw err
            }

            let iterator = 0;
            let movies = {};
            for (let i = 0; i < rows.length; i++) {
                request.db.do(`
                    SELECT name, note
                    FROM award
                    WHERE movie_id = ${rows[i].id}`, (err, awards) => {
                    if (err) {
                        throw err;
                    }
                    rows[i].awards = awards;
                    iterator++;
                    if (iterator === rows.length - 1) {
                        // we're done
                        // sort on year, dept desc, title
                        rows.sort((a, b) => {
                            if (a.year < b.year) {
                                return 1;
                            } else if (a.year > b.year) {
                                return -1;
                            } else {
                                if (a.dept > b.dept) {
                                    return -1;
                                } else if (a.dept < b.dept) {
                                    return 1
                                } else {
                                    return a.title < b.title ? -1 : 1;
                                }
                            }
                        });
                        // group on year
                        for (let row of rows) {
                            movies[row.year] = movies[row.year] || [];
                            movies[row.year].push(row);
                        }
                        template.get('movielist.ejs', {
                            request: request,
                            movies: movies
                        }, (err, content) => {
                            if (err) {
                                throw err;
                            }
                            request.body = content;
                            cb();
                        });
                    }
                });
            }
        });
    });
};
