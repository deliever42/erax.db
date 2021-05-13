const getData = require("./getData");

module.exports = (key, path, adapter) => {
    if (adapter === "yaml") {
        if (getData(key, path, "yaml")) return true;
        return false;
    };
    if (getData(key, path, "json")) return true;
    return false;
};