const { mkdirSync, writeFileSync } = require('fs');
const DatabaseError = require('../Error/DatabaseError');
const { sep } = require('path');
const {
    destroy,
    checkFile,
    isString,
    isNumber,
    write,
    read,
    set,
    get,
    unset,
    pull
} = require('../Utils/Util');
const { red, gray, blue } = require('colorette');

module.exports = class JsonDatabase {
    static DBCollection = [];

    constructor(options = {}) {
        let path;
        if (
            !options ||
            (options &&
                (options.databasePath === null ||
                    options.databasePath === undefined ||
                    options.databasePath === ''))
        )
            path = 'database.json';
        else if (options && options.databasePath) path = options.databasePath;

        if (!isString(path)) throw new DatabaseError('Database name must be string!');

        let seperator;
        if (
            !options ||
            (options &&
                (options.seperator === null ||
                    options.seperator === undefined ||
                    options.seperator === ''))
        )
            seperator = '.';
        else if (options && options.seperator) seperator = options.seperator;

        if (!isString(seperator)) throw new DatabaseError('Seperator must be string!');

        let processFolder = process.cwd();
        let databasePath = path;

        if (databasePath.endsWith(sep)) {
            databasePath += 'database.json';
        } else {
            if (!databasePath.endsWith('.json')) {
                databasePath += '.json';
            }
        }

        databasePath = databasePath.replace(processFolder, '').replace('/', sep).replace('\\', sep);

        if (databasePath.startsWith(sep)) {
            databasePath = databasePath.slice(1);
        }

        let dirs = databasePath.split(sep);
        let dbName = '';
        let dirNames = '';

        for (let dir of dirs) {
            if (!dir.endsWith('.json')) {
                dirNames += `${dir}${sep}`;
                if (!checkFile(`${processFolder}${sep}${dirNames}`)) {
                    mkdirSync(`${processFolder}${sep}${dirNames}`);
                }
            } else {
                dbName = `${dir}`;

                if (!checkFile(`${processFolder}${sep}${dirNames}${dbName}`)) {
                    writeFileSync(`${processFolder}${sep}${dirNames}${dbName}`, '{}');
                }
            }
        }

        this.dbPath = `${processFolder}${sep}${dirNames}${dbName}`;
        this.dbName = `${dirNames}${dbName}`;
        this.data = read(this.dbPath);
        this.sep = seperator;

        if (!JsonDatabase.DBCollection.includes(this.dbName)) {
            JsonDatabase.DBCollection.push(this.dbName);
        }
    }

    set(key, value) {
        if (key === '' || key === null || key === undefined)
            throw new DatabaseError('Please specify a key.');
        if (!isString(key)) throw new DatabaseError('Key must be string!');
        if (value === '' || value === null || value === undefined)
            throw new DatabaseError('Please specify a value.');
        set(this.data, key, value, this.sep);
        write(this.dbPath, this.data);
        return value;
    }

    has(key) {
        return this.get(key) ? true : false;
    }

    deleteAll() {
        this.data = {};
        write(this.dbPath, {});
        return true;
    }

    destroy() {
        this.data = {};
        destroy(this.dbPath);
        return true;
    }

    fetch(key) {
        if (key === '' || key === null || key === undefined)
            throw new DatabaseError('Please specify a key.');
        if (!isString(key)) throw new DatabaseError('Key must be string!');
        return get(this.data, key, this.sep);
    }

    get(key) {
        return this.fetch(key);
    }

    type(key) {
        if (this.has(key) === false) return null;
        if (Array.isArray(this.get(key))) return 'array';
        return typeof this.get(key);
    }

    delete(key) {
        if (this.has(key) === false) return null;
        unset(this.data, key, this.sep);
        write(this.dbPath, this.data);
        return true;
    }

    fetchAll() {
        return this.all();
    }

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

    size() {
        return this.all().length;
    }

    startsWith(value) {
        if (value === '' || value === null || value === undefined)
            throw new DatabaseError('Please specify a value.');
        return this.all().filter((x) => x.ID.startsWith(value));
    }

    endsWith(value) {
        if (value === '' || value === null || value === undefined)
            throw new DatabaseError('Please specify a value.');
        return this.all().filter((x) => x.ID.endsWith(value));
    }

    includes(value) {
        if (value === '' || value === null || value === undefined)
            throw new DatabaseError('Please specify a value.');
        return this.all().filter((x) => x.ID.includes(value));
    }

    push(key, value, valueIgnoreIfPresent = false, multiple = false) {
        let filteredValue = Array.isArray(value) ? value : [value];
        let array = this.get(key);

        if (this.has(key) === false) return this.set(key, filteredValue);
        if (this.arrayHas(key) === false)
            return console.log(
                `${blue('[ EraxDB ]')} => ${red('Error:')} ${gray(
                    'The type of data you specify must be array!'
                )}`
            );

        if (Array.isArray(value) && multiple === true) {
            for (let item of value) {
                if (valueIgnoreIfPresent === true) {
                    if (!this.arrayHasValue(key, item)) array.push(item);
                } else array.push(item);
            }
        } else {
            if (valueIgnoreIfPresent === true) {
                if (!this.arrayHasValue(key, value)) array.push(value);
            } else array.push(value);
        }

        return this.set(key, array);
    }

    math(key, operator, value, goToNegative = false) {
        if (operator === null || operator === undefined || operator === '')
            throw new DatabaseError('Please specify a operator. (-  +  *  /  %)');
        if (value === null || value === undefined || value === '')
            throw new DatabaseError('Please specify a value.');
        if (!isNumber(value)) throw new DatabaseError(`Value must be number!`);

        value = Number(value);

        if (this.has(key) === false) return this.set(key, value);
        let data = this.get(key);

        switch (operator) {
            case '+':
            case 'add':
            case 'addition':
                data += value;
                break;
            case '-':
            case 'subtract':
            case 'subtraction':
            case 'subtr':
            case 'sub':
            case 'substr':
                data -= value;
                if (goToNegative === false && data < 1) data = Number('0');
                break;
            case '*':
            case 'multiplication':
            case 'multiple':
            case 'mult':
            case 'multip':
                data *= value;
                break;
            case 'division':
            case 'div':
            case '/':
                data /= value;
                if (goToNegative === false && data < 1) data = Number('0');
                break;
            case '%':
            case 'percentage':
            case 'percent':
                data %= value;
                break;
            default:
                throw new DatabaseError('Invalid Operator! (-  +  *  /  %)');
        }

        return this.set(key, data);
    }

    add(key, value) {
        return this.math(key, '+', value);
    }

    subtract(key, value, goToNegative = false) {
        return this.math(key, '-', value, goToNegative);
    }

    arrayHas(key) {
        if (Array.isArray(this.get(key))) return true;
        return false;
    }

    info() {
        let p = require('../../package.json');

        return {
            Version: p.version,
            DatabaseName: this.dbName,
            DataSize: this.size(),
            DatabaseType: 'json'
        };
    }

    deleteEach(value, maxDeletedSize = 0) {
        let deleted = 0;
        maxDeletedSize = Number(maxDeletedSize);

        maxDeletedSize === null ? maxDeletedSize === 0 : maxDeletedSize === maxDeletedSize;
        maxDeletedSize === undefined ? maxDeletedSize === 0 : maxDeletedSize === maxDeletedSize;
        maxDeletedSize === '' ? maxDeletedSize === 0 : maxDeletedSize === maxDeletedSize;

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

    pull(key, value, multiple = false) {
        let array = this.get(key);

        if (this.has(key) === false) return null;
        if (this.arrayHas(key) === false)
            return console.log(
                `${blue('[ EraxDB ]')} => ${red('Error:')} ${gray(
                    'The type of data you specify must be array!'
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

    arrayHasValue(key, value) {
        if (this.has(key) === false) return null;
        if (this.arrayHas(key) === false)
            return console.log(
                `${blue('[ EraxDB ]')} => ${red('Error:')} ${gray(
                    'The type of data you specify must be array!'
                )}`
            );
        if (this.get(key).indexOf(value) > -1) return true;
        return false;
    }

    filter(callback) {
        return this.all().filter(callback);
    }

    findAndDelete(callback, maxDeletedSize = 0) {
        let deleted = 0;
        maxDeletedSize = Number(maxDeletedSize);

        maxDeletedSize === null ? maxDeletedSize === 0 : maxDeletedSize === maxDeletedSize;
        maxDeletedSize === undefined ? maxDeletedSize === 0 : maxDeletedSize === maxDeletedSize;
        maxDeletedSize === '' ? maxDeletedSize === 0 : maxDeletedSize === maxDeletedSize;

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

    keyArray() {
        let arr = [];
        Object.keys(this.data).forEach((key) => arr.push(key));
        return arr;
    }

    valueArray() {
        let arr = [];
        Object.values(this.data).forEach((value) => arr.push(value));
        return arr;
    }

    DBCollectionSize() {
        return JsonDatabase.DBCollection.length;
    }

    getDBName() {
        return this.dbName;
    }

    map(callback) {
        return this.all().map(callback);
    }

    reduce(callback) {
        return this.all().reduce(callback);
    }

    toJSON() {
        return this.data;
    }

    sort(callback) {
        return this.all().sort(callback);
    }
};
