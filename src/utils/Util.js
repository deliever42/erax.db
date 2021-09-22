const FETCH = require("node-fetch");
const fs = require("fs");

/**
 *
 * @class
 */
module.exports = class Util {
    /**
     *
     * @returns {{ updated: boolean, installedVersion: string, packageData: string }}
     */
    static async updateCheck() {
        let version = require("../../package.json").version;
        let packageData = await FETCH("https://registry.npmjs.com/erax.db").then((text) =>
            text.json()
        );
        if (version === packageData["dist-tags"].latest) {
            return {
                updated: true,
                installedVersion: version,
                packageVersion: packageData["dist-tags"].latest
            };
        } else {
            return {
                updated: false,
                installedVersion: version,
                packageVersion: packageData["dist-tags"].latest
            };
        }
    }

    /**
     *
     * @param {string} path
     * @returns {void | null}
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
        key.includes(".") ? key === key.split(".").shift() : key === key;
        return key;
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
     * @param {{ [key: string]: any } | string} data
     * @returns {void | null}
     */
    static write(path, data) {
        if (path.endsWith(".json")) {
            return fs.writeFileSync(path, JSON.stringify(data, null, 4));
        } else if (path.endsWith(".yml")) {
            return fs.writeFileSync(path, YAML.stringify(data));
        } else {
            return null;
        }
    }

    /**
     *
     * @param {string} path
     * @returns {void | null}
     */
    static read(path) {
        if (fs.existsSync(path)) {
            if (path.endsWith(".json")) {
                return JSON.parse(fs.readFileSync(path, "utf-8"));
            } else if (path.endsWith(".yml")) {
                return YAML.parse(fs.readFileSync(path, "utf-8"));
            } else {
                return null;
            }
        } else {
            return null;
        }
    }

    /**
     *
     * @param {{ [key: string]: any }} data
     * @param {string} sep
     * @param {string} key
     * @param {any} value
     * @returns {void}
     */
    static dataSet(data, sep, key, value) {
        if (key.includes(sep)) {
            let splited = key.split(sep);
            let obj = {};
            obj = data;
            let json = obj;
            for (let i = 0; i < splited.length - 1; i++) {
                if (!json[splited[i]]) json = json[splited[i]] = {};
                else json = json[splited[i]];
            }
            json[splited[splited.length - 1]] = value;
        } else {
            return (data[key] = value);
        }
    }

    /**
     *
     * @param {{ [key: string]: any }} data
     * @param {string} sep
     * @param {string} key
     * @returns {any}
     */
    static dataGet(data, sep, key) {
        if (key.includes(sep)) {
            let splited = key.split(sep);
            let obj = {};
            obj = data;
            let json = obj;

            for (let i = 0; i < splited.length - 1; i++) {
                json = json[splited[i]];
            }
            return json[splited[splited.length - 1]] ? json[splited[splited.length - 1]] : null;
        } else {
            return data[key] ? data[key] : null;
        }
    }

    /**
     *
     * @param {{ [key: string]: any }} data
     * @param {string} sep
     * @param {string} key
     * @returns {boolean}
     */
    static dataHas(data, sep, key) {
        if (key.includes(sep)) {
            let splited = key.split(sep);
            let obj = {};
            obj = data;
            let json = obj;

            for (let i = 0; i < splited.length - 1; i++) {
                json = json[splited[i]];
            }
            return json[splited[splited.length - 1]] ? json[splited[splited.length - 1]] : null;
        } else {
            return data[key] ? true : false;
        }
    }

    /**
     *
     * @param {{ [key: string]: any }} data
     * @param {string} sep
     * @param {string} key
     * @returns {null | void}
     */
    static dataDelete(data, sep, key) {
        if (key.includes(sep)) {
            let splited = key.split(sep);
            let obj = {};
            obj = data;
            let json = obj;

            for (let i = 0; i < splited.length - 1; i++) {
                json = json[splited[i]];
            }
            return json[splited[splited.length - 1]]
                ? delete json[splited[splited.length - 1]]
                : null;
        } else {
            return data[key] ? delete data[key] : null;
        }
    }
};
