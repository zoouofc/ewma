#!/usr/bin/env node
/**
 * Add an admin user
 * @author Mitchell Sawatzky
 */

const path = require('path');
const bcrypt = require('bcrypt');
const read = require('read');
const conf = require('../conf.json');

// ============= HACK

// hack the require cache so that we can call CGI code
global.__rootname = path.resolve(`${__dirname}/../cgi`);
let hackedConfPath = path.resolve(`${__rootname}/conf.json`);
require.cache[hackedConfPath] = {
    id: hackedConfPath,
    filename: hackedConfPath,
    loaded: true,
    children: [],
    exports: conf
};
// now that the conf data is in the cache,
// we need to tell the module loader that it exists
const Module = require('module');
let realResolve = Module._resolveFilename;
Module._resolveFilename = function (request, parent) {
    if (request === hackedConfPath) {
        return hackedConfPath;
    }
    return realResolve(request, parent);
};

// ============= END HACK

// new we can import cgi code
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
                    db.do('INSERT INTO users (username, password) VALUES (?, ?);', [username, hash], (err) => {
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
