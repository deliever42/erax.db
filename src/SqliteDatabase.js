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
      * @example await db.set("key", "value");
      * @returns {Promise<any>}
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
                return await tag.get("value")
            } else {
                await this.sql.update({ value: value }, { where: { key: key } })
                this.data = {}
                return await tag.get("value")
            }
        })
    };

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
    };

    /**
    * Tüm verileri silersiniz.
    * @example await db.deleteAll();
    * @returns {Promise<boolean>}
    */
    async deleteAll() {
        await this.sql.findAll().then(async datas => {
            datas.forEach(async obj => {

                let key = await obj.dataValues.key
                let value = await obj.dataValues.value
                _.set(this.data, key, value)
            })
        })

        Object.keys(this.data).forEach(async key => {
            await this.delete(key)
        })

        this.data = {}
        return true;
    };

    /**
    * Belirttiğiniz veriyi çekersiniz.
    * @param {string} key Veri
    * @example await db.fetch("key");
    * @returns {Promise<any>}
    */
    async fetch(key) {
        if (!key || key === "") return Error("Bir Veri Belirtmelisin.");
        let tag = await this.sql.findOne({ where: { key: key } })
        if (!tag) return null
        return await tag.get("value")
    };

    /**
    * Belirttiğiniz veriyi çekersiniz.
    * @param {string} key Veri
    * @example await db.get("key");
    * @returns {Promise<any>}
    */
    async get(key) {
        if (!key || key === "") return Error("Bir Veri Belirtmelisin.");
        return await this.fetch(key)
    };

    /**
    * Verinin tipini öğrenirsiniz.
    * @param {string} key Veri
    * @example await db.type("key");
    * @returns {Promise<"array" | "string" | "number" | "boolean" | "symbol" | "function" | "object" | "null" | "undefined" | "bigint">}
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
    * @example await db.delete("key");
    * @returns {Promise<boolean>}
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
        return arr.length
    };

    /**
    * Matematik işlemi yaparak veri kaydedersiniz.
    * @param {string} key Veri
    * @param {"+" | "-" | "*" | "/"} operator Operator
    * @param {number} value Değer
    * @param {boolean} goToNegative Value'nin -'lere düşük düşmeyeceği, default olarak false.
    * @example await db.math("key", "+", "1");
    * @returns {Promise<any>}
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
      * @example await db.add("key", 1);
      * @returns {Promise<any>}
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
    * @example await db.startsWith("key");
    * @returns {Promise<Array<{ ID: string, data: any }>>}
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
    * @example await db.endsWith("key");
    * @returns {Promise<Array<{ ID: string, data: any }>>}
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
    * @example await db.includes("key");
    * @returns {Promise<Array<{ ID: string, data: any }>>}
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
     * @example await db.deleteEach("key");
     * @returns {Promise<boolean>}
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
    * @example await db.filter(x => x.ID.startsWith("key"));
    * @returns {Promise<Array<{ ID: string, data: any }>>}
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

    /**
      * Belirttiğiniz veriyi Array'lı kaydedersiniz.
      * @param {string} key Veri
      * @param {any} value Değer
      * @param {boolean} valueIgnoreIfPresent Belirtilen verinin Array'ında belirtilen Value varsa otomatik yoksay, default olarak true.
      * @example await db.push("key", "value");
      * @returns {Promise<Array<any>>}
      */
    async push(key, value, valueIgnoreIfPresent = true) {
        if (await this.has(key) === false) return await this.set(key, [value]);
        else if (await this.arrayHas(key) === true && await this.has(key) === true) {

            let tag = await this.sql.findOne({ where: { key: key } })
            let yenivalue = await tag.get("value")

            yenivalue.push(value)
            if (await yenivalue.indexOf(value) > -1 && valueIgnoreIfPresent === true) return "EraxDB => Bir Hata Oluştu: Şartlar Uygun Olmadığı İçin Veri Pushlanmadı."
            return await this.set(key, yenivalue);
        }
        else {
            return "EraxDB => Bir Hata Oluştu: Şartlar Uygun Olmadığı İçin Veri Pushlanmadı."
        };
    };

    /**
    * Belirttiğiniz veri Array'lı ise true, Array'sız ise false olarak cevap verir.
    * @param {string} key Veri
    * @example await db.arrayHas("key");
    * @returns {Promise<boolean>}
    */
    async arrayHas(key) {
        if (!key || key === "") return Error("Bir Veri Belirtmelisin.");
        let tag = await this.sql.findOne({ where: { key: key } })
        let datavalue = await tag.get("value")
        if (Array.isArray(await datavalue)) return true;
        return false;
    };

    /**
    * Belirttiğiniz verinin Array'ında belirttiğiniz değer varmı/yokmu kontrol eder.
    * @param {string} key Veri
    * @param {any} value Değer
    * @example await db.arrayHasValue("key", "value");
    * @returns {Promise<boolean>}
    * 
    */
    async arrayHasValue(key, value) {
        if (!key || key === "") return Error("Bir Veri Belirtmelisin.")
        if (await this.has(key) === false) return null;
        if (await this.arrayHas(key) === false) return "EraxDB => Bir Hata Oluştu: Belirtilen Verinin Tipi Array Olmak Zorundadır!"
        if (!value || value === "") return Error("Bir Değer Belirtmelisin.");
        let tag = await this.sql.findOne({ where: { key: key } })
        let datavalue = await tag.get("value")
        if (await datavalue.indexOf(value) > -1) return true
        return false
    }

    /**
    * Belirttiğiniz verinin Array'ından belirttiğiniz değer varsa siler.
    * @param {string} key Veri
    * @param {any} value Değer
    * @example await db.unpush("key", "value");
    * @returns {Promise<Array<any>>}
    */
    async unpush(key, value) {
        if (!key || key === "") return Error("Bir Veri Belirtmelisin.")
        if (this.has(key) === false) return null;
        if (this.arrayHas(key) === false) return "EraxDB => Bir Hata Oluştu: Belirttiğiniz Verinin Tipi Array Olmak Zorundadır!"
        if (!value || value === "") return Error("Bir Değer Belirtmelisin.");

        let tag = await this.sql.findOne({ where: { key: key } })
        let datavalue = await tag.get("value")
        
        if (await datavalue.indexOf(value) < 0) return "EraxDB => Bir Hata Oluştu: Belirttiğiniz Değer Belirttiğiniz Verinin Array'ında Bulunmuyor."
        
        let yenivalue =  datavalue.filter(x => x !== value);
        return await this.set(key, yenivalue);
    };
};