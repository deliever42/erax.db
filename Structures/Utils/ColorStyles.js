/**
 *
 * @param {string} message
 * @returns {string}
 */
const red = function (message) {
    return `\x1b[31m${message}\x1b[37m`;
};

/**
 *
 * @param {string} message
 * @returns {string}
 */
const gray = function (message) {
    return `\x1b[90m${message}\x1b[37m`;
};

/**
 *
 * @param {string} message
 * @returns {string}
 */
const green = function (message) {
    return `\x1b[32m${message}\x1b[37m`;
};

/**
 *
 * @param {string} message
 * @returns {string}
 */
const blue = function (message) {
    return `\x1b[34m${message}\x1b[37m`;
};

module.exports = { red, gray, green, blue };
