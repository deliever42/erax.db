const fs = require("fs");
const Error = require("./Error");
const _ = require("lodash");

module.exports = class JsonDatabase {
  constructor(options = { databasePath: "./database.json" }) {
    this.dbPath = options.databasePath;

    if (!this.dbPath.startsWith("./")) this.dbPath = "./" + this.dbPath;
    if (!this.dbPath.endsWith(".json")) this.dbPath = this.dbPath + ".json";

    this.dbName = this.dbPath.split("./").pop().split(".json")[0];
    this.data = {};

    if (!fs.existsSync(this.dbPath)) {
      fs.writeFileSync(this.dbPath, "{}");
    } else {
      this.data = JSON.parse(fs.readFileSync(this.dbPath, "utf-8"));
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
    if (!key || key === "") return Error("Bir Veri Belirtmelisin.");
    if (!value || value === "") return Error("Bir Değer Belirtmelisin.");
    _.set(this.data, key, value);
    fs.writeFileSync(this.dbPath, JSON.stringify(this.data, null, 2));
    return value;
  }

  /**
   * Belirttiğiniz veri varmı/yokmu kontrol eder.
   * @param {string} key Veri
   * @example db.has("key");
   * @returns {boolean}
   */
  has(key) {
    if (!key || key === "") return Error("Bir Veri Belirtmelisin.");
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

    fs.writeFileSync(this.dbPath, "{}");
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
   * @returns {any}
   */
  fetch(key) {
    if (!key || key === "") return Error("Bir Veri Belirtmelisin.");
    return _.get(this.data, key);
  }

  /**
   * Belirttiğiniz veriyi çekersiniz.
   * @param {string} key Veri
   * @example db.get("key");
   * @returns {any}
   */
  get(key) {
    if (!key || key === "") return Error("Bir Veri Belirtmelisin.");
    return this.fetch(key);
  }

  /**
   * Belirttiğiniz verinin tipini öğrenirsiniz.
   * @param {string} key Veri
   * @example db.type("key");
   * @returns {"array" | "string" | "number" | "boolean" | "symbol" | "function" | "object" | "null" | "undefined" | "bigint"}
   */
  type(key) {
    if (!key || key === "") return Error(`Bir Veri Belirmelisin.`);
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
    if (!key || key === "") return Error(`Bir Veri Belirmelisin.`);
    if (this.has(key) === false) return null;
    _.unset(this.data, key);
    fs.writeFileSync(this.dbPath, JSON.stringify(this.data, null, 2));
    return true;
  }

  /**
   * Tüm verileri Array içine ekler.
   * @example db.fetchAll();
   * @returns {Array<{ ID: string, data: any }>}
   */
  fetchAll() {
    return this.all();
  }

  /**
   * Tüm verileri Array içine ekler.
   * @example db.all();
   * @returns {Array<{ ID: string, data: any }>}
   */
  all() {
    let arr = [];
    Object.entries(this.data).forEach((entry) => {
      const [key, value] = entry;
      const data = {
        ID: key,
        data: value,
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
   * @returns {Array<{ ID: string, data: any }>}
   */
  startsWith(value) {
    if (!value || value === "") return Error("Bir Değer Belirtmelisin.");
    return this.all().filter((x) => x.ID.startsWith(value));
  }

  /**
   * Belirttiğiniz değer ile biten verileri Array içine ekler.
   * @param {string} value Değer
   * @example db.endsWith("key");
   * @returns {Array<{ ID: string, data: any }>}
   */
  endsWith(value) {
    if (!value || value === "") return Error("Bir Değer Belirtmelisin.");
    return this.all().filter((x) => x.ID.endsWith(value));
  }

  /**
   * Belirttiğiniz değeri içeren verileri Array içine ekler.
   * @param {string} value Değer
   * @example db.includes("key");
   * @returns {Array<{ ID: string, data: any }>}
   */
  includes(value) {
    if (!value || value === "") return Error("Bir Değer Belirtmelisin.");
    return this.all().filter((x) => x.ID.includes(value));
  }

  /**
   * Belirttiğiniz veriyi Array'lı kaydedersiniz.
   * @param {string} key Veri
   * @param {any} value Değer
   * @param {boolean} valueIgnoreIfPresent Belirtilen verinin Array'ında belirtilen Value varsa otomatik yoksay, default olarak true.
   * @example db.push("key", "value");
   * @returns {Array<any[]>}
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
   * @returns {any}
   */
  math(key, operator, value, goToNegative = false) {
    if (!key || key === "") return Error("Bir Veri Belirtmelisin.");
    if (!operator || operator === "")
      return Error("Bir İşlem Belirtmelisin. (- + * /)");
    if (!value || value === "") return Error("Bir Değer Belirtmelisin.");
    if (isNaN(value)) return Error(`Değer Sadece Sayıdan Oluşabilir!`);

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
   * @returns {any}
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
   * @returns {any}
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
    if (!key || key === "") return Error("Bir Veri Belirtmelisin.");
    if (Array.isArray(this.get(key))) return true;
    return false;
  }

  /**
   * Database bilgilerini öğrenirsiniz.
   * @example db.info();
   * @returns {{ Sürüm: number, DatabaseAdı: string, ToplamVeriSayısı: number, DatabaseTürü: "json" | "yaml" | "sqlite" }}
   */
  info() {
    let p = require("../package.json");

    return {
      Sürüm: p.version,
      DatabaseAdı: this.dbName,
      ToplamVeriSayısı: this.size(),
      DatabaseTürü: "json",
    };
  }

  /**
   * Belirttiğiniz değeri içeren verileri siler.
   * @param {string} value Değer
   * @example db.deleteEach("key");
   * @returns {boolean}
   */
  deleteEach(value) {
    if (!value || value === "") return Error("Bir Değer Belirtmelisin.");
    this.includes(value).forEach((data) => {
      this.delete(data.ID);
    });
    return true;
  }

  /**
   * Belirttiğiniz verinin Array'ında belirttiğiniz değer varsa siler.
   * @param {string} key Veri
   * @param {any} value Değer
   * @example db.pull("key", "value");
   * @returns {Array<any[]>}
   */
  pull(key, value) {
    if (!key || key === "") return Error("Bir Veri Belirtmelisin.");
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
   * @param {any} value Değer
   * @example db.arrayHasValue("key", "value");
   * @returns {boolean}
   */
  arrayHasValue(key, value) {
    if (!key || key === "") return Error("Bir Veri Belirtmelisin.");
    if (this.has(key) === false) return null;
    if (this.arrayHas(key) === false)
      return "EraxDB => Bir Hata Oluştu: Belirtilen Verinin Tipi Array Olmak Zorundadır!";
    if (!value || value === "") return Error("Bir Değer Belirtmelisin.");
    if (this.get(key).indexOf(value) > -1) return true;
    return false;
  }

  /**
   * Verileri filtrelersiniz.
   * @param {(element: { ID: string, data: any }, index: number, array: Array<{ ID: string, data: any }>) => boolean} callbackfn Callbackfn
   * @example db.filter(x => x.ID.startsWith("key"));
   * @returns {Array<{ ID: string, data: any }>}
   */
  filter(callbackfn) {
    return this.all().filter(callbackfn);
  }

  /**
   * Tüm verilerin adını Array içine ekler.
   * @example db.keyArray()
   * @returns {Array<string[]>}
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
   * @returns {Array<any[]>}
   */
  valueArray() {
    let arr = [];
    this.all().forEach((data) => {
      arr.push(data.data);
    });
    return arr;
  }
};
