const chalk = require("chalk");

/**
 * 
 * @class
 */
module.exports = class ErrorManager extends Error {
    /**
     * 
     * @constructor
     * @param {string} message
     */
    constructor(message) {
        super(`${chalk.blue("EraxDB")} => ${chalk.red("Error:")} ${chalk.gray(message)}`);
    }
};
