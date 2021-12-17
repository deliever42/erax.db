const { red, gray, blue } = require('./ColorStyles');

/**
 *
 * @extends {Error}
 * @class DaatabaseError
 */
module.exports = class DatabaseError extends Error {
    /**
     *
     * @constructor
     * @param {string} message
     */
    constructor(message) {
        super(`${blue('EraxDB')} => ${red('Error:')} ${gray(message)}`);
    }
};
