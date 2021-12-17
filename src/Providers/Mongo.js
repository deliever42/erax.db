const { mkdirSync, writeFileSync } = require('fs');
const DatabaseError = require('../Utils/DatabaseError');
const { sep } = require('path');
const {
    parseKey,
    checkFile,
    isString,
    isNumber,
    isObject,
    write,
    read,
    set,
    get,
    unset,
    pull
} = require('../Utils/Util');
const { red, gray, blue } = require('../Utils/ColorStyles');
const { EventEmitter } = require('events');

/**
 *
 * @class MongoDatabase
 */
module.exports = class MongoDatabase extends EventEmitter {
    /**
     *
     * @static
     * @type {string[]}
     */
    static DBCollection = [];

    /**
     *
     * @constructor
     * @param {{ mongoURL: string, seperator?: string, modelName?: string, mongoOptions?: object }} options
     */
    constructor(options) {
        super();
        this.mongoose;

        try {
            this.mongoose = require('mongoose');
        } catch {
            throw new DatabaseError('Please install module mongoose (npm install mongoose)');
        }

        if (
            !options ||
            (options &&
                (options.mongoURL === null ||
                    options.mongoURL === undefined ||
                    options.mongoURL === ''))
        )
            throw new DatabaseError('Please specify a MongoDB URL.');
        if (!isString(options.mongoURL)) throw new DatabaseError('MongoDB URL must be string!');

        let seperator;
        if (
            !options ||
            (options &&
                (options.seperator === null ||
                    options.seperator === undefined ||
                    options.seperator === ''))
        )
            seperator = '.';
        else if (options && options.seperator) seperator = options.seperator;

        if (!isString(seperator)) throw new DatabaseError('Seperator must be string!');

        let modelName;
        if (
            !options ||
            (options &&
                (options.modelName === null ||
                    options.modelName === undefined ||
                    options.modelName === ''))
        )
            modelName = 'Erax_MONGODB';
        else if (options && options.modelName) modelName = options.modelName;

        if (!isString(modelName)) throw new DatabaseError('Model Name must be string!');

        let mongoOptions;
        if (
            !options ||
            (options &&
                (options.mongoOptions === null ||
                    options.mongoOptions === undefined ||
                    options.mongoOptions === ''))
        )
            mongoOptions = {};
        else if (options && options.mongoOptions) mongoOptions = options.mongoOptions;

        if (!isObject(mongoOptions)) throw new DatabaseError('Mongo Options must be object!');

        if (!options.mongoURL.match(/^mongodb([a-z+]{0,15})?.+/g))
            throw new DatabaseError('Invalid MongoDB URL!');

        this.url = options.mongoURL;
        this.dbName = this.url.split('mongodb.net/').pop().split('?')[0];
        this.sep = seperator;
        this.mongoOptions = mongoOptions;

        this.connection = this.mongoose.createConnection(this.url, {
            ...mongoOptions
        });

        this.mongo = require('../Mongo/Schema')(this.connection, modelName);

        this.connection.on('open', () => {
            this.emit('ready', 'Connected to MongoDB!');
        });

        if (!MongoDatabase.DBCollection.includes(this.dbName)) {
            MongoDatabase.DBCollection.push(this.dbName);
        }
    }

    /**
     * @param  {any} args
     * @example db.ready(() => console.log("Connected to MongoDB!"))
     * @returns {void}
     */
    ready(...args) {
        return this.on('ready', ...args);
    }

    /**
     *
     * @param {string} key
     * @param {any} value
     * @example await db.set("key", "value");
     * @returns {Promise<any>}
     */
    async set(key, value) {
        if (key === '' || key === null || key === undefined)
            throw new DatabaseError('Please specify a key.');
        if (!isString(key)) throw new DatabaseError('Key must be string!');
        if (value === '' || value === null || value === undefined)
            throw new DatabaseError('Please specify a value.');

        let parsedKey = parseKey(key, this.sep);
        let data = await this.mongo.findOne({ key: parsedKey });
        let json = {};
        let parseds = {};

        if (!data) {
            set(json, key, value, this.sep);
            parseds.key = parsedKey;
            parseds.value = json[parseds.key];
            await this.mongo.create({ key: parseds.key, value: parseds.value });
        } else {
            set(json, parsedKey, data.value, this.sep);
            set(json, key, value, this.sep);
            parseds.key = parsedKey;
            parseds.value = json[parseds.key];
            await this.mongo.updateOne({ key: parseds.key }, { value: parseds.value });
        }

        json = {};
        return value;
    }

    /**
     *
     * @param {string} key
     * @example await db.has("key");
     * @returns {Promise<boolean>}
     */
    async has(key) {
        return (await this.get(key)) ? true : false;
    }

    /**
     *
     * @example await db.deleteAll();
     * @returns {Promise<boolean>}
     */
    async deleteAll() {
        await this.mongo.deleteMany({});
        return true;
    }

    /**
     *
     * @param {string} key
     * @example await db.fetch("key");
     * @returns {Promise<any>}
     */
    async fetch(key) {
        if (key === '' || key === null || key === undefined)
            throw new DatabaseError('Please specify a key.');
        if (!isString(key)) throw new DatabaseError('Key must be string!');
        let parsedKey = parseKey(key, this.sep);
        let json = {};

        let data = await this.mongo.findOne({ key: parsedKey });
        if (!data) return null;

        let value = await data.get('value');

        set(json, parsedKey, value, this.sep);
        let parsedValue = get(json, key, this.sep);
        json = {};
        return parsedValue;
    }

    /**
     *
     * @param {string} key
     * @example await db.get("key");
     * @returns {Promise<any>}
     */
    async get(key) {
        return await this.fetch(key);
    }

    /**
     *
     * @param {string} key
     * @example await db.type("key");
     * @returns {Promise<"array" | "string" | "number" | "boolean" | "symbol" | "function" | "object" | "null" | "undefined" | "bigint">}
     */
    async type(key) {
        if (this.has(key) === false) return null;
        if (Array.isArray(await this.get(key))) return 'array';
        return typeof (await this.get(key));
    }

    /**
     *
     * @param {string} key
     * @example await db.delete("key");
     * @returns {Promise<boolean>}
     */
    async delete(key) {
        if (key === '' || key === null || key === undefined)
            throw new DatabaseError('Please specify a key.');
        if (!isString(key)) throw new DatabaseError('Key must be string!');

        let parsedKey = parseKey(key, this.sep);
        let json = {};

        let data = await this.mongo.findOne({ key: parsedKey });
        if (!data || !(await this.has(key))) return null;

        let value = await data.get('value');

        set(json, parsedKey, value, this.sep);
        unset(json, key, this.sep);

        let parsedValue = get(json, parsedKey, this.sep);

        if (!parsedValue) await this.mongo.deleteOne({ key: parsedKey });
        else await this.set(parsedKey, parsedValue);

        json = {};

        return true;
    }

    /**
     *
     * @example await db.fetchAll();
     * @returns {Promise<{ ID: string, data: any }[]>}
     */
    async fetchAll() {
        return await this.all();
    }

    /**
     *
     * @example await db.all();
     * @returns {Promise<{ ID: string, data: any }[]>}
     */
    async all() {
        let arr = [];

        await this.mongo.find().then(async (data) => {
            data.forEach(async (obj) => {
                let key = await obj.key;
                let value = await obj.value;

                const data = {
                    ID: key,
                    data: value
                };
                arr.push(data);
            });
        });

        return arr;
    }

    /**
     *
     * @param {string} key
     * @param {"+" | "-" | "*" | "/" | "%"} operator
     * @param {number} value
     * @param {boolean} [goToNegative]
     * @example await db.math("key", "+", 1);
     * @returns {Promise<number>}
     */
    async math(key, operator, value, goToNegative = false) {
        if (operator === null || operator === undefined || operator === '')
            throw new DatabaseError('Please specify a operator. (-  +  *  /  %)');
        if (value === null || value === undefined || value === '')
            throw new DatabaseError('Please specify a value.');
        if (!isNumber(value)) throw new DatabaseError(`Value must be number!`);

        value = Number(value);

        if (this.has(key) === false) return await this.set(key, value);
        let data = await this.get(key);

        switch (operator) {
            case '+':
            case 'add':
            case 'addition':
                data += value;
                break;
            case '-':
            case 'subtract':
            case 'subtraction':
            case 'subtr':
            case 'sub':
            case 'substr':
                data -= value;
                if (goToNegative === false && data < 1) data = Number('0');
                break;
            case '*':
            case 'multiplication':
            case 'multiple':
            case 'mult':
            case 'multip':
                data *= value;
                break;
            case 'division':
            case 'div':
            case '/':
                data /= value;
                if (goToNegative === false && data < 1) data = Number('0');
                break;
            case '%':
            case 'percentage':
            case 'percent':
                data %= value;
                break;
            default:
                throw new DatabaseError('Invalid Operator! (-  +  *  /  %)');
        }

        return await this.set(key, data);
    }

    /**
     *
     * @param {string} key
     * @param {number} value
     * @example await db.add("key", 1);
     * @returns {Promise<number>}
     */
    async add(key, value) {
        return await this.math(key, '+', value);
    }

    /**
     *
     * @param {string} key
     * @param {number} value
     * @param {boolean} [goToNegative]
     * @returns {Promise<number>}
     * @example await db.subtract("key", 1);
     */
    async subtract(key, value, goToNegative = false) {
        return await this.math(key, '-', value, goToNegative);
    }

    /**
     *
     * @example await db.info();
     * @returns {Promise<{ Version: number, DatabaseName: string, DataSize: number, DatabaseType: "mongo" }>}
     */
    async info() {
        let p = require('../../package.json');

        return {
            Version: p.version,
            DatabaseName: this.dbName,
            DataSize: await this.size(),
            DatabaseType: 'mongo'
        };
    }

    /**
     *
     * @param {string} value
     * @example await db.startsWith("key");
     * @returns {Promise<{ ID: string, data: any }[]>}
     */
    async startsWith(value) {
        if (value === '' || value === null || value === undefined)
            throw new DatabaseError('Please specify a value.');
        return await this.filter((x) => x.ID.startsWith(value));
    }

    /**
     *
     * @param {string} value
     * @example await db.endsWith("key");
     * @returns {Promise<{ ID: string, data: any }[]>}
     */
    async endsWith(value) {
        if (value === '' || value === null || value === undefined)
            throw new DatabaseError('Please specify a value.');
        return await this.filter((x) => x.ID.endsWith(value));
    }

    /**
     *
     * @param {string} value
     * @example await db.includes("key");
     * @returns {Promise<{ ID: string, data: any }[]>}
     */
    async includes(value) {
        if (value === '' || value === null || value === undefined)
            throw new DatabaseError('Please specify a value.');
        return await this.filter((x) => x.ID.includes(value));
    }

    /**
     *
     * @param {string} value
     * @param {number} [maxDeletedSize]
     * @example await db.deleteEach("key");
     * @returns {Promise<number>}
     */
    async deleteEach(value, maxDeletedSize = 0) {
        if (value === '' || value === null || value === undefined)
            throw new DatabaseError('Please specify a value.');

        let deleted = 0;
        maxDeletedSize = Number(maxDeletedSize);

        maxDeletedSize === null ? maxDeletedSize === 0 : maxDeletedSize === maxDeletedSize;
        maxDeletedSize === undefined ? maxDeletedSize === 0 : maxDeletedSize === maxDeletedSize;
        maxDeletedSize === '' ? maxDeletedSize === 0 : maxDeletedSize === maxDeletedSize;

        const all = await this.all();

        all.forEach(async ({ ID }) => {
            if (!ID.includes(value)) return;

            if (maxDeletedSize === 0) {
                await this.delete(ID);
                deleted++;
            } else {
                if (deleted < maxDeletedSize) {
                    await this.delete(ID);
                    deleted++;
                }
            }
        });

        return deleted;
    }

    /**
     *
     * @param {(element: { ID: string, data: any }) => any} callback
     * @example await db.filter((element) => element.ID.startsWith("key"));
     * @returns {Promise<{ ID: string, data: any }[]>}
     */
    async filter(callback) {
        const all = await this.all();
        return all.filter(callback);
    }

    /**
     *
     * @param {(element: { ID: string, data: any }) => any} callback
     * @example await db.map((element) => element.ID);
     * @returns {any[]}
     */
    async map(callback) {
        const all = await this.all();
        return all.map(callback);
    }

    /**
     *
     * @param {(a: { ID: string, data: any }, b: { ID: string, data: any }) => any} callback
     * @example await db.reduce((a, b) => a + b);
     * @returns {Promise<any[]>}
     */
    async reduce(callback) {
        const all = await this.all();
        return all.reduce(callback);
    }

    /**
     *
     * @param {string} key
     * @param {any} value
     * @param {boolean} [valueIgnoreIfPresent]
     * @param {boolean} [multiple]
     * @example await db.push("key", "value");
     * @returns {Promise<any[]>}
     */
    async push(key, value, valueIgnoreIfPresent = false, multiple = false) {
        let filteredValue = Array.isArray(value) ? value : [value];
        let array = await this.get(key);

        if ((await this.has(key)) === false) return await this.set(key, filteredValue);
        if ((await this.arrayHas(key)) === false)
            return console.log(
                `${blue('EraxDB')} => ${red('Error:')} ${gray(
                    'The type of data you specify must be array!'
                )}`
            );

        if (Array.isArray(value) && multiple === true) {
            for (let item of value) {
                if (valueIgnoreIfPresent === true) {
                    if (!(await this.arrayHasValue(key, item))) array.push(item);
                } else array.push(item);
            }
        } else {
            if (valueIgnoreIfPresent === true) {
                if (!(await this.arrayHasValue(key, value))) array.push(value);
            } else array.push(value);
        }

        return await this.set(key, array);
    }

    /**
     *
     * @param {string} key
     * @example await db.arrayHas("key");
     * @returns {Promise<boolean>}
     */
    async arrayHas(key) {
        if (!key || key === '') throw new DatabaseError('Please specify a key.');
        let value = await this.get(key);
        if (Array.isArray(await value)) return true;
        return false;
    }

    /**
     *
     * @param {string} key
     * @param {any} value
     * @example await db.arrayHasValue("key", "value");
     * @returns {Promise<boolean>}
     *
     */
    async arrayHasValue(key, value) {
        if ((await this.has(key)) === false) return null;
        if ((await this.arrayHas(key)) === false)
            return console.log(
                `${blue('EraxDB')} => ${red('Error:')} ${gray(
                    'The type of data you specify must be array!'
                )}`
            );
        let datavalue = await this.get(key);
        if ((await datavalue.indexOf(value)) > -1) return true;
        return false;
    }

    /**
     *
     * @param {string} key
     * @param {any} value
     * @param {boolean} [multiple]
     * @example await db.pull("key", "value");
     * @returns {Promise<any[]>}
     */
    async pull(key, value, multiple = false) {
        let array = await this.get(key);

        if ((await this.has(key)) === false) return null;
        if ((await this.arrayHas(key)) === false)
            return console.log(
                `${blue('EraxDB')} => ${red('Error:')} ${gray(
                    'The type of data you specify must be array!'
                )}`
            );

        if (Array.isArray(value) && multiple === true) {
            value.forEach((item) => {
                pull(array, item);
            });
        } else {
            pull(array, value);
        }

        return await this.set(key, array);
    }

    /**
     *
     * @example await db.size();
     * @returns {Promise<number>}
     */
    async size() {
        const all = await this.all();
        return all.length;
    }

    /**
     *
     * @example await db.keyArray();
     * @returns {Promise<string[]>}
     */
    async keyArray() {
        const arr = await this.map((element) => element.ID);
        return arr;
    }

    /**
     *
     * @example await db.valueArray();
     * @returns {Promise<any[]>}
     */
    async valueArray() {
        const arr = await this.map((element) => element.data);
        return arr;
    }

    /**
     *
     * @param {string} path
     * @example await db.import("database.json");
     * @returns {Promise<boolean>}
     */
    async import(path = 'database.json') {
        let processFolder = process.cwd();
        let databasePath = path;

        if (!databasePath.endsWith('.json')) {
            databasePath += '.json';
        }

        databasePath = databasePath.replace(processFolder, '').replace('/', sep).replace('\\', sep);

        if (databasePath.startsWith(sep)) {
            databasePath = databasePath.slice(1);
        }

        if (!checkFile(`${processFolder}${sep}${databasePath}`)) return null;

        let file = read(`${processFolder}${sep}${databasePath}`);

        Object.entries(file).forEach(async (entry) => {
            let [key, value] = entry;
            await this.set(key, value);
        });
        return true;
    }

    /**
     *
     * @param {string} path
     * @example await db.export("database.json");
     * @returns {Promise<boolean>}
     */
    async export(path = 'database.json') {
        let processFolder = process.cwd();
        let databasePath = path;

        if (databasePath.endsWith(sep)) {
            databasePath += 'database.json';
        } else {
            if (!databasePath.endsWith('.json')) {
                databasePath += '.json';
            }
        }

        databasePath = databasePath.replace(processFolder, '').replace('/', sep).replace('\\', sep);

        if (databasePath.startsWith(sep)) {
            databasePath = databasePath.slice(1);
        }

        let dirs = databasePath.split(sep);
        let dbName = '';
        let dirNames = '';

        for (let dir of dirs) {
            if (!dir.endsWith('.json')) {
                dirNames += `${dir}${sep}`;
                if (!checkFile(`${processFolder}${sep}${dirNames}`)) {
                    mkdirSync(`${processFolder}${sep}${dirNames}`);
                }
            } else {
                dbName = `${dir}`;

                if (!checkFile(`${processFolder}${sep}${dirNames}${dbName}`)) {
                    writeFileSync(`${processFolder}${sep}${dirNames}${dbName}`, '{}');
                }
            }
        }

        const all = await this.all();
        let dbPath = `${processFolder}${sep}${dirNames}${dbName}`;
        let json = {};

        all.forEach(async ({ ID, data }) => {
            json[ID] = data;
        });

        write(dbPath, json);

        json = {};
        return true;
    }

    /**
     *
     * @example db.DBCollectionSize();
     * @returns {number}
     */
    DBCollectionSize() {
        return MongoDatabase.DBCollection.length;
    }

    /**
     *
     * @example db.getDBName();
     * @returns {string}
     */
    getDBName() {
        return this.dbName;
    }

    /**
     *
     * @param {(element: { ID: string, data: any }) => any} callback
     * @param {number} [maxDeletedSize]
     * @example await db.findAndDelete((element) => element.ID.includes("test"));
     * @returns {Promise<number>}
     */
    async findAndDelete(callback, maxDeletedSize = 0) {
        let deleted = 0;
        maxDeletedSize = Number(maxDeletedSize);

        maxDeletedSize === null ? maxDeletedSize === 0 : maxDeletedSize === maxDeletedSize;
        maxDeletedSize === undefined ? maxDeletedSize === 0 : maxDeletedSize === maxDeletedSize;
        maxDeletedSize === '' ? maxDeletedSize === 0 : maxDeletedSize === maxDeletedSize;

        const all = await this.filter(callback);

        all.forEach(async ({ ID }) => {
            if (maxDeletedSize === 0) {
                await this.delete(ID);
                deleted++;
            } else {
                if (deleted < maxDeletedSize) {
                    await this.delete(ID);
                    deleted++;
                }
            }
        });

        return deleted;
    }

    /**
     *
     * @example await db.toJSON();
     * @returns {Promise<{ [key: string]: any }>}
     */
    async toJSON() {
        let obj = {};

        return obj;
    }

    /**
     * @example db.state;
     * @returns {"CONNECTING" | "CONNECTED" | "DISCONNECTING" | "DISCONNECTED"}
     */
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
            case 3:
                return 'DISCONNECTING';
        }
    }

    /**
     *
     * @example db.disconnect;
     * @returns {Promise<void>}
     */
    get disconnect() {
        return this.connection.close(true);
    }

    /**
     * @example db.connect;
     * @returns {void}
     */
    get connect() {
        this.connection = this.mongoose.createConnection(this.url, {
            ...this.mongoOptions
        });

        this.mongo = require('../Mongo/Schema')(this.connection, modelName);

        this.connection.on('open', () => {
            this.emit('ready', 'Connected to MongoDB!');
        });
        return;
    }

    /**
     * @example db.getURL;
     * @returns {string}
     */
    get getURL() {
        return this.url;
    }

    /**
     *
     * @param {(a: { ID: string, data: any }, b: { ID: string, data: any }) => any} callback
     * @example db.short((a, b) => b.data - a.data);
     * @returns {Promise<any>}
     */
    async short(callback) {
        const all = await this.all();
        return all.short(callback);
    }
};