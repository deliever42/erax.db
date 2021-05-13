const { readFileSync } = require("fs")
const yaml = require("yaml");

module.exports = (path, adapter) => {
    if (adapter === "json") {
        const oku = (file) => JSON.parse(readFileSync(file, 'utf-8'));
        let dbPath = oku(path);
        let arr = [];
        for (const veri in dbPath) {
            const key = {
                ID: veri,
                data: dbPath[veri]
            };
            arr.push(key);
        };
        return arr;
    };
    const oku = (file) => yaml.parse(readFileSync(file, 'utf-8'));
    let dbPath = oku(path);
    let arr = [];
    for (const veri in dbPath) {
        const key = {
            ID: veri,
            data: dbPath[veri]
        };
        arr.push(key);
    };
    return arr;
};