import { readFileSync, writeFileSync } from 'fs';
import { DatabaseError } from './DatabaseError';

export class Utils {
    public static stringify(type: 'bson' | 'json', obj: any, space?: number): string {
        switch (type) {
            case 'bson':
                let bson = null;

                try {
                    bson = require('bson');
                } catch {
                    throw new DatabaseError('Package "bson" is not installed!');
                }

                return bson.serialize(obj);
            case 'json':
                return JSON.stringify(obj, null, space ?? 4);
            default:
                throw new DatabaseError(`This database type "${type}" is not supported!`);
        }
    }

    public static parse(type: 'bson' | 'json', obj: any): any {
        switch (type) {
            case 'bson':
                let bson = null;

                try {
                    bson = require('bson');
                } catch {
                    throw new DatabaseError('Package "bson" is not installed!');
                }

                return bson.deserialize(obj);
            case 'json':
                return JSON.parse(obj);
            default:
                throw new DatabaseError(`This database type "${type}" is not supported!`);
        }
    }

    public static write<V>(
        type: 'bson' | 'json',
        filePath: string,
        obj: { [key: string]: V },
        space?: number
    ) {
        return writeFileSync(filePath, this.stringify(type, obj, space));
    }

    public static read<V>(type: 'bson' | 'json', filePath: string): { [key: string]: V } {
        return this.parse(type, readFileSync(filePath, type === 'json' ? 'utf-8' : null));
    }
}
