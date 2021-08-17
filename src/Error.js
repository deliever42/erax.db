/**
 * Error Util
 * @private
 * @param {string} message Hata Mesajı
 * @returns {Error}
 */
module.exports = (message) => {
    throw new Error(`EraxDB => Bir Hata Oluştu: ${message}`);
};
