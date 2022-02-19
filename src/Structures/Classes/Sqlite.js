const { mkdirSync, writeFileSync } = require('fs');
const DatabaseError = require('../Error/DatabaseError');
const { sep } = require('path');
const {
    parseKey,
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

module.exports = class SqliteDatabase {
    static DBCollection = [];

    constructor(options = {}) {
        let SQL;

        try {
            SQL = require('better-sqlite3');
        } catch {
            throw new DatabaseError(
                'Please install module better-sqlite3 (npm install better-sqlite3@7.4.6)'
            );
        }

        let path;
        if (
            !options ||
            (options &&
                (options.databasePath === null ||
                    options.databasePath === undefined ||
                    options.databasePath === ''))
        )
            path = 'database.db';
        else if (options && options.databasePath) path = options.databasePath;

        if (!isString(path)) throw new DatabaseError('Database name must be string!');

        let tableName;
        if (
            !options ||
            (options &&
                (options.tableName === null ||
                    options.tableName === undefined ||
                    options.tableName === ''))
        )
            tableName = 'Erax_SQLITEDB';
        else if (options && options.tableName) tableName = options.tableName;

        if (!isString(tableName)) throw new DatabaseError('Table name must be string!');

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

        tableName = tableName.split(/ +/).join('');

        let processFolder = process.cwd();
        let databasePath = path;

        if (databasePath.endsWith(sep)) {
            databasePath += 'database.db';
        } else {
            if (!databasePath.endsWith('.db')) {
                databasePath += '.db';
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
            if (!dir.endsWith('.db')) {
                dirNames += `${dir}${sep}`;
                if (!checkFile(`${processFolder}${sep}${dirNames}`)) {
                    mkdirSync(`${processFolder}${sep}${dirNames}`);
                }
            } else {
                dbName = `${dir}`;
            }
        }

        this.dbName = `${dirNames}${dbName}`;
        this.dbPath = `${processFolder}${sep}${dirNames}${dbName}`;
        this.sql = new SQL(this.dbPath);
        this.sep = seperator;
        this.tableName = tableName;
        this.sql
            .prepare(`CREATE TABLE IF NOT EXISTS ${this.tableName} (key TEXT, value TEXT)`)
            .run();

        if (!SqliteDatabase.DBCollection.includes(this.dbName)) {
            SqliteDatabase.DBCollection.push(this.dbName);
        }
    }

    set(key, value) {
        if (key === '' || key === null || key === undefined)
            throw new DatabaseError('Please specify a key.');
        if (!isString(key)) throw new DatabaseError('Key must be string!');
        if (value === '' || value === null || value === undefined)
            throw new DatabaseError('Please specify a value.');

        let parsedKey = parseKey(key, this.sep);
        let data =
            this.sql.prepare(`SELECT * FROM ${this.tableName} WHERE key = (?)`).get(parsedKey) ||
            {};
        let json = {};

        if (!data.key) {
            set(json, key, value, this.sep);
            this.sql
                .prepare(`INSERT INTO ${this.tableName} (key, value) VALUES (?, ?)`)
                .run(parsedKey, JSON.stringify(json[parsedKey]));
        } else {
            set(json, parsedKey, JSON.parse(data.value), this.sep);
            set(json, key, value, this.sep);

            this.sql
                .prepare(`UPDATE ${this.tableName} SET value = (?) WHERE key = (?)`)
                .run(JSON.stringify(json[parsedKey]), parsedKey);
        }

        return value;
    }

    has(key) {
        return this.get(key) ? true : false;
    }

    deleteAll() {
        this.destroy();
        this.sql
            .prepare(`CREATE TABLE IF NOT EXISTS ${this.tableName} (key TEXT, value TEXT)`)
            .run();
        return true;
    }

    fetch(key) {
        if (key === '' || key === null || key === undefined)
            throw new DatabaseError('Please specify a key.');
        if (!isString(key)) throw new DatabaseError('Key must be string!');
        let parsedKey = parseKey(key, this.sep);
        let json = {};

        let data = this.sql
            .prepare(`SELECT * FROM ${this.tableName} WHERE key = (?)`)
            .get(parsedKey);
        if (!data) return null;

        let value = data.value;

        set(json, parsedKey, JSON.parse(value), this.sep);
        let parsedValue = get(json, key, this.sep);
        return parsedValue;
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
        if (key === '' || key === null || key === undefined)
            throw new DatabaseError('Please specify a key.');
        if (!isString(key)) throw new DatabaseError('Key must be string!');

        let parsedKey = parseKey(key, this.sep);
        let json = {};

        let data = this.sql
            .prepare(`SELECT * FROM ${this.tableName} WHERE key = (?)`)
            .get(parsedKey);
        if (!data || !this.has(key)) return null;

        let value = data.value;

        set(json, parsedKey, JSON.parse(value), this.sep);
        unset(json, key, this.sep);

        let parsedValue = get(json, parsedKey, this.sep);

        if (!parsedValue)
            this.sql.prepare(`DELETE FROM ${this.tableName} WHERE key = (?)`).run(parsedKey);
        else this.set(parsedKey, parsedValue);

        json = {};
        return true;
    }

    fetchAll() {
        let arr = this.all();

        return arr;
    }

    all() {
        let all = this.sql
            .prepare(`SELECT * FROM ${this.tableName} WHERE key IS NOT NULL`)
            .iterate();
        let arr = [];

        for (let data of all) {
            arr.push({
                ID: data.key,
                data: JSON.parse(data.value)
            });
        }

        return arr;
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

    info() {
        let p = require('../../package.json');

        return {
            Version: p.version,
            DatabaseName: this.dbName,
            DataSize: this.size(),
            DatabaseType: 'sqlite'
        };
    }

    startsWith(value) {
        if (value === '' || value === null || value === undefined)
            throw new DatabaseError('Please specify a value.');
        return this.filter((x) => x.ID.startsWith(value));
    }

    endsWith(value) {
        if (value === '' || value === null || value === undefined)
            throw new DatabaseError('Please specify a value.');
        return this.filter((x) => x.ID.endsWith(value));
    }

    destroy() {
        this.sql.prepare(`DROP TABLE IF EXISTS ${this.tableName}`).run();
        return true;
    }

    includes(value) {
        if (value === '' || value === null || value === undefined)
            throw new DatabaseError('Please specify a value.');
        return this.filter((x) => x.ID.includes(value));
    }

    deleteEach(value, maxDeletedSize = 0) {
        if (value === '' || value === null || value === undefined)
            throw new DatabaseError('Please specify a value.');

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

    filter(callback) {
        return this.all().filter(callback);
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

    arrayHas(key) {
        let value = this.get(key);
        if (Array.isArray(value)) return true;
        return false;
    }

    arrayHasValue(key, value) {
        if (this.has(key) === false) return null;
        if (this.arrayHas(key) === false)
            return console.log(
                `${blue('[ EraxDB ]')} => ${red('Error:')} ${gray(
                    'The value you specified is not in the array of the data you specified.'
                )}`
            );

        let datavalue = this.get(key);
        if (datavalue.indexOf(value) > -1) return true;
        return false;
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

    size() {
        return this.all().length;
    }

    keyArray() {
        let arr = [];
        let all = this.all();

        all.forEach((data) => {
            arr.push(data.ID);
        });

        return arr;
    }

    valueArray() {
        let arr = [];
        let all = this.all();

        all.forEach((data) => {
            arr.push(data.data);
        });

        return arr;
    }

    import(path = 'database.json') {
        let processFolder = process.cwd();
        let databasePath = path;

        if (!databasePath.endsWith('.json')) {
            databasePath += '.json';
        }

        databasePath = databasePath.replace(processFolder, '').replace('/', sep).replace('\\', sep);

        if (databasePath.startsWith(sep)) {
            databasePath = databasePath.slice(1);
        }

        if (!checkFile(`${processFolder}${sep}${databasePath}`)) return null;

        let file = read(`${processFolder}${sep}${databasePath}`);

        Object.entries(file).forEach((entry) => {
            let [key, value] = entry;
            this.set(key, value);
        });
        return true;
    }

    export(path = 'database.json') {
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

        let dbPath = `${processFolder}${sep}${dirNames}${dbName}`;

        let json = {};
        let all = this.all();

        all.forEach((data) => {
            let key = data.ID;
            let value = data.data;

            json[key] = value;
        });

        write(dbPath, json);

        return true;
    }

    DBCollectionSize() {
        return SqliteDatabase.DBCollection.length;
    }

    getDBName() {
        return this.dbName;
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

    map(callback) {
        return this.all().map(callback);
    }

    reduce(callback) {
        return this.all().reduce(callback);
    }

    toJSON() {
        let json = {};

        this.all().forEach((data) => {
            json[data.ID] = data.data;
        });

        return json;
    }

    sort(callback) {
        return this.all().sort(callback);
    }
};
