const fs = require('fs');
const YAML = require('yaml');

function destroy(path) {
    if (fs.existsSync(path)) {
        return fs.unlinkSync(path);
    } else {
        return null;
    }
}

function parseKey(key, sep = '.') {
    return key.includes(sep) ? key.split(sep).shift() : key;
}

function checkFile(path) {
    return fs.existsSync(path);
}

function isString(value) {
    return typeof value === 'string';
}

function isNumber(value) {
    return +value === +value;
}

function isObject(value) {
    return Array.isArray(value) ? false : typeof value === 'object';
}

function write(path, data) {
    if (path.endsWith('.json')) {
        return fs.writeFileSync(path, JSON.stringify(data, null, 4));
    } else if (path.endsWith('.yml')) {
        return fs.writeFileSync(path, YAML.stringify(data, { indent: 4 }));
    }
}

function read(path) {
    if (fs.existsSync(path)) {
        if (path.endsWith('.json')) {
            return JSON.parse(fs.readFileSync(path, 'utf-8'));
        } else if (path.endsWith('.yml')) {
            return YAML.parse(fs.readFileSync(path, 'utf-8'));
        }
    }
}

function set(obj, key, value, sep = '.') {
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
}

function get(obj, key, sep = '.') {
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

function unset(obj, key, sep = '.') {
    let locations = key.split(sep);
    let length = locations.length - 1;
    let i = 0;

    while (i < length) {
        if (!obj[locations[i]]) return null;
        obj = obj[locations[i]];
        i++;
    }

    return delete obj[locations[length]];
}

function pull(array, item) {
    const index = array.indexOf(item);
    if (index > -1) {
        array.splice(index, 1);
    }
    return array;
}

module.exports = {
    destroy,
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
};
