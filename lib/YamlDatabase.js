const {
    getData,
    setData,
    isArray,
    isNumber,
    allData,
    dataControl,
    destroyDB,
    deleteAllDB,
    fetchAllDB,
    deleteData,
    startDB,
    ErrorManager
} = require("../util/index");

module.exports = class YamlDatabase {
    constructor(dbPath = "database.yaml") {
        this.path = dbPath

        if (!this.path.startsWith('./')) this.path = "./" + this.path
        if (!this.path.endsWith(".yaml")) this.path = this.path + ".yaml"

        startDB(this.path, "yaml")
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
        return setData(key, value, this.path, "yaml")
    }

    /**
     * Veri varmı/yokmu kontrol eder.
     * @param {string} key Key
     * @returns {boolean}
     * @example db.has("key");
     */
    has(key) {
        if (!key) return ErrorManager("Bir Veri Belirtmelisin.");
        return dataControl(key, this.path, "yaml")
    }

    /**
    * Tüm verileri silersiniz.
    * @example db.deleteAll();
    * @returns {void}
    */
    deleteAll() {
        return deleteAllDB(this.path, "yaml")
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
        return getData(key, this.path, "yaml")
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
    * @returns {"string" | "number" | "bigint" | "boolean" | "symbol" | "Array" | "undefined" | "object" | "Function"}
    * @example db.type("key");
    */
    type(key) {
        if (!key) return ErrorManager(`Bir Veri Belirmelisin.`)
        if (!this.get(key)) return null;

        if (this.arrayHas(key) === true) {
            return "Array"
        } else if (typeof this.get(key) === "string") {
            return "string"
        } else if (isNumber(key, this.path, "yaml")) {
            return "number"
        } else if (typeof this.get(key) === "boolean") {
            return "boolean"
        } else if (typeof this.get(key) === "bigint") {
            return "bigint"
        } else if (typeof this.get(key) === "boolean") {
            return "boolean"
        } else if (typeof this.get(key) === "symbol") {
            return "symbol"
        } else if (typeof this.get(key) === "undefined") {
            return "undefined"
        } else if (typeof this.get(key) === "Function") {
            return "Function"
        } else if (typeof this.get(key) === "object") {
            return "object"
        } else {
            return typeof this.get(key)
        }
    }

    /**
    * Belirttiğiniz veriyi silersiniz.
    * @param {string} key Key
    * @returns {void}
    * @example db.delete("key");
    */
    delete(key) {
        if (!key) return ErrorManager(`Bir Veri Belirmelisin.`)
        return deleteData(key, this.path, "yaml")
    }

    /**
    * Tüm verileri çekersiniz.
    * @example db.fetchAll();
    * @returns {object}
    */
    fetchAll() {
        return fetchAllDB(this.path, "yaml")
    }

    /**
    * Tüm verileri Array İçine Ekler.
    * @example db.all();
    * @returns {Array<{ ID: string, data: any }>}
    */
    all() {
        return allData(this.path, "yaml")
    }

    /**
    * Database'de ki verilerin sayısını atar.
    * @example db.length();
    * @returns {object}
    */
    length() {
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

        switch (operator) {
            case "-":
                if (goToNegative === false && this.get(key) < 1) return setData(key, Number("0"), this.path, "yaml")
                data = data - Number(value);
                return setData(key, data, this.path, "yaml")
                break;
            case "+":
                data = data + Number(value);
                return setData(key, data, this.path, "yaml")
                break;
            case "*":
                data = data * Number(value);
                return setData(key, data, this.path, "yaml")
                break;
            case "/":
                if (goToNegative === false && this.get(key) < 1) return setData(key, Number("0"), this.path, "yaml")
                data = data / Number(value);
                return setData(key, data, this.path, "yaml")
                break;
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
        return isArray(key, this.path, "yaml")
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