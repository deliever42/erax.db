const fs = require("fs");
const YAML = require("yaml");

const adapterr = (path) => {
    if (path.startsWith("./")) path = path.split("./")[1]
    let sonuc = path.split(".")[1];
    return sonuc;
}


module.exports = {
    allData(path) {
        const adapter = adapterr(path)

        if (adapter === "json") {
            const oku = (path) => JSON.parse(fs.readFileSync(path, 'utf-8'));
            const dbPath = oku(path);
            let arr = [];
            for (const veri in dbPath) {
                const key = {
                    ID: veri,
                    data: dbPath[veri]
                };
                arr.push(key);
            };
            return arr;
        }
        else if (adapter === "yaml") {
            const oku = (path) => YAML.parse(fs.readFileSync(path, 'utf-8'));
            const dbPath = oku(path);
            let arr = [];
            for (const veri in dbPath) {
                const key = {
                    ID: veri,
                    data: dbPath[veri]
                };
                arr.push(key);
            };
            return arr;
        }

    },
    deleteData(key, path) {
        const adapter = adapterr(path)

        if (adapter === "json") {
            const oku = (path) => JSON.parse(fs.readFileSync(path, 'utf-8'));
            const yazdir = (path, data) => fs.writeFileSync(path, JSON.stringify(data, null, 4));
            const dbPath = oku(path);
            if (!dbPath[key]) return null;
            delete dbPath[key];
            yazdir(path, dbPath);
            return true;
        }
        else if (adapter === "yaml") {
            const oku = (path) => YAML.parse(fs.readFileSync(path, 'utf-8'));
            const yazdir = (path, data) => fs.writeFileSync(path, YAML.stringify(data, null, 4));
            const dbPath = oku(path);
            if (!dbPath[key]) return null;
            delete dbPath[key];
            yazdir(path, dbPath);
            return true;
        }
    },
    getData(key, path) {
        const adapter = adapterr(path)

        if (adapter === "json") {
            const oku = (path) => JSON.parse(fs.readFileSync(path, 'utf-8'));
            const dbPath = oku(path);
            if (!dbPath[key]) return null;
            return dbPath[key];
        }
        else if (adapter === "yaml") {
            const oku = (path) => YAML.parse(fs.readFileSync(path, 'utf-8'));
            const dbPath = oku(path);
            if (!dbPath[key]) return null;
            return dbPath[key];
        }
    },
    setData(key, value, path) {
        const adapter = adapterr(path)

        if (adapter === "json") {
            const oku = (path) => JSON.parse(fs.readFileSync(path, 'utf-8'));
            const yazdir = (path, data) => fs.writeFileSync(path, JSON.stringify(data, null, 4));
            const dbPath = oku(path);
            dbPath[key] = value;
            yazdir(path, dbPath);
            return dbPath[key];
        }
        else if (adapter === "yaml") {
            const oku = (path) => YAML.parse(fs.readFileSync(path, 'utf-8'));
            const yazdir = (path, data) => fs.writeFileSync(path, YAML.stringify(data, null, 4));
            const dbPath = oku(path);
            dbPath[key] = value;
            yazdir(path, dbPath);
            return dbPath[key];
        }
    },
};