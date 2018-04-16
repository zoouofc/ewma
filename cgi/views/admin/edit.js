/**
 * Theme expirey
 * @author Mitchell Sawatzky
 */

const template = require(`${__rootname}/util/template`);
const page = require(`${__rootname}/util/page`);
const code = require(`${__rootname}/util/code`);

module.exports.matchPaths = [/^\/admin\/edit\/[0-9]+\/?$/];
module.exports.name = 'edit';
module.exports.type = 'GET';

module.exports.handle = page.requirePermission('movie_edit', (request, cb) => {
    request.scripts.push('edit');
    request.stylesheets.push('edit');
    page.populateHeaders(request, () => {
        let id = request.pathname.split('/')[3];
        request.db.do(`
            SELECT
                title,
                rating,
                year,
                dept,
                src,
                mime,
                theme,
                (SELECT t.parent FROM trailer t WHERE m.id = t.trailer) AS trailer
            FROM movies m where id = ?`, [id], (err, movie) => {
            if (err) {
                throw err;
            }
            movie = movie[0];
            if (!movie) {
                code.errorPage(request, code.NOT_FOUND, cb);
                return;
            }

            // ok the movie exists. Get all the data.
            let depts = null;
            let awards = null;
            let themes = null;
            let allMovies = [];
            let ok = 0;
            let needed = 3;

            function proc () {
                template.get('admin/edit.ejs', {
                    request: request,
                    movie: movie,
                    depts: depts,
                    awards: awards,
                    themes: themes,
                    allMovies: allMovies,
                    mimes: [
                        {
                            name: null,
                            display: 'Select a MIME'
                        },
                        {
                            name: 'video/mp4',
                            display: 'MP4'
                        },
                        {
                            name: 'video/webm',
                            display: 'WEBM'
                        }
                    ]
                }, (err, content) => {
                    if (err) {
                        throw err;
                    }
                    request.body = content;
                    cb();
                });
            }

            request.db.do('SELECT abbr, display FROM department', (err, rows) => {
                if (err) {
                    throw err;
                }
                depts = [{abbr: null, display: 'Select a Department'}].concat(rows);
                if (ok == needed) {
                    proc();
                } else {
                    ok++;
                }
            });

            request.db.do('SELECT id, name, note FROM award WHERE movie_id = ?', [id], (err, rows) => {
                if (err) {
                    throw err;
                }
                awards = rows;
                if (ok == needed) {
                    proc();
                } else {
                    ok++;
                }
            });

            request.db.do('SELECT id, year, dept, title FROM movies WHERE id != ? ORDER BY year DESC, title ASC;', [id], (err, rows) => {
                if (err) {
                    throw err;
                }

                for (let row of rows) {
                    if (!row.year) row.year = '?';
                    if (!row.dept) row.dept = '?';
                    if (!row.title) row.title = '?';
                    allMovies.push({val: row.id, text: `${row.year}//${row.dept.toUpperCase()} - ${row.title}`});
                }
                if (ok == needed) {
                    proc();
                } else {
                    ok++;
                }
            });

            request.db.do('SELECT DISTINCT theme FROM movies ORDER BY theme', (err, rows) => {
                if (err) {
                    throw err;
                }
                themes = [];
                for (row of rows) {
                    if (row.theme) {
                        themes.push({
                            name: row.theme,
                            display: row.theme
                        });
                    }
                }
                themes.unshift({
                    name: null,
                    display: 'Pick a Theme'
                });
                if (ok == needed) {
                    proc();
                } else {
                    ok++;
                }
            });
        });
    });
});
