const Sequelize = require("sequelize");
const Error = require("./Error");
const _ = require("lodash")

module.exports = class SqliteDatabase {
    constructor(options = { databasePath: "./database.sqlite" }) {

        this.dbPath = options.databasePath;

        if (!this.dbPath.startsWith('./')) this.dbPath = "./" + this.dbPath
        if (!this.dbPath.endsWith(".sqlite")) this.dbPath = this.dbPath + ".sqlite"

        this.dbName = this.dbPath.split("./").pop().split(".sqlite")[0];
        this.data = {};

        const sequelize = new Sequelize.Sequelize("database", "user", "password", {
            host: "localhost",
            dialect: "sqlite",
            logging: false,
            storage: this.dbPath
        });

        const Config = sequelize.define("EraxDB", {
            key: { type: Sequelize.DataTypes.STRING, unique: true, allowNull: false },
            value: { type: Sequelize.DataTypes.JSON, unique: true, allowNull: false }
        })

        this.sql = Config
        this.sql.sync()
    };

    /**
      * Belirttiğiniz veriyi kaydedersiniz.
      * @param {string} key Veri
      * @param {any} value Değer
      * @returns {Promise<any>}
      * @example await db.set("key", "value");
      */
    async set(key, value) {
        if (!key || key === "") return Error("Bir Veri Belirtmelisin.");
        if (!value || value === "") return Error("Bir Değer Belirtmelisin.");
        _.set(this.data, key, value)
        Object.entries(this.data).forEach(async entry => {
            let [key, value] = entry

            let tag = await this.sql.findOne({ where: { key: key } })
            if (!tag) {
                await this.sql.create({ key: key, value: value })
                this.data = {}
                return tag
            } else {
                await this.sql.update({ value: value }, { where: { key: key } })
                this.data = {}
                return tag
            }
        })
    };

    /**
     * Belirttiğiniz veri varmı/yokmu kontrol eder.
     * @param {string} key Veri
     * @returns {Promise<boolean>}
     * @example await db.has("key");
     */
    async has(key) {
        if (!key || key === "") return Error("Bir Veri Belirtmelisin.");
        if (await this.get(key)) return true;
        return false;
    };

    /**
    * Tüm verileri silersiniz.
    * @returns {Promise<boolean>}
    * @example await db.deleteAll();
    */
    async deleteAll() {
        await this.sql.findAll().then(async datas => {
            datas.forEach(async obj => {

                let key = await obj.dataValues.key
                let value = await obj.dataValues.value
                _.set(this.data, key, value)
            })
        })

        Object.keys(this.data).forEach(key => {
            this.delete(key)
        })

        this.data = {}
        return true;
    };

    /**
    * Belirttiğiniz veriyi çekersiniz.
    * @param {string} key Veri
    * @returns {Promise<any>}
    * @example await db.fetch("key");
    */
    async fetch(key) {
        if (!key || key === "") return Error("Bir Veri Belirtmelisin.");
        let tag = await this.sql.findOne({ where: { key: key } })
        if (!tag) return null
        let value = await tag.get("value")
        return value
    };

    /**
    * Belirttiğiniz veriyi çekersiniz.
    * @param {string} key Veri
    * @returns {Promise<any>}
    * @example await db.get("key");
    */
    async get(key) {
        if (!key || key === "") return Error("Bir Veri Belirtmelisin.");
        return await this.fetch(key)
    };

    /**
    * Verinin tipini öğrenirsiniz.
    * @param {string} key Veri
    * @returns {Promise<"array" | "string" | "number" | "boolean" | "symbol" | "function" | "object" | "null" | "undefined" | "bigint">}
    * @example await db.type("key");
    */
    async type(key) {
        if (!key || key === "") return Error(`Bir Veri Belirmelisin.`)
        if (this.has(key) === false) return null;
        if (Array.isArray(await this.get(key))) return "array";
        return typeof await this.get(key)
    };

    /**
    * Belirttiğiniz veriyi silersiniz.
    * @param {string} key Veri
    * @returns {Promise<boolean>}
    * @example await db.delete("key");
    */
    async delete(key) {
        if (!key || key === "") return Error(`Bir Veri Belirmelisin.`)
        if (this.has(key) === false) return null;
        await this.sql.destroy({ where: { key: key } })
        return true
    };

    /**
    * Tüm verileri Array içine ekler.
    * @example await db.fetchAll();
    * @returns {Promise<Array<{ ID: string, data: any }>>}
    */
    async fetchAll() {
        let arr = [];

        await this.sql.findAll().then(async datas => {
            datas.forEach(async obj => {

                let key = await obj.dataValues.key
                let value = await obj.dataValues.value
                _.set(this.data, key, value)
            })
        })

        Object.entries(this.data).forEach(entry => {
            const [key, value] = entry
            const data = {
                ID: key,
                data: value
            }
            arr.push(data)
        })

        this.data = {}
        return arr;
    };

    /**
    * Tüm verileri Array içine ekler.
    * @example await db.all();
    * @returns {Promise<Array<{ ID: string, data: any }>>}
    */
    async all() {
        let arr = [];

        await this.sql.findAll().then(async datas => {
            datas.forEach(async obj => {

                let key = await obj.dataValues.key
                let value = await obj.dataValues.value
                _.set(this.data, key, value)
            })
        })

        Object.entries(this.data).forEach(entry => {
            const [key, value] = entry
            const data = {
                ID: key,
                data: value
            }
            arr.push(data)
        })

        this.data = {}
        return arr;

    };

    /**
    * Database'de ki verilerin sayısını atar.
    * @example await db.size();
    * @returns {Promise<number>}
    */
    async size() {
        let arr = [];

        await this.sql.findAll().then(async datas => {
            datas.forEach(async obj => {

                let key = await obj.dataValues.key
                let value = await obj.dataValues.value
                _.set(this.data, key, value)
            })
        })

        Object.entries(this.data).forEach(entry => {
            const [key, value] = entry
            const data = {
                ID: key,
                data: value
            }
            arr.push(data)
        })

        this.data = {}
        console.log(arr.length)
        return arr.length
    };

    /**
    * Matematik işlemi yaparak veri kaydedersiniz.
    * @param {string} key Veri
    * @param {"+" | "-" | "*" | "/"} operator Operator
    * @param {number} value Değer
    * @param {boolean} goToNegative Value'nin -'lere düşük düşmeyeceği, default olarak false.
    * @returns {Promise<any>}
    * @example await db.math("key", "+", "1");
    */
    async math(key, operator, value, goToNegative = false) {
        if (!key || key === "") return Error("Bir Veri Belirtmelisin.")
        if (!operator || operator === "") return Error("Bir İşlem Belirtmelisin. (- + * /)")
        if (!value || value === "") return Error("Bir Değer Belirtmelisin.")
        if (isNaN(value)) return Error(`Değer Sadece Sayıdan Oluşabilir!`);

        if (this.has(key) === false) return await this.set(key, Number(value))
        let data = await this.get(key)

        if (operator === "-") {
            if (goToNegative === false && data < 1) data = Number("0")
            data = data - Number(value);
        } else if (operator === "+") {
            data = data + Number(value);
        } else if (operator === "*") {
            data = data * Number(value);
        } else if (operator === "/") {
            if (goToNegative === false && data < 1) data = Number("0")
            data = data / Number(value);
        } else {
            return Error("Geçersiz İşlem!");
        };

        return await this.set(key, data)
    };

    /**
      * Belirttiğiniz veriye 1 ekler.
      * @param {string} key Veri
      * @param {number} value Değer
      * @returns {Promise<any>}
      * @example await db.add("key", 1);
      */
    async add(key, value) {
        return await this.math(key, "+", value)
    };

    /**
      * Belirttiğiniz veriden 1 çıkarır.
      * @param {string} key Veri
      * @param {number} value Değer
      * @param {boolean} goToNegative Value'nin -'lere düşük düşmeyeceği, default olarak false.
      * @returns {Promise<any>}
      * @example await db.subtract("key", 1);
      */
    async subtract(key, value, goToNegative = false) {
        return await this.math(key, "-", value, goToNegative)
    };

    /**
      * Database bilgilerini öğrenirsiniz.
      * @example await db.info();
      * @returns {object}
      */
    info() {
        let p = require("../package.json")

        return {
            Sürüm: p.version,
            DatabaseAdı: this.dbName,
            ToplamVeriSayısı: this.size(),
            DatabaseTürü: "sqlite"
        }
    }

    /**
    * Belirttiğiniz değer ile başlayan verileri Array içine ekler.
    * @param {string} key Veri
    * @returns {Promise<Array<{ ID: string, data: any }>>}
    * @example await db.startsWith("key");
    */
    async startsWith(key) {
        let arr = []
        await this.sql.findAll().then(async datas => {
            datas.forEach(async obj => {

                let key = await obj.dataValues.key
                let value = await obj.dataValues.value
                _.set(this.data, key, value)
            })
        })

        Object.entries(this.data).forEach(entry => {
            const [newKey, newValue] = entry
            if (!newKey.startsWith(key)) return

            const data = {
                ID: newKey,
                data: newValue
            }
            arr.push(data)
        })

        this.data = {}
        return arr;
    }

    /**
    * Belirttiğiniz değer ile biten verileri Array içine ekler.
    * @param {string} key Veri
    * @returns {Promise<Array<{ ID: string, data: any }>>}
    * @example await db.endsWith("key");
    */
    async endsWith(key) {
        if (!key || key === "") return Error("Bir Veri Belirtmelisin.")
        let arr = []
        await this.sql.findAll().then(async datas => {
            datas.forEach(async obj => {

                let key = await obj.dataValues.key
                let value = await obj.dataValues.value
                _.set(this.data, key, value)
            })
        })

        Object.entries(this.data).forEach(entry => {
            const [newKey, newValue] = entry
            if (!newKey.endsWith(key)) return

            const data = {
                ID: newKey,
                data: newValue
            }
            arr.push(data)
        })

        this.data = {}
        return arr;
    }

    /**
    * Belirttiğiniz değeri içeren verileri Array içine ekler.
    * @param {string} key Veri
    * @returns {Promise<Array<{ ID: string, data: any }>>}
    * @example await db.includes("key");
    */
    async includes(key) {
        if (!key || key === "") return Error("Bir Veri Belirtmelisin.")
        let arr = []
        await this.sql.findAll().then(async datas => {
            datas.forEach(async obj => {

                let key = await obj.dataValues.key
                let value = await obj.dataValues.value
                _.set(this.data, key, value)
            })
        })

        Object.entries(this.data).forEach(entry => {
            const [newKey, newValue] = entry
            if (!newKey.includes(key)) return

            const data = {
                ID: newKey,
                data: newValue
            }
            arr.push(data)
        })

        this.data = {}
        return arr;
    }

    /**
     * Belirttiğiniz değeri içeren verileri siler.
     * @param {string} key Veri
     * @returns {Promise<boolean>}
     * @example await db.deleteEach("key");
     */
    async deleteEach(key) {
        if (!key || key === "") return Error("Bir Veri Belirtmelisin.")
        await this.sql.findAll().then(async datas => {
            datas.forEach(async obj => {

                let key = await obj.dataValues.key
                let value = await obj.dataValues.value
                _.set(this.data, key, value)
            })
        })

        Object.keys(this.data).forEach(newKey => {
            if (!newKey.includes(key)) return

            this.delete(newKey)
        })

        this.data = {}
        return true
    }

    /**
    * Verileri filtrelersiniz.
    * @param {(key: string) => boolean} callbackfn Callbackfn
    * @returns {Promise<Array<{ ID: string, data: any }>>}
    * @example await db.filter(x => x.ID.startsWith("key"));
    */
    async filter(callbackfn) {
        let arr = []
        await this.sql.findAll().then(async datas => {
            datas.forEach(async obj => {

                let key = await obj.dataValues.key
                let value = await obj.dataValues.value
                _.set(this.data, key, value)
            })
        })

        Object.entries(this.data).forEach(entry => {
            const [newKey, newValue] = entry

            const data = {
                ID: newKey,
                data: newValue
            }
            arr.push(data)
        })

        this.data = {}

        return arr.filter(callbackfn)
    }
};