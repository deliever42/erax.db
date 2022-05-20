import { BaseDatabase } from './BaseDatabase';
import { join, sep, extname } from 'path';
import { Utils as _ } from './Utils';
import { set, get, unset } from 'lodash';
import { mkdirSync, existsSync } from 'fs';
import { DatabaseError } from './DatabaseError';
import Database from 'better-sqlite3';
import type {
    BaseFetchOptions,
    BasePushOptions,
    BaseDeleteEachOptions,
    BaseMathOptions,
    Schema,
    Operators
} from '../Interfaces';

export interface SqliteDatabaseOptions {
    space?: number;
    cache?: boolean;
    filePath: string;
    tableName?: string;
    backup?: {
        enabled: boolean;
        backupInterval?: number;
        filePath?: string;
    };
}

export class SqliteDatabase<V> extends BaseDatabase<V> {
    public options: SqliteDatabaseOptions;
    public sql!: Database.Database;
    private backupInterval: any = null;
    public constructor(
        options: SqliteDatabaseOptions = {
            space: 4,
            cache: true,
            filePath: join(process.cwd(), 'database.db'),
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
        if (!this.options.tableName) this.options.tableName = 'EraxDB';

        let resolvedFilePath = process.cwd();
        let resolvedBackupFilePath = process.cwd();

        this.options.filePath = this.options.filePath
            .replace('/', sep)
            .replace('\\', sep)
            .replace(process.cwd(), '');

        if (this.options.filePath.endsWith(sep)) this.options.filePath += 'database.db';
        if (extname(this.options.filePath) !== '.db') this.options.filePath += '.db';

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

        const paths = this.options.filePath.split(sep);

        for (const path of paths) {
            resolvedFilePath += `${sep}${path}`;

            if (!existsSync(resolvedFilePath) && extname(resolvedFilePath) !== '.db')
                mkdirSync(resolvedFilePath);
            else if (!existsSync(resolvedFilePath) && extname(resolvedFilePath) === '.db') {
                this.sql = Database(resolvedFilePath);
                break;
            } else if (existsSync(resolvedFilePath) && extname(resolvedFilePath) === '.db') {
                this.sql = Database(resolvedFilePath);
                break;
            }
        }

        this.options.filePath = resolvedFilePath;
        this.options = options;

        this.sql
            .prepare(`CREATE TABLE IF NOT EXISTS ${this.options.tableName} (key TEXT, value TEXT)`)
            .run();

        this.sql.pragma('synchronous = OFF');
        this.sql.pragma('journal_mode = OFF');
        this.sql.pragma('locking_mode = EXCLUSIVE');

        if (this.options.cache) this.cache = this.clone();

        if (this.options.backup!.enabled && this.options.backup!.filePath) {
            this.backupInterval = setInterval(() => {
                const createdAt = new Date();
                const createdAtString = `${
                    createdAt.getMonth() + 1
                }-${createdAt.getDate()}-${createdAt.getFullYear()} ${createdAt.getHours()}_${createdAt.getMinutes()}_${createdAt.getSeconds()}`;

                const sql = new Database(
                    join(this.options.backup!.filePath!, `${createdAtString}.db`)
                );

                sql.prepare(
                    `CREATE TABLE IF NOT EXISTS ${this.options.tableName} (key TEXT, value TEXT)`
                ).run();

                sql.pragma('synchronous = OFF');
                sql.pragma('journal_mode = OFF');
                sql.pragma('locking_mode = EXCLUSIVE');

                if (this.options.cache) {
                } else {
                }
            }, this.options.backup!.backupInterval);
        }
    }

    public set(key: string, value: V | Array<V>): V | Array<V> {
        if (!key) throw new DatabaseError('Invalid key!');

        const parsedKey = key.split('.')[0];

        if (this.options.cache) {
            let data = get(this.cache, parsedKey);

            set(this.cache, key, value);

            if (data) {
                if (key.includes('.')) {
                    set(this.cache, parsedKey, data);
                    set(this.cache, key, value);

                    this.sql
                        .prepare(`UPDATE ${this.options.tableName} SET value = (?) WHERE key = (?)`)
                        .run(_.stringify('json', get(this.cache, parsedKey)), parsedKey);
                } else {
                    this.sql
                        .prepare(`UPDATE ${this.options.tableName} SET value = (?) WHERE key = (?)`)
                        .run(_.stringify('json', value), key);
                }
            } else {
                if (key.includes('.')) {
                    this.sql
                        .prepare(`INSERT INTO ${this.options.tableName} (key, value) VALUES (?, ?)`)
                        .run(parsedKey, _.stringify('json', get(this.cache, parsedKey)));
                } else {
                    this.sql
                        .prepare(`INSERT INTO ${this.options.tableName} (key, value) VALUES (?, ?)`)
                        .run(key, _.stringify('json', value));
                }
            }
        } else {
            let json = {};
            set(json, key, value);

            let data = this.sql
                .prepare(`SELECT * FROM ${this.options.tableName} WHERE key = (?)`)
                .get(parsedKey);

            if (data) {
                if (key.includes('.')) {
                    set(json, parsedKey, _.parse('json', data.value));
                    set(json, key, value);

                    this.sql
                        .prepare(`UPDATE ${this.options.tableName} SET value = (?) WHERE key = (?)`)
                        .run(_.stringify('json', get(json, parsedKey)), parsedKey);
                } else {
                    this.sql
                        .prepare(`UPDATE ${this.options.tableName} SET value = (?) WHERE key = (?)`)
                        .run(_.stringify('json', value), key);
                }
            } else {
                if (key.includes('.')) {
                    this.sql
                        .prepare(`INSERT INTO ${this.options.tableName} (key, value) VALUES (?, ?)`)
                        .run(parsedKey, _.stringify('json', get(json, parsedKey)));
                } else {
                    this.sql
                        .prepare(`INSERT INTO ${this.options.tableName} (key, value) VALUES (?, ?)`)
                        .run(key, _.stringify('json', value));
                }
            }

            json = {};
        }

        return value;
    }

    public get(key: string): V | V[] | null {
        if (!key) throw new DatabaseError('Invalid key!');

        if (this.options.cache) {
            return get(this.cache, key);
        } else {
            const parsedKey = key.split('.')[0];

            let data = this.sql
                .prepare(`SELECT * FROM ${this.options.tableName} WHERE key = (?)`)
                .get(parsedKey);
            if (!data) return null;

            if (key.includes('.')) {
                let json = {};

                set(json, parsedKey, _.parse('json', data.value));
                return get(json, key);
            } else {
                return _.parse('json', data.value);
            }
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
        this.sql.prepare(`DELETE FROM ${this.options.tableName}`).run();
        return;
    }

    public delete(key: string) {
        if (!key) throw new DatabaseError('Invalid key!');

        if (this.options.cache) {
            const data = this.get(key);
            if (!data) return null;

            unset(this.cache, key);

            if (key.includes('.')) {
                const parsedKey = key.split('.')[0];
                this.set(parsedKey, get(this.cache, parsedKey));
            } else {
                this.sql.prepare(`DELETE FROM ${this.options.tableName} WHERE key = (?)`).run(key);
            }
        } else {
            if (key.includes('.')) {
                const parsedKey = key.split('.')[0];
                let json = {};

                let data = this.sql
                    .prepare(`SELECT * FROM ${this.options.tableName} WHERE key = (?)`)
                    .get(parsedKey);
                if (!data) return null;

                set(json, parsedKey, _.parse('json', data.value));
                unset(json, key);
                this.set(parsedKey, get(json, parsedKey));
                json = {};
            } else {
                this.sql.prepare(`DELETE FROM ${this.options.tableName} WHERE key = (?)`).run(key);
            }
        }

        return;
    }

    public destroy() {
        if (this.options.backup!.enabled && this.options.backup!.filePath)
            clearInterval(this.backupInterval);
        this.cache = {};
        this.sql.prepare(`DROP TABLE IF EXISTS ${this.options.tableName}`).run();
        return;
    }

    public getAll(
        options: BaseFetchOptions = { force: true, cache: true }
    ): Array<{ ID: string; data: V }> {
        if (options.force) {
            const file = this.sql
                .prepare(`SELECT * FROM ${this.options.tableName}`)
                .iterate() as unknown as any[];

            const allArray = [...file].map(({ key, value }) => {
                return { ID: key, data: _.parse('json', value) };
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

    public findAndDelete(fn: (key: string, value: V) => boolean) {
        const file = _.read<V>('bson', this.options.filePath);

        for (const [key, value] of Object.entries(file)) {
            if (fn(key, value)) this.delete(key);
        }
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

        return this.set(key, array);
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
        fn: (
            previousValue: Schema<V>,
            currentValue: Schema<V>,
            currentIndex: number,
            array: Array<Schema<V>>
        ) => any,
        options?: BaseFetchOptions
    ) {
        return this.getAll(options).reduce(fn);
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
}
