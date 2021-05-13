const getData = require("./getData")

module.exports = (key, path, adapter) => {
    if (adapter === "yaml") {
        if (typeof getData(key, path, "yaml") === "number") return true;
        return false;
    };
    if (typeof getData(key, path, "json") === "number") return true;
    return false;
};