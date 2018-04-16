/**
 * Activate a user
 * @author Mitchell Sawatzky
 */

const page = require(`${__rootname}/util/page`);
const code = require(`${__rootname}/util/code`);
const mail = require(`${__rootname}/util/mail`);
const redirection = require(`${__rootname}/util/redirection`);
const user = require(`${__rootname}/models/user`);

module.exports.matchPaths = [/^\/admin\/user\/[a-z0-9-]+\/activate\/?$/];
module.exports.name = 'user activation';
module.exports.type = 'POST';

module.exports.handle = page.requirePermission('manage_users', (request, cb) => {
    let u = new user.User(request.db);
    let uid = request.pathname.split('/')[3];
    u.initFromId(uid, (err) => {
        if (err) {
            throw err;
        }
        console.error(uid, u.valid, u)
        if (u.valid) {
            if (u.attributes.approved) {
                redirection.found(request, `/admin/user/${uid}`, cb);
                return;
            }
            request.db.do('UPDATE users SET approved = 1 WHERE id = ?', [uid], (err) => {
                if (err) {
                    throw err;
                }

                mail.sendMail({
                    To: u.attributes.email,
                    Subject: 'Your account has been activated!'
                }, `<html><head></head><body>Hello ${u.attributes.username},
<br/>
<p>Congratulations! We have just activated your account.</p>
<p>You may now peruse the <a href="https://ewma.zooengg.ca">ENGG Week Movie Archive</a> at your leasure. Please do not share your account credentials around
or show off the EWMA to people that may do malicious things with it. The EWMA takes work to maintain, and we want to keep the
students who produce these movies safe.</p>
<p>If you find that any of the movies violate university policies, please watch the movie again. You're probably mistaken.</p>
<p>If you have any ENGG Week movie content that we don't know about or have feedback on the site, please don't hesitate to shoot us an email at
<a href="mailto:ewma@zooengg.ca">ewma@zooengg.ca</a>. We'd love to hear from you.</p>
<br/>
Cheers,<br/>
The EWMA Team</body></html>`, (err) => {
                    if (err) {
                        throw err;
                    }
                    redirection.found(request, `/admin/user/${uid}`, cb);
                });
            });
        } else {
            code.errorPage(request, code.NOT_FOUND, cb);
        }
    });
});
