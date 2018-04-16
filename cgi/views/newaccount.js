/**
 * Page for creating a new account
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

module.exports.matchPaths = ['/newaccount'];
module.exports.name = 'newaccount';
module.exports.type = ['GET', 'POST'];

function createPage (request, errText, cb) {
    request.stylesheets.push('newaccount', 'tos');
    request.scripts.push('newaccount');
    page.populateHeaders(request, () => {
        template.get('newaccount.ejs', {
            request: request,
            errText: errText
        }, (err, content) => {
            if (err) {
                throw err;
            }
            request.body = content;
            cb();
        });
    });
}

function handleCreateAttempt (request, cb) {
    if (!request.post.username || !request.post.password || !request.post.email || !request.post.hdyhau) {
        code.errorPage(request, code.BAD_REQUEST, cb);
        return;
    }
    if (request.post.username.length > 100) {
        createPage(request, 'Username cannot be greater than 100 characters', cb);
        return;
    }
    if (request.post.email.length > 100) {
        createPage(request, 'Email cannot be greater than 100 characters', cb);
        return;
    }
    if (request.post.hdyhau.length < 5) {
        createPage(request, 'Kay, but how did you hear about this though?', cb);
        return;
    }
    if (!/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(request.post.email)) {
        createPage(request, 'Email is invalid', cb);
        return;
    }
    if (request.post.password !== request.post.passwordConfirm) {
        createPage(request, 'Passwords are different', cb);
        return;
    }

    throw new Error('no')

    request.db.do('SELECT id FROM users WHERE LOWER(username) = LOWER(?) OR LOWER(email) = LOWER(?)', [
        request.post.username,
        request.post.email
    ], (err, rows) => {
        if (err) {
            throw err;
        }
        if (rows.length) {
            createPage(request, 'An account with this username or email already exists', cb);
            return;
        }

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

                let uID = uuid();
                request.db.do(`
                    INSERT INTO users (id, username, email, password, approved) VALUES
                    (?, ?, ?, ?, 0);
                `, [uID, request.post.username, request.post.email, hash], (err) => {
                    if (err) {
                        throw err;
                    }

                    // send mail to the user
                    mail.sendMail({
                        To: request.post.email,
                        Subject: 'Account Creation'
                    }, `<html><head></head><body>Hello ${request.post.username},
<br/>
<p>Your account has been created and is awaiting activation. You will not be able to use your account
until it has been activated by an administrator. We are sorry for this inconvinience, but we gotta protect dat privacy.</p>
<p>We'll be sure to send you another email when your account has been activated.</p>
<br/>
Cheers,<br/>
The EWMA Team</body></html>`, (err) => {
                        if (err) {
                            throw err;
                        }

                        // send mail to the ewma admin
                        mail.sendMail({
                            To: 'ewma@zooengg.ca',
                            Subject: 'Account Requesting Activation'
                        }, `<html><head></head><body>
Listen up bitches,</br>
<p>An account has just been created and is requesting activation.</p>
<pre>Username: ${request.post.username}
ID: ${uID}
Email: <a href="mailto:${request.post.email}">${request.post.email}</a>

How did you hear about us?
${request.post.hdyhau}
</pre>
<a href="https://ewma.zooengg.ca/admin/user/activate/${uID}">Activate this user</a>
                        </body></html>`, (err) => {
                            if (err) {
                                throw err;
                            }
                            redirection.found(request, '/', cb);
                        });
                    });
                });
            });
        });
    });
}

module.exports.handle = (request, cb) => {
    switch (request.method) {
        case 'GET':
            createPage(request, null, cb);
            break;
        case 'POST':
            handleCreateAttempt(request, cb);
            break;
        default:
            code.errorPage(request, code.METHOD_NOT_ALLOWED, cb);
            return;
    }
}
