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
        let movies;
        let awards;
        let maxRating;
        let videoTypes = {
            commentary: [],
            primary: [],
            trailer: [],
            other: []
        };
        let queries = 4;

        function done() {
            if (--queries === 0) {
                // everything is ready
                for (let movie of movies) {
                    movie.rating = movie.rating / maxRating * 100;

                    if (movie.duration) {
                        movie.durationDisplay = time.secondsToStamp(movie.duration);
                    }

                    movie.awards = [];
                    for (let award of awards) {
                        if (award.movie_id === movie.id) {
                            movie.awards.push(award);
                        }
                    }

                    movie.hasCommentary = videoTypes.commentary.indexOf(movie.id) !== -1;
                    movie.hasPrimary = videoTypes.primary.indexOf(movie.id) !== -1;
                    movie.hasTrailer = videoTypes.trailer.indexOf(movie.id) !== -1;
                    movie.hasOther = videoTypes.other.indexOf(movie.id) !== -1;

                    movie.hasVideo = movie.hasCommentary || movie.hasPrimary || movie.hasTrailer || movie.hasOther;
                }

                movies.sort(sorter);

                // group on year
                let sortedMovies = [];
                for (let movie of movies) {
                    if (!sortedMovies.length) {
                        sortedMovies.push({
                            year: movie.year,
                            movies: []
                        });
                    }

                    if (sortedMovies[sortedMovies.length - 1].year === movie.year) {
                        sortedMovies[sortedMovies.length - 1].movies.push(movie);
                    } else {
                        sortedMovies.push({
                            year: movie.year,
                            movies: [movie]
                        });
                    }
                }

                template.get('movielist.ejs', {
                    request: request,
                    movies: sortedMovies,
                    sortType: sortType
                }, (err, content) => {
                    if (err) {
                        throw err;
                    }
                    request.body = content;
                    cb();
                });
            }
        }


        request.db.do(`
            SELECT
                m.title,
                m.rating,
                m.year,
                m.id,
                m.dept,
                d.display,
                m.theme,
                m.duration,
                (SELECT v.id FROM videos v WHERE v.movie_id = m.id LIMIT 1) as clickable
            FROM movies m
                LEFT JOIN department d
                    ON m.dept = d.abbr`, (err, rows) => {
            if (err) {
                throw err
            }
            movies = rows;
            done();
        });


        request.db.do('SELECT max(rating) as rating from movies;', (err, rows) => {
            if (err) {
                throw err;
            }
            maxRating = rows[0].rating < 100 ? 100 : rows[0].rating;
            done();
        });

        request.db.do('SELECT name, note, movie_id FROM award', (err, rows) => {
            if (err) {
                throw err;
            }
            for (let row of rows) {
                if (GOLDIES.indexOf(row.name) !== -1) {
                    row.gold = true;
                }
            }
            awards = rows;
            done();
        });

        // Join on sources here because we don't care about video entries that don't have any sources
        request.db.do('SELECT videos.type, videos.movie_id FROM videos INNER JOIN sources on sources.video_id = videos.id', (err, rows) => {
            if (err) {
                throw err;
            }
            for (let row of rows) {
                if (!(row.type in videoTypes)) {
                    throw new Error(`Unknown videoType: ${row.type}`);
                }
                if (videoTypes[row.type].indexOf(row.movie_id) === -1) {
                    videoTypes[row.type].push(row.movie_id);
                }
            }
            done();
        });
    });
};
