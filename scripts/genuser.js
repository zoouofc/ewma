#!/usr/bin/env node
/**
 * Add an admin user
 * @author Mitchell Sawatzky
 */

const bcrypt = require('bcrypt');
const read = require('read');
const conf = require('../conf.json');

require('./_path_configuration.js')();
const dbW = require(`${__rootname}/util/db`);

read({
    prompt: 'username>'
}, (err, username) => {
    if (err || !username) {
        console.error('\n\x1b[31mcould not read username\x1b[0m');
        process.exit();
    }
    if (username.length > 100) {
        console.error('\n\x1b[31musername too long. max is 100 chars\x1b[0m');
        process.exit();
    }
    read({
        prompt: `email>`
    }, (err, email) => {
        if (err || !email) {
            console.error('\n\x1b[31mcould not read email\x1b[0m');
            process.exit();
        }
        if (email.length > 100) {
            console.error('\n\x1b[31memail too long. max is 100 chars\x1b[0m');
            process.exit();
        }
        if (!/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(email)) {
            console.error('\n\x1b[31memail is invalid.\x1b[0m');
            process.exit();
        }
        read({
            prompt: 'password>',
            silent: true,
            replace: '*'
        }, (err, password) => {
            let ok = false;
            let uh = null;
            let ph = null;

            if (err || !password) {
                console.error('\n\x1b[31mcould not read password\x1b[0m');
                process.exit();
            }

            let rounds = conf['encryption-rounds'];
            if (!rounds || isNaN(rounds)) {
                console.error('\n\x1b[31mplease fill in a value for \x1b[33mconf.json//"encryption-rounds"<str>\x1b[0m');
                process.exit();
            }

            bcrypt.genSalt(rounds, (err, salt) => {
                if (err) {
                    throw err;
                }

                bcrypt.hash(password, salt, (err, hash) => {
                    if (err) {
                        throw err;
                    }
                    console.log(`password: \x1b[33m${hash.substr(0, salt.length)}\x1b[32m${hash.substr(salt.length)}\x1b[0m`);
                    console.log('opening db...');
                    dbW.acquire(function (db) {
                        db.do(`
                            INSERT INTO users (id, username, email, password, approved) VALUES
                            (UUID(), ?, ?, ?, 1);
                        `, [username, email, hash], (err) => {
                            if (err) {
                                console.error(err.stack);
                            }
                            db.kill(() => {
                                console.log('done');
                            });
                        });
                    });
                });
            });
        });
    });
});
