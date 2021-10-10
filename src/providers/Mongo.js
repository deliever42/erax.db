const mongoose = require("mongoose");
const { mkdirSync, writeFileSync } = require("fs");
const ErrorManager = require("../utils/ErrorManager");
const { sep } = require("path");
const chalk = require("chalk");
const { parseKey, checkFile, isString, isNumber, write, read } = require("../utils/Util");
const { set, get, unset } = require("lodash");

/**
 *
 * @class MongoDatabase
 */
module.exports = class MongoDatabase {
    /**
     *
     * @static
     * @type {string[]}
     */
    static DBCollection = [];

    /**
     *
     * @constructor
     * @param {{ mongoURL: string }} options
     */
    constructor(options = {}) {
        if (
            !options ||
            (options &&
                (options.mongoURL === null ||
                    options.mongoURL === undefined ||
                    options.mongoURL === ""))
        )
            throw new ErrorManager("Please specify a MongoDB URL.");
        if (!isString(mongoURL)) throw new ErrorManager("MongoDB URL must be string!");
        if (!options.mongoURL.match(/^mongodb([a-z+]{0,15})?.+/g))
            throw new ErrorManager("Invalid MongoDB URL!");

        this.url = options.mongoURL;
        this.dbName = this.url.split("mongodb.net/").pop().split("?")[0];

        mongoose.connect(this.url, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true,
            useFindAndModify: false
        });

        const Schema = new mongoose.Schema({
            key: {
                type: mongoose.Schema.Types.String,
                unique: true,
                required: true
            },
            value: {
                type: mongoose.Schema.Types.Mixed,
                unique: true,
                required: true
            }
        });

        this.mongo = mongoose.models.EraxDB || mongoose.model("EraxDB", Schema);

        if (!MongoDatabase.DBCollection.includes(this.dbName)) {
            MongoDatabase.DBCollection.push(this.dbName);
        }
    }

    /**
     *
     * @param {string} key
     * @param {any} value
     * @example await db.set("key", "value");
     * @returns {Promise<any>}
     */
    async set(key, value) {
        if (key === "" || key === null || key === undefined)
            throw new ErrorManager("Please specify a key.");
        if (!isString(key)) throw new ErrorManager("Key must be string!");
        if (value === "" || value === null || value === undefined)
            throw new ErrorManager("Please specify a value.");

        let parsedKey = parseKey(key);
        let data = await this.mongo.findOne({ key: parsedKey });
        let json = {};
        let parseds = {};

        if (!data) {
            set(json, key, value);
            parseds.key = parseKey(key);
            parseds.value = json[parseds.key];
            await this.mongo.create({ key: parseds.key, value: parseds.value });
        } else {
            set(json, parsedKey, parseds.value);
            set(json, key, value);
            parseds.key = parseKey(key);
            parseds.value = json[parseds.key];
            await this.mongo.updateOne({ key: parseds.key }, { value: parseds.value });
        }

        json = {};
        return parsedValue;
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
        if (key === "" || key === null || key === undefined)
            throw new ErrorManager("Please specify a key.");
        if (!isString(key)) throw new ErrorManager("Key must be string!");
        let parsedKey = parseKey(key);
        let json = {};

        let data = await this.mongo.findOne({ key: parsedKey });
        if (!data) return null;

        let value = await data.get("value");

        set(json, parsedKey, value);
        let parsedValue = get(json, key) ? get(json, key) : null;
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
        if (Array.isArray(await this.get(key))) return "array";
        return typeof (await this.get(key));
    }

    /**
     *
     * @param {string} key
     * @example await db.delete("key");
     * @returns {Promise<boolean>}
     */
    async delete(key) {
        if (key === "" || key === null || key === undefined)
            throw new ErrorManager("Please specify a key.");
        if (!isString(key)) throw new ErrorManager("Key must be string!");

        let parsedKey = parseKey(key);
        let json = {};

        let data = await this.mongo.findOne({ key: parsedKey });
        if (!data || !(await this.has(key))) return null;

        let value = await data.get("value");

        set(json, parsedKey, value);
        unset(json, key);

        let parsedValue = get(json, parsedKey);

        await this.set(parsedKey, parsedValue);
        json = {};

        return true;
    }

    /**
     *
     * @example await db.fetchAll();
     * @returns {Promise<{ ID: string, data: any }[]>}
     */
    async fetchAll() {
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
        if (operator === null || operator === undefined || operator === "")
            throw new ErrorManager("Please specify a operator. (-  +  *  /  %)");
        if (value === null || value === undefined || value === "")
            throw new ErrorManager("Please specify a value.");
        if (!isNumber(value)) throw new ErrorManager(`Value must be number!`);

        value = Number(value);

        if (this.has(key) === false) return await this.set(key, value);
        let data = await this.get(key);

        switch (operator) {
            case "+":
            case "add":
            case "addition":
                data += value;
                break;
            case "-":
            case "subtract":
            case "subtraction":
            case "subtr":
            case "sub":
            case "substr":
                data -= value;
                if (goToNegative === false && data < 1) data = Number("0");
                break;
            case "*":
            case "multiplication":
                data *= value;
                break;
            case "division":
            case "div":
            case "/":
                data /= value;
                if (goToNegative === false && data < 1) data = Number("0");
                break;
            case "%":
            case "percentage":
            case "percent":
                data %= value;
                break;
            default:
                throw new ErrorManager("Invalid Operator! (-  +  *  /  %)");
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
        return await this.math(key, "+", value);
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
        return await this.math(key, "-", value, goToNegative);
    }

    /**
     *
     * @example await db.info();
     * @returns {Promise<{ Sürüm: number, DatabaseAdı: string, ToplamVeriSayısı: number, DatabaseTürü: "mongo" }>}
     */
    async info() {
        let p = require("../../package.json");

        return {
            Sürüm: p.version,
            DatabaseAdı: this.dbName,
            ToplamVeriSayısı: await this.size(),
            DatabaseTürü: "mongo"
        };
    }

    /**
     *
     * @param {string} value
     * @example await db.startsWith("key");
     * @returns {Promise<{ ID: string, data: any }[]>}
     */
    async startsWith(value) {
        if (value === "" || value === null || value === undefined)
            throw new ErrorManager("Please specify a value.");
        return await this.filter((x) => x.ID.startsWith(value));
    }

    /**
     *
     * @param {string} value
     * @example await db.endsWith("key");
     * @returns {Promise<{ ID: string, data: any }[]>}
     */
    async endsWith(value) {
        if (value === "" || value === null || value === undefined)
            throw new ErrorManager("Please specify a value.");
        return await this.filter((x) => x.ID.endsWith(value));
    }

    /**
     *
     * @param {string} value
     * @example await db.includes("key");
     * @returns {Promise<{ ID: string, data: any }[]>}
     */
    async includes(value) {
        if (value === "" || value === null || value === undefined)
            throw new ErrorManager("Please specify a value.");
        return await this.filter((x) => x.ID.includes(value));
    }

    /**
     *
     * @param {string} value
     * @param {number} [maxDeletedSize]
     * @example await db.deleteEach("key");
     * @returns {Promise<boolean>}
     */
    async deleteEach(value, maxDeletedSize = 0) {
        if (value === "" || value === null || value === undefined)
            throw new ErrorManager("Please specify a value.");

        let deleted = 0;
        maxDeletedSize = Number(maxDeletedSize);

        maxDeletedSize === null ? maxDeletedSize === 0 : maxDeletedSize === maxDeletedSize;
        maxDeletedSize === undefined ? maxDeletedSize === 0 : maxDeletedSize === maxDeletedSize;
        maxDeletedSize === "" ? maxDeletedSize === 0 : maxDeletedSize === maxDeletedSize;

        await this.mongo.find().then(async (data) => {
            data.forEach(async (obj) => {
                let key = await obj.key;
                let dval = await obj.value;
                if (!key.includes(value)) return;

                if (maxDeletedSize === 0) {
                    await this.mongo.deleteOne({ key: key }, { value: dval });
                    deleted++;
                } else {
                    if (deleted < maxDeletedSize) {
                        await this.mongo.deleteOne({ key: key }, { value: dval });
                        deleted++;
                    }
                }
            });
        });

        return deleted;
    }

    /**
     *
     * @param {(element: { ID: string, data: any }) => boolean} callback
     * @example await db.filter((element) => element.ID.startsWith("key"));
     * @returns {Promise<{ ID: string, data: any }[]>}
     */
    async filter(callback) {
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

        return arr.filter(callback);
    }

    /**
     *
     * @param {(element: { ID: string, data: any }) => boolean} callback
     * @example await db.map((element) => element.ID);
     * @returns {any[]}
     */
    async map(callback) {
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

        return arr.map(callback);
    }

    /**
     *
     * @param {(a: { ID: string, data: any }, b: { ID: string, data: any }) => boolean} callback
     * @example await db.reduce((a, b) => a + b);
     * @returns {Promise<any[]>}
     */
    async reduce(callback) {
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

        return arr.reduce(callback);
    }

    /**
     *
     * @param {string} key
     * @param {any} value
     * @param {boolean} [valueIgnoreIfPresent]
     * @example await db.push("key", "value");
     * @returns {Promise<any[]>}
     */
    async push(key, value, valueIgnoreIfPresent = true) {
        if ((await this.has(key)) === false) return await this.set(key, [value]);
        else if ((await this.arrayHas(key)) === true && (await this.has(key)) === true) {
            let newval = await this.get(key);
            if (newval.includes(value) && valueIgnoreIfPresent === true)
                return console.log(
                    `${chalk.blue("EraxDB")} => ${chalk.red("Error:")} ${chalk.gray(
                        "Data was not pushed because the conditions were not suitable."
                    )}`
                );
            newval.push(value);
            return await this.set(key, newval);
        } else {
            return console.log(
                `${chalk.blue("EraxDB")} => ${chalk.red("Error:")} ${chalk.gray(
                    "Data was not pushed because the conditions were not suitable."
                )}`
            );
        }
    }

    /**
     *
     * @param {string} key
     * @example await db.arrayHas("key");
     * @returns {Promise<boolean>}
     */
    async arrayHas(key) {
        if (!key || key === "") throw new ErrorManager("Please specify a key.");
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
                `${chalk.blue("EraxDB")} => ${chalk.red("Error:")} ${chalk.gray(
                    "The type of data you specify must be array!"
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
     * @example await db.pull("key", "value");
     * @returns {Promise<any[]>}
     */
    async pull(key, value) {
        if (this.has(key) === false) return null;
        if (this.arrayHas(key) === false)
            return console.log(
                `${chalk.blue("EraxDB")} => ${chalk.red("Error:")} ${chalk.gray(
                    "The type of data you specify must be array!"
                )}`
            );

        if ((await this.arrayHasValue(key, value)) === false)
            return console.log(
                `${chalk.blue("EraxDB")} => ${chalk.red("Error:")} ${chalk.gray(
                    "The value you specified is not in the array of the data you specified."
                )}`
            );

        let oldArr = await this.get(key);
        let newArr = oldArr.filter((x) => x !== value);

        return await this.set(key, newArr);
    }

    /**
     *
     * @example await db.size();
     * @returns {Promise<number>}
     */
    async size() {
        let arr = [];

        await this.mongo.find().then(async (data) => {
            data.forEach(async (obj) => {
                let key = await obj.key;
                arr.push(key);
            });
        });

        return arr.length;
    }

    /**
     *
     * @example await db.keyArray();
     * @returns {Promise<string[]>}
     */
    async keyArray() {
        let arr = [];

        await this.mongo.find().then(async (data) => {
            data.forEach(async (obj) => {
                let key = await obj.key;
                arr.push(key);
            });
        });

        return arr;
    }

    /**
     *
     * @example await db.valueArray();
     * @returns {Promise<any[]>}
     */
    async valueArray() {
        let arr = [];

        await this.mongo.find().then(async (data) => {
            data.forEach(async (obj) => {
                let value = await obj.value;
                arr.push(value);
            });
        });

        return arr;
    }

    /**
     *
     * @param {string} path
     * @example await db.import("database.json");
     * @returns {Promise<boolean>}
     */
    async import(path = "database.json") {
        let processFolder = process.cwd();
        let databasePath = path;

        if (!databasePath.endsWith(".json")) {
            databasePath += ".json";
        }

        databasePath = databasePath.replace(processFolder, "").replace("/", sep).replace("\\", sep);

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
    async export(path = "database.json") {
        let processFolder = process.cwd();
        let databasePath = path;

        if (databasePath.endsWith(sep)) {
            databasePath += "database.json";
        } else {
            if (!databasePath.endsWith(".json")) {
                databasePath += ".json";
            }
        }

        databasePath = databasePath.replace(processFolder, "").replace("/", sep).replace("\\", sep);

        if (databasePath.startsWith(sep)) {
            databasePath = databasePath.slice(1);
        }

        let dirs = databasePath.split(sep);
        let dbName = "";
        let dirNames = "";

        for (let i = 0; i < dirs.length; i++) {
            if (!dirs[i].endsWith(".json")) {
                dirNames += `${dirs[i]}${sep}`;
                if (!checkFile(`${processFolder}${sep}${dirNames}`)) {
                    mkdirSync(`${processFolder}${sep}${dirNames}`);
                }
            } else {
                dbName = `${dirs[i]}`;

                if (!checkFile(`${processFolder}${sep}${dirNames}${dbName}`)) {
                    writeFileSync(`${processFolder}${sep}${dirNames}${dbName}`, "{}");
                }
            }
        }

        let dbPath = `${processFolder}${sep}${dirNames}${dbName}`;

        let json = {};

        await this.mongo.find().then(async (data) => {
            data.forEach(async (obj) => {
                let key = await obj.key;
                let value = await obj.value;

                set(json, key, value);
                write(dbPath, json);
            });
        });

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
     * @param {(element: { ID: string, data: any }) => boolean} callback
     * @param {number} [maxDeletedSize]
     * @example await db.findAndDelete((element) => element.ID.includes("test"));
     * @returns {Promise<number>}
     */
    async findAndDelete(callback, maxDeletedSize = 0) {
        let deleted = 0;
        maxDeletedSize = Number(maxDeletedSize);

        maxDeletedSize === null ? maxDeletedSize === 0 : maxDeletedSize === maxDeletedSize;
        maxDeletedSize === undefined ? maxDeletedSize === 0 : maxDeletedSize === maxDeletedSize;
        maxDeletedSize === "" ? maxDeletedSize === 0 : maxDeletedSize === maxDeletedSize;

        let filtered = await this.filter(callback);
        filtered.forEach(async (obj) => {
            if (maxDeletedSize === 0) {
                await this.mongo.deleteOne({ key: obj.ID }, { value: obj.data });
                deleted++;
            } else {
                if (deleted < maxDeletedSize) {
                    await this.mongo.deleteOne({ key: obj.ID }, { value: obj.data });
                    deleted++;
                }
            }
        });
        return deleted;
    }
};
