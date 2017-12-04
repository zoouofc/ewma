/**
 * File containing utilities for redirecting a request
 * @namespace util.redirection
 * @author Mitchell Sawatzky
 */

function found (request, location, cb) {
    request.headers['status'] = '302 Found';
    request.headers['location'] = location;
    request.body = `302 Found: You should be redirected to <a href="${location}">${location}</a>`
    cb();
}

module.exports = {
    found: found
};
