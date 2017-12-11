/**
 * Route requests based on their paths
 * @file router.js
 * @namespace router
 * @author Mitchell Sawatzky
 */

const fs = require("fs");
const pathLib = require("path");
const template = require(`${__rootname}/util/template`);
const code = require(`${__rootname}/util/code`);

let registeredEndpoints = {};

/**
 * Recursively decend into a directory and load endpoints
 * @param {string} path - the path to search
 * @returns {undefined}
 */
function descend (path) {
    var dir = fs.readdirSync(path);
    for (let i = 0; i < dir.length; i++) {
        if (dir[i].substr(0, 1) !== ".") {
            if (fs.lstatSync(path + "/" + dir[i]).isDirectory()) {
                descend(path + "/" + dir[i]);
            } else if (dir[i].substr(-3) === ".js") {
                let enpt = require(pathLib.resolve(path + "/" + dir[i]));
                if (typeof enpt.type === 'string') {
                    enpt.type = [enpt.type];
                }
                for (let type of enpt.type) {
                    registeredEndpoints[type] = registeredEndpoints[type] || [];
                    registeredEndpoints[type].push(enpt);
                }
            } else {
                console.error("Unexpected non-js file in endpoints: " + path + "/" + dir[i]);
            }
        }
    }
}

module.exports.init = function () {
    descend(`${__rootname}/views`);
};

module.exports.handoff = function (request, clbk) {
    if (!(request.method in registeredEndpoints)) {
        code.errorPage(request, code.NOT_FOUND, clbk);
        return;
    }
    for (let epnt of registeredEndpoints[request.method]) {
        for (let path of epnt.matchPaths) {
            if (typeof path === "string") {
                if (path === request.pathname) {
                    epnt.handle(request, function (err) {
                        if (err) {
                            throw err;
                        }
                        clbk();
                    });
                    return;
                }
            } else if (path instanceof RegExp) {
                if (path.test(request.pathname)) {
                    epnt.handle(request, function (err) {
                        if (err) {
                            throw err;
                        }
                        clbk();
                    });
                    return;
                }
            } else {
                throw new Error("Unknown pathspec: " + path);
            }
        }
    }

    code.errorPage(request, code.NOT_FOUND, clbk);
    return;
};
