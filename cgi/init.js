#!/usr/bin/node

/**
 * Entry point for all requests to the server
 * @file init.js
 * @namespace init
 * @author Mitchell Sawatzky
 */

process.env.REQUEST_START = Date.now();
global.__rootname = __dirname;

const env = require(`${__rootname}/util/env.js`);
const exitProcedures = require(`${__rootname}/exitProcedures.js`);
const template = require(`${__rootname}/util/template.js`);
const cookie = require('cookie');

let request = env.process();

request.headers['status'] = '200 OK';
request.headers['content-type'] = 'text/html';
request.headers['set-cookie'] = cookie.serialize('session', '1231231231', {
    httpOnly: true,
    maxAge: 60 * 60 * 24
});

// pathing and handling of request.body
template.get('index.ejs', function (err, contents) {
    if (err) {
        throw err;
    }
    // output here
    for (header in request.headers) {
        process.stdout.write(`${header}: ${request.headers[header]}\n`);
    }
    process.stdout.write('\n');

    process.stdout.write(contents);
    exitProcedures.shutdown(0);
});
