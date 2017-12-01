/**
 * This file defines generic custom error types, and provides a method to extend errors
 * @file error.js
 * @namespace error
 * @author Mitchell Sawatzky
 */


/**
 * Easily extendable error, from https://stackoverflow.com/a/32749533
 * @class ExtendableError
 * @member error
 * @extends Error
 */
class ExtendableError extends Error {
    constructor (message) {
        super(message);
        this.name = this.constructor.name;
        if (typeof Error.captureStackTrace === 'function') {
            Error.captureStackTrace(this, this.constructor);
        } else {
            this.stack = (new Error(message)).stack;
        }
    }
}
module.exports.ExtendableError = ExtendableError;

/**
 * Error for handling instances where the type of a construct cannot be handled.
 * @class UnhandledTypeError
 * @member error
 * @extends ExtendableError
 */
class UnhandledTypeError extends ExtendableError {}
module.exports.UnhandledTypeError = UnhandledTypeError;

/**
 * Error for handling unmet expectations
 * @class UnmetExpectationError
 * @member error
 * @extends ExtendableError
 */
class UnmetExpectationError extends ExtendableError {}
module.exports.UnmetExpectationError = UnmetExpectationError;
