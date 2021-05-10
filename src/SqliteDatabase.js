const db = require("quick.db");

module.exports = class SqliteDatabase {

    constructor() {
        this.db = db
    }

    /**
     * Veri kaydedersiniz.
     * @param {string} key Key
     * @param {any} value Value
     * @example db.set("key", value);
     */
    set(key, value) {
        if (!key) throw new TypeError("ERAX.DB - Bir Veri Belirtmelisin.");
        if (!value) throw new TypeError("ERAX.DB - Bir Value Belirtmelisin.");

        return this.db.set(key, value)
    }

    /**
     * Veri varmı/yokmu kontrol eder.
     * @param {string} key Key
     * @example db.has("key");
     */
    has(key) {
        if (!key) throw new TypeError("ERAX.DB - Bir Veri Belirtmelisin.");
        return this.db.has(key)
    }

    /**
    * Veri çekersiniz.
    * @param {string} key Key
    * @example db.fetch("key";
    */
    fetch(key) {
        if (!key) throw new TypeError("ERAX.DB - Bir Veri Belirtmelisin.");
        return this.db.fetch(key)
    }

    /**
    * Veri çekersiniz.
    * @param {string} key Key
    * @example db.get("key");
    */
    get(key) {
        if (!key) throw new TypeError("ERAX.DB - Bir Veri Belirtmelisin.");
        return this.fetch(key)
    }

    /**
     * Verinin tipini öğrenirsiniz.
     * @param {string} key Key
     * @returns {"string" | "number" | "bigint" | "boolean" | "symbol" | "Array" | "undefined" | "object" | "Function"}
     * @example db.type("key");
     */
    type(key) {
        if (!key) throw new TypeError(`ERAX.DB - Bir Veri Belirmelisin.`)
        if (this.has(key) === false) return null

        if (this.arrayHas(key) === true) {
            return "Array"
        } else if (typeof this.get(key) === "string") {
            return "string"
        } else if (typeof this.get(key) === "number") {
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
    * @example db.delete("key");
    */
    delete(key) {
        if (!key) throw new TypeError(`ERAX.DB - Bir Veri Belirmelisin.`)
        return this.db.delete(key)
    }

    /**
    * Tüm verileri çekersiniz.
    * @example db.fetchAll();
    */
    fetchAll() {
        return this.db.fetchAll()
    }

    /**
    * Tüm verileri Array İçine Ekler.
    * @example db.all();
    */
    all() {
        return this.db.all()
    }

    /**
    * Database'de ki verilerin sayısını atar.
    * @example db.length();
    */
    length() {
        return this.all().length
    }

    /**
    * Belirttiğiniz veri ismi ile başlayan verileri array içine ekler.
    * @param {string} key Key
    * @example db.startsWith("key");
    */
    startsWith(key) {
        if (!key) throw new TypeError("ERAX.DB - Bir Veri Belirtmelisin.");
        return this.all().filter(data => data.ID.startsWith(key))
    }

    /**
    * Belirttiğiniz veri ismi ile biten verileri array içine ekler.
    * @param {string} key Key
    * @example db.endsWith("key");
    */
    endsWith(key) {
        if (!key) throw new TypeError("ERAX.DB - Bir Veri Belirtmelisin.");
        return this.all().filter(data => data.ID.endsWith(key))
    }

    /**
    * Belirttiğiniz veri ismi içeren verileri array içine ekler.
    * @param {string} key Key
    * @example db.includes("key");
    */
    includes(key) {
        if (!key) throw new TypeError("ERAX.DB - Bir Veri Belirtmelisin.");
        return this.all().filter(data => data.ID.includes(key))
    }

    /**
      * Arraylı veri kaydedersiniz.
      * @param {string} key Key
      * @param {any} value Value
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
      * Belirttiğiniz veriye 1 ekler.
      * @param {string} key Key
      * @param {number} value Value
      * @example db.add("key", 1);
      */
    add(key, value) {
        if (!key) throw new TypeError("ERAX.DB - Bir Veri Belirtmelisin.")
        if (!value) throw new TypeError("ERAX.DB - Bir Value Belirtmelisin.")
        if (isNaN(value)) throw new TypeError(`ERAX.DB - Value Sadece Sayıdan Oluşabilir!`);
        return this.math(key, "+", value)
    }

    /**
      * Belirttiğiniz veriden 1 çıkarır.
      * @param {string} key Key
      * @param {number} value Value
      * @param {boolean} goToNegative Value'nin -'lere düşük düşmeyeceği, default olarak false.
      * @example db.subtract("key", 1);
      */
    subtract(key, value, goToNegative = false) {
        if (!key) throw new TypeError("ERAX.DB - Bir Veri Belirtmelisin.")
        if (!value) throw new TypeError("ERAX.DB - Bir Value Belirtmelisin.")
        if (isNaN(value)) throw new TypeError(`ERAX.DB - Value Sadece Sayıdan Oluşabilir!`);
        return this.math(key, "-", value, goToNegative)
    }

    /**
   * Matematik işlemi yaparak veri kaydedersiniz.
   * @param {string} key Key
   * @param {"+" | "-" | "*" | "/"} operator Operator
   * @param {number} value Value
   * @param {boolean} goToNegative Value'nin -'lere düşük düşmeyeceği, default olarak false.
   * @example db.math("key", "+", "1");
   */
    math(key, operator, value, goToNegative = false) {
        if (!key) throw new TypeError("ERAX.DB - Bir Veri Belirtmelisin.")
        if (!operator) throw new TypeError("ERAX.DB - Bir İşlem Belirtmelisin. (- + * /)")
        if (!value) throw new TypeError("ERAX.DB - Bir Value Belirtmelisin.")
        if (isNaN(value)) throw new TypeError(`ERAX.DB - Value Sadece Sayıdan Oluşabilir!`);

        let data = this.get(key)
        if (!data) return this.set(key, value)

        if (operator === "-") {
            if (goToNegative === false && this.get(key) < 1) {
                let sayi = Number("0")
                return this.set(key, sayi)
            };

            data = data - Number(value);
            return this.set(key, data)

        } else if (operator === "+") {
            data = data + Number(value);
            return this.set(key, data)

        } else if (operator === "*") {
            data = data * Number(value);
            return this.set(key, data)

        } else if (operator === "/") {
            if (goToNegative === false && this.get(key) < 1) {
                let sayi = Number("0")
                return this.set(key, sayi)
            };

            data = data / Number(value);
            return this.set(key, data)

        } else {
            throw new TypeError("ERAX.DB - Matematik İşlemlerinde Sadece Toplama, Çıkarma, Çarpma ve Bölme İşlemlerini Yapabilirim! (- + * /)")
        }
    }

    /**
     * Veri arraylı/arraysız kontrol eder.
     * @param {string} key Key
     * @example db.arrayHas("key");
     */
    arrayHas(key) {
        if (!key) throw new TypeError("ERAX.DB - Bir Veri Belirtmelisin.")
        if (this.has(key) === false) return null
        if (Array.isArray(this.get(key))) return true
        return false
    }

    /**
      * ERAX.DB'nin sürümünü öğrenirsiniz.
      * @example db.version();
      */
    version() {
        let p = require("../package.json")
        return p.version
    }

    /**
    * Belirttiğiniz veriyi içeren tüm verileri siler.
    * @param {string} key Key
    * @example db.deleteEach("key");
    */
    deleteEach(key) {
        if (!key) throw new TypeError("ERAX.DB - Bir Veri Belirtmelisin.")
        this.includes(key).forEach(veri => {
            this.delete(veri.ID)
        })
        return true
    }

    /**
    * Tüm verileri silersiniz.
    * @example db.deleteAll();
    */
    deleteAll() {
        this.all().forEach(veri => {
            this.delete(veri.ID)
        })
        return true
    }
}