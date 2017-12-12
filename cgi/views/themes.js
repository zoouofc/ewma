/**
 * Theme expirey
 * @author Mitchell Sawatzky
 */

const template = require(`${__rootname}/util/template`);
const page = require(`${__rootname}/util/page`);

module.exports.matchPaths = ['/themes'];
module.exports.name = 'themes';
module.exports.type = 'GET';

module.exports.handle = (request, cb) => {
    request.stylesheets.push('theme');
    page.populateHeaders(request, () => {
        request.db.do(`
            SELECT
                m.theme,
                m.year,
                d.display
            FROM movies m
                INNER JOIN department d ON m.dept = d.abbr
            WHERE m.year IS NOT NULL
                AND m.theme IS NOT NULL;`, (err, rows) => {
            if (err) {
                throw err;
            }
            let themes = [];
            let yr = (new Date()).getFullYear() + 1;
            for (let row of rows) {
                if (yr - row.year < 10) {
                    let already = false;
                    for (let i = 0; i < themes.length; i++) {
                        if (row.theme === themes[i].theme && row.year >= themes[i].year) {
                            // this theme was used more than once in the last 10 years, this one is more recent.
                            if (row.display !== themes[i].dept) {
                                themes[i] = {
                                    theme: row.theme,
                                    year: row.year,
                                    dept: themes[i].dept + ', ' + row.display,
                                    available: row.year + 10
                                }
                            }
                            already = true;
                            break;
                        }
                    }
                    if (!already) {
                        themes.push({
                            theme: row.theme,
                            year: row.year,
                            dept: row.display,
                            available: row.year + 10
                        });
                    }
                }
            }
            themes.sort((a, b) => {
                return a.year < b.year ? -1 : 1;
            });
            template.get('themes.ejs', {
                request: request,
                nowYear: yr,
                themes: themes
            }, (err, content) => {
                if (err) {
                    throw err;
                }
                request.body = content;
                cb();
            });
        });
    });
};
