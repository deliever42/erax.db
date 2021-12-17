const Util = require('./Utils/Util');
const { red, gray, green, blue } = require('./Utils/ColorStyles');

Util.updateCheck().then((data) => {
    if (!data.updated) {
        console.log('--------------------------------------------------');
        console.log(
            blue('EraxDB: ') + red(data.installedVersion) + ' => ' + green(data.packageVersion)
        );
        console.log(blue('For New Version') + ' => ' + gray('npm install erax.db@latest'));
        console.log('--------------------------------------------------');
    }
});

module.exports = {
    JsonDatabase: require('./Providers/Json'),
    YamlDatabase: require('./Providers/Yaml'),
    SqliteDatabase: require('./Providers/Sqlite'),
    MongoDatabase: require('./Providers/Mongo')
};
