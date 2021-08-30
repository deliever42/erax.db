const fs = require("fs");
const ErrorManager = require("../utils/ErrorManager");
const path = require("path");
const Util = require("../utils/Util");
const chalk = require("chalk");

/**
 * Json Database
 * @class
 */
module.exports = class JsonDatabase {
    /**
     * Oluşturulmuş tüm Database'leri Array içinde gönderir.
     * @static
     * @type {string[]}
     */
    static DBCollection = [];

    /**
     * Options
     * @constructor
     * @param {{ databasePath: string }} options Database Options
     */
    constructor(options = { databasePath: "database.json" }) {
        if (
            typeof options.databasePath !== "string" ||
            options.databasePath === undefined ||
            options.databasePath === null
        )
            throw new ErrorManager("Geçersiz Database İsmi!");

        let processFolder = process.cwd();
        let databasePath = options.databasePath;

        if (databasePath.endsWith(path.sep)) {
            databasePath += "database.json";
        } else {
            if (!databasePath.endsWith(".json")) {
                databasePath += ".json";
            }
        }

        let dirs = databasePath.split(path.sep).filter((dir) => dir !== "");
        let dbName = "";
        let dirNames = "";

        for (let i = 0; i < dirs.length; i++) {
            if (!dirs[i].endsWith(".json")) {
                dirNames += `${dirs[i]}${path.sep}`;
                if (!fs.existsSync(`${processFolder}${path.sep}${dirNames}`)) {
                    fs.mkdirSync(`${processFolder}${path.sep}${dirNames}`);
                }
            } else {
                dbName = `${dirs[i]}`;

                if (!fs.existsSync(`${processFolder}${path.sep}${dirNames}${dbName}`)) {
                    fs.writeFileSync(`${processFolder}${path.sep}${dirNames}${dbName}`, "{}");
                }
            }
        }

        this.dbPath = `${process.cwd()}${path.sep}${dirNames}${dbName}`;

        this.dbName = `${dirNames}${dbName}`;

        this.data = JSON.parse(fs.readFileSync(this.dbPath, "utf-8"));

        if (!JsonDatabase.DBCollection.includes(this.dbName)) {
            JsonDatabase.DBCollection.push(this.dbName);
        }
    }

    /**
     * Belirttiğiniz veriyi kaydedersiniz.
     * @param {string} key Veri
     * @param {any} value Değer
     * @example db.set("key", "value");
     * @returns {any}
     */
    set(key, value) {
        if (key === "" || key === null || key === undefined)
            throw new ErrorManager("Bir Veri Belirtmelisin.");
        if (typeof key !== "string")
            throw new ErrorManager("Belirtilen Veri String Tipli Olmalıdır!");
        if (value === "" || value === null || value === undefined)
            throw new ErrorManager("Bir Değer Belirtmelisin.");
        Util.dataSet(this.data, key, value);
        Util.write(this.dbPath, this.data);
        return value;
    }

    /**
     * Belirttiğiniz veri varmı/yokmu kontrol eder.
     * @param {string} key Veri
     * @example db.has("key");
     * @returns {boolean}
     */
    has(key) {
        return Util.dataHas(this.data, key);
    }

    /**
     * Tüm verileri silersiniz.
     * @example db.deleteAll();
     * @returns {boolean}
     */
    deleteAll() {
        this.data = {};
        fs.writeFileSync(this.dbPath, "{}");
        return true;
    }

    /**
     * Database dosyasını siler.
     * @example db.destroy();
     * @returns {boolean}
     */
    destroy() {
        this.data = {};
        fs.unlinkSync(this.dbPath);
        return true;
    }

    /**
     * Belirttiğiniz veriyi çekersiniz.
     * @param {string} key Veri
     * @example db.fetch("key");
     * @returns {any}
     */
    fetch(key) {
        if (key === "" || key === null || key === undefined)
            throw new ErrorManager("Bir Veri Belirtmelisin.");
        if (typeof key !== "string")
            throw new ErrorManager("Belirtilen Veri String Tipli Olmalıdır!");
        return Util.dataGet(this.data, key);
    }

    /**
     * Belirttiğiniz veriyi çekersiniz.
     * @param {string} key Veri
     * @example db.get("key");
     * @returns {any}
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
        Util.dataDelete(this.data, key);
        Util.write(this.dbPath, this.data);
        return true;
    }

    /**
     * Tüm verileri Array içine ekler.
     * @example db.fetchAll();
     * @returns {{ ID: string, data: any }[]}
     */
    fetchAll() {
        return this.all();
    }

    /**
     * Tüm verileri Array içine ekler.
     * @example db.all();
     * @returns {{ ID: string, data: any }[]}
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
     * @example db.size()
     * @returns {number}
     */
    size() {
        return this.all().length;
    }

    /**
     * Belirttiğiniz değer ile başlayan verileri Array içine ekler.
     * @param {string} value Değer
     * @example db.startsWith("key");
     * @returns {{ ID: string, data: any }[]}
     */
    startsWith(value) {
        if (value === "" || value === null || value === undefined)
            throw new ErrorManager("Bir Değer Belirtmelisin.");
        return this.all().filter((x) => x.ID.startsWith(value));
    }

    /**
     * Belirttiğiniz değer ile biten verileri Array içine ekler.
     * @param {string} value Değer
     * @example db.endsWith("key");
     * @returns {{ ID: string, data: any }[]}
     */
    endsWith(value) {
        if (value === "" || value === null || value === undefined)
            throw new ErrorManager("Bir Değer Belirtmelisin.");
        return this.all().filter((x) => x.ID.endsWith(value));
    }

    /**
     * Belirttiğiniz değeri içeren verileri Array içine ekler.
     * @param {string} value Değer
     * @example db.includes("key");
     * @returns {{ ID: string, data: any }[]}
     */
    includes(value) {
        if (value === "" || value === null || value === undefined)
            throw new ErrorManager("Bir Değer Belirtmelisin.");
        return this.all().filter((x) => x.ID.includes(value));
    }

    /**
     * Belirttiğiniz veriyi Array'lı kaydedersiniz.
     * @param {string} key Veri
     * @param {any} value Değer
     * @param {boolean} valueIgnoreIfPresent Belirtilen verinin Array'ında belirtilen Value varsa otomatik yoksay, default olarak true.
     * @example db.push("key", "value");
     * @returns {any[]}
     */
    push(key, value, valueIgnoreIfPresent = true) {
        if (this.has(key) === false) return this.set(key, [value]);
        else if (this.arrayHas(key) === true && this.has(key) === true) {
            let yenivalue = this.get(key);
            if (yenivalue.includes(value) && valueIgnoreIfPresent === true)
                return console.log(
                    `${chalk.blue("EraxDB")} => ${chalk.red("Bir Hata Oluştu:")} ${chalk.gray(
                        "Şartlar Uygun Olmadığı İçin Veri Pushlanmadı."
                    )}`
                );
            yenivalue.push(value);
            return this.set(key, yenivalue);
        } else {
            return console.log(
                `${chalk.blue("EraxDB")} => ${chalk.red("Bir Hata Oluştu:")} ${chalk.gray(
                    "Şartlar Uygun Olmadığı İçin Veri Pushlanmadı."
                )}`
            );
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
        if (operator === null || operator === undefined || operator === "")
            throw new ErrorManager("Bir İşlem Belirtmelisin. (-  +  *  /  %)");
        if (value === null || value === undefined || value === "")
            throw new ErrorManager("Bir Değer Belirtmelisin.");
        if (isNaN(value)) throw new ErrorManager(`Belirtilen Değer Sadece Sayıdan Oluşabilir!`);

        if (this.has(key) === false) return this.set(key, Number(value));
        let data = this.get(key);

        switch (operator) {
            case "+":
            case "add":
            case "addition":
            case "ekle":
                data += Number(value);
                break;
            case "-":
            case "subtract":
            case "subtraction":
            case "subtr":
            case "çıkar":
            case "sub":
            case "substr":
                data -= Number(value);
                if (goToNegative === false && data < 1) data = Number("0");
                break;
            case "*":
            case "multiplication":
            case "çarp":
            case "çarpma":
                data *= Number(value);
                break;
            case "bölme":
            case ".":
            case "division":
            case "div":
            case "/":
                data /= Number(value);
                if (goToNegative === false && data < 1) data = Number("0");
                break;
            case "%":
            case "yüzde":
            case "percentage":
            case "percent":
                data %= Number(value);
                break;
            default:
                throw new ErrorManager("Geçersiz İşlem!");
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
     * @returns {{ Sürüm: number, DatabaseAdı: string, ToplamVeriSayısı: number, DatabaseTürü: "json" }}
     */
    info() {
        let p = require("../../package.json");

        return {
            Sürüm: p.version,
            DatabaseAdı: this.dbName,
            ToplamVeriSayısı: this.size(),
            DatabaseTürü: "json"
        };
    }

    /**
     * Belirttiğiniz değeri içeren verileri siler.
     * @param {string} value Değer
     * @param {number} maxDeletedSize Silinecek maksimum veri sayısı.
     * @example db.deleteEach("key");
     * @returns {boolean}
     */
    deleteEach(value, maxDeletedSize = 0) {
        let deleted = 0;
        maxDeletedSize = Number(maxDeletedSize);

        maxDeletedSize === null ? maxDeletedSize === 0 : maxDeletedSize === maxDeletedSize;
        maxDeletedSize === undefined ? maxDeletedSize === 0 : maxDeletedSize === maxDeletedSize;
        maxDeletedSize === "" ? maxDeletedSize === 0 : maxDeletedSize === maxDeletedSize;

        this.includes(value).forEach((data) => {
            if (maxDeletedSize === 0) {
                this.delete(data.ID);
                deleted++;
            } else {
                if (deleted < maxDeletedSize) {
                    this.delete(data.ID);
                    deleted++;
                }
            }
        });
        return true;
    }

    /**
     * Belirttiğiniz verinin Array'ında belirttiğiniz değer varsa siler.
     * @param {string} key Veri
     * @param {any} value Değer
     * @example db.pull("key", "value");
     * @returns {any[]}
     */
    pull(key, value) {
        if (this.has(key) === false) return null;
        if (this.arrayHas(key) === false)
            return console.log(
                `${chalk.blue("EraxDB")} => ${chalk.red("Bir Hata Oluştu:")} ${chalk.gray(
                    "Belirttiğiniz Verinin Tipi Array Olmak Zorundadır!"
                )}`
            );
        if (this.arrayHasValue(key, value) === false)
            return console.log(
                `${chalk.blue("EraxDB")} => ${chalk.red("Bir Hata Oluştu:")} ${chalk.gray(
                    "Belirttiğiniz Değer Belirttiğiniz Verinin Array'ında Bulunmuyor."
                )}`
            );

        let oldArr = this.get(key);
        let newArr = oldArr.filter((x) => x !== value);

        return this.set(key, newArr);
    }

    /**
     * Belirttiğiniz verinin Array'ında belirttiğiniz değer varmı/yokmu kontrol eder.
     * @param {string} key Veri
     * @param {any} value Değer
     * @example db.arrayHasValue("key", "value");
     * @returns {boolean}
     */
    arrayHasValue(key, value) {
        if (this.has(key) === false) return null;
        if (this.arrayHas(key) === false)
            return console.log(
                `${chalk.blue("EraxDB")} => ${chalk.red("Bir Hata Oluştu:")} ${chalk.gray(
                    "Belirttiğiniz Verinin Tipi Array Olmak Zorundadır!"
                )}`
            );
        if (this.get(key).indexOf(value) > -1) return true;
        return false;
    }

    /**
     * Verileri filtrelersiniz.
     * @param {(element: { ID: string, data: any }) => boolean} callback Callback
     * @example db.filter(x => x.ID.startsWith("key"));
     * @returns {{ ID: string, data: any }[]}
     */
    filter(callback) {
        return this.all().filter(callback);
    }

    /**
     * Verileri filteleyip silersiniz.
     * @param {(element: { ID: string, data: any }) => boolean} callback Callback
     * @param {number} maxDeletedSize Silinecek maksimum veri sayısı.
     * @example db.filterAndDelete((element) => element.ID.includes("test"));
     * @returns {number}
     */
    filterAndDelete(callback, maxDeletedSize = 0) {
        let deleted = 0;
        maxDeletedSize = Number(maxDeletedSize);

        maxDeletedSize === null ? maxDeletedSize === 0 : maxDeletedSize === maxDeletedSize;
        maxDeletedSize === undefined ? maxDeletedSize === 0 : maxDeletedSize === maxDeletedSize;
        maxDeletedSize === "" ? maxDeletedSize === 0 : maxDeletedSize === maxDeletedSize;

        let filtered = this.filter(callback);
        filtered.forEach((obj) => {
            if (maxDeletedSize === 0) {
                this.delete(obj.ID);
                deleted++;
            } else {
                if (deleted < maxDeletedSize) {
                    this.delete(obj.ID);
                    deleted++;
                }
            }
        });
        return deleted;
    }

    /**
     * Tüm verilerin adını Array içine ekler.
     * @example db.keyArray()
     * @returns {string[]}
     */
    keyArray() {
        let arr = [];
        Object.keys(JSON.parse(fs.readFileSync(this.dbPath, "utf-8"))).forEach((key) =>
            arr.push(key)
        );
        return arr;
    }

    /**
     * Tüm verilerin değerini Array içine ekler.
     * @example db.valueArray()
     * @returns {any[]}
     */
    valueArray() {
        let arr = [];
        Object.values(JSON.parse(fs.readFileSync(this.dbPath, "utf-8"))).forEach((value) =>
            arr.push(value)
        );
        return arr;
    }

    /**
     * Oluşturulmuş tüm Database'lerin sayısını gönderir.
     * @example db.DBCollectionSize()
     * @returns {number}
     */
    DBCollectionSize() {
        return JsonDatabase.DBCollection.length;
    }

    /**
     * Database adını gönderir.
     * @example db.getDBName()
     * @returns {string}
     */
    getDBName() {
        return this.dbName;
    }

    /**
     * Yeni Array oluşturup gönderir.
     * @param {(element: { ID: string, data: any }) => boolean} callback Callback
     * @example db.map((element) => element.ID);
     * @returns {any[]}
     */
    map(callback) {
        return this.all().map(callback);
    }
};