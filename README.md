# Yaml Database Kullanımı
```js
const { YamlDatabase } = require("erax.db")
const db = new YamlDatabase("./MyDatabase.yaml")
```

# JSON Database Kullanımı
```js
const { JsonDatabase } = require("erax.db")
const db = new JsonDatabase("./MyDatabase.json")
```

# Sqlite Database Kullanımı
```js
const { SqliteDatabase } = require("erax.db")
const db = new SqliteDatabase()
```

# Fonksiyonlar
```js
db.set("key", "value") //key Adlı Veriyi Database'ye Kaydeder. 
db.fetch("key") //key Adlı Veriyi Database'den Çeker.
db.get("key") //db.fetch İle Aynı Fonksiyondur.
db.has("key") //key Adlı Veri Database'de Varsa true, Yoksa false Olarak Cevap Verir. 
db.arrayHas("key") //key Adlı Veri Arraylı İse true, Arraysız İse false Olarak Cevap Verir.
db.push("key", "value") //key Adlı Veriyi Arraylı Olarak Database'ye Kaydeder.
db.fetchAll() //Database'deki Tüm Verileri Çeker.
db.all() //Database'deki Tüm Verileri Gözden Geçirir.
db.length() //Database'deki Toplam Veri Sayısını Atar.
db.type("key") //key Adlı Verinin Tipini Atar.
db.startsWith("key") //Database'de key Adı İle Başlayan Verileri Array İçine Ekler.
db.endsWith("key") //Database'de key Adı İle Biten Verileri Array İçine Ekler.
db.includes("key") //Database'de key Adı İçeren Verileri Array İçine Ekler.
db.delete("key") //key Adlı Veriyi Database'den Siler.
db.deleteAll() //Database'deki Tüm Verileri Siler.
db.destroy() //Database Dosyasını Siler.
db.math("key", "işlem", "value") //Matematik İşlemi Yaparak Veriyi Database'ye Kaydeder.
db.add("key", 1) //key Adlı Veriye 1 Ekler.
db.subtract("key" 1) //Key Adlı Veriden 1 Çıkarır.
db.version() //ERAX.DB'nin Sürümünü Atar.
```

#### Herhangi Bir Sıkıntı İle Karşılaşırsanız Aşağıdaki Discord'a Gelin.
[Discord](https://discord.gg/bKmtnaBDRH)

