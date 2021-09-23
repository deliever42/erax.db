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
const db = require("better-sqlite3");

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
    constructor(options = { databasePath: "database.db", seperator: "." }) {
        if (options.databasePath === undefined || options.databasePath === null)
            throw new ErrorManager("Please specify a database name.");

        if (!isString(options.databasePath))
            throw new ErrorManager("Database name must be string!");

        let processFolder = process.cwd();
        let databasePath = options.databasePath;

        if (databasePath.endsWith(sep)) {
            databasePath += "database.db";
        } else {
            if (!databasePath.endsWith(".db")) {
                databasePath += ".db";
            }
        }

        let dirs = databasePath.split(sep).filter((dir) => dir !== "");
        let dbName = "";
        let dirNames = "";

        for (let i = 0; i < dirs.length; i++) {
            if (!dirs[i].endsWith(".db")) {
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
        this.dbPath = `${process.cwd()}${sep}${dirNames}${dbName}`;
        this.sql = new db(this.dbPath);
        this.sql.prepare("CREATE TABLE IF NOT EXISTS EraxDB (key TEXT, value TEXT)").run();

        if (!SqliteDatabase.DBCollection.includes(this.dbName)) {
            SqliteDatabase.DBCollection.push(this.dbName);
        }
    }

    /**
     *
     * @param {string} key
     * @param {any} value
     * @example db.set("key", "value");
     * @returns {any}
     */
    set(key, value) {
        if (key === "" || key === null || key === undefined)
            throw new ErrorManager("Please specify a key.");
        if (!isString(key)) throw new ErrorManager("Key must be string!");
        if (value === "" || value === null || value === undefined)
            throw new ErrorManager("Please specify a value.");

        let parsedKey = parseKey(key, this.sep);

        let json = {};
        let data = this.sql.prepare(`SELECT * FROM EraxDB WHERE key = (?)`).get(parsedKey);

        dataSet(json, this.sep, key, value);

        let parsedValue = json[parseKey(key, this.sep)];
        parsedValue = JSON.stringify(parsedValue);

        if (!data) {
            this.sql
                .prepare(`INSERT INTO EraxDB (key, value) VALUES (?,?)`)
                .run(parsedKey, parsedValue);
        } else {
            this.sql
                .prepare(`UPDATE EraxDB SET value = (?) WHERE key = (?)`)
                .run(parsedValue, parsedKey);
        }

        return value;
    }

    /**
     *
     * @param {string} key
     * @example db.has("key");
     * @returns {boolean}
     */
    has(key) {
        return this.get(key) ? true : false;
    }

    /**
     *
     * @example db.deleteAll();
     * @returns {boolean}
     */
    deleteAll() {
        let all = this.all();
        all.forEach((data) => this.delete(data.ID));
        return true;
    }

    /**
     *
     * @param {string} key
     * @example db.fetch("key");
     * @returns {any}
     */
    fetch(key) {
        if (key === "" || key === null || key === undefined)
            throw new ErrorManager("Please specify a key.");
        if (!isString(key)) throw new ErrorManager("Key must be string!");

        if (key.includes(this.sep)) {
            let parsedKey = parseKey(key, this.sep);
            let json = {};

            let data = this.sql.prepare(`SELECT * FROM EraxDB WHERE key = (?)`).get(parsedKey);
            if (!data) return null;

            let value = data.value;

            dataSet(json, this.sep, parsedKey, JSON.parse(value));
            let parsedValue = dataGet(json, this.sep, key);
            json = {};
            return parsedValue;
        } else {
            let data = this.sql.prepare(`SELECT * FROM EraxDB WHERE key = (?)`).get(key);
            if (!data) return null;
            return data.value;
        }
    }

    /**
     *
     * @param {string} key
     * @example db.get("key");
     * @returns {any}
     */
    get(key) {
        return this.fetch(key);
    }

    /**
     *
     * @param {string} key
     * @example db.type("key");
     * @returns {"array" | "string" | "number" | "boolean" | "symbol" | "function" | "object" | "null" | "undefined" | "bigint"}
     */
    type(key) {
        if (this.has(key) === false) return null;
        if (Array.isArray(this.get(key))) return "array";
        return typeof this.get(key);
    }

    /**
     *
     * @param {string} key
     * @example db.delete("key");
     * @returns {boolean}
     */
    delete(key) {
        if (key === "" || key === null || key === undefined)
            throw new ErrorManager("Please specify a key.");
        if (!isString(key)) throw new ErrorManager("Key must be string!");

        if (key.includes(this.sep)) {
            let parsedKey = parseKey(key, this.sep);
            let json = {};

            let data = this.sql.prepare(`SELECT * FROM EraxDB WHERE key = (?)`).get(parsedKey);
            if (!data) return null;

            let value = data.value;

            dataSet(json, this.sep, parsedKey, JSON.parse(value));
            dataDelete(json, this.sep, key);

            let parsedValue = dataGet(json, this.sep, parsedKey);
            this.set(parsedKey, parsedValue);

            json = {};
            return true;
        } else {
            if (this.has(key) === false) return null;
            this.sql.prepare(`DELETE FROM EraxDB WHERE key = (?)`).run(key);
            return true;
        }
    }

    /**
     *
     * @example db.fetchAll();
     * @returns {{ ID: string, data: any }[]}
     */
    fetchAll() {
        let arr = this.all();

        return arr;
    }

    /**
     *
     * @example db.all();
     * @returns {{ ID: string, data: any }[]}
     */
    all() {
        let all = this.sql.prepare(`SELECT * FROM EraxDB WHERE key IS NOT NULL`).iterate();
        let arr = [];

        for (let data of all) {
            arr.push({
                ID: data.key,
                data: JSON.parse(data.value)
            });
        }

        return arr;
    }

    /**
     *
     * @param {string} key
     * @param {"+" | "-" | "*" | "/" | "%"} operator
     * @param {number} value
     * @param {boolean} [goToNegative]
     * @example db.math("key", "+", 1);
     * @returns {number}
     */
    math(key, operator, value, goToNegative = false) {
        if (operator === null || operator === undefined || operator === "")
            throw new ErrorManager("Please specify a operator. (-  +  *  /  %)");
        if (value === null || value === undefined || value === "")
            throw new ErrorManager("Please specify a value.");
        if (isNumber(value)) throw new ErrorManager(`Value must be number!`);

        value = Number(value);

        if (this.has(key) === false) return this.set(key, value);
        let data = this.get(key);

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

        return this.set(key, data);
    }

    /**
     *
     * @param {string} key
     * @param {number} value
     * @example db.add("key", 1);
     * @returns {number}
     */
    add(key, value) {
        return this.math(key, "+", value);
    }

    /**
     *
     * @param {string} key
     * @param {number} value
     * @param {boolean} [goToNegative]
     * @returns {number}
     * @example db.subtract("key", 1);
     */
    subtract(key, value, goToNegative = false) {
        return this.math(key, "-", value, goToNegative);
    }

    /**
     *
     * @example db.info();
     * @returns {{ Version: number, DatabaseName: string, DataSize: number, DatabaseType: "sqlite" }}
     */
    info() {
        let p = require("../../package.json");

        return {
            Version: p.version,
            DatabaseName: this.dbName,
            DataSize: this.size(),
            DatabaseType: "sqlite"
        };
    }

    /**
     *
     * @param {string} value
     * @example db.startsWith("key");
     * @returns {{ ID: string, data: any }[]}
     */
    startsWith(value) {
        if (value === "" || value === null || value === undefined)
            throw new ErrorManager("Please specify a value.");
        return this.filter((x) => x.ID.startsWith(value));
    }

    /**
     *
     * @param {string} value
     * @example db.endsWith("key");
     * @returns {{ ID: string, data: any }[]}
     */
    endsWith(value) {
        if (value === "" || value === null || value === undefined)
            throw new ErrorManager("Please specify a value.");
        return this.filter((x) => x.ID.endsWith(value));
    }

    /**
     *
     * @param {string} value
     * @example db.includes("key");
     * @returns {{ ID: string, data: any }[]}
     */
    includes(value) {
        if (value === "" || value === null || value === undefined)
            throw new ErrorManager("Please specify a value.");
        return this.filter((x) => x.ID.includes(value));
    }

    /**
     *
     * @param {string} value
     * @param {number} [maxDeletedSize]
     * @example db.deleteEach("key");
     * @returns {boolean}
     */
    deleteEach(value, maxDeletedSize = 0) {
        if (value === "" || value === null || value === undefined)
            throw new ErrorManager("Please specify a value.");

        let deleted = 0;
        maxDeletedSize = Number(maxDeletedSize);

        maxDeletedSize === null ? maxDeletedSize === 0 : maxDeletedSize === maxDeletedSize;
        maxDeletedSize === undefined ? maxDeletedSize === 0 : maxDeletedSize === maxDeletedSize;
        maxDeletedSize === "" ? maxDeletedSize === 0 : maxDeletedSize === maxDeletedSize;

        let all = this.includes(value);

        all.forEach((data) => {
            let key = data.ID;
            if (!key.includes(value)) return;

            if (maxDeletedSize === 0) {
                this.delete(key);
                deleted++;
            } else {
                if (deleted < maxDeletedSize) {
                    this.delete(key);
                    deleted++;
                }
            }
        });

        return deleted;
    }

    /**
     *
     * @param {(element: { ID: string, data: any }) => boolean} callback
     * @example db.filter((element) => element.ID.startsWith("key"));
     * @returns {{ ID: string, data: any }[]}
     */
    filter(callback) {
        let all = this.all();

        return all.filter(callback);
    }

    /**
     *
     * @param {string} key
     * @param {any} value
     * @param {boolean} [valueIgnoreIfPresent]
     * @example db.push("key", "value");
     * @returns {any[]}
     */
    push(key, value, valueIgnoreIfPresent = true) {
        if (this.has(key) === false) return this.set(key, [value]);
        else if (this.arrayHas(key) === true && this.has(key) === true) {
            let newval = this.get(key);
            if (newval.includes(value) && valueIgnoreIfPresent === true)
                return console.log(
                    `${chalk.blue("EraxDB")} => ${chalk.red("Error:")} ${chalk.gray(
                        "Data was not pushed because the conditions were not suitable."
                    )}`
                );
            newval.push(value);
            return this.set(key, newval);
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
     * @example db.arrayHas("key");
     * @returns {boolean}
     */
    arrayHas(key) {
        let value = this.get(key);
        if (Array.isArray(value)) return true;
        return false;
    }

    /**
     *
     * @param {string} key
     * @param {any} value
     * @example db.arrayHasValue("key", "value");
     * @returns {boolean}
     *
     */
    arrayHasValue(key, value) {
        if (this.has(key) === false) return null;
        if (this.arrayHas(key) === false)
            return console.log(
                `${chalk.blue("EraxDB")} => ${chalk.red("Error:")} ${chalk.gray(
                    "The value you specified is not in the array of the data you specified."
                )}`
            );

        let datavalue = this.get(key);
        if (datavalue.indexOf(value) > -1) return true;
        return false;
    }

    /**
     *
     * @param {string} key
     * @param {any} value
     * @example db.pull("key", "value");
     * @returns {any[]}
     */
    pull(key, value) {
        if (this.has(key) === false) return null;
        if (this.arrayHas(key) === false)
            return console.log(
                `${chalk.blue("EraxDB")} => ${chalk.red("Error:")} ${chalk.gray(
                    "The type of data you specify must be array!"
                )}`
            );

        if (this.arrayHasValue(key, value) === false)
            return console.log(
                `${chalk.blue("EraxDB")} => ${chalk.red("Error:")} ${chalk.gray(
                    "The value you specified is not in the array of the data you specified."
                )}`
            );

        let oldArr = this.get(key);
        let newArr = oldArr.filter((x) => x !== value);
        return this.set(key, newArr);
    }

    /**
     *
     * @example db.size();
     * @returns {number}
     */
    size() {
        let all = this.all();
        return all.length;
    }

    /**
     *
     * @example db.keyArray();
     * @returns {string[]}
     */
    keyArray() {
        let arr = [];
        let all = this.all();

        all.forEach((data) => {
            arr.push(data.ID);
        });

        return arr;
    }

    /**
     *
     * @example db.valueArray();
     * @returns {any[]}
     */
    valueArray() {
        let arr = [];
        let all = this.all();

        all.forEach((data) => {
            arr.push(data.data);
        });

        return arr;
    }

    /**
     *
     * @param {string} path
     * @example db.import("./database.json");
     * @returns {boolean}
     */
    import(path = "./database.json") {
        let processFolder = process.cwd();
        let databasePath = path;

        if (!databasePath.endsWith(".json")) {
            databasePath += ".json";
        }

        if (!checkFile(`${processFolder}${sep}${databasePath}`)) return null;

        let file = read(`${processFolder}${sep}${databasePath}`);

        Object.entries(file).forEach((entry) => {
            let [key, value] = entry;
            this.set(key, value);
        });
        return true;
    }

    /**
     *
     * @param {string} path
     * @example db.export("./database.json");
     * @returns {boolean}
     */
    export(path = "database.json") {
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
        let all = this.all();

        all.forEach((data) => {
            let key = data.ID;
            let value = data.data;

            dataSet(json, this.sep, key, value);
            write(dbPath, json);
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
     * @example db.findAndDelete((element) => element.ID.includes("test"));
     * @returns {number}
     */
    findAndDelete(callback, maxDeletedSize = 0) {
        let deleted = 0;
        maxDeletedSize = Number(maxDeletedSize);

        maxDeletedSize === null ? maxDeletedSize === 0 : maxDeletedSize === maxDeletedSize;
        maxDeletedSize === undefined ? maxDeletedSize === 0 : maxDeletedSize === maxDeletedSize;
        maxDeletedSize === "" ? maxDeletedSize === 0 : maxDeletedSize === maxDeletedSize;

        let all = this.all();

        let filtered = all.filter(callback);

        filtered.forEach((data) => {
            if (maxDeletedSize === 0) {
                this.delete(data.ID);
                deleted++;
            } else {
                if (deleted < maxDeletedSize) {
                    this.delete(data.ID);
                    deleted++;
                }
            }
        });
        return deleted;
    }

    /**
     *
     * @param {(element: { ID: string, data: any }) => boolean} callback
     * @example db.map((element) => element.ID);
     * @returns {any[]}
     */
    map(callback) {
        let arr = [];
        let all = this.all();

        all.forEach((data) => {
            let key = data.ID;
            let value = data.data;

            arr.push({
                ID: key,
                data: value
            });
        });

        return arr.map(callback);
    }
};
