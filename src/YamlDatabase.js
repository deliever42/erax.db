const fs = require("fs");
const Error = require("./Error");
const _ = require("lodash");
const YAML = require("yaml");

module.exports = class YamlDatabase {
    constructor(options = { databasePath: "./database.yml" }) {
        this.dbPath = options.databasePath;

        if (!this.dbPath.startsWith("./")) this.dbPath = "./" + this.dbPath;
        if (this.dbPath.endsWith(".yaml")) this.dbPath = this.dbPath.split(".yaml")[0];
        if (!this.dbPath.endsWith(".yml")) this.dbPath = this.dbPath + ".yml";

        this.dbName = this.dbPath.split("./").pop().split(".yml")[0];
        this.data = {};

        if (!fs.existsSync(this.dbPath)) {
            fs.writeFileSync(this.dbPath, "");
        } else {
            this.data = YAML.parse(fs.readFileSync(this.dbPath, "utf-8"));
        }
    }

    /**
     * Belirttiğiniz veriyi kaydedersiniz.
     * @param {string} key Veri
     * @param {any | any[]} value Değer
     * @example db.set("key", "value");
     * @returns {any | any[]}
     */
    set(key, value) {
        if (!key || key === "") return Error("Bir Veri Belirtmelisin.");
        if (typeof key !== "string") return Error("Belirtilen Veri String Tipli Olmalıdır!");
        if (!value || value === "") return Error("Bir Değer Belirtmelisin.");
        _.set(this.data, key, value);
        this.#save();
        return value;
    }

    /**
     * Belirttiğiniz veri varmı/yokmu kontrol eder.
     * @param {string} key Veri
     * @example db.has("key");
     * @returns {boolean}
     */
    has(key) {
        if (this.get(key)) return true;
        return false;
    }

    /**
     * Tüm verileri silersiniz.
     * @example db.deleteAll();
     * @returns {boolean}
     */
    deleteAll() {
        this.all().forEach((data) => {
            _.unset(this.data, data.ID);
        });

        fs.writeFileSync(this.dbPath, "");
        return true;
    }

    /**
     * Database dosyasını siler.
     * @example db.destroy();
     * @returns {boolean}
     */
    destroy() {
        this.all().forEach((data) => {
            _.unset(this.data, data.ID);
        });

        fs.unlinkSync(this.dbPath);
        return true;
    }

    /**
     * Belirttiğiniz veriyi çekersiniz.
     * @param {string} key Veri
     * @example db.fetch("key");
     * @returns {any | any[]}
     */
    fetch(key) {
        if (!key || key === "") return Error("Bir Veri Belirtmelisin.");
        if (typeof key !== "string") return Error("Belirtilen Veri String Tipli Olmalıdır!");
        return _.get(this.data, key);
    }

    /**
     * Belirttiğiniz veriyi çekersiniz.
     * @param {string} key Veri
     * @example db.get("key");
     * @returns {any | any[]}
     */
    get(key) {
        return this.fetch(key);
    }

    /**
     * Belirttiğiniz verinin tipini öğrenirsiniz.
     * @param {string} key Veri
     * @example db.type("key");
     * @returns {"array" | "string" | "number" | "boolean" | "symbol" | "function" | "object" | "null" | "undefined" | "bigint"}
     */
    type(key) {
        if (this.has(key) === false) return null;
        if (Array.isArray(this.get(key))) return "array";
        return typeof this.get(key);
    }

    /**
     * Belirttiğiniz veriyi silersiniz.
     * @param {string} key Veri
     * @example db.delete("key");
     * @returns {boolean}
     */
    delete(key) {
        if (this.has(key) === false) return null;
        _.unset(this.data, key);
        this.#save();
        return true;
    }

    /**
     * Tüm verileri Array içine ekler.
     * @example db.fetchAll();
     * @returns {{ ID: string, data: any | any[] }[]}
     */
    fetchAll() {
        return this.all();
    }

    /**
     * Tüm verileri Array içine ekler.
     * @example db.all();
     * @returns {{ ID: string, data: any | any[] }[]}
     */
    all() {
        let arr = [];
        Object.entries(this.data).forEach((entry) => {
            const [key, value] = entry;
            const data = {
                ID: key,
                data: value
            };
            arr.push(data);
        });
        return arr;
    }

    /**
     * Database'de ki verilerin sayısını atar.
     * @example db.size();
     * @returns {number}
     */
    size() {
        return this.all().length;
    }

    /**
     * Belirttiğiniz değer ile başlayan verileri Array içine ekler.
     * @param {string} value Değer
     * @example db.startsWith("key");
     * @returns {{ ID: string, data: any | any[] }[]}
     */
    startsWith(value) {
        if (!value || value === "") return Error("Bir Değer Belirtmelisin.");
        return this.all().filter((x) => x.ID.startsWith(value));
    }

    /**
     * Belirttiğiniz değer ile biten verileri Array içine ekler.
     * @param {string} value Değer
     * @example db.endsWith("key");
     * @returns {{ ID: string, data: any | any[] }[]}
     */
    endsWith(value) {
        if (!value || value === "") return Error("Bir Değer Belirtmelisin.");
        return this.all().filter((x) => x.ID.endsWith(value));
    }

    /**
     * Belirttiğiniz değeri içeren verileri Array içine ekler.
     * @param {string} value Değer
     * @example db.includes("key");
     * @returns {{ ID: string, data: any | any[] }[]}
     */
    includes(value) {
        if (!value || value === "") return Error("Bir Değer Belirtmelisin.");
        return this.all().filter((x) => x.ID.includes(value));
    }

    /**
     * Belirttiğiniz veriyi Array'lı kaydedersiniz.
     * @param {string} key Veri
     * @param {any | any[]} value Değer
     * @param {boolean} valueIgnoreIfPresent Belirtilen verinin Array'ında belirtilen Value varsa otomatik yoksay, default olarak true.
     * @example db.push("key", "value");
     * @returns {any[]}
     */
    push(key, value, valueIgnoreIfPresent = true) {
        if (this.has(key) === false) return this.set(key, [value]);
        else if (this.arrayHas(key) === true && this.has(key) === true) {
            let yenivalue = this.get(key);
            yenivalue.push(value);
            if (this.arrayHasValue(key, yenivalue) && valueIgnoreIfPresent === true)
                return "EraxDB => Bir Hata Oluştu: Şartlar Uygun Olmadığı İçin Veri Pushlanmadı.";
            return this.set(key, yenivalue);
        } else {
            return "EraxDB => Bir Hata Oluştu: Şartlar Uygun Olmadığı İçin Veri Pushlanmadı.";
        }
    }

    /**
     * Matematik işlemi yaparak veri kaydedersiniz.
     * @param {string} key Veri
     * @param {"+" | "-" | "*" | "/" | "%"} operator Operator
     * @param {number} value Değer
     * @param {boolean} goToNegative Value'nin -'lere düşük düşmeyeceği, default olarak false.
     * @example db.math("key", "+", "1");
     * @returns {number}
     */
    math(key, operator, value, goToNegative = false) {
        if (!operator || operator === "") return Error("Bir İşlem Belirtmelisin. (-  +  *  /  %)");
        if (isNaN(value)) return Error(`Belirtilen Değer Number Tipli Olmadılır!`);

        if (this.has(key) === false) return this.set(key, Number(value));
        let data = this.get(key);

        if (operator === "-") {
            data = data - Number(value);
            if (goToNegative === false && data < 1) data = Number("0");
        } else if (operator === "+") {
            data = data + Number(value);
        } else if (operator === "*") {
            data = data * Number(value);
        } else if (operator === "/") {
            data = data / Number(value);
            if (goToNegative === false && data < 1) data = Number("0");
        } else if (operator === "%") {
            data = data % Number(value);
        } else {
            return Error("Geçersiz İşlem!");
        }

        return this.set(key, data);
    }

    /**
     * Belirttiğiniz veriye 1 ekler.
     * @param {string} key Veri
     * @param {number} value Değer
     * @example db.add("key", 1);
     * @returns {number}
     */
    add(key, value) {
        return this.math(key, "+", value);
    }

    /**
     * Belirttiğiniz veriden 1 çıkarır.
     * @param {string} key Veri
     * @param {number} value Değer
     * @param {boolean} goToNegative Value'nin -'lere düşük düşmeyeceği, default olarak false.
     * @example db.subtract("key", 1);
     * @returns {number}
     */
    subtract(key, value, goToNegative = false) {
        return this.math(key, "-", value, goToNegative);
    }

    /**
     * Belirttiğiniz veri Array'lı ise true, Array'sız ise false olarak cevap verir.
     * @param {string} key Veri
     * @example db.arrayHas("key");
     * @returns {boolean}
     */
    arrayHas(key) {
        if (Array.isArray(this.get(key))) return true;
        return false;
    }

    /**
     * Database bilgilerini öğrenirsiniz.
     * @example db.info();
     * @returns {{ Sürüm: number, DatabaseAdı: string, ToplamVeriSayısı: number, DatabaseTürü: "yaml" }}
     */
    info() {
        let p = require("../package.json");

        return {
            Sürüm: p.version,
            DatabaseAdı: this.dbName,
            ToplamVeriSayısı: this.size(),
            DatabaseTürü: "yaml"
        };
    }

    /**
     * Belirttiğiniz değeri içeren verileri siler.
     * @param {string} value Değer
     * @example db.deleteEach("key");
     * @returns {boolean}
     */
    deleteEach(value) {
        this.includes(value).forEach((data) => {
            this.delete(data.ID);
        });
        return true;
    }

    /**
     * Belirttiğiniz verinin Array'ında belirttiğiniz değer varsa siler.
     * @param {string} key Veri
     * @param {any | any[]} value Değer
     * @example db.pull("key", "value");
     * @returns {any[]}
     */
    pull(key, value) {
        if (this.has(key) === false) return null;
        if (this.arrayHas(key) === false)
            return "EraxDB => Bir Hata Oluştu: Belirttiğiniz Verinin Tipi Array Olmak Zorundadır!";
        if (!value || value === "") return Error("Bir Değer Belirtmelisin.");
        if (this.arrayHasValue(key, value) === false)
            return "EraxDB => Bir Hata Oluştu: Belirttiğiniz Değer Belirttiğiniz Verinin Array'ında Bulunmuyor.";

        let oldArr = this.get(key);
        let newArr = oldArr.filter((x) => x !== value);

        return this.set(key, newArr);
    }

    /**
     * Belirttiğiniz verinin Array'ında belirttiğiniz değer varmı/yokmu kontrol eder.
     * @param {string} key Veri
     * @param {any | any[]} value Değer
     * @example db.arrayHasValue("key", "value");
     * @returns {boolean}
     */
    arrayHasValue(key, value) {
        if (this.has(key) === false) return null;
        if (this.arrayHas(key) === false)
            return "EraxDB => Bir Hata Oluştu: Belirtilen Verinin Tipi Array Olmak Zorundadır!";
        if (!value || value === "") return Error("Bir Değer Belirtmelisin.");
        if (this.get(key).indexOf(value) > -1) return true;
        return false;
    }

    /**
     * Verileri filtrelersiniz.
     * @param {(element: { ID: string, data: any | any[] }, index: number, array: { ID: string, data: any | any[] }[]) => boolean} callbackfn Callbackfn
     * @example db.filter(x => x.ID.startsWith("key"));
     * @returns {{ ID: string, data: any | any[] }[]}
     */
    filter(callbackfn) {
        return this.all().filter(callbackfn);
    }

    /**
     * Tüm verilerin adını Array içine ekler.
     * @example db.keyArray()
     * @returns {string[]}
     */
    keyArray() {
        let arr = [];
        this.all().forEach((data) => {
            arr.push(data.ID);
        });
        return arr;
    }

    /**
     * Tüm verilerin değerini Array içine ekler.
     * @example db.valueArray()
     * @returns {any[]}
     */
    valueArray() {
        let arr = [];
        this.all().forEach((data) => {
            arr.push(data.data);
        });
        return arr;
    }

    /**
     * Veri kaydedersiniz.
     * @private
     * @example this.#save()
     * @returns {boolean}
     */
    #save() {
        fs.writeFileSync(this.dbPath, YAML.stringify(this.data));
        return true;
    }
};
