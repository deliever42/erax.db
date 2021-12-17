/**
 *
 * @param {string} message
 * @returns {string}
 */
this.red = (message) => {
    return `\x1b[31m${message}\x1b[37m`;
};

/**
 *
 * @param {string} message
 * @returns {string}
 */
this.gray = (message) => {
    return `\x1b[90m${message}\x1b[37m`;
};

/**
 *
 * @param {string} message
 * @returns {string}
 */
this.green = (message) => {
    return `\x1b[32m${message}\x1b[37m`;
};

/**
 *
 * @param {string} message
 * @returns {string}
 */
this.blue = (message) => {
    return `\x1b[34m${message}\x1b[37m`;
};

module.exports = this;
