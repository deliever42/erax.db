const { Schema, model, Model, Connection } = require('mongoose');

const schema = new Schema({
    key: {
        type: Schema.Types.String,
        unique: true,
        required: true
    },
    value: {
        type: Schema.Types.Mixed,
        required: true
    }
});

/**
 *
 * @param {Connection} connection
 * @param {string} modelName
 */
module.exports = (connection, modelName) => {
    return connection.model(modelName, schema);
};
