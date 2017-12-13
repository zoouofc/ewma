const code = require(`${__rootname}/util/code`);

function populateHeaders (request, cb) {
    request.headerLinks = request.headerLinks || [];

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

        if (request.admin) {
            request.headerLinks.push({
                text: 'Edit Movie',
                link: '/admin/edit'
            }, {
                text: 'Logout',
                link: '/logout'
            });
        } else {
            request.headerLinks.push({
                text: 'Admin Login',
                link: '/login'
            });
        }

        cb();
    });
}

function requireAdmin(proceed) {
    return (request, exit) => {
        if (request.admin) {
            proceed(request, exit);
            return;
        }
        code.errorPage(request, code.FORBIDDEN, exit);
    }
};

module.exports = {
    populateHeaders: populateHeaders,
    requireAdmin: requireAdmin
};
