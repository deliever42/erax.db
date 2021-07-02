const fs = require("fs");
const { getData, setData, allData, deleteData } = require("./Util");
const ErrorManager = require("./Error");

module.exports = class JsonDatabase {
    constructor(dbPath = "database.json") {
        this.path = dbPath

        if (!this.path.startsWith('./')) this.path = "./" + this.path
        if (!this.path.endsWith(".json")) this.path = this.path + ".json"

        if (!fs.existsSync(this.path)) {
            fs.writeFileSync(this.path, JSON.stringify({}, null, 4))
        };
    };

    /**
      * Veri kaydedersiniz.
      * @param {string} key Key
      * @param {any} value Value
      * @returns {void}
      * @example db.set("key", "value");
      */
    set(key, value) {
        if (!key) return ErrorManager("Bir Veri Belirtmelisin.");
        if (!value) return ErrorManager("Bir Value Belirtmelisin.");
        return setData(key, value, this.path)
    };

    /**
     * Veri varmı/yokmu kontrol eder.
     * @param {string} key Key
     * @returns {boolean}
     * @example db.has("key");
     */
    has(key) {
        if (!key) return ErrorManager("Bir Veri Belirtmelisin.");
        if (this.get(key)) return true;
        return false;
    };

    /**
    * Tüm verileri silersiniz.
    * @example db.deleteAll();
    * @returns {void}
    */
    deleteAll() {
        return fs.writeFileSync(this.path, JSON.stringify({}, null, 4))
    };

    /**
    * Database dosyasını siler.
    * @example db.destroy();
    * @returns {void}
    */
    destroy() {
        return fs.unlinkSync(this.path);
    };

    /**
    * Veri çekersiniz.
    * @param {string} key Key
    * @returns {any}
    * @example db.fetch("key";
    */
    fetch(key) {
        if (!key) return ErrorManager("Bir Veri Belirtmelisin.");
        return getData(key, this.path);
    };

    /**
    * Veri çekersiniz.
    * @param {string} key Key
    * @returns {any}
    * @example db.get("key");
    */
    get(key) {
        if (!key) return ErrorManager("Bir Veri Belirtmelisin.");
        return this.fetch(key)
    };

    /**
    * Verinin tipini öğrenirsiniz.
    * @param {string} key Key
    * @returns {"array" | "string" | "number" | "boolean" | "symbol" | "function" | "object" | "null" | "undefined" | "bigint"}
    * @example db.type("key");
    */
    type(key) {
        if (!key) return ErrorManager(`Bir Veri Belirmelisin.`)
        if (!this.get(key)) return null;

        if (Array.isArray(this.get(key))) return "array";
        return typeof this.get(key)
    };

    /**
    * Belirttiğiniz veriyi silersiniz.
    * @param {string} key Key
    * @returns {void}
    * @example db.delete("key");
    */
    delete(key) {
        if (!key) return ErrorManager(`Bir Veri Belirmelisin.`)
        return deleteData(key, this.path)
    };

    /**
    * Tüm verileri Array İçine Ekler.
    * @example db.fetchAll();
    * @returns {Array<{ ID: string, data: any }>}
    */
    fetchAll() {
        return this.all()
    };

    /**
    * Tüm verileri Array İçine Ekler.
    * @example db.all();
    * @returns {Array<{ ID: string, data: any }>}
    */
    all() {
        return allData(this.path)
    };

    /**
    * Database'de ki verilerin sayısını atar.
    * @example db.size();
    * @returns {object}
    */
    size() {
        return this.all().length
    };

    /**
    * Belirttiğiniz veri ismi ile başlayan verileri Array içine ekler.
    * @param {string} key Key
    * @returns {Array<{ ID: string, data: any }>}
    * @example db.startsWith("key");
    */
    startsWith(key) {
        if (!key) return ErrorManager("Bir Veri Belirtmelisin.");
        return this.all().filter(x => x.ID.startsWith(key))
    };

    /**
    * Belirttiğiniz veri ismi ile biten verileri Array içine ekler.
    * @param {string} key Key
    * @returns {Array<{ ID: string, data: any }>}
    * @example db.endsWith("key");
    */
    endsWith(key) {
        if (!key) return ErrorManager("Bir Veri Belirtmelisin.");
        return this.all().filter(x => x.ID.endsWith(key))
    };

    /**
    * Belirttiğiniz veri ismini içeren verileri Array içine ekler.
    * @param {string} key Key
    * @returns {Array<{ ID: string, data: any }>}
    * @example db.includes("key");
    */
    includes(key) {
        if (!key) return ErrorManager("Bir Veri Belirtmelisin.");
        return this.all().filter(x => x.ID.includes(key))
    };

    /**
      * Arraylı veri kaydedersiniz.
      * @param {string} key Key
      * @param {any} value Value
      * @returns {void}
      * @example db.push("key", "value");
      */
    push(key, value) {
        if (this.has(key) === false) return this.set(key, [value]);

        if (this.arrayHas(key) === true && this.has(key) === true) {
            let yenivalue = this.get(key)
            yenivalue.push(value);
            return this.set(key, yenivalue);
        };

        return this.set(key, [value]);
    };

    /**
    * Matematik işlemi yaparak veri kaydedersiniz.
    * @param {string} key Key
    * @param {"+" | "-" | "*" | "/"} operator Operator
    * @param {number} value Value
    * @param {boolean} goToNegative Value'nin -'lere düşük düşmeyeceği, default olarak false.
    * @returns {void}
    * @example db.math("key", "+", "1");
    */
    math(key, operator, value, goToNegative = false) {
        if (!key) return ErrorManager("Bir Veri Belirtmelisin.")
        if (!operator) return ErrorManager("Bir İşlem Belirtmelisin. (- + * /)")
        if (!value) return ErrorManager("Bir Value Belirtmelisin.")
        if (isNaN(value)) return ErrorManager(`Value Sadece Sayıdan Oluşabilir!`);

        if (this.has(key) === false) return this.set(key, Number(value))
        let data = this.get(key)

        if (operator === "-") {
            if (goToNegative === false && this.get(key) < 1) return setData(key, Number("0"), this.path);
            data = data - Number(value);
            return setData(key, data, this.path);
        } else if (operator === "+") {
            data = data + Number(value);
            return setData(key, data, this.path);
        } else if (operator === "*") {
            data = data * Number(value);
            return setData(key, data, this.path);
        } else if (operator === "/") {
            if (goToNegative === false && this.get(key) < 1) return setData(key, Number("0"), this.path);
            data = data / Number(value);
            return setData(key, data, this.path);
        } else {
            return ErrorManager("Geçersiz İşlem!");
        };
    };

    /**
      * Belirttiğiniz veriye 1 ekler.
      * @param {string} key Key
      * @param {number} value Value
      * @returns {void}
      * @example db.add("key", 1);
      */
    add(key, value) {
        return this.math(key, "+", value)
    };

    /**
      * Belirttiğiniz veriden 1 çıkarır.
      * @param {string} key Key
      * @param {number} value Value
      * @param {boolean} goToNegative Value'nin -'lere düşük düşmeyeceği, default olarak false.
      * @returns {void}
      * @example db.subtract("key", 1);
      */
    subtract(key, value, goToNegative = false) {
        return this.math(key, "-", value, goToNegative)
    };

    /**
     * Veri arraylı/arraysız kontrol eder.
     * @param {string} key Key
     * @example db.arrayHas("key");
     * @returns {boolean}
     */
    arrayHas(key) {
        if (!key) return ErrorManager("Bir Veri Belirtmelisin.");
        if (Array.isArray(this.get(key))) return true;
        return false;
    };

    /**
      * ERAX.DB'nin sürümünü öğrenirsiniz.
      * @example db.version();
      * @returns {object}
      */
    version() {
        let p = require("../package.json")
        return p.version
    }

    /**
     * Belirttiğiniz veriyi içeren tüm verileri siler.
     * @param {string} key Key
     * @returns {void}
     * @example db.deleteEach("key");
     */
    deleteEach(key) {
        if (!key) return ErrorManager("Bir Veri Belirtmelisin.")
        this.includes(key).forEach(veri => {
            this.delete(veri.ID)
        })
        return true
    }

    /**
    * Key Adlı Verinin Arrayından Belirtilen Şeyi Siler.
    * @param {string} key Key
    * @param {any} value Value
    * @returns {void}
    * @example db.unpush("key", "value");
    */
    unpush(key, value) {
        if (!key) return ErrorManager("Bir Veri Belirtmelisin.")
        if (this.has(key) === false) return null;
        if (this.arrayHas(key) === false) return ErrorManager("Belirtilen Verinin Tipi Array Olmak Zorundadır!")
        if (!value) return ErrorManager("Bir Value Belirtmelisin.");
        if (this.arrayHasValue(key, value) === false) return ErrorManager("Belirtilen Value Belirtilen Verinin Arrayında Bulunmuyor.")

        let oldArr = this.get(key);
        let newArr = [];

        oldArr.filter(x => x !== value).forEach(x => newArr.push(x))
        this.set(key, newArr)
        return newArr;

    };

    /**
    * Key Adlı Verinin Arrayında Belirtilen Value Varmı/Yokmu Kontrol Eder.
    * @param {string} key Key
    * @param {any} value Value
    * @returns {void}
    * @example db.arrayHasValue("key", "value");
    */
    arrayHasValue(key, value) {
        if (!key) return ErrorManager("Bir Veri Belirtmelisin.")
        if (this.has(key) === false) return null;
        if (this.arrayHas(key) === false) return ErrorManager("Belirtilen Verinin Tipi Array Olmak Zorundadır!")
        if (!value) return ErrorManager("Bir Value Belirtmelisin.");
        if (this.get(key).indexOf(value) > -1) return true
        return false
    }
};