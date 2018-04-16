/**
 * Process the incoming variables from apache and create a request object
 * @file env.js
 * @namespace env
 * @author Mitchell Sawatzky
 */

const path = require("path");
const uuid = require("uuid/v4");
const query2json = require(`${__rootname}/util/q2j.js`);
const cke = require(`${__rootname}/util/cookie.js`);

module.exports.process = function () {
    if (!process.env.hasOwnProperty('SERVER_SOFTWARE')) {
        // we got invoked without environment variables; mock them.
        process.env.REQUEST_URI = "/test?debug=true";
        process.env.SCRIPT_URL = process.argv[2] ? process.argv[2] : "/test";
        process.env.REQUEST_METHOD = "GET";
        process.env.QUERY_STRING = "debug=true";
    }

    let request = {
        id: uuid(),
        href: path.resolve(process.env.REQUEST_URI),
        pathname: path.resolve(process.env.SCRIPT_URL),
        method: process.env.REQUEST_METHOD,
        query: query2json.q2j(process.env.QUERY_STRING),
        startTime: process.env.REQUEST_START,
        cookie: cke.parse(process.env.HTTP_COOKIE || ''),
        postDataType: process.env.CONTENT_TYPE,

        // output
        headers: {},
        stylesheets: ['umbrella', 'headers', 'footers'],
        scripts: ['lib/jquery.min'],
        body: '',
        headerLinks: []
    };
    process.env.REQUEST_ID = request.id;

    return request;
};
