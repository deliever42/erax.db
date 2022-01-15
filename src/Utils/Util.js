const axios = require('axios');
const fs = require('fs');
const YAML = require('yaml');

/**
 *
 * @returns {Promise<{ updated: boolean, installedVersion: string, packageData: string }>}
 */
this.updateCheck = async () => {
    const version = require('../../package.json').version;
    const packageData = await axios.get('https://registry.npmjs.com/erax.db');

    return {
        updated: version === packageData.data['dist-tags'].latest,
        installedVersion: version,
        packageVersion: packageData.data['dist-tags'].latest
    };
};

/**
 *
 * @param {string} path
 * @returns {void}
 */
this.destroy = (path) => {
    if (fs.existsSync(path)) {
        return fs.unlinkSync(path);
    } else {
        return null;
    }
};

/**
 *
 * @param {string} key
 * @param {string} sep
 * @returns {string}
 */
this.parseKey = (key, sep = '.') => {
    return key.includes(sep) ? key.split(sep).shift() : key;
};

/**
 *
 * @param {string} path
 * @returns {boolean}
 */
this.checkFile = (path) => {
    return fs.existsSync(path);
};

/**
 *
 * @param {any} value
 * @returns {boolean}
 */
this.isString = (value) => {
    return typeof value === 'string';
};

/**
 *
 * @param {any} value
 * @returns {boolean}
 */
this.isNumber = (value) => {
    return +value === +value;
};

/**
 *
 * @param {any} value
 * @returns {boolean}
 */
this.isObject = (value) => {
    return Array.isArray(value) ? false : typeof value === 'object';
};

/**
 *
 * @param {string} path
 * @param {{ [key: string]: any }} data
 * @returns {void}
 */
this.write = (path, data) => {
    if (path.endsWith('.json')) {
        return fs.writeFileSync(path, JSON.stringify(data, null, 4));
    } else if (path.endsWith('.yml')) {
        return fs.writeFileSync(path, YAML.stringify(data, { indent: 4 }));
    }
};

/**
 *
 * @param {string} path
 * @returns {void}
 */
this.read = (path) => {
    if (fs.existsSync(path)) {
        if (path.endsWith('.json')) {
            return JSON.parse(fs.readFileSync(path, 'utf-8'));
        } else if (path.endsWith('.yml')) {
            return YAML.parse(fs.readFileSync(path, 'utf-8'));
        }
    }
};

/**
 *
 * @param {{ [key: string]: any }} obj
 * @param {string} key
 * @param {any} value
 * @param {string} sep
 * @returns {any}
 */
this.set = (obj, key, value, sep = '.') => {
    let locations = key.split(sep);
    let length = locations.length - 1;
    let i = 0;

    while (i < length) {
        if (typeof obj[locations[i]] !== 'object') {
            obj[locations[i]] = {};
        }
        obj = obj[locations[i]];
        i++;
    }

    obj[locations[length]] = value;
    return value;
};

/**
 *
 * @param {{ [key: string]: any }} obj
 * @param {string} key
 * @param {string} sep
 * @returns {any}
 */
this.get = (obj, key, sep = '.') => {
    let locations = key.split(sep);
    let length = locations.length - 1;
    let i = 0;

    while (i < length) {
        if (!obj[locations[i]]) return null;
        obj = obj[locations[i]];
        i++;
    }

    return obj[locations[length]];
};

/**
 *
 * @param {{ [key: string]: any }} obj
 * @param {string} key
 * @param {string} sep
 * @returns {void}
 */
this.unset = (obj, key, sep = '.') => {
    let locations = key.split(sep);
    let length = locations.length - 1;
    let i = 0;

    while (i < length) {
        if (!obj[locations[i]]) return null;
        obj = obj[locations[i]];
        i++;
    }

    return delete obj[locations[length]];
};

/**
 *
 * @param {any[]} array
 * @param {any} item
 * @returns {void}
 */
this.pull = (array, item) => {
    const index = array.indexOf(item);
    if (index > -1) {
        array.splice(index, 1);
    }
    return array;
};

module.exports = this;
