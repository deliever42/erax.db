const { writeFileSync } = require("fs");
const yaml = require("yaml");

module.exports = (path, adapter) => {
    if (adapter === "yaml") {
        const yazdir = (file, data) => writeFileSync(file, yaml.stringify(data, null, 4));
        yazdir(path, {});
        return true;
    };
    const yazdir = (file, data) => writeFileSync(file, JSON.stringify(data, null, 4));
    yazdir(path, {});
    return true;
};