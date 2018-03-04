/**
 * Utilities concerning time
 * @file time.js
 * @namespace time
 * @author Mitchell Sawatzky
 */

const strftime = require('strftime');

/**
 * Convert seconds to %H:%M:%S
 * @memberof time
 * @function secondsToStamp
 * @param {number} seconds - the number of seconds to convert
 * @returns {string}
 */
function secondsToStamp (seconds) {
    return strftime.utc()('%H:%M:%S', new Date(seconds * 1000));
}

module.exports = {
    strftime: strftime,
    secondsToStamp: secondsToStamp
};
