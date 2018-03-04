/**
 * Hack the require cache so that CGI code can be called from the scripts directory
 * @author Mitchell Sawatzky
 */

const path = require('path');
const conf = require('../conf.json');

// ============= HACK

let hacked = false;

module.exports = function() {
    if (!hacked) {
        // hack the require cache so that we can call CGI code
        global.__rootname = path.resolve(`${__dirname}/../cgi`);
        let hackedConfPath = path.resolve(`${__rootname}/conf.json`);
        require.cache[hackedConfPath] = {
            id: hackedConfPath,
            filename: hackedConfPath,
            loaded: true,
            children: [],
            exports: conf
        };

        // now that the conf data is in the cache,
        // we need to tell the module loader that it exists
        const Module = require('module');
        let realResolve = Module._resolveFilename;
        Module._resolveFilename = function (request, parent) {
            if (request === hackedConfPath) {
                return hackedConfPath;
            }
            return realResolve(request, parent);
        };

        hacked = true;
    }
}

// ============= END HACK
