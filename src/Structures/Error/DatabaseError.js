const { red, gray, blue } = require('colorette');

module.exports = class DatabaseError extends Error {
    constructor(message) {
        super(`${blue('[ EraxDB ]')} => ${red('Error:')} ${gray(message)}`);
    }
};
