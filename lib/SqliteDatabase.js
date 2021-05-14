const fs = require("fs");
const { ErrorManager } = require("../util/index")

module.exports = class SqliteDatabase {

    constructor() {
        const db = require("quick.db");
        this.db = db
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

        return this.db.set(key, value)
    }

    /**
     * Veri varmı/yokmu kontrol eder.
     * @param {string} key Key
     * @example db.has("key");
     * @returns {boolean}
     */
    has(key) {
        if (!key) return ErrorManager("Bir Veri Belirtmelisin.");
        return this.db.has(key)
    }

    /**
    * Veri çekersiniz.
    * @param {string} key Key
    * @example db.fetch("key";
    * @returns {any}
    */
    fetch(key) {
        if (!key) return ErrorManager("Bir Veri Belirtmelisin.");
        return this.db.fetch(key)
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
    * @returns {void}
    * @example db.delete("key");
    */
    delete(key) {
        if (!key) return ErrorManager(`Bir Veri Belirmelisin.`)
        return this.db.delete(key)
    }

    /**
    * Tüm verileri çekersiniz.
    * @example db.fetchAll();
    * @returns {object}
    */
    fetchAll() {
        return this.db.fetchAll()
    }

    /**
    * Tüm verileri Array İçine Ekler.
    * @example db.all();
    * @returns {Array<{ID: string, data: any}>}
    */
    all() {
        return this.db.all()
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
    * @returns {Array<{ID: string, data: any}>}
    * @example db.startsWith("key");
    */
    startsWith(key) {
        if (!key) return ErrorManager("Bir Veri Belirtmelisin.");
        return this.all().filter(data => data.ID.startsWith(key))
    }

    /**
    * Belirttiğiniz veri ismi ile biten verileri Array içine ekler.
    * @param {string} key Key
    * @returns {Array<{ID: string, data: any}>}
    * @example db.endsWith("key");
    */
    endsWith(key) {
        if (!key) return ErrorManager("Bir Veri Belirtmelisin.");
        return this.all().filter(data => data.ID.endsWith(key))
    }

    /**
    * Belirttiğiniz veri ismi içeren verileri Array içine ekler.
    * @param {string} key Key
    * @returns {Array<{ID: string, data: any}>}
    * @example db.includes("key");
    */
    includes(key) {
        if (!key) return ErrorManager("Bir Veri Belirtmelisin.");
        return this.all().filter(data => data.ID.includes(key))
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
      * Belirttiğiniz veriye 1 ekler.
      * @param {string} key Key
      * @param {number} value Value
      * @returns {void}
      * @example db.add("key", 1);
      */
    add(key, value) {
        if (!key) return ErrorManager("Bir Veri Belirtmelisin.")
        if (!value) return ErrorManager("Bir Value Belirtmelisin.")
        if (isNaN(value)) return ErrorManager(`Value Sadece Sayıdan Oluşabilir!`);
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
        if (!key) return ErrorManager("Bir Veri Belirtmelisin.")
        if (!value) return ErrorManager("Bir Value Belirtmelisin.")
        if (isNaN(value)) return ErrorManager(`Value Sadece Sayıdan Oluşabilir!`);
        return this.math(key, "-", value, goToNegative)
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
            return ErrorManager("Matematik İşlemlerinde Sadece Toplama, Çıkarma, Çarpma ve Bölme İşlemlerini Yapabilirim! (- + * /)")
        }
    }

    /**
     * Veri arraylı/arraysız kontrol eder.
     * @param {string} key Key
     * @returns {boolean}
     * @example db.arrayHas("key");
     */
    arrayHas(key) {
        if (!key) return ErrorManager("Bir Veri Belirtmelisin.")
        if (this.has(key) === false) return null
        if (Array.isArray(this.get(key))) return true
        return false
    }

    /**
      * ERAX.DB'nin sürümünü öğrenirsiniz.
      * @returns {object}
      * @example db.version();
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
    * Tüm verileri silersiniz.
    * @returns {void}
    * @example db.deleteAll();
    */
    deleteAll() {
        this.all().forEach(veri => {
            this.delete(veri.ID)
        })
        return true
    }

    /**
   * Database'deki Verileri Belirttiğiniz JSON'a Yazar.
   * @param file File
   * @returns {void}
   * @example db.export("./database.json");
   */
    export(file = "./database.json") {
        if (!file.startsWith("./")) file = "./" + file
        if (!file.endsWith(".json")) file = file + ".json"

        const oku = (file) => JSON.parse(fs.readFileSync(file, 'utf-8'));
        const yazdir = (file, data) => fs.writeFileSync(file, JSON.stringify(data, null, 4));

        if (!fs.existsSync(file)) {
            yazdir(file, {})
        }

        this.all().forEach(veri => {
            let dbDosya = oku(file)
            dbDosya[veri.ID] = veri.data;
            yazdir(file, dbDosya);

        })
        return true
    }

    /**
    * Herhangibi bir JSON uzantılı Database'deki verileri Database'ye yazar.
    * @param file File
    * @returns {void}
    * @example db.import("./database.json");
    */
    import(file) {
        if (!file) return ErrorManager("Import Edeceğim Database Dosyasının İsmini Yazmalısın!")
        if (!file.startsWith("./")) file = "./" + file
        if (!file.endsWith(".json")) file = file + ".json"

        const oku = (file) => JSON.parse(fs.readFileSync(file, 'utf-8'));

        let dbDosya = oku(file)

        Object.entries(dbDosya).forEach(data => {
            const [key, value] = data;
            this.set(key, value)
        })
        return true
    }
}