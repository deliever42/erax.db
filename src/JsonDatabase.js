const { unlinkSync, writeFileSync, readFileSync, existsSync } = require('fs');

const oku = (file) => JSON.parse(readFileSync(file, 'utf-8'));
const yazdir = (file, data) => writeFileSync(file, JSON.stringify(data, null, 4));

module.exports = class JsonDatabase {
    constructor(dbPath) {
        this.path = dbPath || 'database.json'

        if (!this.path.startsWith('./')) this.path = "./" + this.path
        if (!this.path.endsWith(".json")) this.path = this.path + ".json"

        if (!existsSync(this.path)) {
            yazdir(this.path, {})
        }
    }

    /**
        * Veri kaydedersiniz.
        * @param {string} key Key
        * @param {string} value Value
        * @example db.set("key", value);
        */
     set(key, value) {
        if (!key) throw new TypeError("ERAX.DB - Bir Veri Belirtmelisin.");
        if (!value) throw new TypeError("ERAX.DB - Bir Value Belirtmelisin.");
        let dbDosya = oku(this.path)
        dbDosya[key] = value;
        yazdir(this.path, dbDosya);
        return dbDosya[key]
    }

    /**
     * Veri varmı/yokmu kontrol eder.
     * @param {string} key Key
     * @example db.has("key");
     */
    has(key) {
        if (!key) throw new TypeError("ERAX.DB - Bir Veri Belirtmelisin.");
        let dbDosya = oku(this.path)
        if (!dbDosya[key]) return false;
        return true;
    }

    /**
    * Tüm verileri silersiniz.
    * @example db.deleteAll();
    */
    deleteAll() {
        yazdir(this.path, {})
        return true;
    }

    /**
    * Database dosyasını siler.
    * @example db.destroy();
    */
    destroy() {
        unlinkSync(this.path);
        return true;
    }

    /**
    * Veri çekersiniz.
    * @param {string} key Key
    * @example db.fetch("key";
    */
    fetch(key) {
        if (!key) throw new TypeError("ERAX.DB - Bir Veri Belirtmelisin.");
        let dbDosya = oku(this.path)
        if (!dbDosya[key]) return null;
        return dbDosya[key]
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
    * @example db.type("key");
    */
    type(key) {
        if (!key) throw new TypeError(`ERAX.DB - Bir Veri Belirmelisin.`)
        let dbDosya = oku(this.path)
        if (!dbDosya[key]) return null

        if (Array.isArray(this.get(key))) {
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
        let dbDosya = oku(this.path);
        if (!dbDosya[key]) return null;
        delete dbDosya[key];
        yazdir(this.path, dbDosya);
        return true;
    }

    /**
    * Tüm verileri çekersiniz.
    * @example db.fetchAll();
    */
    fetchAll() {
        let dbDosya = oku(this.path)

        if (dbDosya.length > 1024) {
            dbDosya = dbDosya.slice(0, 300) + " ..."
        } else {
            dbDosya = dbDosya
        }

        return dbDosya
    }

    /**
    * Tüm verileri gözden geçirir.
    * @example db.all();
    */
    all(key = 'all') {
        switch (key) {
            case 'all':
                return Object.entries(oku(this.path))
                break;
            case 'object':
                return oku(this.path)
                break;
            case 'keys':
                return Object.keys(oku(this.path))
                break;
            case 'values':
                return Object.values(oku(this.path))
                break;
        }
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
        const dbDosya = oku(this.path);
        const array = [];
        for (const veri in dbDosya) {
            const key = { ID: veri, data: dbDosya[veri] };
            array.push(key);
        }
        return array.filter(x => x.ID.startsWith(key))
    }

    /**
    * Belirttiğiniz veri ismi ile biten verileri array içine ekler.
    * @param {string} key Key
    * @example db.endsWith("key");
    */
    endsWith(key) {
        if (!key) throw new TypeError("ERAX.DB - Bir Veri Belirtmelisin.");
        const dbDosya = oku(this.path);
        const array = [];
        for (const veri in dbDosya) {
            const key = { ID: veri, data: dbDosya[veri] };
            array.push(key);
        }
        return array.filter(x => x.ID.endsWith(key))
    }

    /**
    * Belirttiğiniz veri ismi içeren verileri array içine ekler.
    * @param {string} key Key
    * @example db.includes("key");
    */
    includes(key) {
        if (!key) throw new TypeError("ERAX.DB - Bir Veri Belirtmelisin.");
        const dbDosya = oku(this.path);
        const array = [];
        for (const veri in dbDosya) {
            const key = { ID: veri, data: dbDosya[veri] };
            array.push(key);
        }
        return array.filter(x => x.ID.includes(key))
    }

    /**
      * Arraylı veri kaydedersiniz.
      * @param {string} key Key
      * @param {string} value Value
      * @example db.push("key", value);
      */
    push(key, value) {
        if (!this.get(key)) {
            return this.set(key, [value]);
        }

        if (Array.isArray(this.get(key)) && this.get(key)) {
            let yenivalue = this.get(key)
            yenivalue.push(value);
            return this.set(key, yenivalue);
        }

        return this.set(key, [value]);
    }

    /**
      * Matematik işlemi yaparak veri kaydedersiniz.
      * @param {string} key Key
      * @param {string} operator Operator
      * @param {number} value Value
      * @example db.math("key", "+", "1");
      */
    math(key, operator, value) {
        if (!key) throw new TypeError("ERAX.DB - Bir Veri Belirtmelisin.")
        if (!operator) throw new TypeError("ERAX.DB - Bir İşlem Belirtmelisin. (- + * /)")
        if (!value) throw new TypeError("ERAX.DB - Bir Value Belirtmelisin.")
        if (isNaN(value)) throw new TypeError(`ERAX.DB - Value Sadece Sayıdan Oluşabilir!`);
        if (!isNaN(operator)) throw new TypeError(`ERAX.DB - İşlem Sayı İçermez!`);
        if (operator > 1) throw new TypeError("ERAX.DB - İşlem 1 Karakterden Oluşabilir!")

        let dbDosya = oku(this.path)

        if (operator === "-") {
            dbDosya[key] = dbDosya[key] - value;
            yazdir(this.path, dbDosya);
            return dbDosya[key]

        } else if (operator === "+") {
            dbDosya[key] = dbDosya[key] + value;
            yazdir(this.path, dbDosya);
            return dbDosya[key]

        } else if (operator === "*") {
            dbDosya[key] = dbDosya[key] * value;
            yazdir(this.path, dbDosya);
            return dbDosya[key]

        } else if (operator === "/") {
            dbDosya[key] = dbDosya[key] / value;
            yazdir(this.path, dbDosya);
            return dbDosya[key]

        } else {
            throw new TypeError("ERAX.DB - Matematik İşlemlerinde Sadece Toplama, Çıkarma, Çarpma ve Bölme İşlemlerini Yapabilirim! (- + * /)")
        }
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
        let dbDosya = oku(this.path)
        if (!dbDosya[key]) return this.set(key, value)
        return this.math(key, "+", value)
    }

    /**
      * Belirttiğiniz veriden 1 çıkarır.
      * @param {string} key Key
      * @param {number} value Value
      * @example db.subtract("key", 1);
      */
    subtract(key, value) {
        if (!key) throw new TypeError("ERAX.DB - Bir Veri Belirtmelisin.")
        if (!value) throw new TypeError("ERAX.DB - Bir Value Belirtmelisin.")
        if (isNaN(value)) throw new TypeError(`ERAX.DB - Value Sadece Sayıdan Oluşabilir!`);
        let dbDosya = oku(this.path)
        if (!dbDosya[key]) return this.set(key, value)
        return this.math(key, "-", value)
    }

    /**
     * Veri arraylı/arraysız kontrol eder.
     * @param {string} key Key
     * @example db.arrayHas("key");
     */
    arrayHas(key) {
        let dbDosya = oku(this.path)
        if (!key) throw new TypeError("ERAX.DB - Bir Veri Belirtmelisin.")
        if (!dbDosya[key]) return null;
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
}