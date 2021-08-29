const mongoose = require("mongoose");
const fs = require("fs");
const ErrorManager = require("../utils/ErrorManager");
const path = require("path");
const Util = require("../utils/Util");
const chalk = require("chalk");

/**
 * Mongo Database
 * @class
 */
module.exports = class MongoDatabase {
    /**
     * Oluşturulmuş tüm Database'leri Array içinde gönderir.
     * @static
     * @type {string[]}
     */
    static DBCollection = [];

    /**
     * Options
     * @constructor
     * @param {{ mongoURL: string }} options Database Options
     */
    constructor(options = { mongoURL }) {
        if (!options.mongoURL) throw new ErrorManager("MongoDB URL'si Bulunamadı!");
        if (!options.mongoURL.match(/^mongodb([a-z+]{0,15})?.+/g))
            throw new ErrorManager("Geçersiz MongoDB URL'si!");

        this.url = options.mongoURL;

        this.dbName = this.url.split("mongodb.net/").pop().split("?")[0];

        mongoose.connect(this.url, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true,
            useFindAndModify: false
        });

        const Schema = new mongoose.Schema({
            key: {
                type: mongoose.Schema.Types.String,
                unique: true,
                required: true
            },
            value: {
                type: mongoose.Schema.Types.Mixed,
                unique: true,
                required: true
            }
        });

        this.mongo = mongoose.models.EraxDB || mongoose.model("EraxDB", Schema);

        if (!MongoDatabase.DBCollection.includes(this.dbName)) {
            MongoDatabase.DBCollection.push(this.dbName);
        }
    }

    /**
     * Belirttiğiniz veriyi kaydedersiniz.
     * @param {string} key Veri
     * @param {any} value Değer
     * @example await db.set("key", "value");
     * @returns {Promise<any>}
     */
    async set(key, value) {
        if (key === "" || key === null || key === undefined)
            throw new ErrorManager("Bir Veri Belirtmelisin.");
        if (typeof key !== "string")
            throw new ErrorManager("Belirtilen Veri String Tipli Olmalıdır!");
        if (value === "" || value === null || value === undefined)
            throw new ErrorManager("Bir Değer Belirtmelisin.");

        let json = {};

        Util.dataSet(json, key, value);

        Object.entries(json).forEach(async (entry) => {
            let [key, value] = entry;

            let tag = await this.mongo.findOne({ key: key });
            if (!tag) {
                await this.mongo.create({ key: key, value: value });
                json = {};
                return value;
            } else {
                await this.mongo.updateOne({ key: key }, { value: value });
                json = {};
                return value;
            }
        });
    }

    /**
     * Belirttiğiniz veri varmı/yokmu kontrol eder.
     * @param {string} key Veri
     * @example await db.has("key");
     * @returns {Promise<boolean>}
     */
    async has(key) {
        return (await this.get(key)) ? true : false;
    }

    /**
     * Tüm verileri silersiniz.
     * @example await db.deleteAll();
     * @returns {Promise<boolean>}
     */
    async deleteAll() {
        await this.mongo.deleteMany({});
        return true;
    }

    /**
     * Belirttiğiniz veriyi çekersiniz.
     * @param {string} key Veri
     * @example await db.fetch("key");
     * @returns {Promise<any>}
     */
    async fetch(key) {
        if (key === "" || key === null || key === undefined)
            throw new ErrorManager("Bir Veri Belirtmelisin.");
        if (typeof key !== "string")
            throw new ErrorManager("Belirtilen Veri String Tipli Olmalıdır!");

        if (key.includes(".")) {
            let newkey = Util.parseKey(key);
            let json = {};

            let tag = await this.mongo.findOne({ key: newkey });
            if ((await this.has(key)) === false) return null;

            let value = await tag.get("value");
            Util.dataSet(json, newkey, value);
            let newvalue = Util.dataGet(json, key);
            json = {};
            return newvalue;
        } else {
            let tag = await this.mongo.findOne({ key: key });
            if ((await this.has(key)) === false) return null;
            return await tag.get("value");
        }
    }

    /**
     * Belirttiğiniz veriyi çekersiniz.
     * @param {string} key Veri
     * @example await db.get("key");
     * @returns {Promise<any>}
     */
    async get(key) {
        return await this.fetch(key);
    }

    /**
     * Belirttiğiniz verinin tipini öğrenirsiniz.
     * @param {string} key Veri
     * @example await db.type("key");
     * @returns {Promise<"array" | "string" | "number" | "boolean" | "symbol" | "function" | "object" | "null" | "undefined" | "bigint">}
     */
    async type(key) {
        if (this.has(key) === false) return null;
        if (Array.isArray(await this.get(key))) return "array";
        return typeof (await this.get(key));
    }

    /**
     * Belirttiğiniz veriyi silersiniz.
     * @param {string} key Veri
     * @example await db.delete("key");
     * @returns {Promise<boolean>}
     */
    async delete(key) {
        if (key === "" || key === null || key === undefined)
            throw new ErrorManager("Bir Veri Belirtmelisin.");
        if (typeof key !== "string")
            throw new ErrorManager("Belirtilen Veri String Tipli Olmalıdır!");

        if (key.includes(".")) {
            let newkey = key.split(".").shift();
            if ((await this.has(newkey)) === false) return null;
            let tag = await this.mongo.findOne({ key: newkey });
            let value = await tag.get("value");
            let json = {};

            Util.dataSet(json, newkey, value);
            Util.dataDelete(json, key);

            let newvalue = Util.dataGet(json, newkey);
            await this.set(newkey, newvalue);
            json = {};
            return true;
        } else {
            if ((await this.has(key)) === false) return null;
            let tag = await this.mongo.findOne({ key: key });
            let value = await tag.get("value");
            await this.mongo.deleteOne({ key: key }, { value: value });
            return true;
        }
    }

    /**
     * Tüm verileri Array içine ekler.
     * @example await db.fetchAll();
     * @returns {Promise<{ ID: string, data: any }[]>}
     */
    async fetchAll() {
        let arr = [];

        await this.mongo.find().then(async (data) => {
            data.forEach(async (obj) => {
                let key = await obj.key;
                let value = await obj.value;

                const data = {
                    ID: key,
                    data: value
                };
                arr.push(data);
            });
        });

        return arr;
    }

    /**
     * Tüm verileri Array içine ekler.
     * @example await db.all();
     * @returns {Promise<{ ID: string, data: any }[]>}
     */
    async all() {
        let arr = [];

        await this.mongo.find().then(async (data) => {
            data.forEach(async (obj) => {
                let key = await obj.key;
                let value = await obj.value;

                const data = {
                    ID: key,
                    data: value
                };
                arr.push(data);
            });
        });

        return arr;
    }

    /**
     * Matematik işlemi yaparak veri kaydedersiniz.
     * @param {string} key Veri
     * @param {"+" | "-" | "*" | "/" | "%"} operator Operator
     * @param {number} value Değer
     * @param {boolean} goToNegative Value'nin -'lere düşük düşmeyeceği, default olarak false.
     * @example await db.math("key", "+", "1");
     * @returns {Promise<number>}
     */
    async math(key, operator, value, goToNegative = false) {
        if (operator === null || operator === undefined || operator === "")
            throw new ErrorManager("Bir İşlem Belirtmelisin. (-  +  *  /  %)");
        if (value === null || value === undefined || value === "")
            throw new ErrorManager("Bir Değer Belirtmelisin.");
        if (isNaN(value)) throw new ErrorManager(`Belirtilen Değer Sadece Sayıdan Oluşabilir!`);

        if (this.has(key) === false) return await this.set(key, Number(value));
        let data = await this.get(key);

        switch (operator) {
            case "+":
            case "add":
            case "addition":
            case "ekle":
                data += Number(value);
                break;
            case "-":
            case "subtract":
            case "subtraction":
            case "subtr":
            case "çıkar":
            case "sub":
            case "substr":
                data -= Number(value);
                if (goToNegative === false && data < 1) data = Number("0");
                break;
            case "*":
            case "multiplication":
            case "çarp":
            case "çarpma":
                data *= Number(value);
                break;
            case "bölme":
            case ".":
            case "division":
            case "div":
            case "/":
                data /= Number(value);
                if (goToNegative === false && data < 1) data = Number("0");
                break;
            case "%":
            case "yüzde":
            case "percentage":
            case "percent":
                data %= Number(value);
                break;
            default:
                throw new ErrorManager("Geçersiz İşlem!");
        }

        return await this.set(key, data);
    }

    /**
     * Belirttiğiniz veriye 1 ekler.
     * @param {string} key Veri
     * @param {number} value Değer
     * @example await db.add("key", 1);
     * @returns {Promise<number>}
     */
    async add(key, value) {
        return await this.math(key, "+", value);
    }

    /**
     * Belirttiğiniz veriden 1 çıkarır.
     * @param {string} key Veri
     * @param {number} value Değer
     * @param {boolean} goToNegative Value'nin -'lere düşük düşmeyeceği, default olarak false.
     * @returns {Promise<number>}
     * @example await db.subtract("key", 1);
     */
    async subtract(key, value, goToNegative = false) {
        return await this.math(key, "-", value, goToNegative);
    }

    /**
     * Database bilgilerini öğrenirsiniz.
     * @example await db.info();
     * @returns {Promise<{ Sürüm: number, DatabaseAdı: string, ToplamVeriSayısı: number, DatabaseTürü: "mongo" }>}
     */
    async info() {
        let p = require("../../package.json");

        return {
            Sürüm: p.version,
            DatabaseAdı: this.dbName,
            ToplamVeriSayısı: await this.size(),
            DatabaseTürü: "mongo"
        };
    }

    /**
     * Belirttiğiniz değer ile başlayan verileri Array içine ekler.
     * @param {string} value Değer
     * @example await db.startsWith("key");
     * @returns {Promise<{ ID: string, data: any }[]>}
     */
    async startsWith(value) {
        if (value === "" || value === null || value === undefined)
            throw new ErrorManager("Bir Değer Belirtmelisin.");
        return await this.filter((x) => x.ID.startsWith(value));
    }

    /**
     * Belirttiğiniz değer ile biten verileri Array içine ekler.
     * @param {string} value Değer
     * @example await db.endsWith("key");
     * @returns {Promise<{ ID: string, data: any }[]>}
     */
    async endsWith(value) {
        if (value === "" || value === null || value === undefined)
            throw new ErrorManager("Bir Değer Belirtmelisin.");
        return await this.filter((x) => x.ID.endsWith(value));
    }

    /**
     * Belirttiğiniz değeri içeren verileri Array içine ekler.
     * @param {string} value Değer
     * @example await db.includes("key");
     * @returns {Promise<{ ID: string, data: any }[]>}
     */
    async includes(value) {
        if (value === "" || value === null || value === undefined)
            throw new ErrorManager("Bir Değer Belirtmelisin.");
        return await this.filter((x) => x.ID.includes(value));
    }

    /**
     * Belirttiğiniz değeri içeren verileri siler.
     * @param {string} value Değer
     * @param {number} maxDeletedSize Silinecek maksimum veri sayısı.
     * @example await db.deleteEach("key");
     * @returns {Promise<boolean>}
     */
    async deleteEach(value, maxDeletedSize = 0) {
        if (value === "" || value === null || value === undefined)
            throw new ErrorManager("Bir Değer Belirtmelisin.");

        let deleted = 0;
        maxDeletedSize = Number(maxDeletedSize);

        maxDeletedSize === null ? maxDeletedSize === 0 : maxDeletedSize === maxDeletedSize;
        maxDeletedSize === undefined ? maxDeletedSize === 0 : maxDeletedSize === maxDeletedSize;
        maxDeletedSize === "" ? maxDeletedSize === 0 : maxDeletedSize === maxDeletedSize;

        await this.mongo.find().then(async (data) => {
            data.forEach(async (obj) => {
                let key = await obj.key;
                let dval = await obj.value;
                if (!key.includes(value)) return;

                if (maxDeletedSize === 0) {
                    await this.mongo.deleteOne({ key: key }, { value: dval });
                    deleted++;
                } else {
                    if (deleted < maxDeletedSize) {
                        await this.mongo.deleteOne({ key: key }, { value: dval });
                        deleted++;
                    }
                }
            });
        });

        return true;
    }

    /**
     * Verileri filtrelersiniz.
     * @param {(element: { ID: string, data: any }) => boolean} callback Callback
     * @example await db.filter((element) => element.ID.startsWith("key"));
     * @returns {Promise<{ ID: string, data: any }[]>}
     */
    async filter(callback) {
        let arr = [];
        await this.mongo.find().then(async (data) => {
            data.forEach(async (obj) => {
                let key = await obj.key;
                let value = await obj.value;

                const data = {
                    ID: key,
                    data: value
                };
                arr.push(data);
            });
        });

        return arr.filter(callback);
    }

    /**
     * Yeni Array oluşturup gönderir.
     * @param {(element: { ID: string, data: any }) => boolean} callback Callback
     * @example await db.map((element) => element.ID);
     * @returns {any[]}
     */
    async map(callback) {
        let arr = [];
        await this.mongo.find().then(async (data) => {
            data.forEach(async (obj) => {
                let key = await obj.key;
                let value = await obj.value;

                const data = {
                    ID: key,
                    data: value
                };
                arr.push(data);
            });
        });

        return arr.map(callback);
    }

    /**
     * Belirttiğiniz veriyi Array'lı kaydedersiniz.
     * @param {string} key Veri
     * @param {any} value Değer
     * @param {boolean} valueIgnoreIfPresent Belirtilen verinin Array'ında belirtilen Value varsa otomatik yoksay, default olarak true.
     * @example await db.push("key", "value");
     * @returns {Promise<any[]>}
     */
    async push(key, value, valueIgnoreIfPresent = true) {
        if ((await this.has(key)) === false) return await this.set(key, [value]);
        else if ((await this.arrayHas(key)) === true && (await this.has(key)) === true) {
            let yenivalue = await this.get(key);
            if (yenivalue.includes(value) && valueIgnoreIfPresent === true)
                return console.log(
                    `${chalk.blue("EraxDB")} => ${chalk.red("Bir Hata Oluştu:")} ${chalk.gray(
                        "Şartlar Uygun Olmadığı İçin Veri Pushlanmadı."
                    )}`
                );
            yenivalue.push(value);
            return await this.set(key, yenivalue);
        } else {
            return console.log(
                `${chalk.blue("EraxDB")} => ${chalk.red("Bir Hata Oluştu:")} ${chalk.gray(
                    "Şartlar Uygun Olmadığı İçin Veri Pushlanmadı."
                )}`
            );
        }
    }

    /**
     * Belirttiğiniz veri Array'lı ise true, Array'sız ise false olarak cevap verir.
     * @param {string} key Veri
     * @example await db.arrayHas("key");
     * @returns {Promise<boolean>}
     */
    async arrayHas(key) {
        if (!key || key === "") throw new ErrorManager("Bir Veri Belirtmelisin.");
        let value = await this.get(key);
        if (Array.isArray(await value)) return true;
        return false;
    }

    /**
     * Belirttiğiniz verinin Array'ında belirttiğiniz değer varmı/yokmu kontrol eder.
     * @param {string} key Veri
     * @param {any} value Değer
     * @example await db.arrayHasValue("key", "value");
     * @returns {Promise<boolean>}
     *
     */
    async arrayHasValue(key, value) {
        if ((await this.has(key)) === false) return null;
        if ((await this.arrayHas(key)) === false)
            return console.log(
                `${chalk.blue("EraxDB")} => ${chalk.red("Bir Hata Oluştu:")} ${chalk.gray(
                    "Belirttiğiniz Verinin Tipi Array Olmak Zorundadır!"
                )}`
            );
        let datavalue = await this.get(key);
        if ((await datavalue.indexOf(value)) > -1) return true;
        return false;
    }

    /**
     * Belirttiğiniz verinin Array'ında belirttiğiniz değer varsa siler.
     * @param {string} key Veri
     * @param {any} value Değer
     * @example await db.pull("key", "value");
     * @returns {Promise<any[]>}
     */
    async pull(key, value) {
        if (this.has(key) === false) return null;
        if (this.arrayHas(key) === false)
            return console.log(
                `${chalk.blue("EraxDB")} => ${chalk.red("Bir Hata Oluştu:")} ${chalk.gray(
                    "Belirttiğiniz Verinin Tipi Array Olmak Zorundadır!"
                )}`
            );

        if ((await this.arrayHasValue(key, value)) === false)
            return console.log(
                `${chalk.blue("EraxDB")} => ${chalk.red("Bir Hata Oluştu:")} ${chalk.gray(
                    "Belirttiğiniz Değer Belirttiğiniz Verinin Array'ında Bulunmuyor."
                )}`
            );

        let oldArr = await this.get(key);
        let newArr = oldArr.filter((x) => x !== value);

        return await this.set(key, newArr);
    }

    /**
     * Database'de ki verilerin sayısını atar.
     * @example await db.size();
     * @returns {Promise<number>}
     */
    async size() {
        let arr = [];

        await this.mongo.find().then(async (data) => {
            data.forEach(async (obj) => {
                let key = await obj.key;
                arr.push(key);
            });
        });

        return arr.length;
    }

    /**
     * Tüm verilerin adını Array içine ekler.
     * @example await db.keyArray()
     * @returns {Promise<string[]>}
     */
    async keyArray() {
        let arr = [];

        await this.mongo.find().then(async (data) => {
            data.forEach(async (obj) => {
                let key = await obj.key;
                arr.push(key);
            });
        });

        return arr;
    }

    /**
     * Tüm verilerin değerini Array içine ekler.
     * @example await db.valueArray()
     * @returns {Promise<any[]>}
     */
    async valueArray() {
        let arr = [];

        await this.mongo.find().then(async (data) => {
            data.forEach(async (obj) => {
                let value = await obj.value;
                arr.push(value);
            });
        });

        return arr;
    }

    /**
     * Belirtilen JSON dosyasından verileri import eder.
     * @param {string} path Dosya
     * @example await db.import("./database.json")
     * @returns {Promise<boolean>}
     */
    async import(pathh = "./database.json") {
        let processFolder = process.cwd();
        let databasePath = pathh;

        if (!databasePath.endsWith(".json")) {
            databasePath += ".json";
        }

        if (!fs.existsSync(`${processFolder}${path.sep}${databasePath}`)) return null;

        let file = JSON.parse(
            fs.readFileSync(`${processFolder}${path.sep}${databasePath}`, "utf-8")
        );

        Object.entries(file).forEach(async (entry) => {
            let [key, value] = entry;
            await this.set(key, value);
        });
        return true;
    }

    /**
     * Belirtilen JSON dosyasına verileri export eder.
     * @param {string} path Dosya
     * @example await db.export("./database.json")
     * @returns {Promise<boolean>}
     */
    async export(pathh = "./database.json") {
        let processFolder = process.cwd();
        let databasePath = pathh;

        if (databasePath.endsWith(path.sep)) {
            databasePath += "database.json";
        } else {
            if (!databasePath.endsWith(".json")) {
                databasePath += ".json";
            }
        }

        let dirs = databasePath.split(path.sep).filter((dir) => dir !== "");
        let dbName = "";
        let dirNames = "";

        for (let i = 0; i < dirs.length; i++) {
            if (!dirs[i].endsWith(".json")) {
                dirNames += `${dirs[i]}${path.sep}`;
                if (!fs.existsSync(`${processFolder}${path.sep}${dirNames}`)) {
                    fs.mkdirSync(`${processFolder}${path.sep}${dirNames}`);
                }
            } else {
                dbName = `${dirs[i]}`;

                if (!fs.existsSync(`${processFolder}${path.sep}${dirNames}${dbName}`)) {
                    fs.writeFileSync(`${processFolder}${path.sep}${dirNames}${dbName}`, "{}");
                }
            }
        }

        let dbPath = `${process.cwd()}${path.sep}${dirNames}${dbName}`;

        let json = {};

        await this.mongo.find().then(async (data) => {
            data.forEach(async (obj) => {
                let key = await obj.key;
                let value = await obj.value;

                Util.dataSet(json, key, value);
                fs.writeFileSync(dbPath, JSON.stringify(json, null, 4));
            });
        });

        json = {};
        return true;
    }

    /**
     * Oluşturulmuş tüm Database'lerin sayısını gönderir.
     * @example db.DBCollectionSize()
     * @returns {number}
     */
    DBCollectionSize() {
        return MongoDatabase.DBCollection.length;
    }

    /**
     * Database adını gönderir.
     * @example db.getDBName()
     * @returns {string}
     */
    getDBName() {
        return this.dbName;
    }

    /**
     * Verileri filteleyip silersiniz.
     * @param {(element: { ID: string, data: any }) => boolean} callback Callback
     * @param {number} maxDeletedSize Silinecek maksimum veri sayısı.
     * @example await db.filterAndDelete((element) => element.ID.includes("test"));
     * @returns {Promise<number>}
     */
    async filterAndDelete(callback, maxDeletedSize = 0) {
        let deleted = 0;
        maxDeletedSize = Number(maxDeletedSize);

        maxDeletedSize === null ? maxDeletedSize === 0 : maxDeletedSize === maxDeletedSize;
        maxDeletedSize === undefined ? maxDeletedSize === 0 : maxDeletedSize === maxDeletedSize;
        maxDeletedSize === "" ? maxDeletedSize === 0 : maxDeletedSize === maxDeletedSize;

        let filtered = await this.filter(callback);
        filtered.forEach(async (obj) => {
            if (maxDeletedSize === 0) {
                await this.mongo.deleteOne({ key: obj.ID }, { value: obj.data });
                deleted++;
            } else {
                if (deleted < maxDeletedSize) {
                    await this.mongo.deleteOne({ key: obj.ID }, { value: obj.data });
                    deleted++;
                }
            }
        });
        return deleted;
    }
};
