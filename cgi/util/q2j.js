/**
 * Convert a querystring to a json object
 * @file q2j.js
 * @namespace q2j
 * @author Mitchell Sawatzky
 */

module.exports.q2j = function (querystring) {
    let json = {};
    querystring = querystring.replace(/\+/gm, ' ');
    let components = querystring.split("&");
    for (let component of components) {
        let comp = component.split("=");
        let key = comp.splice(0, 1);
        let val = comp.join("=");

        try {
            key = decodeURIComponent(key);
        } catch (e) {
            if (e instanceof URIError) {
                // those bastards gave us a bad QUERY_STRING
            } else {
                throw e;
            }
        }
        try {
            val = decodeURIComponent(val);
        } catch (e) {
            if (e instanceof URIError) {
                // those bastards gave us a bad QUERY_STRING
            } else {
                throw e;
            }
        }

        json[key] = val;
    }
    return json;
};
