![Image](https://img.shields.io/npm/v/erax.db?color=%2351F9C0&label=erax.db)
![Image](https://img.shields.io/npm/dt/erax.db.svg?color=%2351FC0&maxAge=3600)

#

![Image](https://nodei.co/npm/erax.db.png?downloads=true&downloadRank=true&stars=true)

# News

```npm
- Added multiple option for pull and push methods.
- Now if you are using Sqlite or Mongo you have to download the modules yourself.
- Added ini.
- Added seperator option for database options.
```

# Warn

```npm
- Node.JS version must be greater than 12.
```

# Use

```js
const {
    JsonDatabase,
    YamlDatabase,
    SqliteDatabase,
    MongoDatabase,
    IniDatabase
} = require("erax.db");

//JSON
const jsondb = new JsonDatabase({ databasePath: "MyJsonDatabase.json" });
console.log(JsonDatabase.DBCollection); //It sends all Databases created for Json to the console.

//Yaml
const yamldb = new YamlDatabase({ databasePath: "MyYamlDatabase.yml" });
console.log(YamlDatabase.DBCollection); //It sends all Databases created for Yaml to the console.

//Ini
const inidb = new IniDatabase({ databasePath: "MyInilDatabase.ini" });
console.log(IniDatabase.DBCollection); //It sends all Databases created for Ini to the console.

//SQlite
const sqlitedb = new SqliteDatabase({
    databasePath: "MySqliteDatabase.db",
    tableName: "MySqliteDatabase"
});
console.log(SqliteDatabase.DBCollection); //It sends all Databases created for Sqlite to the console.

//Mongo
const mongodb = new MongoDatabase({ mongoURL: "MongoDB URL" });
console.log(MongoDatabase.DBCollection); //It sends all Databases created for Mongo to the console.
```

# Methods

```js
//Set & Fetch Methods
<db>.set("key", "value")
<db>.fetch("key")
<db>.get("key")
<db>.push("key", "value")

//Delete Methods
<db>.delete("key")
<db>.deleteAll()
<db>.deleteEach("value")
<db>.findAndDelete((element) => element.ID.includes("test"))
<db>.destroy()
<db>.pull("key", "value")

//Exists Methods
<db>.has("key")
<db>.arrayHas("key")
<db>.arrayHasValue("key", "value")

//Array Methods
<db>.all()
<db>.fetchAll()
<db>.startsWith("value")
<db>.endsWith("value")
<db>.includes("value")
<db>.filter((element) => element.ID.startsWith("key"))
<db>.map((element) => element.ID)
<db>.reduce((a, b) => a + b)
<db>.keyArray()
<db>.valueArray()

//Math Methods
<db>.math("key", "+", 1)
<db>.add("key", 1)
<db>.subtract("key", 1)

//Normal Methods
<db>.info()
<db>.size()
<db>.type("key")
<db>.DBCollectionSize()
<db>.getDBName()

//SQLite and Mongo Extra Methods
await <db>.export("database.json")
await <db>.import("database.json")

//NOTE: Only use await in Mongo.
```

#### You can reach Emirhan77#0001 on Discord to report a bug.
