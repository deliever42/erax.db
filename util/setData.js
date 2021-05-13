const { writeFileSync, readFileSync } = require("fs");
const yaml = require("yaml");

module.exports = (key, value, path, adapter) => {
    if (adapter === "yaml") {
        const oku = (file) => yaml.parse(readFileSync(file, 'utf-8'));
        const yazdir = (file, data) => writeFileSync(file, yaml.stringify(data, null, 4));
        let dbPath = oku(path);
        dbPath[key] = value;
        yazdir(path, dbPath);
        return dbPath[key];
    };
    const oku = (file) => JSON.parse(readFileSync(file, 'utf-8'));
    const yazdir = (file, data) => writeFileSync(file, JSON.stringify(data, null, 4));
    let dbPath = oku(path);
    dbPath[key] = value;
    yazdir(path, dbPath);
    return dbPath[key];
};