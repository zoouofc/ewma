/**
 * Authentication logic
 * @author Mitchell Sawatzky
 */

const cookie = require(`${__rootname}/util/cookie`);
const uuid = require('uuid/v4');
const conf = require(`${__rootname}/conf.json`);
const bcrypt = require('bcrypt');

function validateUser (request, username, password, cb) {
    if (!username || !password) {
        cb(null, false);
        return;
    }

    request.db.do('SELECT password FROM users WHERE username = ?;', [username], (err, row) => {
        if (err) {
            cb(err);
            return;
        }
        if (row.length) {
            // user exists
            bcrypt.compare(password, row[0].password, (err, res) => {
                if (err) {
                    cb(err);
                    return;
                }
                if (res) {
                    cb(null, true);
                } else {
                    // password's wrong
                    cb(null, false);
                }
            });
        } else {
            cb(null, false);
        }
    });
}

function checkSession (request, session, cb) {
    request.db.do(`
        SELECT admin
        FROM session
        WHERE token = ?
            AND issued > ?
        LIMIT 1`, [session, Math.floor(Date.now() / 1000) - conf['session-length']], (err, rows) => {
        if (err) {
            console.error(err);
            cb(err);
            return;
        }
        if (rows.length) {
            cb(null, true, !!rows[0].admin);
        } else {
            cb(null, false, false);
        }
    });
}

function grantSession (request, admin, cb) {
    let token = uuid();
    request.db.do(`
        INSERT INTO session (token, issued, admin)
            VALUES (?, ?, ?);`, [token, Math.floor(Date.now() / 1000), !!admin], (err) => {
        if (err) {
            cb(err);
            return;
        }
        request.headers['set-cookie'] = cookie.serialize('session', token, {
            httpOnly: true,
            maxAge: 60 * 60 * 24
        });
        cb(null);
    });
}

module.exports = {
    checkSession: checkSession,
    grantSession: grantSession,
    validateUser: validateUser
};
