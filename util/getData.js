const { readFileSync } = require("fs");
const yaml = require("yaml");

module.exports = (key, path, adapter) => {
    if (adapter === "json") {
        const oku = (file) => JSON.parse(readFileSync(file, 'utf-8'));
        let dbPath = oku(path);
        if (!dbPath[key]) return null;
        return dbPath[key];
    };
    const oku = (file) => yaml.parse(readFileSync(file, 'utf-8'));
    let dbPath = oku(path)
    if (!dbPath[key]) return null;
    return dbPath[key]
}