const { mkdirSync, writeFileSync } = require("fs");
const DatabaseError = require("../Utils/DatabaseError");
const { sep } = require("path");
const { destroy, checkFile, isString, isNumber, write, read } = require("../Utils/Util");
const { set, get, unset, pull } = require("lodash");
const { red, gray, blue } = require("../Utils/ColorStyles");

/**
 *
 * @class YamlDatabase
 */
module.exports = class YamlDatabase {
    /**
     *
     * @static
     * @type {string[]}
     */
    static DBCollection = [];

    /**
     *
     * @constructor
     * @param {{ databasePath?: string }} options
     */
    constructor(options = {}) {
        let path;
        if (
            !options ||
            (options &&
                (options.databasePath === null ||
                    options.databasePath === undefined ||
                    options.databasePath === ""))
        )
            path = "database.yml";
        else if (options && options.databasePath) path = options.databasePath;

        if (!isString(path)) throw new DatabaseError("Database name must be string!");

        let processFolder = process.cwd();
        let databasePath = path;

        if (databasePath.endsWith(sep)) {
            databasePath += "database.yml";
        } else {
            if (!databasePath.endsWith(".yml")) {
                databasePath += ".yml";
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
            if (!dirs[i].endsWith(".yml")) {
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

        this.dbPath = `${processFolder}${sep}${dirNames}${dbName}`;
        this.dbName = `${dirNames}${dbName}`;
        this.data = read(this.dbPath);

        if (!YamlDatabase.DBCollection.includes(this.dbName)) {
            YamlDatabase.DBCollection.push(this.dbName);
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
            throw new DatabaseError("Please specify a key.");
        if (!isString(key)) throw new DatabaseError("Key must be string!");
        if (value === "" || value === null || value === undefined)
            throw new DatabaseError("Please specify a value.");
        set(this.data, key, value);
        write(this.dbPath, this.data);
        return get(this.data, key);
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
        this.data = {};
        write(this.dbPath, {});
        return true;
    }

    /**
     *
     * @example db.destroy();
     * @returns {boolean}
     */
    destroy() {
        this.data = {};
        destroy(this.dbPath);
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
            throw new DatabaseError("Please specify a key.");
        if (!isString(key)) throw new DatabaseError("Key must be string!");
        return get(this.data, key);
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
        if (this.has(key) === false) return null;
        unset(this.data, key);
        write(this.dbPath, this.data);
        return true;
    }

    /**
     *
     * @example db.fetchAll();
     * @returns {{ ID: string, data: any }[]}
     */
    fetchAll() {
        return this.all();
    }

    /**
     *
     * @example db.all();
     * @returns {{ ID: string, data: any }[]}
     */
    all() {
        let arr = [];
        Object.entries(this.data).forEach((entry) => {
            const [key, value] = entry;
            const data = {
                ID: key,
                data: value
            };
            arr.push(data);
        });
        return arr;
    }

    /**
     *
     * @example db.size();
     * @returns {number}
     */
    size() {
        return this.all().length;
    }

    /**
     *
     * @param {string} value
     * @example db.startsWith("key");
     * @returns {{ ID: string, data: any }[]}
     */
    startsWith(value) {
        if (value === "" || value === null || value === undefined)
            throw new DatabaseError("Please specify a value.");
        return this.all().filter((x) => x.ID.startsWith(value));
    }

    /**
     *
     * @param {string} value
     * @example db.endsWith("key");
     * @returns {{ ID: string, data: any }[]}
     */
    endsWith(value) {
        if (value === "" || value === null || value === undefined)
            throw new DatabaseError("Please specify a value.");
        return this.all().filter((x) => x.ID.endsWith(value));
    }

    /**
     *
     * @param {string} value
     * @example db.includes("key");
     * @returns {{ ID: string, data: any }[]}
     */
    includes(value) {
        if (value === "" || value === null || value === undefined)
            throw new DatabaseError("Please specify a value.");
        return this.all().filter((x) => x.ID.includes(value));
    }

    /**
     *
     * @param {string} key
     * @param {any} value
     * @param {boolean} [valueIgnoreIfPresent]
     * @param {boolean} [multiple]
     * @example db.push("key", "value");
     * @returns {any[]}
     */
    push(key, value, valueIgnoreIfPresent = false, multiple = false) {
        let filteredValue = Array.isArray(value) ? value : [value];
        let array = this.get(key);

        if (this.has(key) === false) return this.set(key, filteredValue);
        if (this.arrayHas(key) === false)
            return console.log(
                `${blue("EraxDB")} => ${red("Error:")} ${gray(
                    "The type of data you specify must be array!"
                )}`
            );
        if (Array.isArray(value) && multiple === true) {
            value.forEach((item) => {
                if (this.arrayHasValue(key, item) && valueIgnoreIfPresent === false)
                    array.push(item);
            });
        } else {
            if (this.arrayHasValue(key, value) && valueIgnoreIfPresent === false) array.push(value);
        }

        return this.set(key, array);
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
            throw new DatabaseError("Please specify a operator. (-  +  *  /  %)");
        if (value === null || value === undefined || value === "")
            throw new DatabaseError("Please specify a value.");
        if (!isNumber(value)) throw new DatabaseError(`Value must be number!`);

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
            case "multiple":
            case "mult":
            case "multip":
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
                throw new DatabaseError("Invalid Operator! (-  +  *  /  %)");
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
     * @example db.subtract("key", 1);
     * @returns {number}
     */
    subtract(key, value, goToNegative = false) {
        return this.math(key, "-", value, goToNegative);
    }

    /**
     *
     * @param {string} key
     * @example db.arrayHas("key");
     * @returns {boolean}
     */
    arrayHas(key) {
        if (Array.isArray(this.get(key))) return true;
        return false;
    }

    /**
     *
     * @example db.info();
     * @returns {{ Version: number, DatabaseName: string, DataSize: number, DatabaseType: "yaml" }}
     */
    info() {
        let p = require("../../package.json");

        return {
            Version: p.version,
            DatabaseName: this.dbName,
            DataSize: this.size(),
            DatabaseType: "yaml"
        };
    }

    /**
     *
     * @param {string} value
     * @param {number} [maxDeletedSize]
     * @example db.deleteEach("key");
     * @returns {boolean}
     */
    deleteEach(value, maxDeletedSize = 0) {
        let deleted = 0;
        maxDeletedSize = Number(maxDeletedSize);

        maxDeletedSize === null ? maxDeletedSize === 0 : maxDeletedSize === maxDeletedSize;
        maxDeletedSize === undefined ? maxDeletedSize === 0 : maxDeletedSize === maxDeletedSize;
        maxDeletedSize === "" ? maxDeletedSize === 0 : maxDeletedSize === maxDeletedSize;

        this.includes(value).forEach((data) => {
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
     * @param {string} key
     * @param {any} value
     * @param {boolean} [multiple]
     * @example db.pull("key", "value");
     * @returns {any[]}
     */
    pull(key, value, multiple = false) {
        let array = this.get(key);

        if (this.has(key) === false) return null;
        if (this.arrayHas(key) === false)
            return console.log(
                `${blue("EraxDB")} => ${red("Error:")} ${gray(
                    "The type of data you specify must be array!"
                )}`
            );

        if (Array.isArray(value) && multiple === true) {
            value.forEach((item) => {
                pull(array, item);
            });
        } else {
            pull(array, value);
        }

        return this.set(key, array);
    }

    /**
     *
     * @param {string} key
     * @param {any} value
     * @example db.arrayHasValue("key", "value");
     * @returns {boolean}
     */
    arrayHasValue(key, value) {
        if (this.has(key) === false) return null;
        if (this.arrayHas(key) === false)
            return console.log(
                `${blue("EraxDB")} => ${red("Error:")} ${gray(
                    "The type of data you specify must be array!"
                )}`
            );
        if (this.get(key).indexOf(value) > -1) return true;
        return false;
    }

    /**
     *
     * @param {(element: { ID: string, data: any }) => boolean} callback
     * @example db.filter(x => x.ID.startsWith("key"));
     * @returns {{ ID: string, data: any }[]}
     */
    filter(callback) {
        return this.all().filter(callback);
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

        let filtered = this.filter(callback);
        filtered.forEach((obj) => {
            if (maxDeletedSize === 0) {
                this.delete(obj.ID);
                deleted++;
            } else {
                if (deleted < maxDeletedSize) {
                    this.delete(obj.ID);
                    deleted++;
                }
            }
        });
        return deleted;
    }

    /**
     *
     * @example db.keyArray();
     * @returns {string[]}
     */
    keyArray() {
        let arr = [];
        Object.keys(this.data).forEach((key) => arr.push(key));
        return arr;
    }

    /**
     *
     * @example db.valueArray();
     * @returns {any[]}
     */
    valueArray() {
        let arr = [];
        Object.values(this.data).forEach((value) => arr.push(value));
        return arr;
    }

    /**
     *
     * @example db.DBCollectionSize();
     * @returns {number}
     */
    DBCollectionSize() {
        return YamlDatabase.DBCollection.length;
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
     * @example db.map((element) => element.ID);
     * @returns {any[]}
     */
    map(callback) {
        return this.all().map(callback);
    }

    /**
     *
     * @param {(a: { ID: string, data: any }, b: { ID: string, data: any }) => boolean} callback
     * @example db.reduce((a, b) => a + b);
     * @returns {any[]}
     */
    reduce(callback) {
        return this.all().reduce(callback);
    }
};
