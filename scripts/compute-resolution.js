#!/usr/bin/env node
/**
 * Update source resolutions in the db
 * @author Mitchell Sawatzky
 */

const ffprobe = require('node-ffprobe');
const fs = require('fs');
const conf = require('../conf.json');

const resolutionMap = {
    '352x240': '240p',
    '480x360': '360p',
    '858x480': '480p',
    '1280x720': '720p',
    '1920x1080': '1080p'
};

require('./_path_configuration.js')();
const dbW = require(`${__rootname}/util/db`);

fs.readdir(conf['movie-sources'], (err, dir) => {
    if (err) {
        console.error(`\x1b[31mcould not search movie-sources: ${err}\x1b[0m`);
        process.exit();
    }

    dbW.acquire(function (db) {
        let ongoing = 0;

        db.do('SELECT file FROM sources WHERE resolution IS NULL', (err, rows) => {
            if (err) {
                throw err;
            }


            for (let row of rows) {
                let file = row.file;

                if (file in dir) {
                    ongoing++;

                    ffprobe(`${conf['movie-sources']}/${file}`, (err, probe) => {
                        if (err) {
                            console.error(`\x1b[31mcould not probe source: ${file}: ${err}\x1b[0m`);
                            cont(db, --ongoing);
                            return;
                        }

                        let resolution;
                        for (let stream of probe.streams) {
                            if (stream.codec_type === 'video') {
                                if (resolution) {
                                    console.error(`\x1b[31mcould not probe source: ${file}: more than one video stream\x1b[0m`);
                                    cont(db, --ongoing);
                                    return;
                                }
                                resolution = resolutionMap[`${stream.width}x${stream.height}`];
                                if (!resolution) {
                                    console.error(`\x1b[31mcould not probe source: ${file}: unsupported resolution ${stream.width}x${stream.height}\x1b[0m`);
                                    cont(db, --ongoing);
                                    return;
                                }
                            }
                        }

                        db.do(`UPDATE sources
                                SET sources.resolution = ?
                                WHERE sources.file = ?`,
                            [resolution, file], (err) => {
                            if (err) {
                                throw err;
                            }

                            console.log(`${file}: ${resolution}`);
                            cont(db, --ongoing);
                        });
                    });
                } else {
                    console.error(`\x1b[31mcould not probe source: ${file}: not in movie_sources\x1b[0m`);
                }
            }
        });
    });
});

function cont (db, ongoing) {
    if (ongoing === 0) {
        db.kill(() => {
            console.log('\nDone');
        });
    }
}
