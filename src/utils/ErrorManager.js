const chalk = require("chalk");

/**
 * Hata Yöneticisi
 * @class
 */
module.exports = class ErrorManager extends Error {
    /**
     * @constructor
     * @param {string} message
     */
    constructor(message) {
        super(`${chalk.blue("EraxDB")} => ${chalk.red("Bir Hata Oluştu:")} ${chalk.gray(message)}`);
    }
};
