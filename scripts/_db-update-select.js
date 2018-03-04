#!/usr/bin/env node
/**
 * Interactively selec a db update
 * @author Mitchell Sawatzky
 */

const ss = require('select-shell');
const fs = require('fs');
const path = require('path');

fs.readdir('./db/updates', (err, dir) => {
    if (err) {
        console.error(`\x1b[31mcould not search db/updates: ${err}\x1b[0m`);
        process.exit();
    }

    let list = ss({
        pointer: ' ▸ ',
        pointerColor: 'yellow',
        msgCancel: 'Aborting',
        msgCancelColor: 'yellow',
        multiSelect: false,
        prepend: true
    });

    let fileOs = [];
    let ongoing = 0;

    for (let file of dir) {
        ongoing++;
        fs.stat(`./db/updates/${file}`, (err, stat) => {
            if (err) {
                throw err;
            }
            fileOs.push({
                file: file,
                time: stat.mtimeMs,
                path: path.resolve(`${__dirname}/../db/updates/${file}`)
            });
            ongoing--;

            if (ongoing === 0) {
                fileOs.sort((a, b) => {
                    if (a.time < b.time) return 1;
                    if (a.time > b.time) return -1;
                    return 0;
                });

                console.log('Only showing 5 most recent items (ESC to abort)\n');
                fileOs.slice(5);

                for (let file of fileOs) {
                    let dTime = new Date(file.time);
                    list.option(
                        `(Modified ${dTime.toLocaleDateString()} ${dTime.toLocaleTimeString().toUpperCase()}) ${file.file}`,
                        file.path
                    );
                }

                list.on('cancel', (options) => {
                    process.exit(1);
                });

                list.on('select', (options) => {
                    fs.writeFile('/tmp/ewma-_db-update-select', options[0].value, (err) => {
                        if (err) {
                            throw err;
                        }
                        process.exit(0)
                    });
                });

                list.list();
            }
        });
    };
});
