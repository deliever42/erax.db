const FETCH = require("node-fetch");
const fs = require("fs");
const YAML = require("yaml");

/**
 *
 * @class
 */
module.exports = class Util {
    /**
     *
     * @returns {Promise<{ updated: boolean, installedVersion: string, packageData: string }>}
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
            } else {
                return null;
            }
        } else {
            return null;
        }
    }
};
