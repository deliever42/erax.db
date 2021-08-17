![Image](https://img.shields.io/npm/v/erax.db?color=%2351F9C0&label=erax.db)
![Image](https://img.shields.io/npm/dt/erax.db.svg?color=%2351FC0&maxAge=3600)

#

![Image](https://nodei.co/npm/erax.db.png?downloads=true&downloadRank=true&stars=true)

# Yenilikler

```npm
- Hata Düzeltmeleri.
- DBCollection Eklendi.
- DBCollectionSize Methodu Eklendi.
- GetDBName Methodu Eklendi
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
console.log(JsonDatabase.DBCollection) //Konsola Json için oluşturulmuş tüm Database'leri gönderir.

//Yaml
const yamldb = new YamlDatabase({ databasePath: "./MyYamlDatabase.yml" });
console.log(YamlDatabase.DBCollection) //Konsola Yaml için oluşturulmuş tüm Database'leri gönderir.

//SQlite
const sqlitedb = new SqliteDatabase({ databasePath: "./MySqliteDatabase.sqlite" });
console.log(SqliteDatabase.DBCollection) //Konsola Sqlite için oluşturulmuş tüm Database'leri gönderir.

//Mongo
const mongodb = new MongoDatabase({ mongoURL: "MongoDB URL'si" });
console.log(MongoDatabase.DBCollection) //Konsola MongoDB için oluşturulmuş tüm Database'leri gönderir.

//NOT: SQlite'de Hata Alırsanız Umursamayın.
```

# Methodlar

```js
//Set & Fetch Methodları
<db>.set("veri", "değer") //Belirttiğiniz veriyi kaydedersiniz.
<db>.fetch("veri") //Belirttiğiniz veriyi çekersiniz.
<db>.get("veri") //Belirttiğiniz veriyi çekersiniz.
<db>.push("veri", "değer") //Belirttiğiniz veriyi Array'lı kaydedersiniz.

//Delete Methodları
<db>.delete("veri") //Belirttiğiniz veriyi silersiniz.
<db>.deleteAll() //Tüm verileri silersiniz.
<db>.deleteEach("değer") //Belirttiğiniz değeri içeren verileri siler.
<db>.destroy() //Database dosyasını siler.
<db>.pull("veri", "değer") //Belirttiğiniz verinin değerinde belirttiğiniz değer varsa siler.

//Boolean Methodları
<db>.has("veri") //Belirttiğiniz veri varmı/yokmu kontrol eder.
<db>.arrayHas("veri") //Belirttiğiniz verinin değeri Array'lı ise true, Array'sız ise false olarak cevap verir.
<db>.arrayHasValue("veri", "değer") //Belirttiğiniz verinin değerinde belirttiğiniz değer varmı/yokmu kontrol eder.

//Array Methodları
<db>.all() //Tüm verileri Array içine ekler.
<db>.fetchAll() //Tüm verileri Array içine ekler.
<db>.startsWith("değer") //Belirttiğiniz değer ile başlayan verileri Array içine ekler.
<db>.endsWith("değer") //Belirttiğiniz değer ile biten verileri Array içine ekler.
<db>.includes("değer") //Belirttiğiniz değeri içeren verileri Array içine ekler.
<db>.filter((element, index, array) => element.ID.startsWith("veri")) //Verileri filtrelersiniz.
<db>.keyArray() //Tüm verilerin adını Array içine ekler.
<db>.valueArray() //Tüm verilerin değerini Array içine ekler.

//Matematik İşlemi Methodları
<db>.math("veri", "işlem", "değer") //Matematik işlemi yaparak veri kaydedersiniz.
<db>.add("veri", 1) //Belirttiğiniz veriye 1 ekler.
<db>.subtract("veri" 1) //Belirttiğiniz veriden 1 çıkarır.

//Normal Methodlar
<db>.info() //Database bilgilerini öğrenirsiniz.
<db>.size() //Database'deki verilerin sayısını atar.
<db>.type("veri") //Belirttiğiniz verinin tipini öğrenirsiniz.
<db>.DBCollectionSize() //Oluşturulmuş tüm Database'lerin sayısını gönderir.
<db>.getDBName() //Database ismini gönderir.

//SQlite ve Mongo İçin Methodlar
await <db>.export() //Belirtilen JSON dosyasına verileri export eder.
await <db>.import() //Belirtilen JSON dosyasından verileri import eder.

//NOT: Mongo ve SQlite'de Methodları Kullanırken await Kullanmayı Unutmayın.
```

#### Hata Bildirmek İçin Discord Üzerinden Emirhan77#0001'e Ulaşabilirsiniz.
