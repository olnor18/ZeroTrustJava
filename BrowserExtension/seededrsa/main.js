const RSA = require("./rsa");

module.exports = function generateKey(password) {
    const key = new RSA(password);
    return key.generate(2048).then((key) => {
        return {"privateKey": key.privateKey, "publicKey": key.publicKey}
    })
}