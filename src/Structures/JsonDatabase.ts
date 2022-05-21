import { BaseDatabase } from './BaseDatabase';
import { join, sep, extname } from 'path';
import { Utils as _ } from './Utils';
import { set, get, unset } from 'lodash';
import { mkdirSync, existsSync, unlinkSync } from 'fs';
import { DatabaseError } from './DatabaseError';
import type {
    BaseFetchOptions,
    BasePushOptions,
    BaseDeleteEachOptions,
    BaseMathOptions,
    Schema,
    Operators
} from '../Interfaces';

export interface JsonDatabaseOptions {
    space?: number;
    cache?: boolean;
    filePath: string;
    backup?: {
        enabled: boolean;
        backupInterval?: number;
        filePath?: string;
    };
}

export class JsonDatabase<V> extends BaseDatabase<V> {
    public options: JsonDatabaseOptions;
    private backupInterval: any = null;
    public constructor(
        options: JsonDatabaseOptions = {
            space: 4,
            cache: true,
            filePath: join(process.cwd(), 'database.json'),
            backup: {
                enabled: false
            }
        }
    ) {
        super();

        this.options = options;

        if (!this.options.filePath) throw new DatabaseError('Invalid file path!');
        if (!this.options.cache && this.options.cache !== false) this.options.cache = true;
        if (!this.options.backup) this.options.backup = { enabled: false };

        let resolvedFilePath = process.cwd();
        let resolvedBackupFilePath = process.cwd();

        this.options.filePath = this.options.filePath
            .replace('/', sep)
            .replace('\\', sep)
            .replace(process.cwd(), '');

        if (this.options.filePath.endsWith(sep)) this.options.filePath += 'database.json';
        if (extname(this.options.filePath) !== '.json') this.options.filePath += '.json';

        if (this.options.backup.enabled) {
            if (!this.options.backup.backupInterval) this.options.backup.backupInterval = 10800000;
            if (!this.options.backup.filePath) this.options.backup.filePath = 'backups';

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

        const paths = this.options.filePath.split(sep);

        for (const path of paths) {
            resolvedFilePath += `${sep}${path}`;

            if (!existsSync(resolvedFilePath) && extname(resolvedFilePath) !== '.json')
                mkdirSync(resolvedFilePath);
            else if (!existsSync(resolvedFilePath) && extname(resolvedFilePath) === '.json') {
                _.write<V>('json', resolvedFilePath, {}, this.options.space);
                break;
            }
        }

        this.options.filePath = resolvedFilePath;
        this.options = options;

        if (this.options.cache) this.cache = _.read('json', resolvedFilePath);

        if (this.options.backup!.enabled && this.options.backup!.filePath) {
            this.backupInterval = setInterval(() => {
                const createdAt = new Date();
                const createdAtString = `${
                    createdAt.getMonth() + 1
                }-${createdAt.getDate()}-${createdAt.getFullYear()} ${createdAt.getHours()}_${createdAt.getMinutes()}_${createdAt.getSeconds()}`;

                if (this.options.cache) {
                    _.write<V>(
                        'json',
                        join(this.options.backup!.filePath!, `${createdAtString}.json`),
                        this.cache,
                        this.options.space
                    );
                } else {
                    const file = _.read<V>('json', this.options.backup!.filePath!);

                    _.write<V>(
                        'json',
                        join(this.options.backup!.filePath!, `${createdAtString}.json`),
                        file,
                        this.options.space
                    );
                }
            }, this.options.backup!.backupInterval);
        }
    }

    public set(key: string, value: V): V {
        if (!key) throw new DatabaseError('Invalid key!');

        if (this.options.cache) {
            set(this.cache, key, value);
            _.write<V>('json', this.options.filePath, this.cache, this.options.space);
        } else {
            const file = _.read<V>('json', this.options.filePath);
            set(file, key, value);
            _.write<V>('json', this.options.filePath, file, this.options.space);
        }

        return value;
    }

    public get(key: string): V | null {
        if (!key) throw new DatabaseError('Invalid key!');

        if (this.options.cache) {
            return get(this.cache, key);
        } else {
            const file = _.read<V>('json', this.options.filePath);
            return get(file, key);
        }
    }

    public fetch(key: string) {
        if (!key) throw new DatabaseError('Invalid key!');

        return this.get(key);
    }

    public has(key: string) {
        if (!key) throw new DatabaseError('Invalid key!');

        return !!this.get(key);
    }

    public clear() {
        this.cache = {};
        return _.write<V>('json', this.options.filePath, {}, this.options.space);
    }

    public delete(key: string) {
        if (!key) throw new DatabaseError('Invalid key!');

        if (this.options.cache) {
            unset(this.cache, key);
            _.write<V>('json', this.options.filePath, this.cache, this.options.space);
        } else {
            const file = _.read<V>('json', this.options.filePath);
            unset(file, key);
            _.write<V>('json', this.options.filePath, file, this.options.space);
        }

        return;
    }

    public destroy() {
        if (this.options.backup!.enabled && this.options.backup!.filePath)
            clearInterval(this.backupInterval);
        this.cache = {};
        return unlinkSync(this.options.filePath);
    }

    public getAll(
        options: BaseFetchOptions = { force: true, cache: true }
    ): Array<{ ID: string; data: V }> {
        if (options.force) {
            const file = _.read<V>('json', this.options.filePath);

            if (options.cache && this.options.cache) this.cache = file;

            return Object.entries(file).map(([ID, data]) => {
                return { ID, data };
            });
        } else {
            return Object.entries(this.cache).map(([ID, data]) => {
                return { ID, data };
            });
        }
    }

    public fetchAll(options?: BaseFetchOptions) {
        return this.getAll(options);
    }

    public size(options?: BaseFetchOptions) {
        return this.getAll(options).length;
    }

    public keyArray(options?: BaseFetchOptions) {
        return this.getAll(options).map(({ ID }) => ID);
    }

    public valueArray(options?: BaseFetchOptions) {
        return this.getAll(options).map(({ data }) => data);
    }

    public push(
        key: string,
        values: V | Array<V>,
        options: BasePushOptions = { returnIfExists: false }
    ) {
        if (!key) throw new DatabaseError('Invalid key!');

        const array = (this.get(key) || []) as unknown as Array<V>;
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

        return this.set(key, array as any);
    }

    public pull(key: string, values: V | Array<V>) {
        if (!key) throw new DatabaseError('Invalid key!');

        const array = this.get(key);
        if (!Array.isArray(array)) return null;

        if (Array.isArray(values)) {
            for (const value of values) {
                array.splice(array.indexOf(value), 1);
            }
        } else {
            array.splice(array.indexOf(values), 1);
        }

        return this.set(key, array);
    }

    public type(key: string) {
        if (!key) throw new DatabaseError('Invalid key!');

        const data = this.get(key);
        if (!data) return null;
        return Array.isArray(data) ? 'array' : typeof data;
    }

    public math(
        key: string,
        operator: Operators,
        value: number,
        options: BaseMathOptions = { goToNegative: true }
    ) {
        if (!key) throw new DatabaseError('Invalid key!');
        if (isNaN(value)) throw new DatabaseError('Invalid value!');

        let data = this.get(key) || 0;
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

        return this.set(key, data as any);
    }

    public filter(
        fn: (value: Schema<V>, index: number, array: Array<Schema<V>>) => boolean,
        options?: BaseFetchOptions
    ) {
        return this.getAll(options).filter(fn);
    }

    public find(
        fn: (value: Schema<V>, index: number, array: Array<Schema<V>>) => boolean,
        options?: BaseFetchOptions
    ) {
        return this.getAll(options).find(fn);
    }

    public sort(fn: (a: Schema<V>, b: Schema<V>) => number, options?: BaseFetchOptions) {
        return this.getAll(options).sort(fn);
    }

    public map(
        fn: (value: Schema<V>, index: number, array: Array<Schema<V>>) => any,
        options?: BaseFetchOptions
    ) {
        return this.getAll(options).map(fn);
    }

    public reduce(
        fn: (
            previousValue: Schema<V>,
            currentValue: Schema<V>,
            currentIndex: number,
            array: Array<Schema<V>>
        ) => any,
        initialValue?: any,
        options?: BaseFetchOptions
    ) {
        return this.getAll(options).reduce(fn, initialValue);
    }

    public clone(options?: BaseFetchOptions) {
        return this.reduce((p, { ID, data }) => ({ [ID]: data }), {}, options) as unknown as {
            [key: string]: V;
        };
    }

    public deleteEach(key: string, options: BaseDeleteEachOptions & BaseFetchOptions = {}) {
        if (!key) throw new DatabaseError('Invalid key!');

        const datas = this.keyArray(options).filter((ID) => ID.includes(key), options);
        let deleted = 0;

        options.maxDeletedSize = options.maxDeletedSize ??= 0;

        for (const ID of datas) {
            if (options.maxDeletedSize === 0) {
                this.delete(ID);
                deleted++;
            } else {
                if (deleted >= options.maxDeletedSize) break;

                this.delete(ID);
                deleted++;
            }
        }

        return deleted;
    }

    public findAndDelete(
        fn: (key: string, value: V) => boolean,
        options: BaseDeleteEachOptions & BaseFetchOptions = {}
    ) {
        const datas = this.getAll(options);
        let deleted = 0;

        options.maxDeletedSize = options.maxDeletedSize ??= 0;

        for (const { ID, data } of datas) {
            if (fn(ID, data)) {
                if (options.maxDeletedSize === 0) {
                    this.delete(ID);
                    deleted++;
                } else {
                    if (deleted >= options.maxDeletedSize) break;

                    this.delete(ID);
                    deleted++;
                }
            }
        }

        return deleted;
    }
}
