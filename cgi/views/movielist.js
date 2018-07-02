/**
 * Movie List
 * @author Mitchell Sawatzky
 */

const template = require(`${__rootname}/util/template`);
const code = require(`${__rootname}/util/code`);
const page = require(`${__rootname}/util/page`);
const time = require(`${__rootname}/util/time`);
const conf = require(`${__rootname}/conf.json`);

module.exports.matchPaths = ['/movies/list'];
module.exports.name = 'movielist';
module.exports.type = 'GET';

const GOLDIES = conf.golden_awards;

module.exports.handle = (request, cb) => {
    request.stylesheets.push('movielist', 'awards');

    let sortDirection = -1; // desc
    if (request.query.hasOwnProperty('d') && request.query.d === '1') {
        sortDirection = 1;
    }

    let sorter;
    let sortType;
    switch (request.query.s) {
        case 't':
            sortType = 't';
            sorter = (a, b) => {
                // sort on title, year desc, dept
                if (a.title > b.title) {
                    return sortDirection;
                } else if (a.title < b.title) {
                    return -sortDirection;
                } else {
                    if (a.year > b.year) {
                        return -sortDirection;
                    } else if (a.year < b.year) {
                        return sortDirection;
                    } else {
                        return a.dept < b.dept ? -sortDirection : sortDirection;
                    }
                }
            };
            break;
        case 'i':
            sortType = 'i';
            sorter = (a, b) => {
                // sort on theme, year desc, dept
                if (a.theme === null || b.theme === null) {
                    if (a.theme !== null) {
                        return sortDirection;
                    }
                    if (b.theme !== null) {
                        return -sortDirection;
                    }
                }

                if (a.theme > b.theme) {
                    return sortDirection;
                } else if (a.theme < b.theme) {
                    return -sortDirection;
                } else {
                    if (a.year > b.year) {
                        return -sortDirection;
                    } else if (a.year < b.year) {
                        return sortDirection;
                    } else {
                        return a.dept < b.dept ? -sortDirection : sortDirection;
                    }
                }
            };
            break;
        case 'r':
            sortType = 'r';
            sorter = (a, b) => {
                // sort on rating, year desc, dept
                if (a.rating > b.rating) {
                    return sortDirection;
                } else if (a.rating < b.rating) {
                    return -sortDirection;
                } else {
                    if (a.year > b.year) {
                        return -sortDirection;
                    } else if (a.year < b.year) {
                        return sortDirection;
                    } else {
                        return a.dept < b.dept ? -sortDirection : sortDirection;
                    }
                }
            };
            break;
        case 'l':
            sortType = 'l';
            sorter = (a, b) => {
                // sort on duration, dept desc, dept
                if (a.duration > b.duration) {
                    return sortDirection;
                } else if (a.duration < b.duration) {
                    return -sortDirection;
                } else {
                    if (a.year > b.year) {
                        return -sortDirection;
                    } else if (a.year < b.year) {
                        return sortDirection;
                    } else {
                        return a.dept > b.dept ? -sortDirection : sortDirection;
                    }
                }
            };
            break;
        case 'd':
            sortType = 'd';
            sorter = (a, b) => {
                // sort on dept desc, year desc, title
                if (a.dept < b.dept) {
                    return sortDirection;
                } else if (a.dept > b.dept) {
                    return -sortDirection;
                } else {
                    if (a.year > b.year) {
                        return -sortDirection;
                    } else if (a.year < b.year) {
                        return sortDirection;
                    } else {
                        return a.title < b.title ? -sortDirection : sortDirection;
                    }
                }
            };
            break;
        case 'a':
            sortType = 'a';
            sorter = (a, b) => {
                // sort on number of awards, year desc, dept desc
                if (a.awards.length > b.awards.length) {
                    return sortDirection;
                } else if (a.awards.length < b.awards.length) {
                    return -sortDirection;
                } else {
                    if (a.year > b.year) {
                        return sortDirection;
                    } else if (a.year < b.year) {
                        return -sortDirection;
                    } else {
                        return a.dept > b.dept ? -sortDirection : sortDirection;
                    }
                }
            };
            break;
        case 'y':
        default:
            sortType = 'y';
            sorter = (a, b) => {
                // sort on year desc, dept desc, title
                if (a.year < b.year) {
                    return -sortDirection;
                } else if (a.year > b.year) {
                    return sortDirection;
                } else {
                    if (a.dept > b.dept) {
                        return sortDirection;
                    } else if (a.dept < b.dept) {
                        return -sortDirection;
                    } else {
                        return a.title < b.title ? sortDirection : -sortDirection;
                    }
                }
            };
            break;
    }

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
                        rows[i].durationDisplay = time.secondsToStamp(rows[i].duration);
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
                            rows.sort(sorter);
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
                                movies: movies,
                                sortType: sortType
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
