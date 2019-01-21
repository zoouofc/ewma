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
                theme
            FROM movies m where id = ?
        `, [id], (err, movie) => {
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
            let videosAndSources = null;
            let ok = 0;
            let needed = 4;

            function proc () {
                template.get('admin/edit.ejs', {
                    request: request,
                    movie: movie,
                    depts: depts,
                    awards: awards,
                    themes: themes,
                    allMovies: allMovies,
                    videosAndSources: videosAndSources,
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
                    ],
                    resolutions: [
                        'Select a Resolution',
                        '240p',
                        '360p',
                        '480p',
                        '720p',
                        '1080p'
                    ],
                    videoTypes: [
                        'primary',
                        'trailer',
                        'commentary',
                        'other'
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

            request.db.do(`
                SELECT
                    sources.id as sourceID,
                    sources.video_id,
                    sources.file,
                    sources.mime,
                    sources.resolution,
                    videos.id as videoID,
                    videos.type,
                    videos.title
                FROM videos
                    LEFT JOIN sources ON sources.video_id = videos.id
                WHERE videos.movie_id = ?
                ORDER BY sources.id
            `, [id], (err, rows) => {
                if (err) {
                    throw err;
                }
                videosAndSources = {};

                for (let row of rows) {
                    if (!(row.videoID in videosAndSources)) {
                        videosAndSources[row.videoID] = {
                            id: row.videoID,
                            type: row.type,
                            title: row.title,
                            sources: []
                        };
                    }
                    videosAndSources[row.videoID].sources.push({
                        id: row.sourceID,
                        file: row.file,
                        mime: row.mime,
                        resolution: row.resolution
                    });
                }

                if (ok == needed) {
                    proc();
                } else {
                    ok++;
                }
            });
        });
    });
});
