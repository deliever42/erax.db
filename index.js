const Util = require("./src/Util");
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
            chalk.blue("Yeni Sürüm İçin ") + "=>" + chalk.gray(" npm install erax.db@latest")
        );
        console.log(chalk.bold("--------------------------------------------------"));
    }
});

module.exports = {
    JsonDatabase: require("./src/JsonDatabase"),
    YamlDatabase: require("./src/YamlDatabase"),
    SqliteDatabase: require("./src/SqliteDatabase"),
    MongoDatabase: require("./src/MongoDatabase"),
};
