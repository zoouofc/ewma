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

                db.do(`UPDATE movies
                        INNER JOIN videos ON videos.movie_id = movies.id
                        INNER JOIN sources ON video.id = sources.videos.id
                        SET movies.duration = ?
                        WHERE sources.file = ?`,
                    [Math.floor(probe.format.duration), file], (err) => {
                    if (err) {
                        throw err;
                    }

                    console.log(`${file}: ${probe.format.duration}s`);
                    cont(db, --ongoing);
                });
            });
        }
    });
});

function cont (db, ongoing) {
    if (ongoing === 0) {
        db.kill(() => {
            console.log('\nDone');
        });
    }
}
