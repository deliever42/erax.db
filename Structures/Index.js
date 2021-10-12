const Util = require("./Utils/Util");
const { red, gray, green, blue } = require("./Utils/ColorStyles");

Util.updateCheck().then((checked) => {
    if (checked.updated === false) {
        console.log("--------------------------------------------------");
        console.log(
            blue("EraxDB: ") +
                red(checked.installedVersion) +
                " => " +
                green(checked.packageVersion)
        );
        console.log(blue("For New Version") + " => " + gray("npm install erax.db@latest"));
        console.log("--------------------------------------------------");
    }
});

module.exports = {
    JsonDatabase: require("./Providers/Json"),
    YamlDatabase: require("./Providers/Yaml"),
    SqliteDatabase: require("./Providers/Sqlite"),
    MongoDatabase: require("./Providers/Mongo")
};
