import { BaseDatabase } from './BaseDatabase';
import { join, sep } from 'path';
import { Utils as _ } from './Utils';
import { set, get, unset } from 'lodash';
import { mkdirSync, existsSync } from 'fs';
import { DatabaseError } from './DatabaseError';

import type {
    BaseFetchOptions,
    BasePushOptions,
    BaseMathOptions,
    Schema,
    Operators,
    BaseBackupOptions
} from '../Interfaces';

export interface MongoDatabaseOptions {
    cache?: boolean;
    url?: string;
    mongoOptions?: any;
    modelName?: string;
    backup?: BaseBackupOptions;
}

export class MongoDatabase<V> extends BaseDatabase<V> {
    public options: MongoDatabaseOptions;
    public connection: any;
    private backupInterval: any = null;
    public model: any;
    public constructor(
        options: MongoDatabaseOptions = {
            cache: true,
            url: 'mongodb://localhost:27017/',
            backup: {
                enabled: false
            },
            mongoOptions: {},
            modelName: 'EraxDB'
        }
    ) {
        super();

        this.options = options;

        let mongoose: any = null;

        try {
            mongoose = require('mongoose');
        } catch {
            throw new DatabaseError('Package "mongoose" is not installed!');
        }

        const schema = new mongoose.Schema({
            key: {
                type: mongoose.Schema.Types.String,
                unique: true,
                required: true
            },
            value: {
                type: mongoose.Schema.Types.Mixed,
                required: true
            }
        });

        if (!this.options.url) this.options.url = 'mongodb://localhost:27017/';
        if (!this.options.cache && this.options.cache !== false) this.options.cache = true;
        if (!this.options.backup) this.options.backup = { enabled: false };
        if (!this.options.mongoOptions) this.options.mongoOptions = {};
        if (!this.options.modelName) this.options.modelName = 'EraxDB';

        let resolvedBackupFilePath = process.cwd();

        if (this.options.backup.enabled) {
            if (!this.options.backup.backupInterval) this.options.backup.backupInterval = 10800000;
            if (!this.options.backup.filePath)
                this.options.backup.filePath = join(process.cwd(), 'backups');

            this.options.backup.filePath = this.options.backup.filePath
                .replace('/', sep)
                .replace('\\', sep)
                .replace(process.cwd(), '');

            const paths = this.options.backup.filePath.split(sep);

            for (const path of paths) {
                resolvedBackupFilePath += `${sep}${path}`;
                if (!existsSync(resolvedBackupFilePath)) mkdirSync(resolvedBackupFilePath);
            }

            this.options.backup.filePath = resolvedBackupFilePath;
        }

        this.options = options;
        this.connection = mongoose.createConnection(
            this.options.url as string,
            this.options.mongoOptions
        );
        this.model = this.connection.model(this.options.modelName, schema);

        if (this.options.cache) {
            (async () => {
                this.cache = await this.clone();
            })();
        }

        if (this.options.backup!.enabled && this.options.backup!.filePath) {
            this.backupInterval = setInterval(() => {
                const createdAt = new Date();
                const createdAtString = `${
                    createdAt.getMonth() + 1
                }-${createdAt.getDate()}-${createdAt.getFullYear()} ${createdAt.getHours()}_${createdAt.getMinutes()}_${createdAt.getSeconds()}`;

                if (this.options.cache) {
                    _.write<V>(
                        'bson',
                        join(this.options.backup!.filePath!, `${createdAtString}.bson`),
                        this.cache
                    );
                } else {
                    (async () => {
                        const file = await this.clone();

                        _.write<V>(
                            'bson',
                            join(this.options.backup!.filePath!, `${createdAtString}.bson`),
                            file
                        );
                    })();
                }
            }, this.options.backup!.backupInterval);
        }
    }

    public async set(key: string, value: V): Promise<V> {
        if (typeof key !== 'string') throw new DatabaseError('Invalid key!');

        const parsedKey = key.split('.')[0];

        if (this.options.cache) {
            let data = get(this.cache, parsedKey);

            set(this.cache, key, value);

            if (data) {
                if (key.includes('.')) {
                    set(this.cache, parsedKey, data);
                    set(this.cache, key, value);

                    await this.model.updateOne(
                        { key: parsedKey },
                        { value: get(this.cache, parsedKey) }
                    );
                } else {
                    await this.model.updateOne({ key }, { value });
                }
            } else {
                if (key.includes('.')) {
                    await this.model.create({ key: parsedKey, value: get(this.cache, parsedKey) });
                } else {
                    await this.model.create({ key, value });
                }
            }
        } else {
            let json = {};
            set(json, key, value);

            let data = await this.model.findOne({ key: parsedKey });

            if (data) {
                if (key.includes('.')) {
                    set(json, parsedKey, _.parse('json', data.value));
                    set(json, key, value);

                    await this.model.updateOne({ key: parsedKey }, { value: get(json, parsedKey) });
                } else {
                    await this.model.updateOne({ key }, { value });
                }
            } else {
                if (key.includes('.')) {
                    await this.model.create({ key: parsedKey, value: get(json, parsedKey) });
                } else {
                    await this.model.create({ key, value });
                }
            }

            json = {};
        }

        return value;
    }

    public async get(key: string): Promise<V | null> {
        if (typeof key !== 'string') throw new DatabaseError('Invalid key!');

        if (this.options.cache) {
            return get(this.cache, key);
        } else {
            const parsedKey = key.split('.')[0];

            let data = await this.model.findOne({ key: parsedKey });
            if (!data) return null;

            if (key.includes('.')) {
                let json = {};

                set(json, parsedKey, data.value);
                return get(json, key);
            } else {
                return data.value;
            }
        }
    }

    public async fetch(key: string) {
        if (typeof key !== 'string') throw new DatabaseError('Invalid key!');

        return await this.get(key);
    }

    public async has(key: string) {
        if (typeof key !== 'string') throw new DatabaseError('Invalid key!');

        return !!(await this.get(key));
    }

    public async clear() {
        this.cache = {};
        await this.model.deleteMany({});
        return;
    }

    public async delete(key: string): Promise<null | void> {
        if (typeof key !== 'string') throw new DatabaseError('Invalid key!');

        if (this.options.cache) {
            unset(this.cache, key);

            if (key.includes('.')) {
                const parsedKey = key.split('.')[0];
                await this.set(parsedKey, get(this.cache, parsedKey));
            } else {
                if (!(await this.has(key))) return null;
                await this.model.deleteOne({ key });
            }
        } else {
            if (key.includes('.')) {
                const parsedKey = key.split('.')[0];
                let json = {};

                const data = await this.get(key);
                if (!data) return null;

                set(json, parsedKey, data);
                unset(json, key);
                await this.set(parsedKey, get(json, parsedKey));
                json = {};
            } else {
                if (!(await this.has(key))) return null;
                await this.model.deleteOne({ key });
            }
        }

        return;
    }

    public async destroy() {
        if (this.options.backup!.enabled && this.options.backup!.filePath)
            clearInterval(this.backupInterval);
        this.cache = {};
        await this.clear();
        await this.connection.close();
        return;
    }

    public async getAll(
        options: BaseFetchOptions = { force: true, cache: true }
    ): Promise<Array<{ ID: string; data: V }>> {
        if (options.force) {
            const file = await this.model.find();

            const allArray = [...file].map(({ key, value }) => {
                return { ID: key, data: value };
            });

            if (options.cache && this.options.cache)
                this.cache = allArray.reduce(
                    (p, { ID, data }) => ({ [ID]: data }),
                    {}
                ) as unknown as {
                    [key: string]: V;
                };

            return allArray;
        } else {
            return Object.entries(this.cache).map(([ID, data]) => {
                return { ID, data };
            });
        }
    }

    public async fetchAll(options?: BaseFetchOptions) {
        return await this.getAll(options);
    }

    public async size(options?: BaseFetchOptions) {
        return (await this.getAll(options)).length;
    }

    public async keyArray(options?: BaseFetchOptions) {
        return (await this.getAll(options)).map(({ ID }) => ID);
    }

    public async valueArray(options?: BaseFetchOptions) {
        return (await this.getAll(options)).map(({ data }) => data);
    }

    public async push(
        key: string,
        values: V | Array<V>,
        options: BasePushOptions = { returnIfExists: false }
    ) {
        if (typeof key !== 'string') throw new DatabaseError('Invalid key!');

        const array = ((await this.get(key)) || []) as unknown as Array<V>;
        if (!Array.isArray(array)) return null;

        if (Array.isArray(values)) {
            for (const value of values) {
                const index = array.indexOf(value);
                if (index > -1 && options.returnIfExists) continue;
                array.push(value);
            }
        } else {
            const index = array.indexOf(values);
            if (options.returnIfExists) {
                if (!(index > -1)) array.push(values);
            } else {
                array.push(values);
            }
        }

        return await this.set(key, array as any);
    }

    public async pull(key: string, values: V | Array<V>) {
        if (typeof key !== 'string') throw new DatabaseError('Invalid key!');

        const array = await this.get(key);
        if (!Array.isArray(array)) return null;

        if (Array.isArray(values)) {
            for (const value of values) {
                array.splice(array.indexOf(value), 1);
            }
        } else {
            array.splice(array.indexOf(values), 1);
        }

        return await this.set(key, array);
    }

    public async type(key: string) {
        if (typeof key !== 'string') throw new DatabaseError('Invalid key!');

        const data = await this.get(key);
        if (!data) return null;
        return Array.isArray(data) ? 'array' : typeof data;
    }

    public async math(
        key: string,
        operator: Operators,
        value: number,
        options: BaseMathOptions = { goToNegative: true }
    ) {
        if (typeof key !== 'string') throw new DatabaseError('Invalid key!');
        if (isNaN(value)) throw new DatabaseError('Invalid value!');

        let data = (await this.get(key)) || 0;
        if (typeof data !== 'number') data = 0;

        switch (operator) {
            case '+':
                data += value;
                break;
            case '-':
                data -= value;
                break;
            case '*':
                data *= value;
                break;
            case '/':
                data /= value;
                break;
            case '%':
                data %= value;
                break;
            case '**':
                data **= value;
                break;
            default:
                throw new DatabaseError(`This operator "${operator}" is not supported`);
        }

        if (data < 0 && !options.goToNegative) data = 0;

        return await this.set(key, data as any);
    }

    public async filter(
        fn: (value: Schema<V>, index: number, array: Array<Schema<V>>) => boolean,
        options?: BaseFetchOptions
    ) {
        return (await this.getAll(options)).filter(fn);
    }

    public async find(
        fn: (value: Schema<V>, index: number, array: Array<Schema<V>>) => boolean,
        options?: BaseFetchOptions
    ) {
        return (await this.getAll(options)).find(fn);
    }

    public async sort(fn: (a: Schema<V>, b: Schema<V>) => number, options?: BaseFetchOptions) {
        return (await this.getAll(options)).sort(fn);
    }

    public async map(
        fn: (value: Schema<V>, index: number, array: Array<Schema<V>>) => any,
        options?: BaseFetchOptions
    ) {
        return (await this.getAll(options)).map(fn);
    }

    public async reduce(
        fn: (
            previousValue: Schema<V>,
            currentValue: Schema<V>,
            currentIndex: number,
            array: Array<Schema<V>>
        ) => any,
        initialValue?: any,
        options?: BaseFetchOptions
    ) {
        return (await this.getAll(options)).reduce(fn, initialValue);
    }

    public async clone(options?: BaseFetchOptions) {
        return (await this.reduce(
            (p, { ID, data }) => ({ [ID]: data }),
            {},
            options
        )) as unknown as {
            [key: string]: V;
        };
    }

    public async findAndDelete(
        fn: (key: string, value: V) => boolean,
        options: BaseFetchOptions = {}
    ) {
        const datas = await this.getAll(options);
        let deleted = 0;

        for (const { ID, data } of datas) {
            if (fn(ID, data)) {
                await this.delete(ID);
                deleted++;
            }
        }

        return deleted;
    }

    public async findAndModify(
        fn: (key: string, value: V) => boolean,
        newValue: V,
        options: BaseFetchOptions = {}
    ) {
        const datas = await this.getAll(options);
        let modified = 0;

        for (const { ID, data } of datas) {
            if (fn(ID, data)) {
                await this.set(ID, newValue);
                modified++;
            }
        }

        return modified;
    }

    get state() {
        if (!this.connection || typeof this.connection.readyState !== 'number')
            return 'DISCONNECTED';
        switch (this.connection.readyState) {
            case 0:
                return 'DISCONNECTED';
            case 1:
                return 'CONNECTED';
            case 2:
                return 'CONNECTING';
            default:
                return 'DISCONNECTING';
        }
    }
}
