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

let request = env.process();

request.headers['status'] = '200 OK';
request.headers['content-type'] = 'text/html';

// pathing and handling of request.body
request.body = `<!DOCTYPE html>
<html>
    <head>
        <title>ENGG Week Movie Archive</title>
        <link rel="icon" type="image/png" href="/static/images/favicon.png" />
        <link rel="stylesheet" type="text/css" href="/static/css/index.css" />
    </head>
    <body>
        <img src="/static/images/ewma.svg" />
    </body>
</html>`

// output here
for (header in request.headers) {
    process.stdout.write(`${header}: ${request.headers[header]}\n`);
}
process.stdout.write('\n');

process.stdout.write(request.body);
