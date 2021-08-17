const mongoose = require("mongoose");
const Error = require("./Error");
const _ = require("lodash");
const fs = require("fs");

/**
 * Mongo Database
 * @class
 */
module.exports = class MongoDatabase {
    /**
     * Oluşturulmuş tüm Database'leri Array içinde gönderir.
     * @static
     * @type {MongoDatabase<string[]>}
     */
     static DBCollection = [];

    /**
     * Options
     * @constructor
     * @param {{ mongoURL: string }} options Database Options
     */
    constructor(options = { mongoURL }) {
        if (!options.mongoURL) return Error("MongoDB URL'si Bulunamadı!");
        if (!options.mongoURL.match(/^mongodb([a-z+]{0,15})?.+/g))
            return Error("Geçersiz MongoDB URL'si!");

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
     * @returns {Promise<any | any[]>}
     */
    async set(key, value) {
        if (key === "" || key === null || key === undefined)
            return Error("Bir Veri Belirtmelisin.");
        if (typeof key !== "string") return Error("Belirtilen Veri String Tipli Olmalıdır!");
        if (value === "" || value === null || value === undefined)
            return Error("Bir Değer Belirtmelisin.");

        let json = {};

        _.set(json, key, value);

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
     * @returns {Promise<any | any[]>}
     */
    async fetch(key) {
        if (key === "" || key === null || key === undefined)
            return Error("Bir Veri Belirtmelisin.");
        if (typeof key !== "string") return Error("Belirtilen Veri String Tipli Olmalıdır!");

        if (key.includes(".")) {
            let newkey = key.split(".").shift();
            let json = {};

            let tag = await this.mongo.findOne({ key: newkey });
            if ((await this.has(key)) === false) return null;

            let value = await tag.get("value");
            _.set(json, newkey, value);
            let newvalue = _.get(json, key);
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
     * @returns {Promise<any | any[]>}
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
            return Error("Bir Veri Belirtmelisin.");
        if (typeof key !== "string") return Error("Belirtilen Veri String Tipli Olmalıdır!");

        if (key.includes(".")) {
            let newkey = key.split(".").shift();
            if ((await this.has(newkey)) === false) return null;
            let tag = await this.mongo.findOne({ key: newkey });
            let value = await tag.get("value");
            let json = {};

            _.set(json, newkey, value);
            _.unset(json, key);

            let newvalue = _.get(json, newkey);
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
     * @returns {Promise<{ ID: string, data: any | any[] }[]>}
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
     * @returns {Promise<{ ID: string, data: any | any[] }[]>}
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
            return Error("Bir İşlem Belirtmelisin. (-  +  *  /  %)");
        if (isNaN(value)) return Error(`Belirtilen Değer Sadece Sayıdan Oluşabilir!`);

        if (this.has(key) === false) return await this.set(key, Number(value));
        let data = await this.get(key);

        if (operator === "-") {
            data = data - Number(value);
            if (goToNegative === false && data < 1) data = Number("0");
        } else if (operator === "+") {
            data = data + Number(value);
        } else if (operator === "*") {
            data = data * Number(value);
        } else if (operator === "/") {
            data = data / Number(value);
            if (goToNegative === false && data < 1) data = Number("0");
        } else if (operator === "%") {
            data = data % Number(value);
        } else {
            return Error("Geçersiz İşlem!");
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
        let p = require("../package.json");

        return {
            Sürüm: p.version,
            DatabaseAdı: this.dbName,
            ToplamVeriSayısı: await this.size,
            DatabaseTürü: "mongo"
        };
    }

    /**
     * Belirttiğiniz değer ile başlayan verileri Array içine ekler.
     * @param {string} value Değer
     * @example await db.startsWith("key");
     * @returns {Promise<{ ID: string, data: any | any[] }[]>}
     */
    async startsWith(value) {
        if (value === "" || value === null || value === undefined)
            return Error("Bir Değer Belirtmelisin.");
        return await this.filter((x) => x.ID.startsWith(value));
    }

    /**
     * Belirttiğiniz değer ile biten verileri Array içine ekler.
     * @param {string} value Değer
     * @example await db.endsWith("key");
     * @returns {Promise<{ ID: string, data: any | any[] }[]>}
     */
    async endsWith(value) {
        if (value === "" || value === null || value === undefined)
            return Error("Bir Değer Belirtmelisin.");
        return await this.filter((x) => x.ID.endsWith(value));
    }

    /**
     * Belirttiğiniz değeri içeren verileri Array içine ekler.
     * @param {string} value Değer
     * @example await db.includes("key");
     * @returns {Promise<{ ID: string, data: any | any[] }[]>}
     */
    async includes(value) {
        if (value === "" || value === null || value === undefined)
            return Error("Bir Değer Belirtmelisin.");
        return await this.filter((x) => x.ID.includes(value));
    }

    /**
     * Belirttiğiniz değeri içeren verileri siler.
     * @param {string} value Değer
     * @example await db.deleteEach("key");
     * @returns {Promise<boolean>}
     */
    async deleteEach(value) {
        if (value === "" || value === null || value === undefined)
            return Error("Bir Değer Belirtmelisin.");
        await this.mongo.find().then(async (data) => {
            data.forEach(async (obj) => {
                let key = await obj.key;
                if (!key.includes(value)) return;

                this.delete(key);
            });
        });

        return true;
    }

    /**
     * Verileri filtrelersiniz.
     * @param {(element: { ID: string, data: any | any[] }, index: number, array: { ID: string, data: any | any[] }[]) => boolean} callbackfn Callbackfn
     * @example await db.filter((element) => element.ID.startsWith("key"));
     * @returns {Promise<{ ID: string, data: any | any[] }[]>}
     */
    async filter(callbackfn) {
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

        return arr.filter(callbackfn);
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
                return "EraxDB => Bir Hata Oluştu: Şartlar Uygun Olmadığı İçin Veri Pushlanmadı.";
            yenivalue.push(value);
            return await this.set(key, yenivalue);
        } else {
            return "EraxDB => Bir Hata Oluştu: Şartlar Uygun Olmadığı İçin Veri Pushlanmadı.";
        }
    }

    /**
     * Belirttiğiniz veri Array'lı ise true, Array'sız ise false olarak cevap verir.
     * @param {string} key Veri
     * @example await db.arrayHas("key");
     * @returns {Promise<boolean>}
     */
    async arrayHas(key) {
        if (!key || key === "") return Error("Bir Veri Belirtmelisin.");
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
            return "EraxDB => Bir Hata Oluştu: Belirtilen Verinin Tipi Array Olmak Zorundadır!";
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
            return "EraxDB => Bir Hata Oluştu: Belirttiğiniz Verinin Tipi Array Olmak Zorundadır!";

        if ((await this.arrayHasValue(key, value)) === false)
            return "EraxDB => Bir Hata Oluştu: Belirttiğiniz Değer Belirttiğiniz Verinin Array'ında Bulunmuyor.";

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
     * @example db.keyArray()
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
     * @example db.valueArray()
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
    async import(path = "./database.json") {
        if (!path.startsWith("./")) path = "./" + path;
        if (!path.endsWith(".json")) path = path + ".json";

        let file = JSON.parse(fs.readFileSync(path, "utf-8"));

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
    async export(path = "./database.json") {
        if (!path.startsWith("./")) path = "./" + path;
        if (!path.endsWith(".json")) path = path + ".json";

        let json = {};

        await this.mongo.find().then(async (data) => {
            data.forEach(async (obj) => {
                let key = await obj.key;
                let value = await obj.value;

                _.set(json, key, value);
                fs.writeFileSync(path, JSON.stringify(json, null, 4));
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
};
