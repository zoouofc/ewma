/**
 * Hooks to be called on shutdown
 * @file exitProcedures.js
 * @namespace exitprocedures
 * @author Mitchell Sawatzky
 */

const crashDump = require(`${__rootname}/util/crashDump`);
const constants = require(`${__rootname}/constants`);
const error = require(`${__rootname}/error`);

// functions to be called
var hooks = {};
hooks[constants.priority.HIGH] = [];
hooks[constants.priority.MEDIUM] = [];
hooks[constants.priority.LOW] = [];

/**
 * Error for invalid priorities
 * @class PriorityError
 * @member exitprocedures
 * @extends ExtendableError
 */
class PriorityError extends error.ExtendableError {}
module.exports.PriorityError = PriorityError;

/**
 * Register a hook to be called on shutdown
 * @function register
 * @memberof exitprocedures
 * @throws {PriorityError}
 * @param {Number} priority - the importance of the hook
 * @param {Function} hook - the hook to register
 * @returns {undefined}
 */
module.exports.register = function (priority, hook) {
    for (const p in constants.priority) {
        if (constants.priority[p] === priority) {
            hooks[priority].unshift(hook);
            return;
        }
    }
    throw new PriorityError(`Invalid Priority: ${priority}`);
}

function onShutdown (code) {
    var running = 0;
    if (typeof code !== "number") {
        code = 1;
    }
    function execHooks (priority) {
        for (const hook of hooks[priority]) {
            running++;
            if (code === 0) {
                process.stderr.write(`[EXITHOOK] Executing exit hook at priority ${priority}\n`);
            }
            hook(function () {
                running--;
            });
        }
    }

    execHooks(constants.priority.HIGH);
    setTimeout(function () {
        execHooks(constants.priority.MEDIUM);
    }, 10)
    setTimeout(function () {
        execHooks(constants.priority.LOW);
    }, 20);
    setInterval(function () {
        if (running === 0) {
            process.exit(code);
            process.stderr.write(`[EXITHOOK] ${running} hooks still running...\n`);
        }
    }, 100);
}

process.on("SIGHUP", function() {
    onShutdown(3);
}); // 3
process.on("SIGINT", function() {
    onShutdown(2);
}); // 2
process.on("SIGTERM", function() {
    onShutdown(1);
}); // 1

/**
 * Manually call all the hooks (eg. program exits properly)
 * @function shutdown
 * @member utils.exitprocedures
 * @return {undefined}
 */
module.exports.shutdown = onShutdown;

process.once("uncaughtException", function (e) {
    console.error(e.stack);
    crashDump.dump(e.stack);
    onShutdown(1);
});
