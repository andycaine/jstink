const crypto = require('crypto');

const algorithm = 'aes-256-gcm';

function encrypt(plaintext, associatedData, key) {
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv(algorithm, key, iv);

    cipher.setAAD(Buffer.from(associatedData));
    const encrypted = cipher.update(plaintext);
    const remaining = cipher.final();
    const tag = cipher.getAuthTag();
    return {
        ciphertext: Buffer.concat([encrypted, remaining]),
        tag,
        iv,
        tag
    };
}

function decrypt(ciphertext, associatedData, key, iv, tag) {
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    decipher.setAAD(Buffer.from(associatedData));
    decipher.setAuthTag(Buffer.from(tag));
    let decrypted = decipher.update(ciphertext);
    decrypted += decipher.final();
    return decrypted;
}

module.exports = { encrypt, decrypt };
