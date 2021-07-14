const mongoose = require("mongoose");
const Error = require("./Error");
const _ = require("lodash");

module.exports = class MongoDatabase {
    constructor(options = { mongoURL }) {
        if (!options.mongoURL) return Error("MongoDB URL'si Bulunamadı!");
        if (!options.mongoURL.match(/^mongodb([a-z+]{0,15})?.+/g))
            return Error("Geçersiz MongoDB URL'si!");

        this.url = options.mongoURL;
        this.data = {};

        this.dbName = this.url.split("mongodb.net/")[1].split("?")[0];

        mongoose.connect(this.url, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true,
            useFindAndModify: false,
        });

        const Schema = new mongoose.Schema({
            key: {
                type: mongoose.Schema.Types.String,
                unique: true,
                required: true,
            },
            value: {
                type: mongoose.Schema.Types.Mixed,
                unique: true,
                required: true,
            },
        });

        this.mongo = mongoose.models.EraxDB || mongoose.model("EraxDB", Schema);
    }

    /**
     * Belirttiğiniz veriyi kaydedersiniz.
     * @param {string} key Veri
     * @param {any} value Değer
     * @example await db.set("key", "value");
     * @returns {Promise<any>}
     */
    async set(key, value) {
        if (!key || key === "") return Error("Bir Veri Belirtmelisin.");
        if (!value || value === "") return Error("Bir Değer Belirtmelisin.");
        _.set(this.data, key, value);
        Object.entries(this.data).forEach(async (entry) => {
            let [key, value] = entry;

            let tag = await this.mongo.findOne({ key: key });
            if (!tag) {
                await this.mongo.create({ key: key, value: value });
                this.data = {};
                return value;
            } else {
                await this.mongo.updateOne({ key: key }, { value: value });
                this.data = {};
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
        if (!key || key === "") return Error("Bir Veri Belirtmelisin.");
        if (await this.get(key)) return true;
        return false;
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
        if (!key || key === "") return Error("Bir Veri Belirtmelisin.");
        let tag = await this.mongo.findOne({ key: key });
        if (!tag) return null;
        return await tag.get("value");
    }

    /**
     * Belirttiğiniz veriyi çekersiniz.
     * @param {string} key Veri
     * @example await db.get("key");
     * @returns {Promise<any>}
     */
    async get(key) {
        if (!key || key === "") return Error("Bir Veri Belirtmelisin.");
        return await this.fetch(key);
    }

    /**
     * Belirttiğiniz verinin tipini öğrenirsiniz.
     * @param {string} key Veri
     * @example await db.type("key");
     * @returns {Promise<"array" | "string" | "number" | "boolean" | "symbol" | "function" | "object" | "null" | "undefined" | "bigint">}
     */
    async type(key) {
        if (!key || key === "") return Error(`Bir Veri Belirmelisin.`);
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
        if (!key || key === "") return Error(`Bir Veri Belirmelisin.`);
        let tag = await this.mongo.findOne({ key: key });
        if (!tag) return null;
        let value = await tag.get("value");
        await this.mongo.deleteOne({ key: key }, { value: value });
        return true;
    }

    /**
     * Tüm verileri Array içine ekler.
     * @example await db.fetchAll();
     * @returns {Promise<Array<{ ID: string, data: any }>>}
     */
    async fetchAll() {
        let arr = [];

        await this.mongo.find().then(async (data) => {
            data.forEach(async (obj) => {
                let key = await obj.key;
                let value = await obj.value;

                const data = {
                    ID: key,
                    data: value,
                };
                arr.push(data);
            });
        });

        return arr;
    }

    /**
     * Tüm verileri Array içine ekler.
     * @example await db.all();
     * @returns {Promise<Array<{ ID: string, data: any }>>}
     */
    async all() {
        let arr = [];

        await this.mongo.find().then(async (data) => {
            data.forEach(async (obj) => {
                let key = await obj.key;
                let value = await obj.value;

                const data = {
                    ID: key,
                    data: value,
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
     * @returns {Promise<any>}
     */
    async math(key, operator, value, goToNegative = false) {
        if (!key || key === "") return Error("Bir Veri Belirtmelisin.");
        if (!operator || operator === "")
            return Error("Bir İşlem Belirtmelisin. (- + * /)");
        if (!value || value === "") return Error("Bir Değer Belirtmelisin.");
        if (isNaN(value)) return Error(`Değer Sadece Sayıdan Oluşabilir!`);

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
     * @returns {Promise<any>}
     */
    async add(key, value) {
        return await this.math(key, "+", value);
    }

    /**
     * Belirttiğiniz veriden 1 çıkarır.
     * @param {string} key Veri
     * @param {number} value Değer
     * @param {boolean} goToNegative Value'nin -'lere düşük düşmeyeceği, default olarak false.
     * @returns {Promise<any>}
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
            ToplamVeriSayısı: await this.size(),
            DatabaseTürü: "mongo",
        };
    }

    /**
     * Belirttiğiniz değer ile başlayan verileri Array içine ekler.
     * @param {string} value Değer
     * @example await db.startsWith("key");
     * @returns {Promise<Array<{ ID: string, data: any }>>}
     */
    async startsWith(value) {
        if (!value || value === "") return Error("Bir Değer Belirtmelisin.");
        return await this.filter((x) => x.ID.startsWith(value));
    }

    /**
     * Belirttiğiniz değer ile biten verileri Array içine ekler.
     * @param {string} value Değer
     * @example await db.endsWith("key");
     * @returns {Promise<Array<{ ID: string, data: any }>>}
     */
    async endsWith(value) {
        if (!value || value === "") return Error("Bir Değer Belirtmelisin.");
        return await this.filter((x) => x.ID.endsWith(value));
    }

    /**
     * Belirttiğiniz değeri içeren verileri Array içine ekler.
     * @param {string} value Değer
     * @example await db.includes("key");
     * @returns {Promise<Array<{ ID: string, data: any }>>}
     */
    async includes(value) {
        if (!value || value === "") return Error("Bir Değer Belirtmelisin.");
        return await this.filter((x) => x.ID.includes(value));
    }

    /**
     * Belirttiğiniz değeri içeren verileri siler.
     * @param {string} value Değer
     * @example await db.deleteEach("key");
     * @returns {Promise<boolean>}
     */
    async deleteEach(value) {
        if (!value || value === "") return Error("Bir Değer Belirtmelisin.");
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
     * @param {(element: { ID: string, data: any }, index: number, array: Array<{ ID: string, data: any }>) => boolean} callbackfn Callbackfn
     * @example await db.filter((element) => element.ID.startsWith("key"));
     * @returns {Promise<Array<{ ID: string, data: any }>>}
     */
    async filter(callbackfn) {
        let arr = [];
        await this.mongo.find().then(async (data) => {
            data.forEach(async (obj) => {
                let key = await obj.key;
                let datavalue = await obj.value;

                const data = {
                    ID: key,
                    data: datavalue,
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
     * @returns {Promise<Array<string[]>>}
     */
    async push(key, value, valueIgnoreIfPresent = true) {
        if ((await this.has(key)) === false)
            return await this.set(key, [value]);
        else if (
            (await this.arrayHas(key)) === true &&
            (await this.has(key)) === true
        ) {
            let tag = await this.mongo.findOne({ key: key });
            let yenivalue = await tag.get("value");

            yenivalue.push(value);
            if (
                (await this.arrayHasValue(key, value)) === true &&
                valueIgnoreIfPresent === true
            )
                return "EraxDB => Bir Hata Oluştu: Şartlar Uygun Olmadığı İçin Veri Pushlanmadı.";
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
        let tag = await this.mongo.findOne({ key: key });
        let datavalue = await tag.get("value");
        if (Array.isArray(await datavalue)) return true;
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
        if (!key || key === "") return Error("Bir Veri Belirtmelisin.");
        if ((await this.has(key)) === false) return null;
        if ((await this.arrayHas(key)) === false)
            return "EraxDB => Bir Hata Oluştu: Belirtilen Verinin Tipi Array Olmak Zorundadır!";
        if (!value || value === "") return Error("Bir Değer Belirtmelisin.");
        let tag = await this.mongo.findOne({ key: key });
        let datavalue = await tag.get("value");
        if ((await datavalue.indexOf(value)) > -1) return true;
        return false;
    }

    /**
     * Belirttiğiniz verinin Array'ında belirttiğiniz değer varsa siler.
     * @param {string} key Veri
     * @param {any} value Değer
     * @example await db.pull("key", "value");
     * @returns {Promise<Array<any>>}
     */
    async pull(key, value) {
        if (!key || key === "") return Error("Bir Veri Belirtmelisin.");
        if (this.has(key) === false) return null;
        if (this.arrayHas(key) === false)
            return "EraxDB => Bir Hata Oluştu: Belirttiğiniz Verinin Tipi Array Olmak Zorundadır!";
        if (!value || value === "") return Error("Bir Değer Belirtmelisin.");

        let tag = await this.mongo.findOne({ key: key });
        let datavalue = await tag.get("value");

        if ((await this.arrayHasValue(key, value)) === false)
            return "EraxDB => Bir Hata Oluştu: Belirttiğiniz Değer Belirttiğiniz Verinin Array'ında Bulunmuyor.";

        let yenivalue = datavalue.filter((x) => x !== value);
        return await this.set(key, yenivalue);
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
     * @returns {Promise<Array<string[]>>}
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
     * @returns {Promise<Array<string[]>>}
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
};
