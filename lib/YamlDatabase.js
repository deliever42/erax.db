const fs = require("fs");
const YAML = require("yaml");
const Error = require("./Error");

module.exports = class YamlDatabase {
    constructor(ops = {
        databasePath: "./database.yml"
    }) {
        this.path = ops.databasePath
        this.data = {};

        if (!this.path.startsWith('./')) this.path = "./" + this.path
        if (this.path.endsWith(".yaml")) this.path = this.path.split(".yaml")[0]
        if (!this.path.endsWith(".yml")) this.path = this.path + ".yml"

        if (!fs.existsSync(this.path)) {
            fs.writeFileSync(this.path, "");
        } else {
            this.data = YAML.parse(fs.readFileSync(this.path, "utf-8"));
        }
    };

    /**
      * Veri kaydedersiniz.
      * @param {string} key Key
      * @param {any} value Value
      * @returns {void}
      * @example db.set("key", "value");
      */
    set(key, value) {
        if (!key) return Error("Bir Veri Belirtmelisin.");
        if (!value) return Error("Bir Value Belirtmelisin.");
        this.data[key] = value;
        fs.writeFileSync(this.path, YAML.stringify(this.data));
        return value
    };

    /**
     * Veri varmı/yokmu kontrol eder.
     * @param {string} key Key
     * @returns {boolean}
     * @example db.has("key");
     */
    has(key) {
        if (!key) return Error("Bir Veri Belirtmelisin.");
        if (this.get(key)) return true;
        return false;
    };

    /**
    * Tüm verileri silersiniz.
    * @example db.deleteAll();
    * @returns {void}
    */
    deleteAll() {
        fs.writeFileSync(this.path, "", "utf-8");
        return true;
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
        if (!key) return Error("Bir Veri Belirtmelisin.");
        return this.data[key]
    };

    /**
    * Veri çekersiniz.
    * @param {string} key Key
    * @returns {any}
    * @example db.get("key");
    */
    get(key) {
        if (!key) return Error("Bir Veri Belirtmelisin.");
        return this.fetch(key)
    };

    /**
    * Verinin tipini öğrenirsiniz.
    * @param {string} key Key
    * @returns {"array" | "string" | "number" | "boolean" | "symbol" | "function" | "object" | "null" | "undefined" | "bigint"}
    * @example db.type("key");
    */
    type(key) {
        if (!key) return Error(`Bir Veri Belirmelisin.`)
        if (this.has(key) === false) return null;
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
        if (!key) return Error(`Bir Veri Belirmelisin.`)
        if (this.has(key) === false) return null;
        delete this.data[key]
        fs.writeFileSync(this.path, YAML.stringify(this.data));
        return true
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
        let arr = [];
        for (const veri in this.data) {
            const key = {
                ID: veri,
                data: this.data[veri]
            };
            arr.push(key);
        };
        return arr;
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
        if (!key) return Error("Bir Veri Belirtmelisin.");
        return this.all().filter(x => x.ID.startsWith(key))
    };

    /**
    * Belirttiğiniz veri ismi ile biten verileri Array içine ekler.
    * @param {string} key Key
    * @returns {Array<{ ID: string, data: any }>}
    * @example db.endsWith("key");
    */
    endsWith(key) {
        if (!key) return Error("Bir Veri Belirtmelisin.");
        return this.all().filter(x => x.ID.endsWith(key))
    };

    /**
    * Belirttiğiniz veri ismini içeren verileri Array içine ekler.
    * @param {string} key Key
    * @returns {Array<{ ID: string, data: any }>}
    * @example db.includes("key");
    */
    includes(key) {
        if (!key) return Error("Bir Veri Belirtmelisin.");
        return this.all().filter(x => x.ID.includes(key))
    };

    /**
      * Arraylı veri kaydedersiniz.
      * @param {string} key Key
      * @param {any} value Value
      * @returns {void}
      * @example db.push("key", "value");
      */
    push(key, value, valueIgnoreIfPresent = true) {
        if (this.has(key) === false) return this.set(key, [value]);
        else if (this.arrayHas(key) === true && this.has(key) === true && valueIgnoreIfPresent === true) {
            let yenivalue = this.get(key)
            yenivalue.push(value);
            return this.set(key, yenivalue);
        }
        else {
            return "EraxDB => Bir Hata Oluştu: Şartlar Uygun Olmadığı İçin Veri Pushlanmadı."
        };
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
        if (!key) return Error("Bir Veri Belirtmelisin.")
        if (!operator) return Error("Bir İşlem Belirtmelisin. (- + * /)")
        if (!value) return Error("Bir Value Belirtmelisin.")
        if (isNaN(value)) return Error(`Value Sadece Sayıdan Oluşabilir!`);

        if (this.has(key) === false) return this.set(key, Number(value))
        let data = this.get(key)

        if (operator === "-") {
            if (goToNegative === false && this.get(key) < 1) data = Number("0")
            data = data - Number(value);
        } else if (operator === "+") {
            data = data + Number(value);
        } else if (operator === "*") {
            data = data * Number(value);
        } else if (operator === "/") {
            if (goToNegative === false && this.get(key) < 1) data = Number("0")
            data = data / Number(value);
        } else {
            return Error("Geçersiz İşlem!");
        };

        return this.set(key, data)
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
        if (!key) return Error("Bir Veri Belirtmelisin.");
        if (Array.isArray(this.get(key))) return true;
        return false;
    };

    /**
      * Database Bilgilerini Öğrenirsiniz.
      * @example db.info();
      * @returns {object}
      */
     info() {
        let p = require("../package.json")
        let dbName = this.path.split("./")[1].split(".json")[0];

        return {
            Sürüm: p.version,
            DatabaseAdı: dbName,
            ToplamVeriSayısı: this.size(),
            DatabaseTürü: "yaml"
        }
    }

    /**
     * Belirttiğiniz veriyi içeren tüm verileri siler.
     * @param {string} key Key
     * @returns {void}
     * @example db.deleteEach("key");
     */
    deleteEach(key) {
        if (!key) return Error("Bir Veri Belirtmelisin.")
        this.includes(key).forEach(veri => {
            this.delete(veri.ID)
        })
        return true
    }

    /**
    * Key Adlı Verinin Array'ından Belirtilen Şeyi Siler.
    * @param {string} key Key
    * @param {any} value Value
    * @returns {void}
    * @example db.unpush("key", "value");
    */
    unpush(key, value) {
        if (!key) return Error("Bir Veri Belirtmelisin.")
        if (this.has(key) === false) return null;
        if (this.arrayHas(key) === false) return Error("Belirtilen Verinin Tipi Array Olmak Zorundadır!")
        if (!value) return Error("Bir Value Belirtmelisin.");
        if (this.arrayHasValue(key, value) === false) return Error("Belirtilen Value Belirtilen Verinin Arrayında Bulunmuyor.")

        let oldArr = this.get(key)
        let newArr = oldArr.filter(x => x !== value);

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
        if (!key) return Error("Bir Veri Belirtmelisin.")
        if (this.has(key) === false) return null;
        if (this.arrayHas(key) === false) return Error("Belirtilen Verinin Tipi Array Olmak Zorundadır!")
        if (!value) return Error("Bir Value Belirtmelisin.");
        if (this.get(key).indexOf(value) > -1) return true
        return false
    }

    /**
    * Verileri Filtrelersiniz.
    * @param {(key: string)} callbackfn Callbackfn
    * @returns {Array<{ ID: string, data: any }>}
    * @example db.filter(x => x.ID.startsWith("key"));
    */
    filter(callbackfn) {
        return this.all().filter(callbackfn)
    }
};