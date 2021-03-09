/**
 * User management
 * @author Mitchell Sawatzky
 */

const template = require(`${__rootname}/util/template`);
const page = require(`${__rootname}/util/page`);
const user = require(`${__rootname}/models/user`);

module.exports.matchPaths = ['/admin/users'];
module.exports.name = 'user_management';
module.exports.type = 'GET';


module.exports.handle = page.requirePermission('manage_users', (request, cb) => {
    request.stylesheets.push('users');

    page.populateHeaders(request, (err) => {
        if (err) {
            throw err;
        }

        request.db.do('SELECT id FROM users', (err, ids) => {
            if (err) {
                throw err;
                return;
            }

            let users = [];
            for (let i = 0; i < ids.length; i++) {
                (function (j) {
                    let u = new user.User(request.db);
                    u.initFromId(ids[j].id, (err) => {
                        if (err) {
                            throw err;
                        }

                        u.getPerms((err) => {
                            if (err) {
                                throw err;
                            }

                            users.push(u);

                            if (users.length === ids.length) {
                                // done
                                template.get('admin/users.ejs', {
                                    request: request,
                                    users: users.sort((a, b) => {
                                        if (a.attributes.approved > b.attributes.approved) {
                                            return -1;
                                        } else if (a.attributes.approved < b.attributes.approved) {
                                            return 1;
                                        } else {
                                            if (a.attributes.username.toLowerCase() > b.attributes.username.toLowerCase()) {
                                                return 1;
                                            } else if (a.attributes.username.toLowerCase() < b.attributes.username.toLowerCase()) {
                                                return -1;
                                            }
                                            return 0;
                                        }
                                    })
                                }, (err, content) => {
                                    if (err) {
                                        throw err;
                                    }
                                    request.body = content;
                                    cb();
                                });
                            }
                        });
                    });
                })(i);
            }
        });
    });
});
