const { unlinkSync } = require("fs");

module.exports = (path) => {
    unlinkSync(path);
    return true;
};