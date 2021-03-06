const template = require(`${__rootname}/util/template`);
const page = require(`${__rootname}/util/page`);
const code = require(`${__rootname}/util/code`);
const user = require(`${__rootname}/models/user`);

module.exports.matchPaths = [/^\/admin\/user\/[a-z0-9-]+\/?$/];
module.exports.name = 'user management';
module.exports.type = 'GET';

module.exports.handle = page.requirePermission('manage_users', (request, cb) => {
    request.stylesheets.push('user');
    request.scripts.push('user');

    page.populateHeaders(request, (err) => {
        if (err) {
            throw err;
        }
        request.user.checkPerm('manage_permissions', (err, has_perm) => {
            if (err) {
                throw err;
            }

            let id = request.pathname.split('/')[3];
            let u = new user.User(request.db);
            u.initFromId(id, (err) => {
                if (err) {
                    throw err;
                }
                if (u.valid) {
                    u.getPerms((err) => {
                        if (err) {
                            throw err;
                        }

                        // tells you the permissions that the user does not have
                        request.db.do('SELECT perm FROM permission_schema', (err, rows) => {
                            if (err) {
                                throw err;
                            }

                            let existingPerms = [];
                            for (let row of rows) {
                                if (!u.permissions.has(row.perm)) {
                                    existingPerms.push(row.perm)
                                }
                            }

                            template.get('admin/user.ejs', {
                                request: request,
                                user: u,
                                has_permission: has_perm,
                                existingPerms: existingPerms
                            }, (err, content) => {
                                if (err) {
                                    throw err;
                                }
                                request.body = content;
                                cb();
                            });
                        });
                    });
                } else {
                    return code.errorPage(request, code.NOT_FOUND, cb);
                }
            });
        });
    });
});
