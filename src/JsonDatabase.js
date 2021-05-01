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
     set(veri, value) {
        if (!veri) throw new TypeError("ERAX.DB - Bir Veri Belirtmelisin.");
        if (!value) throw new TypeError("ERAX.DB - Bir Value Belirtmelisin.");
        let dbDosya = oku(this.path)
        dbDosya[veri] = value;
        yazdir(this.path, dbDosya);
        return dbDosya[veri]
    }

    /**
     * Veri varmı/yokmu kontrol eder.
     * @param {string} key Key
     * @example db.set("key");
     */
    has(veri) {
        if (!veri) throw new TypeError("ERAX.DB - Bir Veri Belirtmelisin.");
        let dbDosya = oku(this.path)
        if (!dbDosya[veri]) return false;
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
    fetch(veri) {
        if (!veri) throw new TypeError("ERAX.DB - Bir Veri Belirtmelisin.");
        let dbDosya = oku(this.path)
        if (!dbDosya[veri]) return null;
        return dbDosya[veri]
    }

    /**
 * Veri çekersiniz.
 * @param {string} key Key
 * @example db.get("key");
 */
    get(veri) {
        if (!veri) throw new TypeError("ERAX.DB - Bir Veri Belirtmelisin.");
        return this.fetch(veri)
    }

    /**
 * Verinin tipini öğrenirsiniz.
 * @param {string} key Key
 * @example db.type("key");
 */
    type(veri) {
        if (!veri) throw new TypeError(`ERAX.DB - Bir Veri İsmi Belirmelisin.`)
        let dbDosya = oku(this.path)
        if (!dbDosya[veri]) return null

        if (Array.isArray(this.get(veri))) {
            return "array"
        } else if (typeof this.get(veri) === "string") {
            return "string"
        } else if (typeof this.get(veri) === "number") {
            return "number"
        } else if (typeof this.get(veri) === "boolean") {
            return "boolean"
        } else {
            return typeof this.get(veri)
        }
    }

    /**
 * Belirttiğiniz veriyi silersiniz.
 * @param {string} key Key
 * @example db.delete("key");
 */
    delete(veri) {
        let dbDosya = oku(this.path);
        if (!dbDosya[veri]) return null;
        delete dbDosya[veri];
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
    all(veri = 'all') {
        switch (veri) {
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
    startsWith(veri) {
        if (!veri) throw new TypeError("ERAX.DB - Bir Veri Belirtmelisin.");
        const dbDosya = oku(this.path);
        const array = [];
        for (const veri in dbDosya) {
            const key = { ID: veri, data: dbDosya[veri] };
            array.push(key);
        }
        return array.filter(x => x.ID.startsWith(veri))
    }

    /**
 * Belirttiğiniz veri ismi ile biten verileri array içine ekler.
 * @param {string} key Key
 * @example db.endsWith("key");
 */
    endsWith(veri) {
        if (!veri) throw new TypeError("ERAX.DB - Bir Veri Belirtmelisin.");
        const dbDosya = oku(this.path);
        const array = [];
        for (const veri in dbDosya) {
            const key = { ID: veri, data: dbDosya[veri] };
            array.push(key);
        }
        return array.filter(x => x.ID.endsWith(veri))
    }

    /**
 * Belirttiğiniz veri ismi içeren verileri array içine ekler.
 * @param {string} key Key
 * @example db.includes("key");
 */
    includes(veri) {
        if (!veri) throw new TypeError("ERAX.DB - Bir Veri Belirtmelisin.");
        const dbDosya = oku(this.path);
        const array = [];
        for (const veri in dbDosya) {
            const key = { ID: veri, data: dbDosya[veri] };
            array.push(key);
        }
        return array.filter(x => x.ID.includes(veri))
    }

    /**
      * Arraylı veri kaydedersiniz.
      * @param {string} key Key
      * @param {string} value Value
      * @example db.push("key", value);
      */
    push(veri, value) {
        if (!this.get(veri)) {
            return this.set(veri, [value]);
        }

        if (Array.isArray(this.get(veri)) && this.get(veri)) {
            let yenivalue = this.get(veri)
            yenivalue.push(value);
            return this.set(veri, yenivalue);
        }

        return this.set(veri, [value]);
    }

    /**
      * Matematik işlemi yaparak veri kaydedersiniz.
      * @param {string} key Key
      * @param {string} operator Operator
      * @param {string} value Value
      * @example db.push("key", value);
      */
    math(veri, islem, value) {
        if (!veri) throw new TypeError("ERAX.DB - Bir Veri Belirtmelisin.")
        if (!islem) throw new TypeError("ERAX.DB - Bir İşlem Belirtmelisin. (- + * /)")
        if (!value) throw new TypeError("ERAX.DB - Bir Value Belirtmelisin.")
        if (isNaN(value)) throw new TypeError(`ERAX.DB - Value Sadece Sayıdan Oluşabilir!`);
        if (!isNaN(islem)) throw new TypeError(`ERAX.DB - İşlem Sayı İçermez!`);
        if (islem > 1) throw new TypeError("ERAX.DB - İşlem 1 Karakterden Oluşabilir!")

        let dbDosya = oku(this.path)

        if (islem === "-") {
            dbDosya[veri] = dbDosya[veri] - value;
            yazdir(this.path, dbDosya);
            return dbDosya[veri]

        } else if (islem === "+") {
            dbDosya[veri] = dbDosya[veri] + value;
            yazdir(this.path, dbDosya);
            return dbDosya[veri]

        } else if (islem === "*") {
            dbDosya[veri] = dbDosya[veri] * value;
            yazdir(this.path, dbDosya);
            return dbDosya[veri]

        } else if (islem === "/") {
            dbDosya[veri] = dbDosya[veri] / value;
            yazdir(this.path, dbDosya);
            return dbDosya[veri]

        } else {
            throw new TypeError("ERAX.DB - Matematik İşlemlerinde Sadece Toplama, Çıkarma, Çarpma ve Bölme İşlemlerini Yapabilirim! (- + * /)")
        }
    }

    /**
      * Belirttiğiniz veriye 1 ekler.
      * @param {string} key Key
      * @param {number} value Value
      * @example db.add("key", value);
      */
    add(veri, value) {
        if (!veri) throw new TypeError("ERAX.DB - Bir Veri Belirtmelisin.")
        if (!value) throw new TypeError("ERAX.DB - Bir Value Belirtmelisin.")
        if (isNaN(value)) throw new TypeError(`ERAX.DB - Value Sadece Sayıdan Oluşabilir!`);
        let dbDosya = oku(this.path)
        if (!dbDosya[veri]) return this.set(veri, value)
        return this.math(veri, "+", value)
    }

    /**
      * Belirttiğiniz veriden 1 çıkarır.
      * @param {string} key Key
      * @param {number} value Value
      * @example db.subtract("key", value);
      */
    subtract(veri, value) {
        if (!veri) throw new TypeError("ERAX.DB - Bir Veri Belirtmelisin.")
        if (!value) throw new TypeError("ERAX.DB - Bir Value Belirtmelisin.")
        if (isNaN(value)) throw new TypeError(`ERAX.DB - Value Sadece Sayıdan Oluşabilir!`);
        let dbDosya = oku(this.path)
        if (!dbDosya[veri]) return this.set(veri, value)
        return this.math(veri, "-", value)
    }

    /**
     * Veri arraylı/arraysız kontrol eder.
     * @param {string} key Key
     * @example db.arrayHas("key");
     */
    arrayHas(veri) {
        let dbDosya = oku(this.path)
        if (!veri) throw new TypeError("ERAX.DB - Bir Veri Belirtmelisin.")
        if (!dbDosya[veri]) return null;
        if (Array.isArray(this.get(veri))) return true
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