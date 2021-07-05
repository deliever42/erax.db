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
- filter Methodu Eklendi.
- Modül Hızlandırıldı.
- push Methodu Düzenlendi.
- unpush Methodu Düzenlendi.
- Hatalı Olan Yaml Syntax'ı Düzeltildi.
```

# Uyarı
```npm
- Node.JS'nin Sürümü 12'den Büyük Olmalıdır.
```

# JSON Database Kullanımı
```js
const { JsonDatabase } = require("erax.db")
const db = new JsonDatabase({ databasePath: "./MyDatabase.json"})
```

# Yaml Database Kullanımı
```js
const { YamlDatabase } = require("erax.db")
const db = new YamlDatabase({ databasePath: "./MyDatabase.yml"})
```

# Methodlar
```js
//Set & Fetch Methodları
db.set("key", "value") //key Adlı Veriyi Kaydeder.
db.fetch("key") //key Adlı Veriyi Çeker.
db.get("key") //key Adlı Veriyi Çeker.
db.push("key", "value", valueIgnoreIfPresent = true) //key Adlı Veriyi Arraylı Olarak Kaydeder.

//Delete Methodları
db.delete("key") //key Adlı Veriyi Siler.
db.deleteAll() //Tüm Verileri Siler.
db.deleteEach("key") //key Adı İçeren Verileri Siler.
db.destroy() //Database Dosyasını Siler.
db.unpush("key", "value") //Key Adlı Verinin Arrayından Belirtilen Valueyi Siler.

//Boolean Methodları
db.has("key") //key Adlı Veri Varmı/Yokmu Kontrol Eder. 
db.arrayHas("key") //key Adlı Veri Arraylı/Arraysız Kontrol Eder.
db.arrayHasValue("key", "value") //key Adlı Verinin Arrayında Belirtilen Value Varmı/Yokmu Kontrol Eder.

//Veri Bulma & Filtreleme Methodları
db.all() //Database'deki Tüm Verileri Array İçine Ekler.
db.fetchAll() //Database'deki Tüm Verileri Array İçine Ekler.
db.startsWith("key") //key Adı İle Başlayan Verileri Array İçine Ekler.
db.endsWith("key") //key Adı İle Biten Verileri Array İçine Ekler.
db.includes("key") //key Adı İçeren Verileri Array İçine Ekler.
db.filter(x => x.ID.startsWith("key")) //Verileri Filtrelersiniz.

//Matematik İşlemi Methodları
db.math("key", "işlem", "value", goToNegative = false) //Matematik İşlemi Yaparak Veriyi Kaydeder.
db.add("key", 1) //key Adlı Veriye 1 Ekler.
db.subtract("key" 1, goToNegative = false) //Key Adlı Veriden 1 Çıkarır.

//Normal Methodlar
db.info() //Database Bilgilerini Öğrenirsiniz.
db.size() //Database'deki Toplam Veri Sayısını Atar.
db.type("key") //key Adlı Verinin Tipini Atar.
```

#### Herhangi Bir Sıkıntı İle Karşılaşırsanız Aşağıdaki Discord'a Gelin.
[Discord](https://discord.gg/bKmtnaBDRH)

