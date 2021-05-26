const {
    getData,
    setData,
    allData,
    dataControl,
    destroyDB,
    deleteAllDB,
    deleteData,
    startDB,
    ErrorManager
} = require("../util/index");

module.exports = class JsonDatabase {
    constructor(dbPath) {
        this.path = dbPath

        if (!this.path.startsWith('./')) this.path = "./" + this.path
        if (!this.path.endsWith(".json")) this.path = this.path + ".json"

        startDB(this.path, "json")
    }

    /**
      * Veri kaydedersiniz.
      * @param {string} key Key
      * @param {any} value Value
      * @returns {void}
      * @example db.set("key", value);
      */
    set(key, value) {
        if (!key) return ErrorManager("Bir Veri Belirtmelisin.");
        if (!value) return ErrorManager("Bir Value Belirtmelisin.");
        return setData(key, value, this.path, "json")
    }

    /**
     * Veri varmı/yokmu kontrol eder.
     * @param {string} key Key
     * @returns {boolean}
     * @example db.has("key");
     */
    has(key) {
        if (!key) return ErrorManager("Bir Veri Belirtmelisin.");
        return dataControl(key, this.path, "json")
    }

    /**
    * Tüm verileri silersiniz.
    * @example db.deleteAll();
    * @returns {void}
    */
    deleteAll() {
        return deleteAllDB(this.path, "json")
    }

    /**
    * Database dosyasını siler.
    * @example db.destroy();
    * @returns {void}
    */
    destroy() {
        return destroyDB(this.path)
    }

    /**
    * Veri çekersiniz.
    * @param {string} key Key
    * @returns {any}
    * @example db.fetch("key";
    */
    fetch(key) {
        if (!key) return ErrorManager("Bir Veri Belirtmelisin.");
        return getData(key, this.path, "json")
    }

    /**
    * Veri çekersiniz.
    * @param {string} key Key
    * @returns {any}
    * @example db.get("key");
    */
    get(key) {
        if (!key) return ErrorManager("Bir Veri Belirtmelisin.");
        return this.fetch(key)
    }

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
    }

    /**
    * Belirttiğiniz veriyi silersiniz.
    * @param {string} key Key
    * @returns {void}
    * @example db.delete("key");
    */
    delete(key) {
        if (!key) return ErrorManager(`Bir Veri Belirmelisin.`)
        return deleteData(key, this.path, "json")
    }

    /**
    * Tüm verileri çekersiniz.
    * @example db.fetchAll();
    * @returns {object}
    */
    fetchAll() {
        return this.all()
    }

    /**
    * Tüm verileri Array İçine Ekler.
    * @example db.all();
    * @returns {Array<{ ID: string, data: any }>}
    */
    all() {
        return allData(this.path, "json")
    }

    /**
    * Database'de ki verilerin sayısını atar.
    * @example db.size();
    * @returns {object}
    */
    size() {
        return this.all().length
    }

    /**
    * Belirttiğiniz veri ismi ile başlayan verileri Array içine ekler.
    * @param {string} key Key
    * @returns {Array<{ ID: string, data: any }>}
    * @example db.startsWith("key");
    */
    startsWith(key) {
        if (!key) return ErrorManager("Bir Veri Belirtmelisin.");
        return this.all().filter(x => x.ID.startsWith(key))
    }

    /**
    * Belirttiğiniz veri ismi ile biten verileri Array içine ekler.
    * @param {string} key Key
    * @returns {Array<{ ID: string, data: any }>}
    * @example db.endsWith("key");
    */
    endsWith(key) {
        if (!key) return ErrorManager("Bir Veri Belirtmelisin.");
        return this.all().filter(x => x.ID.endsWith(key))
    }

    /**
    * Belirttiğiniz veri ismini içeren verileri Array içine ekler.
    * @param {string} key Key
    * @returns {Array<{ ID: string, data: any }>}
    * @example db.includes("key");
    */
    includes(key) {
        if (!key) return ErrorManager("Bir Veri Belirtmelisin.");
        return this.all().filter(x => x.ID.includes(key))
    }

    /**
      * Arraylı veri kaydedersiniz.
      * @param {string} key Key
      * @param {any} value Value
      * @returns {void}
      * @example db.push("key", value);
      */
    push(key, value) {
        if (this.has(key) === false) return this.set(key, [value]);

        if (this.arrayHas(key) === true && this.has(key) === true) {
            let yenivalue = this.get(key)
            yenivalue.push(value);
            return this.set(key, yenivalue);
        }

        return this.set(key, [value]);
    }

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
            if (goToNegative === false && this.get(key) < 1) return setData(key, Number("0"), this.path, "json")
            data = data - Number(value);
            return setData(key, data, this.path, "json")
        } else if (operator === "+") {
            data = data + Number(value);
            return setData(key, data, this.path, "json")
        } else if (operator === "*") {
            data = data * Number(value);
            return setData(key, data, this.path, "json")
        } else if (operator === "/") {
            if (goToNegative === false && this.get(key) < 1) return setData(key, Number("0"), this.path, "json")
            data = data / Number(value);
            return setData(key, data, this.path, "json")
        } else {
            return ErrorManager("Geçersiz İşlem!")
        }
    }

    /**
      * Belirttiğiniz veriye 1 ekler.
      * @param {string} key Key
      * @param {number} value Value
      * @returns {void}
      * @example db.add("key", 1);
      */
    add(key, value) {
        return this.math(key, "+", value)
    }

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
    }

    /**
     * Veri arraylı/arraysız kontrol eder.
     * @param {string} key Key
     * @example db.arrayHas("key");
     * @returns {boolean}
     */
    arrayHas(key) {
        if (!key) return ErrorManager("Bir Veri Belirtmelisin.")
        return isArray(key, this.path, "json")
    }

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
}