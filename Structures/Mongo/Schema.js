const { Schema, model, Model } = require("mongoose");

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
 * @param {string} modelName
 * @typedef {Model<any, {}>}
 */
module.exports = (modelName) => {
    return model(modelName, schema);
};
