const getData = require("./getData")

module.exports = (key, path, adapter) => {

    if (adapter === "json") {
        if (Array.isArray(getData(key, path, "json"))) return true;
        return false;
    };
    if (Array.isArray(getData(key, path, "yaml"))) return true;
    return false;
};