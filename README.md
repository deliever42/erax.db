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
db.set("key", "value") //key Adlı Veriyi Kaydeder.
db.fetch("key") //key Adlı Veriyi Çeker.
db.get("key") //db.fetch İle Aynı Fonksiyondur.
db.has("key") //key Adlı Veri Varmı/Yokmu Kontrol Eder. 
db.arrayHas("key") //key Adlı Veri Arraylı/Arraysız Kontrol Eder.
db.push("key", "value") //key Adlı Veriyi Arraylı Olarak Kaydeder.
db.fetchAll() //Database'deki Tüm Verileri Çeker.
db.all() //Database'deki Tüm Verileri Gözden Geçirir.
db.length() //Database'deki Toplam Veri Sayısını Atar.
db.type("key") //key Adlı Verinin Tipini Atar.
db.startsWith("key") //key Adı İle Başlayan Verileri Array İçine Ekler.
db.endsWith("key") //key Adı İle Biten Verileri Array İçine Ekler.
db.includes("key") //key Adı İçeren Verileri Array İçine Ekler.
db.delete("key") //key Adlı Veriyi Siler.
db.deleteAll() //Tüm Verileri Siler.
db.destroy() //Database Dosyasını Siler.
db.math("key", "işlem", "value", goToNegative = false) //Matematik İşlemi Yaparak Veriyi Kaydeder.
db.add("key", 1) //key Adlı Veriye 1 Ekler.
db.subtract("key" 1) //Key Adlı Veriden 1 Çıkarır.
db.version() //ERAX.DB'nin Sürümünü Atar.
```

#### Herhangi Bir Sıkıntı İle Karşılaşırsanız Aşağıdaki Discord'a Gelin.
[Discord](https://discord.gg/bKmtnaBDRH)

