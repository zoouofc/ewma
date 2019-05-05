#!/usr/bin/env node
/**
 * Update source durations in the db
 * @author Mitchell Sawatzky
 */

const ffprobe = require('node-ffprobe');
const fs = require('fs');
const conf = require('../conf.json');

require('./_path_configuration.js')();
const dbW = require(`${__rootname}/util/db`);

const options = require('command-line-args')([
    {name: 'overwrite', alias: 'o', type: Boolean},
    {name: 'update', alias: 'u', type: Boolean}
]);

fs.readdir(conf['movie-sources'], (err, dir) => {
    if (err) {
        console.error(`\x1b[31mcould not search movie-sources: ${err}\x1b[0m`);
        process.exit();
    }

    dbW.acquire(function (db) {
        let ongoing = 0;

        for (let file of dir) {
            ongoing++;

            ffprobe(`${conf['movie-sources']}/${file}`, (err, probe) => {
                if (err) {
                    console.error(`\x1b[31mcould not probe source: ${file}: ${err}\x1b[0m`);
                    cont(db, --ongoing);
                    return;
                }

                function update(append) {
                    db.do(`UPDATE movies
                            INNER JOIN videos ON videos.movie_id = movies.id
                            INNER JOIN sources ON videos.id = sources.video_id
                            SET movies.duration = ?
                            WHERE sources.file = ?`,
                        [Math.floor(probe.format.duration), file], (err) => {
                        if (err) {
                            throw err;
                        }

                        console.log(`\x1b[33m${file}: ${probe.format.duration}s\x1b[0m ${append}`);
                        cont(db, --ongoing);
                    });
                }

                db.do(`SELECT movies.duration, videos.type FROM movies
                        INNER JOIN videos ON videos.movie_id = movies.id
                        INNER JOIN sources on videos.id = sources.video_id
                        WHERE sources.file = ?
                        LIMIT 1`,
                    [file], (err, rows) => {
                    if (err) {
                        throw err;
                    }

                    if (!rows.length) {
                        console.log(`\x1b[31msource not in database: ${file}\x1b[0m`);
                        cont(db, --ongoing);
                    } else if (!rows[0].duration) {
                        update('');
                    } else if (options.overwrite) {
                        if (rows[0].type !== 'primary') {
                            console.log(`\x1b[33m${file}: ${probe.format.duration}s \x1b[0m(\x1b[34mskipping:nonprimary\x1b[0m)`);
                            cont(db, --ongoing);
                        } else {
                            update('(\x1b[31moverwriting\x1b[0m)');
                        }
                    } else if (options.update && Math.floor(probe.format.duration) > rows[0].duration) {
                        update('(\x1b[32mupdating\x1b[0m)');
                    } else {
                        console.log(`\x1b[33m${file}: ${probe.format.duration}s \x1b[0m(\x1b[34mskipping:exists\x1b[0m)`);
                        cont(db, --ongoing);
                    }
                });
            });
        }
    });
});

function cont (db, ongoing) {
    if (ongoing === 0) {
        db.kill(() => {
            console.log('\n\x1b[32mDone\x1b[0m');
        });
    }
}
