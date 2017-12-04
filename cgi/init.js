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
const router = require(`${__rootname}/util/router.js`);
const dataConsumer = require(`${__rootname}/util/dataConsumer.js`);
const query2json = require(`${__rootname}/util/q2j.js`);
const cookie = require('cookie');

let request = env.process();
router.init();

request.headers['status'] = '200 OK';
request.headers['content-type'] = 'text/html';

// before we parse the request path, check that the user has accepted the ToS (unless they are accepting the ToS)
if (!request.cookie.terms_of_service && request.pathname !== '/tosagree' && request.method === 'GET') {
    // tsk tsk. Better make sure they're not an ass first
    request._originalPathname = request.pathname;
    request.pathname = '/tos'
}

dataConsumer.consume((err, data) => {
    request.post = data;
    try {
        request.post = JSON.parse(request.post)
        request.postDataType = 'application/json';
    } catch (e) {
        try {
            request.post = query2json.q2j(request.post);
            request.postDataType = 'application/json';
        } catch (e) {
            request.postDataType = 'raw';
        }
    }
    router.handoff(request, () => {
        // output here
        for (header in request.headers) {
            process.stdout.write(`${header}: ${request.headers[header]}\n`);
        }
        process.stdout.write('\n');
        process.stdout.write(request.body);
        exitProcedures.shutdown(0);
    });
});
