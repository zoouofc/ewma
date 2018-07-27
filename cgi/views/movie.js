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
    request.stylesheets.push('movie', 'awards', 'player', 'lib/plyr.min');
    request.scripts.push('movie', 'lib/plyr.min');
    page.populateHeaders(request, () => {
        let id = request.pathname.split('/')[2];
        request.db.do(`
            SELECT
                v.id,
                v.type,
                v.title as videoTitle,
                m.id as movieId,
                m.title as movieTitle,
                m.rating as movieRating,
                m.year as movieYear,
                m.dept as movieDept,
                m.theme as movieTheme,
                d.display as deptDisplay,
                vc.viewcount as viewcount
            FROM videos v
                INNER JOIN movies m on v.movie_id = m.id
                LEFT JOIN department d ON m.dept = d.abbr
                LEFT JOIN (
                    SELECT vc.video_id, COUNT(*) as viewcount
                    FROM viewcount vc
                    GROUP BY vc.video_id
                ) vc ON vc.video_id = v.id
            WHERE m.id = ?
            ORDER BY v.type, v.id
        `, [id], (err, videos) => {
            if (err) {
                throw err;
            }

            // no videos -> 404
            if (!videos.length) {
                return code.errorPage(request, code.NOT_FOUND, cb);
            }

            request.db.do(`
                SELECT *
                FROM award a
                WHERE movie_id = ?
            `, [id], (err, awards) => {
                if (err) {
                    throw err;
                }

                let videoIds = [];
                for (let video of videos) {
                    videoIds.push(video.id);
                    video.sources = [];
                }

                request.db.do(`
                    SELECT sources.*
                    FROM sources
                    WHERE video_id IN (?)
                `, [videoIds], (err, sources) => {
                    if (err) {
                        throw err;
                    }

                    for (let source of sources) {
                        for (let video of videos) {
                            if (source.video_id === video.id) {
                                video.sources.push(source);
                            }
                        }
                    }

                    let trailers = [];
                    let commentaries = [];
                    let others = [];
                    let primary = [];
                    for (let video of videos) {
                        switch (video.type) {
                            case 'trailer':
                                trailers.push(video);
                                break;
                            case 'commentary':
                                commentaries.push(video);
                                break;
                            case 'other':
                                others.push(video);
                                break;
                            case 'primary':
                                primary.push(video);
                                break;
                            default:
                                throw new Error(`Unknown video type: ${video.type}`);
                                break;
                        }
                    }

                    template.get('movie.ejs', {
                        request: request,
                        awards: awards,
                        trailers: trailers,
                        commentaries: commentaries,
                        others: others,
                        primary: primary,
                        oneVideo: videos[0]
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
    });
};
