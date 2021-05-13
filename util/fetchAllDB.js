const { readFileSync } = require("fs");
const yaml = require("yaml");

module.exports = (path, adapter) => {
    if (adapter === "yaml") {
        const oku = (file) => yaml.parse(readFileSync(file, 'utf-8'));
        let dbPath = oku(path)
        return dbPath;
    };
    const oku = (file) => JSON.parse(readFileSync(file, 'utf-8'));
    let dbPath = oku(path)
    return dbPath;
};