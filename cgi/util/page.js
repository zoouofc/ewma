const code = require(`${__rootname}/util/code`);

function populateHeaders (request, cb) {
    request.headerLinks = request.headerLinks || [];
    request.headerLinksAdmin = request.headerLinksAdmin || [];

    request.headerLinks.push({
        text: 'Movie List',
        link: '/movies/list'
    });

    request.headerLinks.push({
        text: 'Themes',
        link: '/themes'
    });

    // request.headerLinks.push({
    //     text: 'Submit Movie',
    //     link: '/contact'
    // });

    request.db.do(`
        SELECT id
        FROM movies
        WHERE src IS NOT NULL
        ORDER BY RAND()
        LIMIT 0, 1;`, (err, rows) => {
        if (err) {
            throw err;
        }
        request.headerLinks.push({
            text: 'Random Movie',
            link: '/movies/' + rows[0].id
        });

        if (request.permissions.movie_edit) {
            request.headerLinksAdmin.push({
                text: 'Edit Movie',
                link: '/admin/edit'
            });
        }

        // if (request.permissions.manage_permissions) {
        //     request.headerLinksAdmin.push({
        //         text: 'Manage Permissions',
        //         link: '/admin/permissions'
        //     });
        // }

        if (request.permissions.manage_users) {
            request.headerLinksAdmin.push({
                text: 'Manage Users',
                link: '/admin/users'
            });
        }

        request.headerLinks.push({
            text: 'Logout',
            link: '/logout'
        });

        cb();
    });
}

function requirePermission(permission, proceed) {
    return (request, exit) => {
        request.user.checkPerm(permission, (err, ok) => {
            if (err) {
                throw err;
            }
            if (ok) {
                proceed(request, exit);
                return;
            } else {
                code.errorPage(request, code.FORBIDDEN, exit);
            }
        });
    }
};

module.exports = {
    populateHeaders: populateHeaders,
    requirePermission: requirePermission
};
