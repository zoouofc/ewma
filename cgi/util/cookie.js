/**
 * File for managing cookies
 * @file cookie.js
 * @namespace util.cookie
 * @author Mitchell Sawatzky
 */

const cookie = require('cookie');

function tosCookie () {
    return cookie.serialize('terms_of_service', true, {
        httpOnly: true,
        maxAge: 60 * 60 * 24
    });
}

module.exports = {
    parse: cookie.parse,
    tosCookie: tosCookie
};
