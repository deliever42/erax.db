const FETCH = require("node-fetch");
const fs = require("fs");
const YAML = require("yaml");
const DatabaseError = require("./DatabaseError");

/**
 *
 * @class Util
 */
module.exports = class Util {
    /**
     *
     * @returns {Promise<{ updated: boolean, installedVersion: string, packageData: string }>}
     */
    static async updateCheck() {
        let version = require("../../package.json").version;
        let packageData = await FETCH("https://registry.npmjs.com/erax.db").then((data) =>
            data.json()
        );
        let updated = false;
        if (version === packageData["dist-tags"].latest) updated = true;

        return {
            updated: updated,
            installedVersion: version,
            packageVersion: packageData["dist-tags"].latest
        };
    }

    /**
     *
     * @param {string} path
     * @returns {void}
     */
    static destroy(path) {
        if (fs.existsSync(path)) {
            return fs.unlinkSync(path);
        } else {
            return null;
        }
    }

    /**
     *
     * @param {string} key
     * @returns {string}
     */
    static parseKey(key) {
        return key.includes(".") ? key.split(".").shift() : key;
    }

    /**
     *
     * @param {string} path
     * @returns {boolean}
     */
    static checkFile(path) {
        return fs.existsSync(path) ? true : false;
    }

    /**
     *
     * @param {any} key
     * @returns {boolean}
     */
    static isString(key) {
        return typeof key === "string" ? true : false;
    }

    /**
     *
     * @param {any} key
     * @returns {boolean}
     */
    static isNumber(key) {
        return isNaN(key) ? false : true;
    }

    /**
     *
     * @param {string} path
     * @param {{ [key: string]: any }} data
     * @returns {void}
     */
    static write(path, data) {
        if (path.endsWith(".json")) {
            return fs.writeFileSync(path, JSON.stringify(data, null, 4));
        } else if (path.endsWith(".yml")) {
            return fs.writeFileSync(path, YAML.stringify(data));
        } else if (path.endsWith(".ini")) {
            let INI;

            try {
                INI = require("multi-ini");
            } catch {
                throw new DatabaseError("Please install module multi-ini (npm install multi-ini)");
            }

            return INI.write(path, data, { encoding: "utf-8" });
        } else {
            return null;
        }
    }

    /**
     *
     * @param {string} path
     * @returns {void}
     */
    static read(path) {
        if (fs.existsSync(path)) {
            if (path.endsWith(".json")) {
                return JSON.parse(fs.readFileSync(path, "utf-8"));
            } else if (path.endsWith(".yml")) {
                return YAML.parse(fs.readFileSync(path, "utf-8"));
            } else if (path.endsWith(".ini")) {
                let INI;

                try {
                    INI = require("multi-ini");
                } catch {
                    throw new DatabaseError(
                        "Please install module multi-ini (npm install multi-ini)"
                    );
                }

                return INI.read(path, { encoding: "utf-8" });
            } else {
                return null;
            }
        } else {
            return null;
        }
    }

    /**
     *
     * @param {{ [key: string]: any }} obj
     * @param {string} key
     * @param {any} value
     * @param {string} sep
     * @returns {any}
     */
    static set(obj, key, value, sep = ".") {
        let locations = key.split(sep);
        let length = locations.length - 1;
        let i = 0;

        while (i < length) {
            if (typeof obj[locations[i]] !== "object") {
                obj[locations[i]] = {};
            }
            obj = obj[locations[i]];
            i++;
        }

        obj[locations[length]] = value;
        return value;
    }

    /**
     *
     * @param {{ [key: string]: any }} obj
     * @param {string} key
     * @param {string} sep
     * @returns {any}
     */
    static get(obj, key, sep = ".") {
        let locations = key.split(sep);
        let length = locations.length - 1;
        let i = 0;

        while (i < length) {
            if (!obj[locations[i]]) return null;
            obj = obj[locations[i]];
            i++;
        }

        return obj[locations[length]];
    }

    /**
     *
     * @param {{ [key: string]: any }} obj
     * @param {string} key
     * @param {string} sep
     * @returns {boolean}
     */
    static unset(obj, key, sep = ".") {
        let locations = key.split(sep);
        let length = locations.length - 1;
        let i = 0;

        while (i < length) {
            if (!obj[locations[i]]) return null;
            obj = obj[locations[i]];
            i++;
        }

        delete obj[locations[length]];
        return true;
    }

    /**
     *
     * @param {any[]} array
     * @param {any} item
     * @returns {boolean}
     */
    static pull(array, item) {
        array = array.filter((element) => element !== item);
        return true;
    }
};
