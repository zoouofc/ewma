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
const code = require(`${__rootname}/util/code.js`);
const dbWrapper = require(`${__rootname}/util/db.js`);
const auth = require(`${__rootname}/util/auth.js`);
const cookie = require('cookie');

let request = env.process();
router.init();

request.headers['status'] = code.codeString(code.OK);
request.headers['content-type'] = 'text/html';

dbWrapper.acquire(function (db) {
    request.db = db;
    // check if the user has a session
    auth.checkSession(request, request.cookie.session, (err, valid, admin) => {
        if (err) {
            throw err;
        }
        // expired session or first time
        if ((!request.cookie.session || !valid)
            && request.pathname !== '/tosagree'
            && request.method === 'GET'
        ) {
            // tsk tsk. Better make sure they're not an ass first
            request._originalPathname = request.pathname;
            request.pathname = '/tos'
        }

        if (admin) {
            request.admin = true;
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
            console.error(request.post);
            router.handoff(request, () => {
                // output here
                for (header in request.headers) {
                    process.stdout.write(`${header}: ${request.headers[header]}\n`);
                }
                process.stdout.write('\n');
                if (request.headers['content-type'] === 'text/html') {
                    template.get('summary.ejs', {
                        request: request
                    }, (err, content) => {
                        if (err) {
                            throw err;
                        }
                        process.stdout.write(content);
                        process.stdout.write(request.body);
                        exitProcedures.shutdown(0);
                    });
                } else {
                    process.stdout.write(request.body);
                    exitProcedures.shutdown(0);
                }
            });
        });
    });
});
