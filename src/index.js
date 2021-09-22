const Util = require("./utils/Util");
const chalk = require("chalk");

Util.updateCheck().then((checked) => {
    if (checked.updated === false) {
        console.log(chalk.bold("--------------------------------------------------"));
        console.log(
            chalk.blue("EraxDB: ") +
                chalk.red(checked.installedVersion) +
                " => " +
                chalk.green(checked.packageVersion)
        );
        console.log(
            chalk.blue("For New Version") + " => " + chalk.gray("npm install erax.db@latest")
        );
        console.log(chalk.bold("--------------------------------------------------"));
    }
});

module.exports = {
    JsonDatabase: require("./providers/Json"),
    YamlDatabase: require("./providers/Yaml"),
    SqliteDatabase: require("./providers/Sqlite"),
    MongoDatabase: require("./providers/Mongo")
};
