module.exports.matchPaths = ['/darkmode/on', '/darkmode/off'];
module.exports.name = 'darkmode';
module.exports.type = ['POST'];


module.exports.handle = (request, cb) => {
    request.headers['content-type'] = 'application/json';
    let action = request.pathname.split('/')[2];
    request.db.do(`
        UPDATE users SET dark = ? WHERE id = ?
    `, [action === 'on' ? 1 : 0, request.user.attributes.id], (err) => {
        request.body = JSON.stringify({
            session: request.cookie.session,
            darkmode: action
        });
        cb();
    });
};
