/**
 * User management
 * @author Mitchell Sawatzky
 */

const template = require(`${__rootname}/util/template`);
const page = require(`${__rootname}/util/page`);
const user = require(`${__rootname}/models/user`);

module.exports.matchPaths = ['/admin/permissions'];
module.exports.name = 'perm_management';
module.exports.type = 'GET';


module.exports.handle = page.requirePermission('manage_permissions', (request, cb) => {
    page.populateHeaders(request, (err) => {
        if (err) {
            throw err;
        }

        request.db.do('SELECT * FROM permission_schema', (err, perms) => {
            if (err) {
                throw err;
                return;
            }

            let permissions = [];
            for (let i = 0; i < perms.length; i++) {
                (function(j) {
                    let perm = {
                        'permission': perms[j].perm,
                        'description': perms[j].description
                    };
                    request.db.do(`
                        SELECT users.id, users.username
                        FROM users INNER JOIN permissions ON permissions.user = users.id
                        WHERE permissions.perm = ?
                        ORDER BY users.username
                    `, [perms[j].perm], (err, users) => {
                        if (err) {
                            throw err;
                        }
                        perm.users = [];
                        for (let user of users) {
                            perm.users.push({
                                username: user.username,
                                id: user.id
                            });
                        }

                        permissions.push(perm);

                        if (permissions.length === perms.length) {
                            // done
                            template.get('admin/permissions.ejs', {
                                request: request,
                                permissions: permissions.sort((a, b) => {
                                    if (a.permission > b.permission) {
                                        return 1;
                                    } else if (a.permission < b.permission) {
                                        return -1;
                                    }
                                    return 0;
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
                })(i);
            }
        });
    });
});
