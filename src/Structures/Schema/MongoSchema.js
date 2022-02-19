const { Schema } = require('mongoose');

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

module.exports = (connection, modelName) => {
    return connection.model(modelName, schema);
};
