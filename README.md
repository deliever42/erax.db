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
- Bilinen Hatalar Düzeltildi.
```

# Uyarı

```npm
- Node.JS'nin Sürümü 14'den Büyük Olmalıdır.
```

# Kullanım

```js
const { JsonDatabase, YamlDatabase, SqliteDatabase, MongoDatabase } = require("erax.db");

//JSON
const jsondb = new JsonDatabase({ databasePath: "./MyJsonDatabase.json" });

//Yaml
const yamldb = new YamlDatabase({ databasePath: "./MyYamlDatabase.yml" });

//SQlite
const sqlitedb = new SqliteDatabase({ databasePath: "./MySqliteDatabase.sqlite" });

//Mongo
const mongodb = new MongoDatabase({ mongoURL: "MongoDB URL'si" });


//NOT: SQlite'de Hata Alırsanız Umursamayın.
```

# Methodlar

```js
//Set & Fetch Methodları
db.set("veri", "değer") //Belirttiğiniz veriyi kaydedersiniz.
db.fetch("veri") //Belirttiğiniz veriyi çekersiniz.
db.get("veri") //Belirttiğiniz veriyi çekersiniz.
db.push("veri", "değer") //Belirttiğiniz veriyi Array'lı kaydedersiniz.

//Delete Methodları
db.delete("veri") //Belirttiğiniz veriyi silersiniz.
db.deleteAll() //Tüm verileri silersiniz.
db.deleteEach("değer") //Belirttiğiniz değeri içeren verileri siler.
db.destroy() //Database dosyasını siler.
db.pull("veri", "değer") //Belirttiğiniz verinin Array'ında belirttiğiniz değer varsa siler.

//Boolean Methodları
db.has("veri") //Belirttiğiniz veri varmı/yokmu kontrol eder.
db.arrayHas("veri") //Belirttiğiniz veri Array'lı ise true, Array'sız ise false olarak cevap verir.
db.arrayHasValue("veri", "değer") //Belirttiğiniz verinin Array'ında belirttiğiniz değer varmı/yokmu kontrol eder.

//Array Methodları
db.all() //Tüm verileri Array içine ekler.
db.fetchAll() //Tüm verileri Array içine ekler.
db.startsWith("değer") //Belirttiğiniz değer ile başlayan verileri Array içine ekler.
db.endsWith("değer") //Belirttiğiniz değer ile biten verileri Array içine ekler.
db.includes("değer") //Belirttiğiniz değeri içeren verileri Array içine ekler.
db.filter((element, index, array) => element.ID.startsWith("veri")) //Verileri filtrelersiniz.
db.keyArray() //Tüm verilerin adını Array içine ekler.
db.valueArray() //Tüm verilerin değerini Array içine ekler.

//Matematik İşlemi Methodları
db.math("veri", "işlem", "değer") //Matematik işlemi yaparak veri kaydedersiniz.
db.add("veri", 1) //Belirttiğiniz veriye 1 ekler.
db.subtract("veri" 1) //Belirttiğiniz veriden 1 çıkarır.

//Normal Methodlar
db.info() //Database bilgilerini öğrenirsiniz.
db.size() //Database'deki verilerin sayısını atar.
db.type("veri") //Belirttiğiniz verinin tipini öğrenirsiniz.
```

#### Hata Bildirmek İçin Discord Üzerinden Emirhan77#0001'e Ulaşabilirsiniz.
