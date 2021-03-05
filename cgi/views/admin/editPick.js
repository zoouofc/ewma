/**
 * Theme expirey
 * @author Mitchell Sawatzky
 */

const template = require(`${__rootname}/util/template`);
const page = require(`${__rootname}/util/page`);

module.exports.matchPaths = ['/admin/edit'];
module.exports.name = 'editPick';
module.exports.type = 'GET';

module.exports.handle = page.requirePermission('movie_edit', (request, cb) => {
    request.scripts.push('adminPick');
    page.populateHeaders(request, () => {
        request.db.do('SELECT id, year, dept, title FROM movies ORDER BY year DESC, title ASC;', (err, rows) => {
            if (err) {
                throw err;
            }

            let movies = [];
            for (let row of rows) {
                if (!row.year) row.year = '?';
                if (!row.dept) row.dept = '?';
                if (!row.title) row.title = '?';
                movies.push({val: row.id, text: `${row.year}//${row.dept.toUpperCase()} - ${row.title}`});
            }
            template.get('admin/editPick.ejs', {
                request: request,
                movies: movies
            }, (err, content) => {
                if (err) {
                    throw err;
                }
                request.body = content;
                cb();
            });
        });
    });
});
