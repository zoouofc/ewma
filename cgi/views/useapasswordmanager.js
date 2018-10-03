/**
 * Page for resetting password
 * @author Mitchell Sawatzky
 */

const template = require(`${__rootname}/util/template`);
const page = require(`${__rootname}/util/page`);
const code = require(`${__rootname}/util/code`);
const redirection = require(`${__rootname}/util/redirection`);
const bcrypt = require('bcrypt');
const conf = require(`${__rootname}/conf.json`);
const mail = require(`${__rootname}/util/mail`);
const uuid = require('uuid/v4');

module.exports.matchPaths = ['/useapasswordmanager'];
module.exports.name = 'resetpassword';
module.exports.type = ['GET', 'POST'];

function resetPage (request, errText, cb) {
    request.query.token = request.post.token || request.query.token;
    request.query.user = request.post.user || request.query.user;
    request.stylesheets.push('newaccount', 'tos');
    if (request.query.token && request.query.user) {
        request.db.do('SELECT user, token, created FROM passwordtoken WHERE user = ? AND token = ?', [
            request.query.user,
            request.query.token
        ], (err, rows) => {
            if (err) {
                throw err;
            }
            if (rows && (Date.now() - (rows[0].created * 1000)) <= conf['password-reset-window'])  {
                template.get('resetpassword.ejs', {
                    request: request,
                    errText: errText,
                    user: request.query.user,
                    token: request.query.token
                }, (err, content) => {
                    if (err) {
                        throw err;
                    }
                    request.body = content;
                    cb();
                });
            } else {
                code.errorPage(request, code.FORBIDDEN, cb);
            }
        });
    } else {
        page.populateHeaders(request, () => {
            template.get('useapasswordmanager.ejs', {
                request: request,
                errText: errText,
            }, (err, content) => {
                if (err) {
                    throw err;
                }
                request.body = content;
                cb();
            });
        });
    }
}

function handleReset (request, cb) {
    request.db.do('SELECT user, token, created FROM passwordtoken WHERE user = ? AND token = ?', [
        request.post.user,
        request.post.token
    ], (err, rows) => {
        if (err) {
            throw err;
        }
        if (rows && (Date.now() - (rows[0].created * 1000)) <= conf['password-reset-window'])  {
            if (request.post.password !== request.post.passwordConfirm) {
                resetPage(request, 'Passwords are not the same', cb);
            } else {
                let rounds = conf['encryption-rounds'];
                if (!rounds || isNaN(rounds)) {
                    throw new Error('Incomplete configuration');
                }
                bcrypt.genSalt(rounds, (err, salt) => {
                    if (err) {
                        throw err;
                    }

                    bcrypt.hash(request.post.password, salt, (err, hash) => {
                        if (err) {
                            throw err;
                        }

                        request.db.do('UPDATE users SET password = ? WHERE id = ?', [
                            hash,
                            request.post.user
                        ], (err) => {
                            if (err) {
                                throw err;
                            }

                            redirection.found(request, '/', cb);
                        });
                    });
                });
            }
        } else {
            code.errorPage(request, code.FORBIDDEN, cb);
        }
    });
}

function handleResetAttempt (request, cb) {
    if (!request.post.email) {
        code.errorPage(request, code.BAD_REQUEST, cb);
        return;
    }
    if (request.post.email.length > 100) {
        resetPage(request, 'Email cannot be greater than 100 characters', cb);
        return;
    }
    if (!/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(request.post.email)) {
        resetPage(request, 'Email is invalid', cb);
        return;
    }

    request.db.do('SELECT id FROM users WHERE LOWER(email) = LOWER(?)', [
        request.post.email
    ], (err, rows) => {
        if (err) {
            throw err;
        }
        if (rows.length) {
            let rounds = conf['encryption-rounds'];
            if (!rounds || isNaN(rounds)) {
                throw new Error('Incomplete configuration');
            }
            bcrypt.genSalt(rounds, (err, salt) => {
                if (err) {
                    throw err;
                }

                request.db.do('INSERT INTO passwordtoken (user, token, created) VALUES (?, ?, UNIX_TIMESTAMP())', [
                    rows[0].id,
                    salt
                ], (err) => {
                    if (err) {
                        throw err;

                        template.get('password_reset_email.ejs', {
                            token: encodeURIComponent(salt),
                            user: encodeURIComponent(rows[0].id)
                        }, (err, body) => {
                            mail.sendMail({
                                To: request.post.email,
                                Subject: 'Password Reset Request',
                            }, body, (err) => {
                                if (err) {
                                    throw err;
                                }

                                redirection.found(request, '/', cb);
                            });
                        });
                    }
                });
            });
        } else {
            // user doesn't exist
            redirection.found(request, '/', cb);
        }
    });
}

module.exports.handle = (request, cb) => {
    switch (request.method) {
        case 'GET':
            resetPage(request, null, cb);
            break;
        case 'POST':
            if (request.post.password && request.post.passwordConfirm && request.post.user && request.post.token) {
                handleReset(request, cb);
            } else {
                handleResetAttempt(request, cb);
            }
            break;
        default:
            code.errorPage(request, code.METHOD_NOT_ALLOWED, cb);
            return;
    }
}
