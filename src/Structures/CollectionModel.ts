import { Schema, Connection } from 'mongoose';

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

export const CollectionModel = (connection: Connection, modelName: string) => {
    return connection.model(modelName, schema);
};
