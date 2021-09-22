const Sequelize = require("sequelize");
const { mkdirSync } = require("fs");
const ErrorManager = require("../utils/ErrorManager");
const { sep } = require("path");
const {
    parseKey,
    checkFile,
    isString,
    isNumber,
    dataSet,
    dataGet,
    dataDelete,
    write,
    read
} = require("../utils/Util");
const chalk = require("chalk");

/**
 *
 * @class
 */
module.exports = class SqliteDatabase {
    /**
     *
     * @static
     * @type {string[]}
     */
    static DBCollection = [];

    /**
     *
     * @constructor
     * @param {{ databasePath?: string, seperator?: string }} options
     */
    constructor(options = { databasePath: "database.sqlite", seperator: "." }) {
        if (options.databasePath === undefined || options.databasePath === null)
            throw new ErrorManager("Please specify a database name.");

        if (!isString(options.databasePath))
            throw new ErrorManager("Database name must be string!");

        let processFolder = process.cwd();
        let databasePath = options.databasePath;

        if (databasePath.endsWith(sep)) {
            databasePath += "database.sqlite";
        } else {
            if (!databasePath.endsWith(".sqlite")) {
                databasePath += ".sqlite";
            }
        }

        let dirs = databasePath.split(sep).filter((dir) => dir !== "");
        let dbName = "";
        let dirNames = "";

        for (let i = 0; i < dirs.length; i++) {
            if (!dirs[i].endsWith(".sqlite")) {
                dirNames += `${dirs[i]}${sep}`;
                if (!checkFile(`${processFolder}${sep}${dirNames}`)) {
                    mkdirSync(`${processFolder}${sep}${dirNames}`);
                }
            } else {
                dbName = `${dirs[i]}`;
            }
        }

        this.dbName = `${dirNames}${dbName}`;
        this.sep = options.seperator;

        const sequelize = new Sequelize.Sequelize("database", null, null, {
            dialect: "sqlite",
            logging: false,
            storage: `${process.cwd()}${sep}${dirNames}${dbName}`
        });

        this.sql = sequelize.define("EraxDB", {
            key: {
                type: Sequelize.DataTypes.STRING,
                unique: true,
                allowNull: false
            },
            value: {
                type: Sequelize.DataTypes.JSON,
                unique: true,
                allowNull: false
            }
        });

        this.sql.sync();

        if (!SqliteDatabase.DBCollection.includes(this.dbName)) {
            SqliteDatabase.DBCollection.push(this.dbName);
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

        let json = {};

        dataSet(json, this.sep, key, value);
        Object.entries(json).forEach(async (entry) => {
            let [key, value] = entry;

            let tag = await this.sql.findOne({ where: { key: key } });
            if (!tag) {
                await this.sql.create({ key: key, value: value });
                json = {};
                return value;
            } else {
                await this.sql.update({ value: value }, { where: { key: key } });
                json = {};
                return value;
            }
        });
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
        await this.sql.findAll().then(async (datas) => {
            datas.forEach(async (obj) => {
                let key = await obj.dataValues.key;
                await this.sql.destroy({ where: { key: key } });
            });
        });
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

        if (key.includes(this.sep)) {
            let newkey = parseKey(key);
            let json = {};

            let tag = await this.sql.findOne({ where: { key: newkey } });
            if ((await this.has(key)) === false) return null;

            let value = await tag.get("value");
            dataSet(json, this.sep, newkey, value);
            let newvalue = dataGet(json, this.sep, key);
            json = {};
            return newvalue;
        } else {
            let tag = await this.sql.findOne({ where: { key: key } });
            if ((await this.has(key)) === false) return null;
            return await tag.get("value");
        }
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

        if (key.includes(this.sep)) {
            let newkey = parseKey(key);
            if ((await this.has(newkey)) === false) return null;
            let tag = await this.sql.findOne({ where: { key: newkey } });
            let value = await tag.get("value");
            let json = {};

            dataSet(json, this.sep, newkey, value);
            dataDelete(json, this.sep, key);

            let newvalue = dataGet(json, this.sep, newkey);
            await this.set(newkey, newvalue);
            json = {};
            return true;
        } else {
            if ((await this.has(key)) === false) return null;
            await this.sql.destroy({ where: { key: key } });
            return true;
        }
    }

    /**
     *
     * @example await db.fetchAll();
     * @returns {Promise<{ ID: string, data: any }[]>}
     */
    async fetchAll() {
        let arr = [];

        await this.sql.findAll().then(async (data) => {
            data.forEach(async (obj) => {
                let key = await obj.dataValues.key;
                let value = await obj.dataValues.value;

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

        await this.sql.findAll().then(async (data) => {
            data.forEach(async (obj) => {
                let key = await obj.dataValues.key;
                let value = await obj.dataValues.value;

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
        if (isNumber(value)) throw new ErrorManager(`Value must be number!`);

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
     * @returns {Promise<{ Version: number, DatabaseName: string, DataSize: number, DatabaseType: "sqlite" }>}
     */
    async info() {
        let p = require("../../package.json");

        return {
            Version: p.version,
            DatabaseName: this.dbName,
            DataSize: await this.size(),
            DatabaseType: "sqlite"
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

        await this.sql.findAll().then(async (data) => {
            data.forEach(async (obj) => {
                let key = await obj.dataValues.key;
                if (!key.includes(value)) return;

                if (maxDeletedSize === 0) {
                    await this.sql.destroy({ where: { key: key } });
                    deleted++;
                } else {
                    if (deleted < maxDeletedSize) {
                        await this.sql.destroy({ where: { key: key } });
                        deleted++;
                    }
                }
            });
        });

        return true;
    }

    /**
     *
     * @param {(element: { ID: string, data: any }) => boolean} callback
     * @example await db.filter((element) => element.ID.startsWith("key"));
     * @returns {Promise<{ ID: string, data: any }[]>}
     */
    async filter(callback) {
        let arr = [];
        await this.sql.findAll().then(async (data) => {
            data.forEach(async (obj) => {
                let key = await obj.dataValues.key;
                let value = await obj.dataValues.value;

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
     * @param {string} key
     * @param {any} value
     * @param {boolean} [valueIgnoreIfPresent]
     * @example await db.push("key", "value");
     * @returns {Promise<any[]>}
     */
    async push(key, value, valueIgnoreIfPresent = true) {
        if ((await this.has(key)) === false) return await this.set(key, [value]);
        else if ((await this.arrayHas(key)) === true && (await this.has(key)) === true) {
            let yenivalue = await this.get(key);
            if (yenivalue.includes(value) && valueIgnoreIfPresent === true)
                return console.log(
                    `${chalk.blue("EraxDB")} => ${chalk.red("Error:")} ${chalk.gray(
                        "Data was not pushed because the conditions were not suitable."
                    )}`
                );
            yenivalue.push(value);
            return await this.set(key, yenivalue);
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
                    "The value you specified is not in the array of the data you specified."
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

        await this.sql.findAll().then(async (data) => {
            data.forEach(async (obj) => {
                let key = await obj.dataValues.key;
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

        await this.sql.findAll().then(async (data) => {
            data.forEach(async (obj) => {
                let key = await obj.dataValues.key;
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

        await this.sql.findAll().then(async (data) => {
            data.forEach(async (obj) => {
                let value = await obj.dataValues.value;
                arr.push(value);
            });
        });

        return arr;
    }

    /**
     *
     * @param {string} path
     * @example await db.import("./database.json");
     * @returns {Promise<boolean>}
     */
    async import(path = "./database.json") {
        let processFolder = process.cwd();
        let databasePath = path;

        if (!databasePath.endsWith(".json")) {
            databasePath += ".json";
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
     * @example await db.export("./database.json");
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

        let dirs = databasePath.split(sep).filter((dir) => dir !== "");
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
                    write(`${processFolder}${sep}${dirNames}${dbName}`, "{}");
                }
            }
        }

        let dbPath = `${processFolder}${sep}${dirNames}${dbName}`;

        let json = {};

        await this.sql.findAll().then(async (data) => {
            data.forEach(async (obj) => {
                let key = await obj.dataValues.key;
                let value = await obj.dataValues.value;

                dataSet(json, this.sep, key, value);
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
        return SqliteDatabase.DBCollection.length;
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

        let arr = [];
        await this.sql.findAll().then(async (data) => {
            data.forEach(async (obj) => {
                let key = await obj.dataValues.key;
                let value = await obj.dataValues.value;

                const data = {
                    ID: key,
                    data: value
                };
                arr.push(data);
            });
        });

        let filtered = arr.filter(callback);

        filtered.forEach(async (obj) => {
            if (maxDeletedSize === 0) {
                await this.sql.destroy({ where: { key: obj.ID } });
                deleted++;
            } else {
                if (deleted < maxDeletedSize) {
                    await this.sql.destroy({ where: { key: obj.ID } });
                    deleted++;
                }
            }
        });
        return deleted;
    }

    /**
     *
     * @param {(element: { ID: string, data: any }) => boolean} callback
     * @example await db.map((element) => element.ID);
     * @returns {any[]}
     */
    async map(callback) {
        let arr = [];
        await this.sql.findAll().then(async (data) => {
            data.forEach(async (obj) => {
                let key = await obj.dataValues.key;
                let value = await obj.dataValues.value;

                const data = {
                    ID: key,
                    data: value
                };
                arr.push(data);
            });
        });

        return arr.map(callback);
    }
};
