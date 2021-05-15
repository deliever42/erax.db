![Image](https://img.shields.io/npm/v/erax.db?color=%2351F9C0&label=erax.db) 
![Image](https://img.shields.io/npm/dt/erax.db.svg?color=%2351FC0&maxAge=3600) 
#
![Image](https://nodei.co/npm/erax.db.png?downloads=true&downloadRank=true&stars=true)

# Nasıl Mı Yüklenir?
```npm
NPM:
npm install erax.db

YARN:
yarn add erax.db
```

# Yenilikler
```npm
- Hata & Bug Düzeltmeleri.
```

# Uyarı
```npm
- Node.JS'nin Sürümü 12'den Büyük Olmalıdır.
```

# JSON Database Kullanımı
```js
const { JsonDatabase } = require("erax.db")
const db = new JsonDatabase("./MyDatabase.json")
```

# Yaml Database Kullanımı
```js
const { YamlDatabase } = require("erax.db")
const db = new YamlDatabase("./MyDatabase.yaml")
```

# Sqlite Database Kullanımı
```js
const { SqliteDatabase } = require("erax.db")
const db = new SqliteDatabase()
```

# Fonksiyonlar
```js
//Set & Fetch Fonksiyonları
db.set("key", "value") //key Adlı Veriyi Kaydeder.
db.fetch("key") //key Adlı Veriyi Çeker.
db.get("key") //db.fetch İle Aynı Fonksiyondur.
db.fetchAll() //Database'deki Tüm Verileri Çeker.
db.push("key", "value") //key Adlı Veriyi Arraylı Olarak Kaydeder.

//Delete Fonksiyonları
db.delete("key") //key Adlı Veriyi Siler.
db.deleteAll() //Tüm Verileri Siler.
db.deleteEach("key") //key Adı İçeren Verileri Siler.
db.destroy() //Database Dosyasını Siler.

//Boolean Fonksiyonları
db.has("key") //key Adlı Veri Varmı/Yokmu Kontrol Eder. 
db.arrayHas("key") //key Adlı Veri Arraylı/Arraysız Kontrol Eder.

//Veri Bulma Fonksiyonları
db.all() //Database'deki Tüm Verileri Gözden Geçirir.
db.startsWith("key") //key Adı İle Başlayan Verileri Array İçine Ekler.
db.endsWith("key") //key Adı İle Biten Verileri Array İçine Ekler.
db.includes("key") //key Adı İçeren Verileri Array İçine Ekler.

//Matematik İşlemi Fonksiyonları
db.math("key", "işlem", "value", goToNegative = false) //Matematik İşlemi Yaparak Veriyi Kaydeder.
db.add("key", 1) //key Adlı Veriye 1 Ekler.
db.subtract("key" 1, goToNegative = false) //Key Adlı Veriden 1 Çıkarır.

//Normal Fonksiyonlar
db.version() //ERAX.DB'nin Sürümünü Atar.
db.length() //Database'deki Toplam Veri Sayısını Atar.
db.type("key") //key Adlı Verinin Tipini Atar.

//Sqlite İçin Fonksiyonlar
db.import("./dbPath.json") //dbPath.json Adlı Database'deki Verileri Kaydeder.
db.export("./dbPath.json") //dbPath.json Adlı JSON'a Verileri Kaydeder.
```

#### Herhangi Bir Sıkıntı İle Karşılaşırsanız Aşağıdaki Discord'a Gelin.
[Discord](https://discord.gg/bKmtnaBDRH)

