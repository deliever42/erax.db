/**
 * Error Util
 * @param {any} msg
 * @returns {error}
 */
module.exports = (msg) => {
    throw new Error(`EraxDB => Bir Hata Oluştu: ${msg}`);
};
