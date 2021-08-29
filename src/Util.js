const FETCH = require("node-fetch");
const fs = require("fs");
const { set, get, unset } = require("lodash");

module.exports = class Util {
    /**
     * EraxDB Sürümünü kontrol eder.
     * @returns {{ updated: boolean, installedVersion: string, packageData: string }}
     */
    static async updateCheck() {
        let version = require("../package.json").version;
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
     * Veri adını ayrıştırırsınız.
     * @param {string} key Veri
     * @returns {string}
     */
    static parseKey(key) {
        key.includes(".") ? key === key.split(".").shift() : key === key;
        return key;
    }

    /**
     * Verileri yazdırırsınız.
     * @param {string} path Database Path
     * @param {{ [key: string]: any }} data Data
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
     * Veri kaydedersiniz.
     * @param {{ [key: string]: any }} data Data
     * @param {string} key Veri
     * @param {any} value Value
     * @returns {void}
     */
    static dataSet(data, key, value) {
        if (key.includes(".")) return set(data, key, value);
        else {
            return (data[key] = value);
        }
    }

    /**
     * Veri getirirsiniz.
     * @param {{ [key: string]: any }} data Data
     * @param {string} key Veri
     * @returns {any}
     */
    static dataGet(data, key) {
        if (key.includes(".")) return get(data, key) ? get(data, key) : null;
        else {
            return data[key] ? data[key] : null;
        }
    }

    /**
     * Veri varmı/yokmu kontrol eder.
     * @param {{ [key: string]: any }} data Data
     * @param {string} key Veri
     * @returns {boolean}
     */
    static dataHas(data, key) {
        return this.dataGet(data, key) === null ? false : true;
    }

    /**
     * Veri silersiniz.
     * @param {{ [key: string]: any }} data Data
     * @param {string} key key
     * @returns {null | void}
     */
    static dataDelete(data, key) {
        if (key.includes(".")) return this.dataHas(data, key) === true ? unset(data, key) : null;
        else {
            return this.dataHas(data, key) === true ? delete data[key] : null;
        }
    }
};
