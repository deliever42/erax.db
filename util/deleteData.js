const { writeFileSync, readFileSync } = require("fs");
const yaml = require("yaml");

module.exports = (key, path, adapter) => {
    if (adapter === "json") {
        const oku = (file) => JSON.parse(readFileSync(file, 'utf-8'));
        const yazdir = (file, data) => writeFileSync(file, JSON.stringify(data, null, 4));
        let dbPath = oku(path);
        if (dbPath[key]) return null;
        delete dbPath[key];
        yazdir(path, dbPath);
        return true;
    };
    const oku = (file) => yaml.parse(readFileSync(file, 'utf-8'));
    const yazdir = (file, data) => writeFileSync(file, yaml.stringify(data, null, 4));
    let dbPath = oku(path);
    if (dbPath[key]) return null;
    delete dbPath[key];
    yazdir(path, dbPath);
    return true;
};
