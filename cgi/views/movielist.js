/**
 * Movie List
 * @author Mitchell Sawatzky
 */

const template = require(`${__rootname}/util/template`);
const code = require(`${__rootname}/util/code`);
const page = require(`${__rootname}/util/page`);
const time = require(`${__rootname}/util/time`);

module.exports.matchPaths = ['/movies/list'];
module.exports.name = 'movielist';
module.exports.type = 'GET';

const GOLDIES = [
    "Viewer's Choice",
    "Best Actor",
    "Best Actress",
    "Best Picture"
];

module.exports.handle = (request, cb) => {
    request.stylesheets.push('movielist', 'awards');

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
                m.mime,
                m.theme,
                m.duration,
                (SELECT s.trailer FROM trailer s WHERE s.parent = m.id) as trailer
            FROM movies m
                LEFT JOIN department d
                    ON m.dept = d.abbr
            WHERE m.id NOT IN
                (SELECT t.trailer FROM trailer t)`, (err, rows) => {
            if (err) {
                throw err
            }
            request.db.do('SELECT max(rating) as rating from movies;', (err, max) => {
                if (err) {
                    throw err;
                }
                max = max[0].rating < 100 ? 100 : max[0].rating;

                let iterator = 0;
                let movies = [];
                for (let i = 0; i < rows.length; i++) {
                    rows[i].rating = rows[i].rating / max * 100;
                    if (rows[i].duration) {
                        rows[i].duration = time.secondsToStamp(rows[i].duration);
                    }
                    request.db.do(`
                        SELECT name, note, movie_id
                        FROM award
                        WHERE movie_id = ?`, [rows[i].id], (err, awards) => {
                        if (err) {
                            throw err;
                        }
                        rows[i].awards = awards;

                        for (let award of rows[i].awards) {
                            if (GOLDIES.indexOf(award.name) !== -1) {
                                award.gold = true;
                            }
                        }

                        iterator++;
                        if (iterator === rows.length) {
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
                                if (!movies.length) {
                                    movies.push({
                                        year: row.year,
                                        movies: []
                                    });
                                }

                                if (movies[movies.length - 1].year === row.year) {
                                    movies[movies.length - 1].movies.push(row);
                                } else {
                                    movies.push({
                                        year: row.year,
                                        movies: [row]
                                    });
                                }
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
    });
};
